"""
Unit Tests for the Competitor Analysis DAG Node
"""

import unittest
import asyncio
from app.nodes.competitor_node import competitor_analysis_node

ALLOWED_KEYS = {"competitor_insights", "execution_steps", "errors", "_short_circuit"}

class TestCompetitorNode(unittest.TestCase):
    def test_node_without_competitor_ad(self):
        async def run():
            result = await competitor_analysis_node({"brief_data": {}})
            # Must be truthy, not {} -- engine.py:110's reflexion memoization
            # guard checks `state[k]` truthiness and would re-run this node
            # on every reflexion pass otherwise.
            self.assertEqual(result["competitor_insights"], {"provided": False})
            self.assertTrue(result["competitor_insights"])
            self.assertTrue(set(result.keys()).issubset(ALLOWED_KEYS))
        asyncio.run(run())

    def test_node_with_competitor_ad(self):
        async def run():
            state = {
                "brief_data": {
                    "product_name": "Hydrating Serum",
                    "target_audience": "Beauty",
                    "competitor_ad": {
                        "ad_copy": "Dermatologist recommended, clinically proven results.",
                        "competitor_brand": "RivalCo"
                    }
                }
            }
            result = await competitor_analysis_node(state)
            self.assertTrue(result["competitor_insights"]["provided"])
            self.assertEqual(result["competitor_insights"]["hook_angle"], "Authority/Science")
            self.assertTrue(set(result.keys()).issubset(ALLOWED_KEYS))
        asyncio.run(run())

if __name__ == "__main__":
    unittest.main()
