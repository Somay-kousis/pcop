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

if __name__ == "__main__":
    unittest.main()
