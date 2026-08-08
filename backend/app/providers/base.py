"""
Abstract Provider Interfaces for LLM, Vision, Predictive ML, and Meta SDK
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset, GeneratedAudioTrack
from app.schemas.predictive_schema import PredictiveScoreResult
from app.schemas.meta_schema import MetaStagingPayload
from app.schemas.competitor_schema import CompetitorAdAnalysis

class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_copy_matrix(
        self,
        brief: Dict[str, Any],
        critique: str = None,
        competitor_insights: Optional[Dict[str, Any]] = None
    ) -> List[AdCopyVariant]:
        pass

class BaseVisionProvider(ABC):
    @abstractmethod
    async def generate_visual(self, brief: Dict[str, Any], ratio: str) -> GeneratedVisualAsset:
        pass

class BaseAudioProvider(ABC):
    @abstractmethod
    async def generate_audio(self, copy: AdCopyVariant) -> GeneratedAudioTrack:
        pass

class BasePredictiveMLProvider(ABC):
    @abstractmethod
    async def score_variant(self, variant: AdCopyVariant) -> PredictiveScoreResult:
        pass

class BaseMetaSDKProvider(ABC):
    @abstractmethod
    async def stage_creative(self, variant: AdCopyVariant, visual: GeneratedVisualAsset) -> MetaStagingPayload:
        pass

class BaseCompetitorProvider(ABC):
    @abstractmethod
    async def analyze_competitor_ad(self, competitor: Dict[str, Any], brief: Dict[str, Any]) -> CompetitorAdAnalysis:
        pass
