"""
Declarative Level-by-Level Async DAG Execution Engine
Provides strict dependency validation, level write-conflict assertions, per-key merge policies, short-circuiting, and failure posture handling.
"""

import asyncio
import inspect
import copy
from typing import Dict, List, Any, Callable, Set
from app.core.event_bus import event_bus, DAGEvent

# Per-key state merging policies
APPEND_KEYS = {"execution_steps", "errors"}

class DAGNode:
    def __init__(self, name: str, dependencies: List[str], writes: List[str], func: Callable[[Dict[str, Any]], Any], failure_posture: str = "ABORT"):
        self.name = name
        self.dependencies = dependencies
        self.writes = writes
        self.func = func
        self.failure_posture = failure_posture # "ABORT" or "DEGRADE"

class DeclarativeDAGEngine:
    def __init__(self, nodes: List[DAGNode]):
        self.nodes_dict = {n.name: n for n in nodes}
        self._validate_graph(nodes)
        self.levels = self._topological_levels()
        self._validate_level_write_conflicts()

    def _validate_graph(self, nodes: List[DAGNode]):
        # 1. Dependency Existence Check
        for node in nodes:
            for dep in node.dependencies:
                if dep not in self.nodes_dict:
                    raise ValueError(f"Dependency '{dep}' of node '{node.name}' does not exist in registry.")

        # 2. Cycle Detection (DFS)
        visited = {}
        def dfs(name: str) -> bool:
            visited[name] = 1 # Visiting
            for dep in self.nodes_dict[name].dependencies:
                if visited.get(dep, 0) == 1:
                    return True # Cycle detected
                elif visited.get(dep, 0) == 0:
                    if dfs(dep):
                        return True
            visited[name] = 2 # Visited
            return False

        for node in nodes:
            if visited.get(node.name, 0) == 0:
                if dfs(node.name):
                    raise ValueError("Circular dependencies detected in DAG graph structure.")

    def _topological_levels(self) -> List[List[DAGNode]]:
        in_degree = {name: len(node.dependencies) for name, node in self.nodes_dict.items()}
        dependents = {name: [] for name in self.nodes_dict}
        for name, node in self.nodes_dict.items():
            for dep in node.dependencies:
                dependents[dep].append(name)

        levels = []
        current_level = [name for name, deg in in_degree.items() if deg == 0]

        while current_level:
            levels.append([self.nodes_dict[name] for name in current_level])
            next_level = []
            for name in current_level:
                for dep in dependents[name]:
                    in_degree[dep] -= 1
                    if in_degree[dep] == 0:
                        next_level.append(dep)
            current_level = next_level

        if sum(len(l) for l in levels) != len(self.nodes_dict):
            raise ValueError("Topological sort mismatch. Some nodes were silently dropped.")
            
        return levels

    def _validate_level_write_conflicts(self):
        """Asserts that no two nodes executing in parallel in the same level write to the same state key."""
        for level in self.levels:
            seen_writes = set()
            for node in level:
                for key in node.writes:
                    if key in seen_writes:
                        raise ValueError(f"Write conflict: key '{key}' is written to by multiple parallel nodes in the same execution level.")
                    seen_writes.add(key)

    async def run_pipeline(self, initial_state: Dict[str, Any], run_id: str) -> Dict[str, Any]:
        state = copy.deepcopy(initial_state)
        # Clear the short-circuit flag from previous passes at the start of run_pipeline
        state.pop("_short_circuit", None)
        
        failed_nodes: Set[str] = set()
        aborted = False
        stage_idx = 1

        try:
            for level in self.levels:
                if aborted or state.get("_short_circuit"):
                    # Short-circuit subsequent levels on this pass if Reflexion triggered
                    break

                tasks = []
                executing_nodes = []

                for node in level:
                    # Skip executing node if all its write outputs are already pre-populated in the state
                    if all(k in state and state[k] for k in node.writes) and node.name in ["parse_brief", "trend_rag", "winner_rag", "visual", "competitor_analysis"]:
                        continue

                    # Skip if any of this node's dependencies failed
                    if any(dep in failed_nodes for dep in node.dependencies):
                        failed_nodes.add(node.name)
                        errors = state.get("errors", [])
                        errors.append(f"Node '{node.name}' skipped due to failed dependency.")
                        state["errors"] = errors
                        continue

                    await event_bus.publish(DAGEvent(
                        run_id=run_id,
                        event_type="NODE_STARTED",
                        node_name=node.name,
                        stage_index=stage_idx
                    ))
                    executing_nodes.append(node)
                    tasks.append(self._execute_node(node, state))

                if not tasks:
                    continue

                results = await asyncio.gather(*tasks, return_exceptions=True)

                for node, delta in zip(executing_nodes, results):
                    if isinstance(delta, Exception):
                        failed_nodes.add(node.name)
                        errors = state.get("errors", [])
                        errors.append(f"Node '{node.name}' failed: {str(delta)}")
                        state["errors"] = errors
                        
                        await event_bus.publish(DAGEvent(
                            run_id=run_id,
                            event_type="NODE_FAILED",
                            node_name=node.name,
                            stage_index=stage_idx,
                            data={"error": str(delta)}
                        ))
                        
                        if node.failure_posture == "ABORT":
                            aborted = True
                    else:
                        # Enforce write boundary check
                        declared_set = set(node.writes)
                        declared_set.update({"execution_steps", "errors", "_short_circuit"})
                        actual_keys = set(delta.keys())
                        if not actual_keys.issubset(declared_set):
                            forbidden = actual_keys - declared_set
                            raise ValueError(f"Declared writes mismatch: Node '{node.name}' tried to write keys {forbidden} not in writes specification.")

                        state = self._merge_state_delta(state, delta)
                        await event_bus.publish(DAGEvent(
                            run_id=run_id,
                            event_type="NODE_COMPLETED",
                            node_name=node.name,
                            stage_index=stage_idx
                        ))

                stage_idx += 1

            # Posture-Aware Status Logic
            if aborted or any(self.nodes_dict[n].failure_posture == "ABORT" for n in failed_nodes):
                state["status"] = "FAILED"
            elif failed_nodes:
                state["status"] = "PARTIAL"
            elif state.get("compliance_status", {}).get("status") == "REJECTED":
                state["status"] = "BLOCKED"
            else:
                state["status"] = "SUCCESS"

        except Exception as run_err:
            state["status"] = "FAILED"
            errors = state.get("errors", [])
            errors.append(f"Pipeline execution crashed: {str(run_err)}")
            state["errors"] = errors
            raise run_err
        finally:
            # Guarantee event bus ALWAYS publishes terminal event to prevent stream hangs
            await event_bus.publish(DAGEvent(
                run_id=run_id,
                event_type="PIPELINE_COMPLETED",
                node_name="pipeline",
                stage_index=stage_idx,
                data={"status": state.get("status", "SUCCESS")}
            ))
            
        return state

    async def _execute_node(self, node: DAGNode, state: Dict[str, Any]) -> Dict[str, Any]:
        state_snapshot = copy.deepcopy(state)
        if inspect.iscoroutinefunction(node.func):
            return await node.func(state_snapshot)
        else:
            return await asyncio.to_thread(node.func, state_snapshot)

    def _merge_state_delta(self, current_state: Dict[str, Any], delta: Dict[str, Any]) -> Dict[str, Any]:
        new_state = copy.deepcopy(current_state)
        if not delta:
            return new_state

        for k, v in delta.items():
            if k in APPEND_KEYS and isinstance(v, list):
                existing = new_state.get(k, [])
                for item in v:
                    if item not in existing:
                        existing.append(item)
                new_state[k] = existing
            else:
                new_state[k] = v
        return new_state
