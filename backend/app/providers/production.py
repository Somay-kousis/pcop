"""
Production API Providers calling OpenAI, Vertex AI, Groq, Gemini, ElevenLabs, and Meta APIs
Falls back dynamically to Mock implementations if API credentials are not supplied.
"""

import os
import logging
from typing import Dict, Any, List, Optional
from app.providers.base import (
    BaseLLMProvider, BaseVisionProvider, BaseAudioProvider,
    BasePredictiveMLProvider, BaseMetaSDKProvider, BaseCompetitorProvider
)
from app.providers.mocks import (
    MockLLMProvider, MockVisionProvider, MockAudioProvider,
    MockPredictiveMLProvider, MockMetaSDKProvider, MockCompetitorProvider
)
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset, GeneratedAudioTrack
from app.schemas.predictive_schema import PredictiveScoreResult
from app.schemas.meta_schema import MetaStagingPayload
from app.schemas.competitor_schema import CompetitorAdAnalysis
from app.providers.vertex_client import get_vertex_client, is_vertex_configured, VERTEX_TEXT_MODEL, VERTEX_IMAGE_MODEL

logger = logging.getLogger("pencil.providers.production")

# Hard caps on every text-generation call, independent of source, so a
# misbehaving prompt or provider can never run up an unbounded bill.
MAX_COPY_OUTPUT_TOKENS = 400
MAX_ANALYSIS_OUTPUT_TOKENS = 700

GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"
# llama-3.3-70b-versatile was deprecated June 2026; this is Groq's current
# recommended replacement for that tier.
GROQ_MODEL = "openai/gpt-oss-120b"

_groq_key_rotation_index = 0


def _get_groq_keys() -> List[str]:
    keys = [os.getenv(f"GROQ_API_KEY_{i}", "").strip() for i in range(1, 4)]
    single = os.getenv("GROQ_API_KEY", "").strip()
    if single:
        keys.append(single)
    return [k for k in keys if k]


def _next_groq_key() -> Optional[str]:
    """Round-robins across configured Groq keys to spread rate-limit load."""
    global _groq_key_rotation_index
    keys = _get_groq_keys()
    if not keys:
        return None
    key = keys[_groq_key_rotation_index % len(keys)]
    _groq_key_rotation_index += 1
    return key


class ProductionLLMProvider(BaseLLMProvider):
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.use_vertex = is_vertex_configured()
        self.groq_available = bool(_get_groq_keys())
        self.fallback = MockLLMProvider()

    async def generate_copy_matrix(
        self,
        brief: Dict[str, Any],
        critique: str = None,
        competitor_insights: Optional[Dict[str, Any]] = None
    ) -> List[AdCopyVariant]:
        if not self.openai_key and not self.use_vertex and not self.groq_available and not self.gemini_key:
            logger.warning("No LLM credentials configured. Falling back to MockLLMProvider.")
            return await self.fallback.generate_copy_matrix(brief, critique, competitor_insights)

        competitor_context = ""
        if competitor_insights and competitor_insights.get("provided"):
            angles = competitor_insights.get("differentiation_angles") or []
            competitor_context = f" Differentiate from this competitor's angle ({competitor_insights.get('hook_angle')}): {'; '.join(angles)}."

        prompt = (
            f"Generate a single high-converting ad headline and one-sentence body for: "
            f"{brief.get('product_name')} - {brief.get('product_description')}. "
            f"Critique: {critique}.{competitor_context}"
        )

        # Waterfall, priority order: OpenAI > Vertex AI (draws on Cloud
        # Billing credit) > Groq > legacy AI Studio Gemini key (excluded
        # from Cloud trial credit as of March 2026, so tried last). Each
        # attempt catches its own failures and returns None so one bad
        # provider doesn't skip the rest of the chain. Calling these
        # sequentially (not as a pre-built tuple of coroutines) means an
        # early return never leaves a later coroutine un-awaited.
        result = await self._try_openai(brief, prompt)
        if result:
            return result
        result = await self._try_vertex(brief, prompt)
        if result:
            return result
        result = await self._try_groq(brief, prompt)
        if result:
            return result
        result = await self._try_gemini_legacy(brief, prompt)
        if result:
            return result

        return await self.fallback.generate_copy_matrix(brief, critique, competitor_insights)

    async def _try_openai(self, brief: Dict[str, Any], prompt: str) -> Optional[List[AdCopyVariant]]:
        if not self.openai_key:
            return None
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": "You are an expert copywriter. Output headline suggestions."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": MAX_COPY_OUTPUT_TOKENS
                }
                res = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                if res.status_code == 200:
                    text = res.json()["choices"][0]["message"]["content"]
                    return [
                        AdCopyVariant(
                            headline=f"Experience {brief.get('product_name')}",
                            primary_text=text[:200],
                            call_to_action="Shop Now",
                            hook_angle="Problem-Solution",
                            model_used="Production GPT-4o"
                        )
                    ]
                logger.warning(f"OpenAI copy generation returned {res.status_code}.")
        except Exception as e:
            logger.error(f"OpenAI copy generation failed: {e}")
        return None

    async def _try_vertex(self, brief: Dict[str, Any], prompt: str) -> Optional[List[AdCopyVariant]]:
        if not self.use_vertex:
            return None
        vertex_client = get_vertex_client()
        if not vertex_client:
            logger.warning("Vertex AI configured but client init failed.")
            return None
        try:
            import asyncio
            from google.genai import types as genai_types
            response = await asyncio.to_thread(
                vertex_client.models.generate_content,
                model=VERTEX_TEXT_MODEL,
                contents=prompt,
                config=genai_types.GenerateContentConfig(max_output_tokens=MAX_COPY_OUTPUT_TOKENS)
            )
            text = response.text or ""
            if not text:
                return None
            return [
                AdCopyVariant(
                    headline=f"Experience {brief.get('product_name')}",
                    primary_text=text[:200],
                    call_to_action="Shop Now",
                    hook_angle="Problem-Solution",
                    model_used=f"Production Vertex AI ({VERTEX_TEXT_MODEL})"
                )
            ]
        except Exception as e:
            logger.error(f"Vertex AI copy generation failed: {e}")
        return None

    async def _try_groq(self, brief: Dict[str, Any], prompt: str) -> Optional[List[AdCopyVariant]]:
        groq_key = _next_groq_key()
        if not groq_key:
            return None
        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
                payload = {
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": "You are an expert copywriter. Output headline suggestions."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.7,
                    "max_tokens": MAX_COPY_OUTPUT_TOKENS
                }
                res = await client.post(GROQ_CHAT_URL, json=payload, headers=headers)
                if res.status_code == 200:
                    text = res.json()["choices"][0]["message"]["content"]
                    return [
                        AdCopyVariant(
                            headline=f"Experience {brief.get('product_name')}",
                            primary_text=text[:200],
                            call_to_action="Shop Now",
                            hook_angle="Problem-Solution",
                            model_used=f"Production Groq ({GROQ_MODEL})"
                        )
                    ]
                logger.warning(f"Groq copy generation returned {res.status_code}.")
        except Exception as e:
            logger.error(f"Groq copy generation failed: {e}")
        return None

    async def _try_gemini_legacy(self, brief: Dict[str, Any], prompt: str) -> Optional[List[AdCopyVariant]]:
        if not self.gemini_key:
            return None
        try:
            import httpx
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={self.gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": MAX_COPY_OUTPUT_TOKENS}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return [
                        AdCopyVariant(
                            headline=f"Switch to {brief.get('product_name')}",
                            primary_text=text[:200],
                            call_to_action="Learn More",
                            hook_angle="Direct Benefit",
                            model_used="Production Gemini 1.5 Pro (AI Studio)"
                        )
                    ]
                logger.warning(f"Gemini (AI Studio) copy generation returned {res.status_code}.")
        except Exception as e:
            logger.error(f"Gemini (AI Studio) copy generation failed: {e}")
        return None

class ProductionVisionProvider(BaseVisionProvider):
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.use_vertex = is_vertex_configured()
        self.fallback = MockVisionProvider()

    async def generate_visual(self, brief: Dict[str, Any], ratio: str) -> GeneratedVisualAsset:
        if not self.openai_key and not self.use_vertex:
            logger.warning("No OpenAI key or Vertex project configured for visual generation. Falling back to MockVisionProvider.")
            return await self.fallback.generate_visual(brief, ratio)

        try:
            if not self.openai_key and self.use_vertex:
                vertex_client = get_vertex_client()
                if vertex_client:
                    import asyncio
                    import base64
                    from google.genai import types as genai_types
                    prompt = (
                        f"Product ad image for {brief.get('product_name')}. "
                        f"{brief.get('product_description')}. Clean studio lighting, professional photography."
                    )
                    response = await asyncio.to_thread(
                        vertex_client.models.generate_images,
                        model=VERTEX_IMAGE_MODEL,
                        prompt=prompt,
                        config=genai_types.GenerateImagesConfig(number_of_images=1, output_mime_type="image/jpeg")
                    )
                    image_bytes = response.generated_images[0].image.image_bytes
                    data_uri = f"data:image/jpeg;base64,{base64.b64encode(image_bytes).decode()}"
                    return GeneratedVisualAsset(
                        asset_id="visual_vertex_101",
                        url=data_uri,
                        asset_type="IMAGE",
                        aspect_ratio=ratio,
                        model_used=f"Production Vertex AI ({VERTEX_IMAGE_MODEL})",
                        ip_indemnified=True
                    )
                logger.warning("Vertex AI configured but client init failed for visual generation.")

            import httpx
            async with httpx.AsyncClient(timeout=20.0) as client:
                headers = {
                    "Authorization": f"Bearer {self.openai_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": "dall-e-3",
                    "prompt": f"Product ad image for {brief.get('product_name')}. {brief.get('product_description')}. Clean studio lighting, professional photography.",
                    "n": 1,
                    "size": "1024x1024"
                }
                res = await client.post("https://api.openai.com/v1/images/generations", json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    image_url = data["data"][0]["url"]
                    return GeneratedVisualAsset(
                        asset_id="visual_prod_202",
                        url=image_url,
                        asset_type="IMAGE",
                        aspect_ratio=ratio,
                        model_used="Production DALL-E 3",
                        ip_indemnified=True
                    )
        except Exception as e:
            logger.error(f"Production Vision failed: {e}. Falling back to Mock Vision.")

        return await self.fallback.generate_visual(brief, ratio)

class ProductionAudioProvider(BaseAudioProvider):
    def __init__(self):
        self.elevenlabs_key = os.getenv("ELEVENLABS_API_KEY", "")
        self.fallback = MockAudioProvider()

    async def generate_audio(self, copy: AdCopyVariant) -> GeneratedAudioTrack:
        if not self.elevenlabs_key:
            logger.warning("No ElevenLabs key found. Falling back to MockAudioProvider.")
            return await self.fallback.generate_audio(copy)

        try:
            import httpx
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {
                    "xi-api-key": self.elevenlabs_key,
                    "Content-Type": "application/json"
                }
                payload = {
                    "text": f"{copy.headline}. {copy.primary_text}",
                    "model_id": "eleven_monolingual_v1",
                    "voice_settings": {
                        "stability": 0.5,
                        "similarity_boost": 0.75
                    }
                }
                voice_id = "21m00Tcm4TlvDq8ikWAM" # Default voice ID
                url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    # In a real environment, we'd save the binary audio response to an S3 url or local path.
                    return GeneratedAudioTrack(
                        track_id="audio_prod_303",
                        audio_url="https://assets.pencil-ai-demo.local/tts_sample.mp3",
                        script_text=f"Attention: {copy.headline}",
                        duration_seconds=15.0,
                        model_used="Production ElevenLabs voice"
                    )
        except Exception as e:
            logger.error(f"Production Audio failed: {e}. Falling back to Mock Audio.")

        return await self.fallback.generate_audio(copy)

class ProductionPredictiveMLProvider(BasePredictiveMLProvider):
    def __init__(self):
        # We reuse the MockPredictiveMLProvider features since ML weight evaluation is process-local math
        self.fallback = MockPredictiveMLProvider()

    async def score_variant(self, variant: AdCopyVariant) -> PredictiveScoreResult:
        return await self.fallback.score_variant(variant)

class ProductionMetaSDKProvider(BaseMetaSDKProvider):
    def __init__(self):
        self.token = os.getenv("META_SYSTEM_USER_TOKEN", "")
        self.fallback = MockMetaSDKProvider()

    async def stage_creative(self, variant: AdCopyVariant, visual: GeneratedVisualAsset) -> MetaStagingPayload:
        if not self.token:
            logger.warning("No Meta User Token found. Falling back to MockMetaSDKProvider.")
            return await self.fallback.stage_creative(variant, visual)

        # Meta Graph API integration
        try:
            import httpx
            account_id = os.getenv("META_AD_ACCOUNT_ID", "")
            page_id = os.getenv("META_PAGE_ID", "108927162983712")
            url = f"https://graph.facebook.com/v19.0/{account_id}/adcreatives"

            headers = {
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json"
            }
            payload = {
                "name": "Pencil Staged AdCreative",
                "object_story_spec": {
                    "page_id": page_id,
                    "link_data": {
                        "image_hash": "a4f891b90c12e8f7",
                        "link": "https://brand.com",
                        "message": variant.primary_text,
                        "name": variant.headline,
                        "call_to_action": {"type": variant.call_to_action.upper().replace(" ", "_")}
                    }
                }
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    return MetaStagingPayload(
                        sdk_interface="facebook-python-business-sdk",
                        image_hash="a4f891b90c12e8f7",
                        video_id="108927162983712",
                        creative_id=data.get("id", "23850192847192"),
                        object_story_spec=payload["object_story_spec"],
                        status="READY_FOR_PUBLISH"
                    )
        except Exception as e:
            logger.error(f"Production Meta Staging failed: {e}. Falling back to Mock.")

        return await self.fallback.stage_creative(variant, visual)

class ProductionCompetitorProvider(BaseCompetitorProvider):
    def __init__(self):
        self.openai_key = os.getenv("OPENAI_API_KEY", "")
        self.gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.use_vertex = is_vertex_configured()
        self.groq_available = bool(_get_groq_keys())
        self.fallback = MockCompetitorProvider()

    async def analyze_competitor_ad(self, competitor: Dict[str, Any], brief: Dict[str, Any]) -> CompetitorAdAnalysis:
        if not self.openai_key and not self.use_vertex and not self.groq_available and not self.gemini_key:
            logger.warning("No LLM credentials configured for competitor analysis. Falling back to MockCompetitorProvider.")
            return await self.fallback.analyze_competitor_ad(competitor, brief)

        ad_copy = competitor.get("ad_copy", "")
        brand = competitor.get("competitor_brand", "the competitor")
        system_prompt = "You are a competitive ad-intelligence analyst. Respond with strict JSON only."
        user_prompt = (
            f"Analyze this competitor ad from '{brand}': \"{ad_copy}\". "
            f"We are marketing: {brief.get('product_name')} - {brief.get('product_description')}. "
            "Respond ONLY with JSON: {\"positioning\":str, \"hook_angle\":str, \"tone\":str, "
            "\"claims\":[str], \"call_to_action\":str, \"strengths\":[str], \"weaknesses\":[str], "
            "\"differentiation_angles\":[str]}"
        )

        result = await self._try_openai(brief, competitor, system_prompt, user_prompt)
        if result:
            return result
        result = await self._try_vertex(brief, competitor, system_prompt, user_prompt)
        if result:
            return result
        result = await self._try_groq(brief, competitor, system_prompt, user_prompt)
        if result:
            return result
        result = await self._try_gemini_legacy(brief, competitor, user_prompt)
        if result:
            return result

        return await self.fallback.analyze_competitor_ad(competitor, brief)

    def _build_analysis(self, brief: Dict[str, Any], competitor: Dict[str, Any], model_used: str, parsed: Dict[str, Any]) -> CompetitorAdAnalysis:
        # Strip any of our explicit kwargs the model may have echoed back into
        # its JSON (it was only asked for the other 7 fields, but a
        # hallucinated overlap would otherwise raise "multiple values for
        # keyword argument" and needlessly fail this provider attempt).
        reserved = {"provided", "inferred_audience", "analyzed_modalities", "source_url", "model_used"}
        parsed = {k: v for k, v in parsed.items() if k not in reserved}
        return CompetitorAdAnalysis(
            provided=True,
            inferred_audience=brief.get("target_audience", "General Performance Audience"),
            analyzed_modalities=["TEXT"],
            source_url=competitor.get("ad_library_url"),
            model_used=model_used,
            **parsed
        )

    async def _try_openai(self, brief, competitor, system_prompt, user_prompt) -> Optional[CompetitorAdAnalysis]:
        if not self.openai_key:
            return None
        try:
            import httpx, json as jsonlib
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {self.openai_key}", "Content-Type": "application/json"}
                payload = {
                    "model": "gpt-4o",
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": MAX_ANALYSIS_OUTPUT_TOKENS,
                    "response_format": {"type": "json_object"}
                }
                res = await client.post("https://api.openai.com/v1/chat/completions", json=payload, headers=headers)
                if res.status_code == 200:
                    text = res.json()["choices"][0]["message"]["content"]
                    return self._build_analysis(brief, competitor, "Production GPT-4o", jsonlib.loads(text))
                logger.warning(f"OpenAI competitor analysis returned {res.status_code}.")
        except Exception as e:
            logger.error(f"OpenAI competitor analysis failed: {e}")
        return None

    async def _try_vertex(self, brief, competitor, system_prompt, user_prompt) -> Optional[CompetitorAdAnalysis]:
        if not self.use_vertex:
            return None
        vertex_client = get_vertex_client()
        if not vertex_client:
            logger.warning("Vertex AI configured but client init failed for competitor analysis.")
            return None
        try:
            import asyncio, json as jsonlib
            from google.genai import types as genai_types
            response = await asyncio.to_thread(
                vertex_client.models.generate_content,
                model=VERTEX_TEXT_MODEL,
                contents=f"{system_prompt}\n\n{user_prompt}",
                config=genai_types.GenerateContentConfig(
                    max_output_tokens=MAX_ANALYSIS_OUTPUT_TOKENS,
                    response_mime_type="application/json"
                )
            )
            if not response.text:
                return None
            return self._build_analysis(brief, competitor, f"Production Vertex AI ({VERTEX_TEXT_MODEL})", jsonlib.loads(response.text))
        except Exception as e:
            logger.error(f"Vertex AI competitor analysis failed: {e}")
        return None

    async def _try_groq(self, brief, competitor, system_prompt, user_prompt) -> Optional[CompetitorAdAnalysis]:
        groq_key = _next_groq_key()
        if not groq_key:
            return None
        try:
            import httpx, json as jsonlib
            async with httpx.AsyncClient(timeout=15.0) as client:
                headers = {"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"}
                payload = {
                    "model": GROQ_MODEL,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": MAX_ANALYSIS_OUTPUT_TOKENS,
                    "response_format": {"type": "json_object"}
                }
                res = await client.post(GROQ_CHAT_URL, json=payload, headers=headers)
                if res.status_code == 200:
                    text = res.json()["choices"][0]["message"]["content"]
                    return self._build_analysis(brief, competitor, f"Production Groq ({GROQ_MODEL})", jsonlib.loads(text))
                logger.warning(f"Groq competitor analysis returned {res.status_code}.")
        except Exception as e:
            logger.error(f"Groq competitor analysis failed: {e}")
        return None

    async def _try_gemini_legacy(self, brief, competitor, user_prompt) -> Optional[CompetitorAdAnalysis]:
        if not self.gemini_key:
            return None
        try:
            import httpx, json as jsonlib
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={self.gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": user_prompt}]}],
                "generationConfig": {"maxOutputTokens": MAX_ANALYSIS_OUTPUT_TOKENS, "responseMimeType": "application/json"}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return self._build_analysis(brief, competitor, "Production Gemini 1.5 Pro (AI Studio)", jsonlib.loads(text))
                logger.warning(f"Gemini (AI Studio) competitor analysis returned {res.status_code}.")
        except Exception as e:
            logger.error(f"Gemini (AI Studio) competitor analysis failed: {e}")
        return None
