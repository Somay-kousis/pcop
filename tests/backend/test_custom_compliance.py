"""
Unit Tests for Custom Brand DNA Compliance and Reflexion Loop
"""

import unittest
import asyncio
from app.agents.orchestrator import agent_orchestrator

class TestCustomCompliance(unittest.TestCase):
    def test_custom_prohibited_claims_trigger_reflexion(self):
        async def run():
            # Ingest a brand safety rule prohibiting the word " Dove " (with boundary check)
            result = await agent_orchestrator.run_pipeline({
                "product_name": "Dove Cream",
                "product_description": "Luxury moisturization cream",
                "brand_dna": {
                    "brand_name": "Dove",
                    "prohibited_claims": ["Dove"]  # Prohibit the brand name itself
                }
            }, run_id="test_custom_compliance_run")

            # Check compliance status in final state
            # The first pass copywriter will yield "Dove Cream", violating the prohibited claim "Dove".
            # The reflection node will capture this, create a critique, and loop back.
            # The second pass copywriter avoids "Dove" in the copy, yielding a successful PASSED state.
            self.assertEqual(result["status"], "SUCCESS")
            self.assertIn("compliance", result)
            self.assertEqual(result["compliance"]["status"], "PASSED")
            
            stages = [stage["stage"] for stage in result["pipeline_stages"]]
            self.assertTrue(any("Reflexion Self-Correction Gate" in s for s in stages))

        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
