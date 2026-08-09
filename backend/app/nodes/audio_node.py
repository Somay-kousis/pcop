"""
Neural Audio & Voiceover Script Synthesis Node (Node 6)
Uses AudioProvider to synthesize neural voiceover tracks for the copy variant.
"""

from typing import Dict, Any
from app.providers import get_provider
from app.schemas.asset_schema import AdCopyVariant

async def generate_audio_node(state: Dict[str, Any]) -> Dict[str, Any]:
    copy_dict = state.get("copy_variant", {})
    copy_obj = AdCopyVariant(**copy_dict) if copy_dict else AdCopyVariant(headline="Default", primary_text="Default")
    
    audio_provider = get_provider("audio")
    audio_track = await audio_provider.generate_audio(copy_obj)
    
    return {
        "audio_track": audio_track.model_dump(),
        "execution_steps": [{"stage": f"ElevenLabs Neural Audio & Script ({audio_track.model_used})", "completed": True}]
    }
