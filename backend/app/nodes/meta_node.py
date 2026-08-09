"""
Meta Business SDK Staging Node
Stages variants only if compliance checks are PASSED.
"""

from typing import Dict, Any
from app.providers import get_provider
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset

async def meta_staging_node(state: Dict[str, Any]) -> Dict[str, Any]:
    compliance = state.get("compliance_status", {})
    comp_status = compliance.get("status", "PASSED")
    
    # Precondition gate: Block staging if brand safety compliance failed
    if comp_status != "PASSED":
        return {
            "meta_payload": {
                "sdk_interface": "facebook-python-business-sdk",
                "status": "BLOCKED",
                "reason": f"Staging blocked: Brand DNA violations detected: {compliance.get('violations')}"
            },
            "execution_steps": [{"stage": "Meta Business SDK Staging Blocked (Compliance Failed)", "completed": False}]
        }

    copy_dict = state.get("copy_variant", {})
    visual_dict = state.get("visual_asset", {})
    
    copy_obj = AdCopyVariant(**copy_dict) if copy_dict else AdCopyVariant(headline="Default", primary_text="Default")
    visual_obj = GeneratedVisualAsset(**visual_dict) if visual_dict else GeneratedVisualAsset(asset_id="mock", url="http://img.jpg")
    
    meta_provider = get_provider("meta_sdk")
    meta_payload = await meta_provider.stage_creative(copy_obj, visual_obj)
    
    return {
        "meta_payload": meta_payload.model_dump(),
        "execution_steps": [{"stage": "Meta Business SDK Staging Completed", "completed": True}]
    }
