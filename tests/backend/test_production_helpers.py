"""
Unit Tests for Pure-Logic Helpers in the Production Provider Module
(Groq key rotation, reserved-key stripping) -- no network calls.
"""

import unittest
import os
from unittest.mock import patch
import app.providers.production as production


class TestGroqKeyHelpers(unittest.TestCase):
    def test_get_groq_keys_filters_empty(self):
        env = {"GROQ_API_KEY_1": "key1", "GROQ_API_KEY_2": "", "GROQ_API_KEY_3": "key3", "GROQ_API_KEY": ""}
        with patch.dict(os.environ, env, clear=False):
            keys = production._get_groq_keys()
            self.assertEqual(keys, ["key1", "key3"])

    def test_get_groq_keys_empty_when_unset(self):
        env_clear = {k: "" for k in ["GROQ_API_KEY_1", "GROQ_API_KEY_2", "GROQ_API_KEY_3", "GROQ_API_KEY"]}
        with patch.dict(os.environ, env_clear, clear=False):
            self.assertEqual(production._get_groq_keys(), [])

    def test_next_groq_key_rotates(self):
        env = {"GROQ_API_KEY_1": "key1", "GROQ_API_KEY_2": "key2", "GROQ_API_KEY_3": ""}
        with patch.dict(os.environ, env, clear=False):
            # Reset rotation state so this test doesn't depend on execution order.
            production._groq_key_rotation_index = 0
            seen = [production._next_groq_key() for _ in range(4)]
            self.assertEqual(seen, ["key1", "key2", "key1", "key2"])


class TestBuildAnalysisReservedKeys(unittest.TestCase):
    def test_strips_reserved_keys_from_llm_output(self):
        provider = production.ProductionCompetitorProvider()
        # Simulate a hallucinated LLM response that echoes back one of our
        # explicit kwargs -- this used to raise "multiple values for keyword
        # argument" and needlessly fail the whole provider attempt.
        parsed = {
            "positioning": "Aggressive discounting",
            "hook_angle": "Discount",
            "model_used": "some hallucinated value",
            "provided": False,
        }
        analysis = provider._build_analysis(
            brief={"target_audience": "Beauty"},
            competitor={"ad_library_url": "https://example.com"},
            model_used="Production GPT-4o",
            parsed=parsed,
        )
        self.assertEqual(analysis.model_used, "Production GPT-4o")
        self.assertTrue(analysis.provided)
        self.assertEqual(analysis.positioning, "Aggressive discounting")


if __name__ == "__main__":
    unittest.main()
