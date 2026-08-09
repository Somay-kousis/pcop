"""
Multi-Model Permutation Matrix Copywriter & Visual Hero Nodes
"""

from typing import Dict, Any
from app.providers import get_provider
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset

async def generate_copy_matrix_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    critique = state.get("reflection_critique")
    competitor_insights = state.get("competitor_insights")

    llm_provider = get_provider("llm")
    copy_matrix: list[AdCopyVariant] = await llm_provider.generate_copy_matrix(
        brief, critique=critique, competitor_insights=competitor_insights
    )
    matrix_dicts = [v.model_dump() for v in copy_matrix]
    
    return {
        "copy_variants": matrix_dicts,
        "copy_variant": matrix_dicts[0] if matrix_dicts else {},
        "execution_steps": [{"stage": f"Multi-Model Copywriter Matrix ({len(matrix_dicts)} variants synthesized)", "completed": True}]
    }

async def generate_visual_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    customizer = brief.get("customizer", {})
    ratios = customizer.get("target_aspect_ratios", ["9:16"])
    target_ratio = ratios[0] if ratios else "9:16"
    
    vision_provider = get_provider("vision")
    visual: GeneratedVisualAsset = await vision_provider.generate_visual(brief, target_ratio)
    
    return {
        "visual_asset": visual.model_dump(),
        "execution_steps": [{"stage": f"Visual Hero Synthesis ({visual.model_used} - {target_ratio})", "completed": True}]
    }
