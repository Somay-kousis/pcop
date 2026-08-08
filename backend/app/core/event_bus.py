"""
Real-Time Event Bus with Replay Buffer and Multi-Worker Task Cleanups
"""

import asyncio
from typing import Dict, List, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class DAGEvent(BaseModel):
    run_id: str
    event_type: str = Field(..., description="NODE_STARTED, NODE_COMPLETED, NODE_FAILED, PIPELINE_COMPLETED (per reflexion pass), RUN_FINALIZED (terminal, once per run, fired after task_store result is persisted)")
    node_name: str
    stage_index: int
    data: Dict[str, Any] = Field(default_factory=dict)
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class EventBus:
    def __init__(self):
        self._subscribers: Dict[str, List[asyncio.Queue]] = {}
        self._replay_buffer: Dict[str, List[DAGEvent]] = {}
        # Track active subscriber references count
        self._subscriber_counts: Dict[str, int] = {}

    def subscribe(self, run_id: str) -> asyncio.Queue:
        if run_id not in self._subscribers:
            self._subscribers[run_id] = []
        queue = asyncio.Queue()
        self._subscribers[run_id].append(queue)
        
        # Increment active subscriptions count
        self._subscriber_counts[run_id] = self._subscriber_counts.get(run_id, 0) + 1
        
        # Populate queue with historical events
        if run_id in self._replay_buffer:
            for event in self._replay_buffer[run_id]:
                queue.put_nowait(event)
                
        return queue

    def unsubscribe(self, run_id: str, queue: asyncio.Queue):
        if run_id in self._subscribers and queue in self._subscribers[run_id]:
            self._subscribers[run_id].remove(queue)
            if not self._subscribers[run_id]:
                del self._subscribers[run_id]
        
        # Decrement ref count and clean up replay buffer if zero
        if run_id in self._subscriber_counts:
            self._subscriber_counts[run_id] -= 1
            if self._subscriber_counts[run_id] <= 0:
                self.clear_buffer(run_id)
                del self._subscriber_counts[run_id]

    async def publish(self, event: DAGEvent):
        # Cache event in replay buffer
        if event.run_id not in self._replay_buffer:
            self._replay_buffer[event.run_id] = []
        self._replay_buffer[event.run_id].append(event)
        
        # Cap replay buffer length per run ID
        if len(self._replay_buffer[event.run_id]) > 50:
            self._replay_buffer[event.run_id].pop(0)

        if event.run_id in self._subscribers:
            for queue in list(self._subscribers[event.run_id]):
                await queue.put(event)

    def clear_buffer(self, run_id: str):
        if run_id in self._replay_buffer:
            del self._replay_buffer[run_id]

event_bus = EventBus()
