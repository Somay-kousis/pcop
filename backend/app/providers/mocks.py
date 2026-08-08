"""
Mock Provider Implementations for Offline Development & Testing
Honest mock providers clearly separated from production API drivers.
"""

from typing import Dict, Any, List, Optional
from app.providers.base import (
    BaseLLMProvider, BaseVisionProvider, BaseAudioProvider,
    BasePredictiveMLProvider, BaseMetaSDKProvider, BaseCompetitorProvider
)
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset, GeneratedAudioTrack
from app.schemas.predictive_schema import PredictiveScoreResult
from app.schemas.meta_schema import MetaStagingPayload
from app.schemas.competitor_schema import CompetitorAdAnalysis
from app.core.config import settings

class MockLLMProvider(BaseLLMProvider):
    async def generate_copy_matrix(
        self,
        brief: Dict[str, Any],
        critique: str = None,
        competitor_insights: Optional[Dict[str, Any]] = None
    ) -> List[AdCopyVariant]:
        product = brief.get("product_name", "Product")
        desc = brief.get("product_description", "")

        # Critique (compliance/score-driven reflexion) takes priority over
        # competitor differentiation -- fixing a brand-safety violation matters
        # more than the differentiation angle. Competitor context is folded in
        # when both are present.
        if critique:
            # Dynamically react to the Reflexion critique feedback
            # If the critique flags a prohibited claim, let's replace it in the product name
            clean_product = product
            import re
            for flagged_word in re.findall(r"'(.*?)'", critique):
                if flagged_word.lower() in clean_product.lower():
                    clean_product = re.sub(re.escape(flagged_word), "This", clean_product, flags=re.IGNORECASE).strip()
            if not clean_product:
                clean_product = "This Premium Product"

            return [
                AdCopyVariant(
                    headline=f"Limited Time: Stop Waiting & Experience {clean_product}",
                    primary_text=f"Reflexion-Optimized Copy: {desc} Engineered for maximum conversion.",
                    call_to_action="Claim Offer Now",
                    hook_angle="Urgency & Benefit",
                    model_used="Mock GPT-4o (Reflexion Mode)"
                ),
                AdCopyVariant(
                    headline=f"Why 10,000+ Customers Switch to {clean_product}",
                    primary_text=f"Proven results backed by science. {desc}",
                    call_to_action="Try Risk-Free",
                    hook_angle="Social Proof",
                    model_used="Mock Claude 3.5 Sonnet"
                )
            ]

        if competitor_insights and competitor_insights.get("provided"):
            angles = competitor_insights.get("differentiation_angles") or []
            angle = angles[0] if angles else "Lead with a differentiated value proposition"
            competitor_brand = competitor_insights.get("competitor_brand") or "the competitor"
            return [
                AdCopyVariant(
                    headline=f"Beyond {competitor_brand}: Meet {product}",
                    primary_text=f"{angle}. {desc}",
                    call_to_action="See The Difference",
                    hook_angle=f"Differentiated vs {competitor_brand}: {angle}",
                    model_used="Mock GPT-4o (Competitor-Aware)"
                ),
                AdCopyVariant(
                    headline=f"Why Switch From {competitor_brand} to {product}",
                    primary_text=f"{angle}. Proven results backed by science. {desc}",
                    call_to_action="Try Risk-Free",
                    hook_angle="Competitive Displacement",
                    model_used="Mock Claude 3.5 Sonnet (Competitor-Aware)"
                )
            ]

        # Default Multi-Variant Permutation Matrix
        return [
            AdCopyVariant(
                headline=f"Transform Your Routine with {product}",
                primary_text=f"Engineered for high performance. {desc}",
                call_to_action="Shop Now",
                hook_angle="Problem-Solution",
                model_used="Mock GPT-4o"
            ),
            AdCopyVariant(
                headline=f"The Smarter Way to Experience {product}",
                primary_text=f"Upgrade your daily workflow today. {desc}",
                call_to_action="Learn More",
                hook_angle="Direct Value",
                model_used="Mock Gemini 1.5 Pro"
            )
        ]

class MockVisionProvider(BaseVisionProvider):
    async def generate_visual(self, brief: Dict[str, Any], ratio: str) -> GeneratedVisualAsset:
        url = brief.get("customizer", {}).get("product_image_url") or "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop"
        return GeneratedVisualAsset(
            asset_id="visual_mock_101",
            url=url,
            asset_type="IMAGE",
            aspect_ratio=ratio,
            model_used="Mock Adobe Firefly 3",
            ip_indemnified=True
        )

class MockAudioProvider(BaseAudioProvider):
    async def generate_audio(self, copy: AdCopyVariant) -> GeneratedAudioTrack:
        return GeneratedAudioTrack(
            track_id="audio_mock_202",
            audio_url="https://assets.pencil-ai-demo.local/mock_tts_sample.mp3",
            script_text=f"Attention: {copy.headline}. {copy.primary_text[:50]}",
            duration_seconds=15.0,
            model_used="Mock ElevenLabs Studio Voice"
        )

class MockPredictiveMLProvider(BasePredictiveMLProvider):
    async def score_variant(self, variant: AdCopyVariant) -> PredictiveScoreResult:
        headline = variant.headline
        # Linear feature scoring simulation
        score_base = 78.0
        if "limited" in headline.lower() or "stop" in headline.lower() or "why" in headline.lower():
            score_base += 11.5
        if len(headline) > 15:
            score_base += 4.5
            
        score = min(round(score_base, 1), 98.5)
        
        return PredictiveScoreResult(
            overall_score=score,
            projected_roas_uplift=f"+{round(score * 0.8, 1)}%",
            projected_cpa_reduction=f"-{round(score * 0.5, 1)}%",
            hook_rate_confidence=f"{int(score)}%",
            ad_fatigue_horizon_days=18,
            recommendations=["Mock Feature Extraction Score Computed"]
        )

class MockMetaSDKProvider(BaseMetaSDKProvider):
    async def stage_creative(self, variant: AdCopyVariant, visual: GeneratedVisualAsset) -> MetaStagingPayload:
        page_id = settings.meta_page_id if settings.meta_page_id else "108927162983712"
        return MetaStagingPayload(
            sdk_interface="facebook-python-business-sdk",
            image_hash="a4f891b90c12e8f7",
            video_id="108927162983712",
            creative_id="23850192847192",
            object_story_spec={
                "page_id": page_id,
                "video_data": {
                    "title": variant.headline,
                    "message": variant.primary_text,
                    "call_to_action": {"type": variant.call_to_action.upper().replace(" ", "_")}
                }
            },
            status="READY_FOR_PUBLISH"
        )

class MockCompetitorProvider(BaseCompetitorProvider):
    """
    Deterministic keyword-heuristic competitor ad analysis. Honest mock: clearly
    labeled, no external calls. Real analysis happens in ProductionCompetitorProvider.
    """

    DIFFERENTIATION_MAP = {
        "Urgency": ["Lead with durable long-term value instead of a countdown", "Reassure with a no-pressure guarantee"],
        "Discount": ["Emphasize product quality and outcomes over price", "Highlight value that doesn't depend on a sale window"],
        "Authority/Science": ["Pair credibility claims with real customer results", "Make the evidence tangible with a before/after story"],
        "Direct Value": ["Sharpen the specific benefit with a concrete number or timeframe", "Add social proof to reinforce the claim"],
    }

    WEAKNESS_MAP = {
        "Urgency": ["Relies on time pressure rather than product merit"],
        "Discount": ["Trains customers to wait for a discount instead of valuing the product"],
        "Authority/Science": ["Credibility claim isn't backed by a visible, concrete result"],
        "Direct Value": ["Generic claim with no differentiation"],
    }

    def _classify_hook(self, text: str) -> str:
        lowered = text.lower()
        if any(w in lowered for w in ["limited", "hurry", "today only", "ends soon", "now"]):
            return "Urgency"
        if any(w in lowered for w in ["% off", "sale", "discount", "save $"]):
            return "Discount"
        if any(w in lowered for w in ["dermatologist", "clinical", "study", "proven", "scientist"]):
            return "Authority/Science"
        return "Direct Value"

    async def analyze_competitor_ad(self, competitor: Dict[str, Any], brief: Dict[str, Any]) -> CompetitorAdAnalysis:
        ad_copy = (competitor.get("ad_copy") or "").strip()
        brand = competitor.get("competitor_brand") or "Competitor"
        hook_angle = self._classify_hook(ad_copy)

        return CompetitorAdAnalysis(
            provided=True,
            positioning=f"{brand} leads with a {hook_angle.lower()} angle" if ad_copy else "Insufficient signal to infer positioning",
            hook_angle=hook_angle,
            tone="Urgent & promotional" if hook_angle in ("Urgency", "Discount") else "Confident & informative",
            claims=[s.strip() for s in ad_copy.split(".") if s.strip()][:3],
            call_to_action="Shop Now" if hook_angle == "Discount" else "Learn More",
            inferred_audience=brief.get("target_audience", "General Performance Audience"),
            strengths=["Clear, easily scannable hook"] if ad_copy else [],
            weaknesses=self.WEAKNESS_MAP.get(hook_angle, self.WEAKNESS_MAP["Direct Value"]),
            differentiation_angles=self.DIFFERENTIATION_MAP.get(hook_angle, self.DIFFERENTIATION_MAP["Direct Value"]),
            analyzed_modalities=["TEXT"],
            visual_analysis=None,
            source_url=competitor.get("ad_library_url"),
            model_used="Mock Competitor Analyst"
        )
