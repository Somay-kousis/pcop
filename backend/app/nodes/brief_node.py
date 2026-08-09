"""
Brief Ingestion & Brand DNA Sync Node
"""

from typing import Dict, Any

def parse_brief_node(state: Dict[str, Any]) -> Dict[str, Any]:
    brief = state.get("brief_data", {})
    brand = brief.get("brand_dna", {
        "brand_name": "Dove Global",
        "hex_palette": ["#0B1B3D", "#D4AF37", "#FFFFFF"],
        "voice_tone": "Empowering"
    })
    
    return {
        "brand_dna": brand,
        "brief_data": brief,
        "execution_steps": [{"stage": "Ingest Brief & Brand DNA Sync", "completed": True}]
    }
