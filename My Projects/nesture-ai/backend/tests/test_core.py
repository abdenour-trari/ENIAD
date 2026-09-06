"""
Unit tests for Nesture AI backend
Run with: pytest tests/ -v
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
import tempfile
import shutil
from unittest.mock import patch

# ── Patch DATA_DIR before importing modules ───────────────────────────────────
TMP_DIR = tempfile.mkdtemp()

@pytest.fixture(autouse=True, scope="session")
def patch_data_dir():
    with patch("app.core.config.settings.DATA_DIR", TMP_DIR):
        yield
    shutil.rmtree(TMP_DIR, ignore_errors=True)


# ── CSV store tests ───────────────────────────────────────────────────────────
class TestCsvStore:
    def setup_method(self):
        """Create a fresh temp CSV path for each test."""
        import csv, os
        self.path = os.path.join(TMP_DIR, "test_table.csv")
        # patch schema
        from app.core import csv_store
        csv_store.SCHEMA[self.path] = ["id", "name", "value", "created_at"]

    def test_insert_and_read(self):
        from app.core.csv_store import insert, read_all
        r = insert(self.path, {"name": "alpha", "value": "42"})
        assert r["id"] != ""
        rows = read_all(self.path)
        assert len(rows) >= 1
        assert rows[-1]["name"] == "alpha"

    def test_read_where(self):
        from app.core.csv_store import insert, read_where
        insert(self.path, {"name": "beta", "value": "10"})
        insert(self.path, {"name": "gamma", "value": "10"})
        results = read_where(self.path, value="10")
        assert all(r["value"] == "10" for r in results)

    def test_update(self):
        from app.core.csv_store import insert, update, read_one
        r = insert(self.path, {"name": "delta", "value": "old"})
        update(self.path, r["id"], {"value": "new"})
        updated = read_one(self.path, r["id"])
        assert updated["value"] == "new"

    def test_delete(self):
        from app.core.csv_store import insert, delete, read_one
        r = insert(self.path, {"name": "epsilon", "value": "x"})
        assert delete(self.path, r["id"]) is True
        assert read_one(self.path, r["id"]) is None

    def test_read_one_missing(self):
        from app.core.csv_store import read_one
        assert read_one(self.path, "nonexistent-id") is None


# ── AI Engine tests ───────────────────────────────────────────────────────────
class TestAIEngine:
    def _make_session(self, accuracy=0.85, fail_rate=0.1, rt=2500,
                       smoothness=0.80, fatigue=0.15, midline=10, hhc=0.3):
        total = 40
        perfect = int(total * accuracy)
        failed  = int(total * fail_rate)
        return {
            "id": "test-session-001",
            "learner_id": "learner-001",
            "total_attempts":      str(total),
            "perfect_grabs":       str(perfect),
            "failed_grabs":        str(failed),
            "skipped":             str(total - perfect - failed),
            "invalid":             "2",
            "accuracy_score":      str(accuracy),
            "avg_response_time_ms": str(rt),
            "trajectory_smoothness": str(smoothness),
            "fatigue_index":       str(fatigue),
            "midline_crossings":   str(midline),
            "head_hand_coupling":  str(hhc),
            "duration_seconds":    "900",
        }

    def test_happy_path_scenario(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session(accuracy=0.84, rt=2500, smoothness=0.82, fatigue=0.12)
        result = analyse_session(session, [])
        assert result["scenario"] == "happy_path"
        assert result["lpi_score"] > 60
        assert len(result["reflex_scores"]) == 6
        assert result["narrative"] != ""

    def test_alternate_path_scenario(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session(
            accuracy=0.38, fail_rate=0.55, rt=8500,
            smoothness=0.28, fatigue=0.75, midline=1, hhc=0.85
        )
        result = analyse_session(session, [])
        assert result["scenario"] == "alternate_path"
        high_flags = [r for r in result["reflex_scores"] if r["confidence"] == "High"]
        assert len(high_flags) >= 1

    def test_recommendations_capped_at_5(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session(
            accuracy=0.30, fail_rate=0.65, rt=9000,
            smoothness=0.20, fatigue=0.80, midline=0, hhc=0.90
        )
        result = analyse_session(session, [])
        assert len(result["recommendations"]) <= 5

    def test_lpi_within_range(self):
        from app.services.ai_engine import analyse_session
        for acc in [0.20, 0.50, 0.84, 1.0]:
            session = self._make_session(accuracy=acc)
            result = analyse_session(session, [])
            assert 0 <= result["lpi_score"] <= 100, f"LPI out of range for acc={acc}"

    def test_all_6_reflexes_scored(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session()
        result = analyse_session(session, [])
        names = {r["reflex"] for r in result["reflex_scores"]}
        expected = {"Moro", "ATNR", "STNR", "TLR", "Spinal Galant", "Palmar Grasp"}
        assert names == expected

    def test_confidence_levels_valid(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session()
        result = analyse_session(session, [])
        for r in result["reflex_scores"]:
            assert r["confidence"] in ("High", "Medium", "Low")

    def test_narrative_non_empty(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session(accuracy=0.60)
        result = analyse_session(session, [])
        assert len(result["narrative"]) > 50

    def test_metrics_calculated(self):
        from app.services.ai_engine import analyse_session
        session = self._make_session(accuracy=0.75, rt=3000)
        result = analyse_session(session, [])
        m = result["metrics"]
        assert abs(m["accuracy"] - 0.75) < 0.01
        assert abs(m["avg_response_time_ms"] - 3000) < 1


# ── Gesture detection simulation tests ───────────────────────────────────────
class TestGestureClassification:
    """Test indicator logic directly."""

    def test_high_fail_rate_triggers_moro(self):
        from app.services.ai_engine import _detect_indicators
        metrics = {
            "fail_rate": 0.60, "skip_rate": 0.20,
            "avg_head_hand_coupling": 0.75,
            "midline_crossings": 2,
            "avg_response_time_ms": 9000,
            "trajectory_smoothness": 0.30,
            "fatigue_index": 0.70,
            "total_attempts": 40,
        }
        indicators = _detect_indicators(metrics)
        assert indicators["high_fail_rate"] is True
        assert indicators["high_head_hand_coupling"] is True
        assert indicators["frequent_withdrawal"] is True

    def test_low_midline_triggers_atnr(self):
        from app.services.ai_engine import _detect_indicators
        metrics = {
            "fail_rate": 0.10, "skip_rate": 0.05,
            "avg_head_hand_coupling": 0.65,
            "midline_crossings": 2,
            "avg_response_time_ms": 3000,
            "trajectory_smoothness": 0.70,
            "fatigue_index": 0.20,
            "total_attempts": 40,
        }
        indicators = _detect_indicators(metrics)
        assert indicators["midline_avoidance"] is True
        assert indicators["head_hand_coupling"] is True

    def test_slow_response_triggers_tlr(self):
        from app.services.ai_engine import _detect_indicators
        metrics = {
            "fail_rate": 0.15, "skip_rate": 0.05,
            "avg_head_hand_coupling": 0.40,
            "midline_crossings": 8,
            "avg_response_time_ms": 9500,
            "trajectory_smoothness": 0.38,
            "fatigue_index": 0.20,
            "total_attempts": 40,
        }
        indicators = _detect_indicators(metrics)
        assert indicators["slow_response"] is True
        assert indicators["spatial_drift"] is True


# ── Data init smoke test ──────────────────────────────────────────────────────
class TestDataInit:
    def test_initialize_creates_files(self):
        import os
        from app.core.data_init import initialize_data
        with patch("app.core.config.settings.DATA_DIR", TMP_DIR):
            from app.core import csv_store
            # Remap all paths to TMP_DIR
            for key in list(csv_store.SCHEMA.keys()):
                new_key = os.path.join(TMP_DIR, os.path.basename(key))
                csv_store.SCHEMA[new_key] = csv_store.SCHEMA.pop(key)
            initialize_data()
        # At least users.csv should exist
        csv_files = [f for f in os.listdir(TMP_DIR) if f.endswith(".csv")]
        assert len(csv_files) > 0
