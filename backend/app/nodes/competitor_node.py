"""
Competitor Ad Analysis Node (Level 2)

Analyzes a manually-supplied competitor ad (no automated fetching -- see
schemas/competitor_schema.py for why) and produces insights consumed by the
copy generation node to differentiate our variant.
"""

from typing import Dict, Any
from app.providers import get_provider


async def competitor_analysis_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    competitor = brief.get("competitor_ad")

    if not competitor:
        # NOTE: must be a truthy dict, not {} -- the DAG engine's reflexion
        # memoization guard (engine.py:110) treats an empty dict as "not yet
        # written" and would re-run this node on every reflexion pass.
        return {
            "competitor_insights": {"provided": False},
            "execution_steps": [{"stage": "Competitor Ad Analysis (skipped -- none supplied)", "completed": True}]
        }

    try:
        competitor_provider = get_provider("competitor")
        analysis = await competitor_provider.analyze_competitor_ad(competitor, brief)
        insights = analysis.model_dump()
        # Carry the brand name through for downstream copy generation.
        insights["competitor_brand"] = competitor.get("competitor_brand")
        return {
            "competitor_insights": insights,
            "execution_steps": [{"stage": f"Competitor Ad Analysis ({analysis.model_used})", "completed": True}]
        }
    except Exception as e:
        # This node must never raise: copy_matrix depends on it, and an
        # unhandled failure here would cascade to abort the entire run
        # regardless of failure_posture="DEGRADE" (dependents are skipped
        # unconditionally on any failed dependency -- engine.py:113-119).
        return {
            "competitor_insights": {"provided": False, "error": str(e)},
            "execution_steps": [{"stage": "Competitor Ad Analysis (failed, degraded gracefully)", "completed": False}]
        }
