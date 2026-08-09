"""
Predictive Performance ML Scoring Node
Evaluates and ranks all generated creative variants in parallel using feature weights.
"""

from typing import Dict, Any, List
from app.providers import get_provider
from app.schemas.asset_schema import AdCopyVariant

async def predictive_scoring_node(state: Dict[str, Any]) -> Dict[str, Any]:
    copy_variants = state.get("copy_variants", [])
    if not copy_variants and state.get("copy_variant"):
        copy_variants = [state.get("copy_variant")]
        
    scored_variants = []
    top_score_result = None
    best_variant = copy_variants[0] if copy_variants else {}
    highest_score = -1.0
    
    ml_provider = get_provider("predictive_ml")
    
    for var_dict in copy_variants:
        variant = AdCopyVariant(**var_dict)
        score_res = await ml_provider.score_variant(variant)
        
        scored_item = {
            **var_dict,
            "predictive_score": score_res.overall_score,
            "scoring_details": score_res.model_dump()
        }
        scored_variants.append(scored_item)
        
        if score_res.overall_score > highest_score:
            highest_score = score_res.overall_score
            top_score_result = score_res
            best_variant = scored_item

    return {
        "copy_variants": scored_variants,
        "copy_variant": best_variant,
        "predictive_scores": top_score_result.model_dump() if top_score_result else {},
        "execution_steps": [{"stage": f"Predictive Scoring Engine (Ranked {len(scored_variants)} variants, Top Score: {highest_score})", "completed": True}]
    }
