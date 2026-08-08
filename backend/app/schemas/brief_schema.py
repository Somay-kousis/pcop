"""
Pydantic Schemas for Campaign Briefs and Brand DNAi Rules
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.competitor_schema import CompetitorAdInput

class BrandDNARules(BaseModel):
    brand_name: str = Field(default="Unilever Dove", description="Brand name")
    hex_palette: List[str] = Field(default=["#0B1B3D", "#D4AF37", "#FFFFFF"], description="Brand HEX color swatches")
    primary_font: str = Field(default="Outfit", description="Primary brand display font")
    secondary_font: str = Field(default="Inter", description="Secondary body font")
    voice_tone: str = Field(default="Empowering & Premium", description="Brand tone of voice")
    prohibited_claims: List[str] = Field(default=["100% cure", "guaranteed wealth"], description="Prohibited claim keywords")
    logo_vector_url: Optional[str] = Field(default=None, description="Brand logo vector URL")

class CustomizerOverrides(BaseModel):
    llm_model: Optional[str] = Field(default="Auto-Route (50+ Models)", description="Selected LLM copywriting engine")
    vision_model: Optional[str] = Field(default="Adobe Firefly Image 3", description="Selected visual generation model")
    motion_model: Optional[str] = Field(default="Runway Gen-3 Alpha", description="Selected motion video engine")
    audio_model: Optional[str] = Field(default="ElevenLabs Studio Voice", description="Selected audio TTS voice")
    custom_hex_colors: Optional[List[str]] = Field(default=None, description="User overridden color swatches")
    custom_font: Optional[str] = Field(default=None, description="User overridden font choice")
    target_aspect_ratios: List[str] = Field(default=["9:16", "1:1"], description="Target aspect ratios")
    product_image_url: Optional[str] = Field(
        default="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop", 
        description="Uploaded product screenshot/image"
    )

class CampaignBriefRequest(BaseModel):
    product_name: str = Field(..., description="Name of the product or service")
    product_description: str = Field(..., description="Key benefits and features")
    target_audience: str = Field(default="General Performance Audience", description="Target segment")
    target_platforms: List[str] = Field(default=["Meta", "TikTok", "Google"], description="Ad networks to target")
    brand_dna: Optional[BrandDNARules] = Field(default_factory=BrandDNARules, description="Enterprise Brand DNAi rules")
    customizer: Optional[CustomizerOverrides] = Field(default_factory=CustomizerOverrides, description="Template & model customization overrides")
    competitor_ad: Optional[CompetitorAdInput] = Field(default=None, description="Manually supplied competitor ad to analyze and differentiate against")
