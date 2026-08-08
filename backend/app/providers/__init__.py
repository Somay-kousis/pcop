"""
Providers Package Export
"""

import os
from .base import (
    BaseLLMProvider, BaseVisionProvider, BaseAudioProvider,
    BasePredictiveMLProvider, BaseMetaSDKProvider, BaseCompetitorProvider
)
from .mocks import (
    MockLLMProvider, MockVisionProvider, MockAudioProvider,
    MockPredictiveMLProvider, MockMetaSDKProvider, MockCompetitorProvider
)
from .production import (
    ProductionLLMProvider, ProductionVisionProvider, ProductionAudioProvider,
    ProductionPredictiveMLProvider, ProductionMetaSDKProvider, ProductionCompetitorProvider
)

def get_provider(provider_type: str):
    """
    Factory function returning either Production or Mock provider based on API key presence.
    """
    if provider_type == "llm":
        if (os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_CLOUD_PROJECT")
                or os.getenv("GROQ_API_KEY_1") or os.getenv("GROQ_API_KEY_2") or os.getenv("GROQ_API_KEY_3") or os.getenv("GROQ_API_KEY")):
            return ProductionLLMProvider()
        return MockLLMProvider()

    elif provider_type == "vision":
        if os.getenv("OPENAI_API_KEY") or os.getenv("ADOBE_FIREFLY_API_KEY") or os.getenv("GOOGLE_CLOUD_PROJECT"):
            return ProductionVisionProvider()
        return MockVisionProvider()
        
    elif provider_type == "audio":
        if os.getenv("ELEVENLABS_API_KEY"):
            return ProductionAudioProvider()
        return MockAudioProvider()
        
    elif provider_type == "predictive_ml":
        # Process-local scoring engine
        return ProductionPredictiveMLProvider()
        
    elif provider_type == "meta_sdk":
        if os.getenv("META_SYSTEM_USER_TOKEN"):
            return ProductionMetaSDKProvider()
        return MockMetaSDKProvider()

    elif provider_type == "competitor":
        if (os.getenv("OPENAI_API_KEY") or os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_CLOUD_PROJECT")
                or os.getenv("GROQ_API_KEY_1") or os.getenv("GROQ_API_KEY_2") or os.getenv("GROQ_API_KEY_3") or os.getenv("GROQ_API_KEY")):
            return ProductionCompetitorProvider()
        return MockCompetitorProvider()

    raise ValueError(f"Unknown provider type: {provider_type}")

__all__ = [
    "BaseLLMProvider",
    "BaseVisionProvider",
    "BaseAudioProvider",
    "BasePredictiveMLProvider",
    "BaseMetaSDKProvider",
    "BaseCompetitorProvider",
    "MockLLMProvider",
    "MockVisionProvider",
    "MockAudioProvider",
    "MockPredictiveMLProvider",
    "MockMetaSDKProvider",
    "MockCompetitorProvider",
    "ProductionLLMProvider",
    "ProductionVisionProvider",
    "ProductionAudioProvider",
    "ProductionPredictiveMLProvider",
    "ProductionMetaSDKProvider",
    "ProductionCompetitorProvider",
    "get_provider"
]
