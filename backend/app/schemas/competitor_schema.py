"""
Pydantic Schemas for Manual Competitor Ad Input & Analysis

NOTE: Meta's official Ad Library API (`/ads_archive`) does not return ordinary
commercial ads -- only political/social-issue ads plus a narrow US
housing/employment/credit category. There is no automated path to fetch a
competitor's commercial ad. `ad_library_url` below is stored purely as
provenance for a manually pasted ad; it MUST NOT be fetched or scraped
server-side.
"""

from pydantic import BaseModel, Field, model_validator
from typing import List, Optional, Dict, Any, Literal


class CompetitorAdInput(BaseModel):
    ad_copy: Optional[str] = Field(default=None, max_length=5000, description="Manually pasted competitor ad headline/body text")
    ad_library_url: Optional[str] = Field(default=None, description="Meta Ad Library link kept for provenance only -- never fetched server-side")
    competitor_brand: Optional[str] = Field(default=None, description="Name of the competitor brand")
    screenshot_url: Optional[str] = Field(default=None, description="User-provided screenshot of the competitor ad, as a data: URI. Analyzed directly by a vision-capable provider when one is configured; otherwise stored but not analyzed.")
    running_since: Optional[str] = Field(default=None, max_length=100, description="How long the ad has reportedly been active in the Ad Library (user-read, e.g. 'March 2025'). A long-running ad is a signal it's performing well.")
    style_notes: Optional[str] = Field(default=None, max_length=1000, description="User's free-text notes on the competitor ad's visual style to factor into differentiation guidance (e.g. 'minimalist font and colors')")
    source: Literal["MANUAL_PASTE", "AD_LIBRARY_URL", "SCREENSHOT"] = Field(default="MANUAL_PASTE")

    @model_validator(mode="after")
    def require_one_signal(self):
        if not (self.ad_copy and self.ad_copy.strip()) and not (self.screenshot_url and self.screenshot_url.strip()):
            raise ValueError("CompetitorAdInput requires at least one of: ad_copy, screenshot_url")
        return self


class CompetitorAdAnalysis(BaseModel):
    provided: bool = Field(default=True, description="False when no competitor ad was supplied for this run")
    positioning: str = Field(default="")
    hook_angle: str = Field(default="")
    tone: str = Field(default="")
    claims: List[str] = Field(default_factory=list)
    call_to_action: str = Field(default="")
    inferred_audience: str = Field(default="")
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    differentiation_angles: List[str] = Field(default_factory=list, description="Concrete ways our variant should differ from this competitor")
    analyzed_modalities: List[str] = Field(default_factory=lambda: ["TEXT"], description="Which signal types were analyzed; will include 'VISUAL' once screenshot analysis lands")
    visual_analysis: Optional[Dict[str, Any]] = Field(default=None, description="Reserved for future vision-analysis output")
    source_url: Optional[str] = Field(default=None)
    model_used: str = Field(default="Mock Competitor Analyst")
    error: Optional[str] = Field(default=None)
