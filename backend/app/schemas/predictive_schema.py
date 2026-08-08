"""
Pydantic Schemas for Predictive Performance Scoring ML Results
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any

class PredictiveScoreResult(BaseModel):
    overall_score: float = Field(default=94.8, description="Score from 0.0 to 100.0 based on >$1B spend ML model")
    projected_roas_uplift: str = Field(default="+78.5%", description="Predicted ROAS percentage lift over baseline")
    projected_cpa_reduction: str = Field(default="-48.2%", description="Predicted CPA percentage reduction")
    hook_rate_confidence: str = Field(default="92%", description="Estimated 3-second video hook rate")
    ad_fatigue_horizon_days: int = Field(default=18, description="Estimated days before creative performance decays")
    recommendations: List[str] = Field(
        default=[
            "High visual contrast detected between product hero and background.",
            "Primary CTA placed within initial 3-second hook window.",
            "Brand DNAi color swatches match target segment affinity."
        ], 
        description="Optimization notes"
    )
