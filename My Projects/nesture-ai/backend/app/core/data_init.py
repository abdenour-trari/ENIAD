"""
Seed the CSV files with demo data on first run.
"""
import os
import hashlib

# Pure-stdlib PBKDF2 — same algorithm as users.py, works everywhere.
_PBKDF2_ITERATIONS = 100_000
_SALT = b"nesture-ai-salt-2024"

def _hash(pw: str) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", pw.encode(), _SALT, _PBKDF2_ITERATIONS)
    return "pbkdf2_sha256:" + dk.hex()

from app.core.csv_store import (
    USERS_CSV, LEARNERS_CSV, SESSIONS_CSV, GESTURES_CSV,
    REFLEX_SCORES_CSV, EXERCISES_CSV, PRESCRIPTIONS_CSV,
    insert, read_all, _ensure_file, SCHEMA,
)
from app.core.config import settings


def initialize_data():
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    for path in SCHEMA:
        _ensure_file(path)

    # Only seed if users.csv is empty
    if read_all(USERS_CSV):
        return

    _seed_users()
    _seed_learners()
    _seed_exercises()
    _seed_sessions()
    print("✅ Seed data initialized")


def _seed_users():
    users = [
        {"id": "user-parent-001",  "email": "jennifer@example.com",
         "hashed_password": _hash("password123"), "role": "parent",  "name": "Jennifer Chen"},
        {"id": "user-ot-001",      "email": "sarah@example.com",
         "hashed_password": _hash("password123"), "role": "ot",      "name": "Sarah Williams"},
        {"id": "user-learner-001", "email": "maya@example.com",
         "hashed_password": _hash("password123"), "role": "learner", "name": "Maya Chen"},
        {"id": "user-parent-002",  "email": "david@example.com",
         "hashed_password": _hash("password123"), "role": "parent",  "name": "David Park"},
        {"id": "user-learner-002", "email": "liam@example.com",
         "hashed_password": _hash("password123"), "role": "learner", "name": "Liam Park"},
    ]
    for u in users:
        insert(USERS_CSV, u)


def _seed_learners():
    learners = [
        {"id": "learner-001", "name": "Maya Chen",  "age": "12",
         "diagnosis": "Non-speaking autism, delayed motor planning",
         "parent_id": "user-parent-001", "ot_id": "user-ot-001", "avatar_color": "#0D5E6B"},
        {"id": "learner-002", "name": "Liam Park",  "age": "9",
         "diagnosis": "Non-speaking autism, sensory processing disorder",
         "parent_id": "user-parent-002", "ot_id": "user-ot-001", "avatar_color": "#E8841A"},
        {"id": "learner-003", "name": "Zoe Rivera", "age": "14",
         "diagnosis": "Cerebral palsy, motor planning difficulties",
         "parent_id": "user-parent-001", "ot_id": "user-ot-001", "avatar_color": "#5B8DB8"},
    ]
    for l in learners:
        insert(LEARNERS_CSV, l)


def _seed_exercises():
    exercises = [
        {"id": "ex-001", "name": "Starfish Stretch",       "target_reflex": "Moro",
         "description": "Lie flat, spread arms and legs wide. Hold 10 seconds. Repeat 5 times.",
         "duration_minutes": "5",  "video_url": "/videos/starfish-stretch.mp4",    "difficulty_level": "easy"},
        {"id": "ex-002", "name": "Deep Pressure Massage",  "target_reflex": "Moro",
         "description": "Apply firm pressure to shoulders and arms. Use a weighted blanket.",
         "duration_minutes": "10", "video_url": "/videos/deep-pressure.mp4",       "difficulty_level": "easy"},
        {"id": "ex-003", "name": "Slow Swinging",          "target_reflex": "Moro",
         "description": "Sit in a hammock swing. Sway side to side slowly for 5 minutes.",
         "duration_minutes": "5",  "video_url": "/videos/slow-swinging.mp4",       "difficulty_level": "easy"},
        {"id": "ex-004", "name": "Cross-Crawl Patterns",   "target_reflex": "ATNR",
         "description": "Touch right hand to left knee alternately while marching in place.",
         "duration_minutes": "5",  "video_url": "/videos/cross-crawl.mp4",         "difficulty_level": "medium"},
        {"id": "ex-005", "name": "Bilateral Clapping",     "target_reflex": "ATNR",
         "description": "Clap hands at midline, then clap each hand to opposite shoulder.",
         "duration_minutes": "3",  "video_url": "/videos/bilateral-clapping.mp4",  "difficulty_level": "easy"},
        {"id": "ex-006", "name": "Angels in Snow",         "target_reflex": "ATNR",
         "description": "Lie on floor, move arms and legs simultaneously like a snow angel.",
         "duration_minutes": "5",  "video_url": "/videos/angels-snow.mp4",         "difficulty_level": "medium"},
        {"id": "ex-007", "name": "Cat-Cow Yoga",           "target_reflex": "STNR",
         "description": "On hands and knees, alternate between arching and rounding the back.",
         "duration_minutes": "5",  "video_url": "/videos/cat-cow.mp4",             "difficulty_level": "easy"},
        {"id": "ex-008", "name": "Tabletop Rocking",       "target_reflex": "STNR",
         "description": "In tabletop position, rock forward and backward slowly.",
         "duration_minutes": "5",  "video_url": "/videos/tabletop-rocking.mp4",    "difficulty_level": "easy"},
        {"id": "ex-009", "name": "Head Lifts (Prone)",     "target_reflex": "TLR",
         "description": "Lie on tummy, lift head slowly keeping chin tucked. Hold 5 seconds.",
         "duration_minutes": "5",  "video_url": "/videos/head-lifts-prone.mp4",    "difficulty_level": "medium"},
        {"id": "ex-010", "name": "Superman Pose",          "target_reflex": "TLR",
         "description": "Lie on tummy, extend arms and legs. Lift all four off the ground.",
         "duration_minutes": "3",  "video_url": "/videos/superman-pose.mp4",       "difficulty_level": "medium"},
        {"id": "ex-011", "name": "Snow Angel Movements",   "target_reflex": "Spinal Galant",
         "description": "Stand and make snow angel arm movements, focusing on trunk rotation.",
         "duration_minutes": "5",  "video_url": "/videos/snow-angel.mp4",          "difficulty_level": "easy"},
        {"id": "ex-012", "name": "Core Ball Rolling",      "target_reflex": "Spinal Galant",
         "description": "Roll a therapy ball along both sides of the spine gently.",
         "duration_minutes": "5",  "video_url": "/videos/ball-rolling.mp4",        "difficulty_level": "easy"},
        {"id": "ex-013", "name": "Squeeze Ball",           "target_reflex": "Palmar Grasp",
         "description": "Squeeze a therapy ball 10 times each hand. Focus on full finger engagement.",
         "duration_minutes": "3",  "video_url": "/videos/squeeze-ball.mp4",        "difficulty_level": "easy"},
        {"id": "ex-014", "name": "Playdough Manipulation", "target_reflex": "Palmar Grasp",
         "description": "Roll, pinch, and shape playdough. Focus on pincer grip and finger isolation.",
         "duration_minutes": "10", "video_url": "/videos/playdough.mp4",           "difficulty_level": "easy"},
        {"id": "ex-015", "name": "Tweezers Pick-up",       "target_reflex": "Palmar Grasp",
         "description": "Use tweezers to pick up small objects (beads, pom-poms) into a cup.",
         "duration_minutes": "5",  "video_url": "/videos/tweezers.mp4",            "difficulty_level": "medium"},
    ]
    for e in exercises:
        insert(EXERCISES_CSV, e)


def _seed_sessions():
    import random
    from datetime import datetime, timedelta

    base_date    = datetime(2026, 1, 10)
    reflex_names = ["Moro", "ATNR", "STNR", "TLR", "Spinal Galant", "Palmar Grasp"]

    # ── Happy path: Maya Chen (10 sessions, improving) ───────────────────────
    happy_sessions = [
        (0.62, 4200, 22, 18, 5, 0.58, 52),
        (0.65, 4000, 24, 16, 4, 0.61, 55),
        (0.68, 3800, 26, 14, 4, 0.64, 58),
        (0.70, 3600, 28, 13, 3, 0.67, 61),
        (0.72, 3400, 30, 11, 3, 0.70, 65),
        (0.75, 3200, 32, 10, 2, 0.73, 68),
        (0.78, 3000, 34,  9, 2, 0.76, 72),
        (0.80, 2800, 36,  8, 2, 0.79, 76),
        (0.83, 2600, 38,  7, 1, 0.82, 80),
        (0.84, 2500, 40,  6, 1, 0.85, 84),
    ]
    happy_reflexes = [
        (38, 45, 55, 60, 50, 42), (42, 48, 57, 62, 52, 45),
        (46, 52, 59, 63, 54, 48), (50, 56, 61, 65, 56, 52),
        (54, 60, 63, 66, 58, 55), (58, 64, 65, 67, 60, 58),
        (62, 68, 67, 68, 62, 62), (66, 72, 69, 70, 64, 65),
        (70, 76, 71, 72, 66, 68), (74, 79, 73, 74, 68, 71),
    ]
    for i, ((acc, rt, pg, fg, sk, sm, lpi), rxs) in enumerate(zip(happy_sessions, happy_reflexes)):
        d = base_date + timedelta(days=i * 4)
        total = pg + fg + sk
        s = {
            "id": f"session-maya-{i+1:03d}", "learner_id": "learner-001",
            "start_time": d.isoformat(),
            "end_time": (d + timedelta(minutes=15 + i)).isoformat(),
            "duration_seconds": str((15 + i) * 60),
            "difficulty": "medium" if i < 5 else "hard",
            "scenario": "happy_path",
            "total_attempts": str(total), "perfect_grabs": str(pg),
            "failed_grabs": str(fg), "skipped": str(sk),
            "invalid": str(random.randint(0, 2)),
            "accuracy_score": str(round(acc, 3)),
            "avg_response_time_ms": str(rt),
            "trajectory_smoothness": str(round(sm, 3)),
            "fatigue_index": str(round(0.3 - i * 0.02, 3)),
            "midline_crossings": str(random.randint(8, 15)),
            "lpi_score": str(lpi),
        }
        insert(SESSIONS_CSV, s)
        for j, (rname, rscore) in enumerate(zip(reflex_names, rxs)):
            conf = "High" if rscore < 50 else ("Medium" if rscore < 65 else "Low")
            insert(REFLEX_SCORES_CSV, {
                "id": f"reflex-maya-{i+1:03d}-{j}",
                "session_id": s["id"], "learner_id": "learner-001",
                "reflex_name": rname, "confidence_level": conf,
                "score": str(rscore), "indicators_found": str(max(0, 3 - j % 3)),
                "created_at": d.isoformat(),
            })

    # ── Alternate path: Liam Park (5 sessions, needs attention) ─────────────
    alt_sessions = [
        (0.40, 7500, 14, 22, 8, 0.35, 30), (0.38, 7800, 13, 23, 9, 0.32, 28),
        (0.42, 7200, 15, 21, 8, 0.37, 32), (0.39, 7600, 14, 22, 9, 0.34, 29),
        (0.41, 7400, 14, 21, 8, 0.36, 31),
    ]
    alt_reflexes = [
        (22, 28, 30, 25, 20, 18), (20, 26, 28, 23, 18, 16),
        (24, 30, 32, 27, 22, 20), (21, 27, 29, 24, 19, 17),
        (23, 29, 31, 26, 21, 19),
    ]
    for i, ((acc, rt, pg, fg, sk, sm, lpi), rxs) in enumerate(zip(alt_sessions, alt_reflexes)):
        d = base_date + timedelta(days=i * 5)
        total = pg + fg + sk
        s = {
            "id": f"session-liam-{i+1:03d}", "learner_id": "learner-002",
            "start_time": d.isoformat(),
            "end_time": (d + timedelta(minutes=12)).isoformat(),
            "duration_seconds": "720", "difficulty": "easy",
            "scenario": "alternate_path",
            "total_attempts": str(total), "perfect_grabs": str(pg),
            "failed_grabs": str(fg), "skipped": str(sk), "invalid": "3",
            "accuracy_score": str(round(acc, 3)),
            "avg_response_time_ms": str(rt),
            "trajectory_smoothness": str(round(sm, 3)),
            "fatigue_index": "0.72", "midline_crossings": "2",
            "lpi_score": str(lpi),
        }
        insert(SESSIONS_CSV, s)
        for j, (rname, rscore) in enumerate(zip(reflex_names, rxs)):
            conf = "High" if rscore < 25 else ("Medium" if rscore < 35 else "Low")
            insert(REFLEX_SCORES_CSV, {
                "id": f"reflex-liam-{i+1:03d}-{j}",
                "session_id": s["id"], "learner_id": "learner-002",
                "reflex_name": rname, "confidence_level": conf,
                "score": str(rscore), "indicators_found": str(3 if rscore < 25 else 2),
                "created_at": d.isoformat(),
            })
