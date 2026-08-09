"""
Unit Tests for Service Providers using clean Provider boundaries
"""

import unittest
import asyncio
from app.providers.mocks import (
    MockLLMProvider, MockVisionProvider, MockAudioProvider,
    MockPredictiveMLProvider, MockMetaSDKProvider
)
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset

class TestServices(unittest.TestCase):
    def test_llm_provider(self):
        async def run():
            llm = MockLLMProvider()
            variants = await llm.generate_copy_matrix({"product_name": "Dove Serum"})
            self.assertGreaterEqual(len(variants), 2)
            self.assertIn("Dove Serum", variants[0].headline)
        asyncio.run(run())

    def test_vision_provider(self):
        async def run():
            vision = MockVisionProvider()
            asset = await vision.generate_visual({"customizer": {"product_image_url": "http://img.jpg"}}, "9:16")
            self.assertEqual(asset.aspect_ratio, "9:16")
            self.assertEqual(asset.url, "http://img.jpg")
        asyncio.run(run())

    def test_predictive_ml_provider(self):
        async def run():
            ml = MockPredictiveMLProvider()
            res = await ml.score_variant(AdCopyVariant(headline="Limited Time: Try Now", primary_text="Best value"))
            # Expect higher score because of 'limited' keyword
            self.assertGreater(res.overall_score, 85.0)
        asyncio.run(run())

    def test_meta_sdk_provider(self):
        async def run():
            meta = MockMetaSDKProvider()
            res = await meta.stage_creative(
                AdCopyVariant(headline="Test Title", primary_text="Body text", call_to_action="Shop Now"),
                GeneratedVisualAsset(asset_id="101", url="http://img.jpg")
            )
            self.assertEqual(res.status, "READY_FOR_PUBLISH")
            self.assertEqual(res.object_story_spec["video_data"]["call_to_action"]["type"], "SHOP_NOW")
        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
