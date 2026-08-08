"""
Pydantic Schemas for Ad Copy Variants, Visual Hero Assets, and Audio Tracks
"""

from pydantic import BaseModel, Field
from typing import List, Optional

class AdCopyVariant(BaseModel):
    headline: str = Field(..., description="Ad headline")
    primary_text: str = Field(..., description="Primary body copy")
    call_to_action: str = Field(default="Shop Now", description="CTA button label")
    hook_angle: str = Field(default="Problem-Solution", description="Hook strategy")
    model_used: str = Field(default="OpenAI GPT-4o", description="LLM used for synthesis")

class GeneratedVisualAsset(BaseModel):
    asset_id: str = Field(..., description="Unique asset ID")
    url: str = Field(..., description="Image or video asset URL")
    asset_type: str = Field(default="IMAGE", description="IMAGE or VIDEO")
    aspect_ratio: str = Field(default="9:16", description="Aspect ratio e.g. 9:16 or 1:1")
    model_used: str = Field(default="Adobe Firefly Image 3", description="Diffusion or video engine used")
    ip_indemnified: bool = Field(default=True, description="Commercial IP safety status")

class GeneratedAudioTrack(BaseModel):
    track_id: str = Field(..., description="Unique audio track ID")
    audio_url: str = Field(..., description="Neural TTS audio URL")
    script_text: str = Field(..., description="Voiceover script text")
    duration_seconds: float = Field(default=15.0, description="Audio duration")
    model_used: str = Field(default="ElevenLabs Studio Voice", description="TTS engine used")
