"""
Declarative Level-by-Level Parallel DAG Builder
Assembles topological execution levels with writes specification and posture controls.
"""

from typing import Dict, Any
from app.graph.engine import DAGNode, DeclarativeDAGEngine
from app.nodes.brief_node import parse_brief_node
from app.nodes.trend_rag_node import trend_rag_node
from app.nodes.winner_rag_node import winner_rag_node
from app.nodes.competitor_node import competitor_analysis_node
from app.nodes.generation_node import generate_copy_matrix_node, generate_visual_node
from app.nodes.audio_node import generate_audio_node
from app.nodes.compliance_node import check_compliance_node
from app.nodes.clip_node import clip_alignment_node
from app.nodes.scoring_node import predictive_scoring_node
from app.nodes.reflection_node import reflection_loop_node
from app.nodes.meta_node import meta_staging_node

def build_orchestrator_graph() -> DeclarativeDAGEngine:
    """
    Constructs the 11-node parallel DAG using topological level resolution.
    Level 1: parse_brief
    Level 2 (Parallel): trend_rag || winner_rag || visual || competitor_analysis
    Level 3: copy_matrix (depends on trend_rag, winner_rag, competitor_analysis)
    Level 4: scoring (ranks variants and selects winning copy_variant; depends on copy_matrix)
    Level 5 (Parallel): compliance || clip_alignment || audio (all read winning copy_variant; depend on scoring/visual)
    Level 6: reflection_loop (evaluates Reflexion triggers; depends on compliance, clip_alignment, scoring)
    Level 7: meta_staging (stages winning variant; depends on reflection_loop)
    """
    nodes = [
        # Level 1
        DAGNode(
            name="parse_brief", 
            dependencies=[], 
            writes=["brand_dna", "brief_data"], 
            func=parse_brief_node,
            failure_posture="ABORT"
        ),
        # Level 2
        DAGNode(
            name="trend_rag", 
            dependencies=["parse_brief"], 
            writes=["trend_insights"], 
            func=trend_rag_node,
            failure_posture="DEGRADE"
        ),
        DAGNode(
            name="winner_rag", 
            dependencies=["parse_brief"], 
            writes=["winner_insights"], 
            func=winner_rag_node,
            failure_posture="DEGRADE"
        ),
        DAGNode(
            name="visual",
            dependencies=["parse_brief"],
            writes=["visual_asset"],
            func=generate_visual_node,
            failure_posture="ABORT"
        ),
        DAGNode(
            name="competitor_analysis",
            dependencies=["parse_brief"],
            writes=["competitor_insights"],
            func=competitor_analysis_node,
            failure_posture="DEGRADE"
        ),
        # Level 3
        DAGNode(
            name="copy_matrix",
            dependencies=["trend_rag", "winner_rag", "competitor_analysis"],
            writes=["copy_variants", "copy_variant"],
            func=generate_copy_matrix_node,
            failure_posture="ABORT"
        ),
        # Level 4
        DAGNode(
            name="scoring", 
            dependencies=["copy_matrix"], 
            writes=["copy_variants", "copy_variant", "predictive_scores"], 
            func=predictive_scoring_node,
            failure_posture="ABORT"
        ),
        # Level 5
        DAGNode(
            name="audio", 
            dependencies=["scoring"], 
            writes=["audio_track"], 
            func=generate_audio_node,
            failure_posture="DEGRADE"
        ),
        DAGNode(
            name="compliance", 
            dependencies=["scoring"], 
            writes=["compliance_status"], 
            func=check_compliance_node,
            failure_posture="ABORT"
        ),
        DAGNode(
            name="clip_alignment", 
            dependencies=["scoring", "visual"], 
            writes=["clip_alignment_score"], 
            func=clip_alignment_node,
            failure_posture="DEGRADE"
        ),
        # Level 6
        DAGNode(
            name="reflection_loop", 
            dependencies=["compliance", "clip_alignment", "scoring"], 
            writes=["reflection_count", "reflection_critique"], 
            func=reflection_loop_node,
            failure_posture="ABORT"
        ),
        # Level 7
        DAGNode(
            name="meta_staging", 
            dependencies=["reflection_loop"], 
            writes=["meta_payload"], 
            func=meta_staging_node,
            failure_posture="ABORT"
        )
    ]

    return DeclarativeDAGEngine(nodes)
