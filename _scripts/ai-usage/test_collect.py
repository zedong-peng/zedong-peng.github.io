"""Unit tests for the ccusage mapping and the merge rules. Run: python3 test_collect.py"""

import json
import os
import tempfile
import unittest

import collect


SAMPLE = {
    "daily": [
        {
            "period": "2026-10-20",
            "agent": "all",
            "modelBreakdowns": [],
            "agents": [
                {
                    "agent": "claude",
                    "modelBreakdowns": [
                        {"modelName": "claude-opus-5-5", "inputTokens": 100, "cacheReadTokens": 2000,
                         "cacheCreationTokens": 300, "outputTokens": 40, "cost": 1.5},
                        {"modelName": "claude-sonnet-5", "inputTokens": 0, "cacheReadTokens": 0,
                         "cacheCreationTokens": 0, "outputTokens": 0, "cost": 0},
                    ],
                },
                {
                    "agent": "pi",
                    "modelBreakdowns": [
                        {"modelName": "[pi] muse-spark-1.3-contributor", "inputTokens": 10,
                         "cacheReadTokens": 0, "cacheCreationTokens": 0, "outputTokens": 5,
                         "cost": 0.0001},
                    ],
                },
            ],
        }
    ]
}


class CcusageRows(unittest.TestCase):
    def test_maps_agents_to_tools(self):
        rows, errors = collect.ccusage_rows(SAMPLE)
        self.assertEqual(errors, [])
        self.assertEqual([(row[0], row[1], row[2]) for row in rows],
                         [("2026-10-20", "claude-code", "claude-opus-5-5"),
                          ("2026-10-20", "pi", "muse-spark-1.3-contributor")])

    def test_splits_token_kinds(self):
        row = collect.ccusage_rows(SAMPLE)[0][0]
        # date, tool, model, requests, input, cache_read, cache_write, output, api_usd
        self.assertEqual(row[3:8], [0, 100, 2000, 300, 40])
        self.assertAlmostEqual(row[8], 1.5)

    def test_skips_empty_models(self):
        rows, _ = collect.ccusage_rows(SAMPLE)
        self.assertNotIn("claude-sonnet-5", [row[2] for row in rows])

    def test_falls_back_without_by_agent(self):
        flat = {"daily": [{"period": "2026-10-20", "agent": "all", "modelBreakdowns": [
            {"modelName": "gpt-5-codex", "inputTokens": 1, "cacheReadTokens": 2,
             "cacheCreationTokens": 0, "outputTokens": 3, "cost": 0.01}]}]}
        rows, _ = collect.ccusage_rows(flat)
        self.assertEqual(rows[0][1:3], ["all", "gpt-5-codex"])


class Merging(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.old_state = collect.STATE
        collect.STATE = self.tmp.name

    def tearDown(self):
        collect.STATE = self.old_state
        self.tmp.cleanup()

    def host(self):
        return {"name": "box", "backends": [{"type": "python"}]}

    def test_history_never_shrinks(self):
        collect.host_rows(self.host(), {"type": "python"},
                          [["2026-10-20", "codex", "m", 1, 100, 0, 0, 10, None]])
        stored = collect.host_rows(self.host(), {"type": "python"},
                                   [["2026-10-20", "codex", "m", 0, 10, 0, 0, 1, None]])
        self.assertEqual(stored["2026-10-20|codex|m"][1:5], [100, 0, 0, 10])

    def test_backends_do_not_double_count(self):
        collect.host_rows(self.host(), {"type": "ccusage"},
                          [["2026-10-20", "codex", "m", 0, 100, 0, 0, 10, 1.0]])
        stored = collect.host_rows(self.host(), {"type": "python"},
                                   [["2026-10-20", "codex", "m", 1, 100, 0, 0, 10, None]])
        self.assertEqual(stored["2026-10-20|codex|m"][1:5], [100, 0, 0, 10])

    def test_backends_keep_separate_files(self):
        collect.host_rows(self.host(), {"type": "ccusage"},
                          [["2026-10-20", "codex", "m", 0, 100, 0, 0, 10, 1.0]])
        collect.host_rows(self.host(), {"type": "python"},
                          [["2026-10-20", "cursor", "x", 1, 5, 0, 0, 1, None]])
        files = sorted(os.listdir(os.path.join(self.tmp.name, "hosts")))
        self.assertEqual(files, ["box-ccusage.json", "box-python.json"])


class Costs(unittest.TestCase):
    def test_official_price_wins(self):
        prices = {"m": [1, 0.5, 2, 3]}
        value = [0, 1_000_000, 0, 0, 0, 99.0]
        self.assertAlmostEqual(collect.api_cost(prices, {}, "m", value), 1.0)

    def test_recorded_cost_is_fallback(self):
        value = [0, 1_000_000, 0, 0, 0, 0.25]
        self.assertAlmostEqual(collect.api_cost({}, {}, "m", value), 0.25)


class ModelNames(unittest.TestCase):
    def test_strips_relay_prefix(self):
        self.assertEqual(collect.model_name("openai/gpt-5-codex"), "gpt-5-codex")

    def test_keeps_plain_names(self):
        self.assertEqual(collect.model_name("Claude-Opus-5-5"), "claude-opus-5-5")


if __name__ == "__main__":
    unittest.main()
