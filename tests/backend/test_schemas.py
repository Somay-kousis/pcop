"""
Unit Tests for Pydantic Data Schemas
"""

import unittest
from pydantic import ValidationError
from app.schemas.brief_schema import CampaignBriefRequest, BrandDNARules, CustomizerOverrides
from app.schemas.asset_schema import AdCopyVariant, GeneratedVisualAsset
from app.schemas.predictive_schema import PredictiveScoreResult
from app.schemas.meta_schema import MetaStagingPayload
from app.schemas.competitor_schema import CompetitorAdInput, CompetitorAdAnalysis

class TestSchemas(unittest.TestCase):
    def test_brief_schema_defaults(self):
        brief = CampaignBriefRequest(
            product_name="Test Product",
            product_description="Test Description"
        )
        self.assertEqual(brief.product_name, "Test Product")
        self.assertEqual(brief.brand_dna.brand_name, "Unilever Dove")
        self.assertIn("Meta", brief.target_platforms)
        self.assertIsNone(brief.competitor_ad)

    def test_competitor_input_requires_signal(self):
        with self.assertRaises(ValidationError):
            CompetitorAdInput()

        # ad_copy alone is sufficient
        CompetitorAdInput(ad_copy="Limited time offer, act now!")

        # screenshot_url alone is sufficient (proves the future vision path is pre-wired)
        CompetitorAdInput(screenshot_url="https://example.com/ad.png")

    def test_competitor_analysis_defaults(self):
        analysis = CompetitorAdAnalysis()
        self.assertTrue(analysis.provided)
        self.assertEqual(analysis.analyzed_modalities, ["TEXT"])
        self.assertIsNone(analysis.visual_analysis)

    def test_asset_schema(self):
        copy = AdCopyVariant(headline="Test Headline", primary_text="Test Body")
        self.assertEqual(copy.call_to_action, "Shop Now")
        
        visual = GeneratedVisualAsset(asset_id="101", url="https://example.com/img.jpg")
        self.assertTrue(visual.ip_indemnified)

    def test_meta_payload(self):
        meta = MetaStagingPayload()
        self.assertEqual(meta.status, "READY_FOR_PUBLISH")
        self.assertEqual(meta.sdk_interface, "facebook-python-business-sdk")

if __name__ == "__main__":
    unittest.main()
