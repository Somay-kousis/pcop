"""
Integration Tests for Declarative Parallel DAG Engine and Event Bus
"""

import unittest
import asyncio
from app.agents.orchestrator import agent_orchestrator
from app.core.event_bus import event_bus

class TestParallelDAGEngine(unittest.TestCase):
    def test_declarative_parallel_dag(self):
        async def run():
            run_id = "test_run_101"
            queue = event_bus.subscribe(run_id)

            result = await agent_orchestrator.run_pipeline({
                "product_name": "Dove Hydrating Cream",
                "product_description": "Moisturizing face cream",
                "target_audience": "Beauty & Skincare",
                "target_platforms": ["Meta", "TikTok"]
            }, run_id=run_id)

            # Assert pipeline status and properties
            self.assertEqual(result["status"], "SUCCESS")
            self.assertEqual(result["run_id"], run_id)
            self.assertIn("permutation_matrix", result)
            self.assertGreaterEqual(len(result["permutation_matrix"]), 1)
            self.assertIn("trend_insights", result)
            self.assertIn("winner_insights", result)
            
            # Check that Reflexion ran and approved the best candidate
            self.assertIn("predictive_scoring", result)
            self.assertIn("overall_score", result["predictive_scoring"])

            # Check that events were published to the event queue
            events_received = []
            while not queue.empty():
                evt = await queue.get()
                events_received.append(evt.event_type)

            self.assertIn("PIPELINE_COMPLETED", events_received)
            event_bus.unsubscribe(run_id, queue)

        asyncio.run(run())

    def test_competitor_comparison_flows_to_result(self):
        async def run():
            result = await agent_orchestrator.run_pipeline({
                "product_name": "Hydrating Serum",
                "product_description": "24-hour hydration",
                "target_audience": "Beauty & Skincare",
                "competitor_ad": {
                    "ad_copy": "Dermatologist recommended, clinically proven results.",
                    "competitor_brand": "RivalCo"
                }
            }, run_id="test_competitor_comparison_run")

            self.assertIn("competitor_comparison", result)
            self.assertTrue(result["competitor_comparison"]["competitor"]["provided"])
            self.assertTrue(result["competitor_comparison"]["ours"]["headline"])
            # Proves the analysis actually reached the LLM prompt, not just the response envelope.
            self.assertIn("Competitor-Aware", result["ad_variant"]["models"]["copy"])

        asyncio.run(run())

    def test_competitor_survives_reflexion(self):
        async def run():
            # Force reflexion via a prohibited claim, mirroring test_custom_compliance.py
            result = await agent_orchestrator.run_pipeline({
                "product_name": "Dove Cream",
                "product_description": "Luxury moisturization cream",
                "brand_dna": {
                    "brand_name": "Dove",
                    "prohibited_claims": ["Dove"]
                },
                "competitor_ad": {
                    "ad_copy": "Limited time offer, act now!",
                    "competitor_brand": "RivalCo"
                }
            }, run_id="test_competitor_reflexion_run")

            stages = [stage["stage"] for stage in result["pipeline_stages"]]
            self.assertTrue(any("Reflexion Self-Correction Gate" in s for s in stages))
            self.assertTrue(result["competitor_comparison"]["competitor"]["provided"])

        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
