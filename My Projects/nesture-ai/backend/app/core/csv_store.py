"""
CSV-based persistence layer.
Each entity maps to one CSV file. All reads/writes go through this module.
In production this would be replaced with a proper database.
"""
import csv
import os
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional

from app.core.config import settings

# ── File paths ────────────────────────────────────────────────────────────────
USERS_CSV        = os.path.join(settings.DATA_DIR, "users.csv")
LEARNERS_CSV     = os.path.join(settings.DATA_DIR, "learners.csv")
SESSIONS_CSV     = os.path.join(settings.DATA_DIR, "sessions.csv")
GESTURES_CSV     = os.path.join(settings.DATA_DIR, "gestures.csv")
REFLEX_SCORES_CSV = os.path.join(settings.DATA_DIR, "reflex_scores.csv")
EXERCISES_CSV    = os.path.join(settings.DATA_DIR, "exercises.csv")
PRESCRIPTIONS_CSV = os.path.join(settings.DATA_DIR, "prescriptions.csv")

# ── Column definitions ────────────────────────────────────────────────────────
SCHEMA: Dict[str, List[str]] = {
    USERS_CSV: ["id", "email", "hashed_password", "role", "name", "created_at"],
    LEARNERS_CSV: ["id", "name", "age", "diagnosis", "parent_id", "ot_id", "created_at", "avatar_color"],
    SESSIONS_CSV: [
        "id", "learner_id", "start_time", "end_time", "duration_seconds",
        "difficulty", "scenario", "total_attempts", "perfect_grabs",
        "failed_grabs", "skipped", "invalid", "accuracy_score",
        "avg_response_time_ms", "trajectory_smoothness", "fatigue_index",
        "midline_crossings", "lpi_score"
    ],
    GESTURES_CSV: [
        "id", "session_id", "timestamp", "target_letter",
        "classification", "response_time_ms", "trajectory_smoothness",
        "midline_crossing", "head_hand_coupling", "fatigue_indicator"
    ],
    REFLEX_SCORES_CSV: [
        "id", "session_id", "learner_id", "reflex_name",
        "confidence_level", "score", "indicators_found", "created_at"
    ],
    EXERCISES_CSV: [
        "id", "name", "target_reflex", "description",
        "duration_minutes", "video_url", "difficulty_level"
    ],
    PRESCRIPTIONS_CSV: [
        "id", "learner_id", "ot_id", "exercise_id", "session_id",
        "assigned_at", "notes", "status"
    ],
}


# ── Generic helpers ───────────────────────────────────────────────────────────

def _ensure_file(path: str) -> None:
    """Create CSV with header row if it doesn't exist."""
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=SCHEMA[path])
            writer.writeheader()


def read_all(path: str) -> List[Dict[str, Any]]:
    _ensure_file(path)
    with open(path, "r", newline="") as f:
        return list(csv.DictReader(f))


def read_where(path: str, **kwargs) -> List[Dict[str, Any]]:
    rows = read_all(path)
    for key, val in kwargs.items():
        rows = [r for r in rows if r.get(key) == str(val)]
    return rows


def read_one(path: str, id: str) -> Optional[Dict[str, Any]]:
    rows = read_where(path, id=id)
    return rows[0] if rows else None


def insert(path: str, record: Dict[str, Any]) -> Dict[str, Any]:
    _ensure_file(path)
    if "id" not in record or not record["id"]:
        record["id"] = str(uuid.uuid4())
    if "created_at" in SCHEMA[path] and "created_at" not in record:
        record["created_at"] = datetime.utcnow().isoformat()
    with open(path, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=SCHEMA[path])
        writer.writerow({k: record.get(k, "") for k in SCHEMA[path]})
    return record


def update(path: str, id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    rows = read_all(path)
    updated = None
    for i, row in enumerate(rows):
        if row["id"] == id:
            rows[i] = {**row, **updates}
            updated = rows[i]
            break
    if updated:
        _rewrite(path, rows)
    return updated


def delete(path: str, id: str) -> bool:
    rows = read_all(path)
    new_rows = [r for r in rows if r["id"] != id]
    if len(new_rows) < len(rows):
        _rewrite(path, new_rows)
        return True
    return False


def _rewrite(path: str, rows: List[Dict[str, Any]]) -> None:
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=SCHEMA[path])
        writer.writeheader()
        writer.writerows(rows)
