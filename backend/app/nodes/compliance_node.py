"""
Brand Safety & IP Guardrail Node
Evaluates compliance for the top ad copy variant against enterprise Brand DNA rules using exact regex word boundaries.
"""

from typing import Dict, Any
from app.core.guardrails import brand_guardrail_engine

async def check_compliance_node(state: Dict[str, Any]) -> Dict[str, Any]:
    copy_data = state.get("copy_variant", {})
    brand_dna = state.get("brand_dna", {})
    
    compliance = brand_guardrail_engine.validate_compliance(copy_data, brand_dna)
    
    return {
        "compliance_status": compliance,
        "execution_steps": [{"stage": f"Brand Safety & IP Guardrail (Status: {compliance.get('status')})", "completed": True}]
    }
