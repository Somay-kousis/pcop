"""
Unit Tests for DAG Topology Construction and Level Placement
"""

import unittest
from app.graph.builder import build_orchestrator_graph

class TestGraphTopology(unittest.TestCase):
    def test_competitor_analysis_level_placement(self):
        # Construction alone exercises cycle detection and same-level write
        # conflict validation -- if this doesn't raise, the graph is valid.
        engine = build_orchestrator_graph()

        level_2_names = [n.name for n in engine.levels[1]]
        level_3_names = [n.name for n in engine.levels[2]]

        self.assertIn("competitor_analysis", level_2_names)
        self.assertIn("trend_rag", level_2_names)
        self.assertIn("winner_rag", level_2_names)
        self.assertIn("copy_matrix", level_3_names)

if __name__ == "__main__":
    unittest.main()
