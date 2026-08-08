"""
Orchestrator State Schema (Unified & Strongly Typed)
"""

from typing import TypedDict, List, Dict, Any, Optional

class OrchestratorState(TypedDict):
    run_id: str
    status: str # SUCCESS, PARTIAL, FAILED, BLOCKED
    brief_data: Dict[str, Any]
    brand_dna: Dict[str, Any]
    trend_insights: List[Dict[str, Any]]
    winner_insights: Dict[str, Any]
    competitor_insights: Dict[str, Any]
    copy_variants: List[Dict[str, Any]]
    copy_variant: Dict[str, Any]
    visual_asset: Dict[str, Any]
    audio_track: Dict[str, Any]
    compliance_status: Dict[str, Any]
    clip_alignment_score: float
    predictive_scores: Dict[str, Any]
    reflection_count: int
    reflection_critique: Optional[str]
    meta_payload: Dict[str, Any]
    execution_steps: List[Dict[str, Any]]
    errors: List[str]
