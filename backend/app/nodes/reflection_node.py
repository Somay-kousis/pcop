"""
Autonomous Self-Correction & Reflexion Pattern Loop Node (Node 9)
Evaluates compliance status and predictive score; sets loop bounds and terminal blocked gates.
"""

from typing import Dict, Any

async def reflection_loop_node(state: Dict[str, Any]) -> Dict[str, Any]:
    scores = state.get("predictive_scores", {})
    overall_score = scores.get("overall_score", 90.0)
    compliance = state.get("compliance_status", {})
    comp_status = compliance.get("status", "PASSED")
    ref_count = state.get("reflection_count", 0)
    
    # Reflexion trigger: score < 85.0 OR compliance rejected
    needs_reflection = (overall_score < 85.0) or (comp_status == "REJECTED")
    
    if needs_reflection and ref_count < 2:
        violations = compliance.get("violations", [])
        viol_text = f" (Violations: {', '.join(violations)})" if violations else ""
        critique = f"Copy score ({overall_score}) below threshold or rejected{viol_text}. Enforce brand rules."
        
        return {
            "reflection_count": ref_count + 1,
            "reflection_critique": critique,
            "_short_circuit": True, # Private flag triggers short-circuit of Level 7 meta_staging in same pass
            "execution_steps": [{"stage": f"Reflexion Self-Correction Gate (Attempt {ref_count + 1}: Critiquing Copy)", "completed": True}]
        }
    else:
        # Terminal checks when exiting loop
        if comp_status == "REJECTED":
            stage_desc = "Reflexion Loop Exhausted: Blocked due to Brand DNA violations"
        else:
            stage_desc = "Reflexion Gate (Approved for Meta Staging)"
            
        return {
            "reflection_critique": None,
            "execution_steps": [{"stage": stage_desc, "completed": True}]
        }
    return {}
