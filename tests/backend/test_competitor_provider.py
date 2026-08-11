"""
Unit Tests for Competitor Ad Analysis Provider
"""

import unittest
import asyncio
from app.providers import get_provider
from app.providers.mocks import MockCompetitorProvider

class TestCompetitorProvider(unittest.TestCase):
    def test_get_provider_returns_mock_without_keys(self):
        # No API keys are set in this test environment, matching the existing
        # convention (providers are never patched -- see test_services.py).
        provider = get_provider("competitor")
        self.assertIsInstance(provider, MockCompetitorProvider)

    def test_analyze_urgency_competitor_ad(self):
        async def run():
            provider = MockCompetitorProvider()
            analysis = await provider.analyze_competitor_ad(
                {"ad_copy": "Limited time offer, act now and save!", "competitor_brand": "RivalCo"},
                {"target_audience": "Beauty & Skincare"}
            )
            self.assertTrue(analysis.provided)
            self.assertEqual(analysis.hook_angle, "Urgency")
            self.assertGreaterEqual(len(analysis.differentiation_angles), 1)
        asyncio.run(run())

    def test_running_since_surfaces_as_a_strength(self):
        async def run():
            provider = MockCompetitorProvider()
            analysis = await provider.analyze_competitor_ad(
                {"ad_copy": "Clinically proven results.", "running_since": "March 2025"},
                {}
            )
            self.assertTrue(any("March 2025" in s for s in analysis.strengths))
        asyncio.run(run())

    def test_style_notes_fold_into_differentiation_angles(self):
        async def run():
            provider = MockCompetitorProvider()
            analysis = await provider.analyze_competitor_ad(
                {"ad_copy": "Save big today.", "style_notes": "minimalist font and colors"},
                {}
            )
            self.assertTrue(any("minimalist font and colors" in a for a in analysis.differentiation_angles))
        asyncio.run(run())

    def test_screenshot_without_vision_provider_is_honestly_unanalyzed(self):
        async def run():
            provider = MockCompetitorProvider()
            analysis = await provider.analyze_competitor_ad(
                {"ad_copy": "Save big today.", "screenshot_url": "data:image/png;base64,abc"},
                {}
            )
            # Mock never does real vision analysis -- modalities must stay
            # TEXT-only and the gap must be stated, not silently claimed.
            self.assertEqual(analysis.analyzed_modalities, ["TEXT"])
            self.assertIsNotNone(analysis.visual_analysis)
            self.assertIn("no live vision-capable provider", analysis.visual_analysis["note"])
        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
