from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
import uuid

from app.core.csv_store import (
    SESSIONS_CSV, GESTURES_CSV, REFLEX_SCORES_CSV,
    insert, read_all, read_one, read_where, update
)
from app.models.schemas import SessionStartIn, SessionEndIn, SessionOut, AnalysisOut
from app.services.ai_engine import analyse_session

router = APIRouter()


@router.post("/start", response_model=dict)
def start_session(body: SessionStartIn):
    session = {
        "id": str(uuid.uuid4()),
        "learner_id": body.learner_id,
        "start_time": datetime.utcnow().isoformat(),
        "end_time": "",
        "duration_seconds": "",
        "difficulty": body.difficulty,
        "scenario": "",
        "total_attempts": "0",
        "perfect_grabs": "0",
        "failed_grabs": "0",
        "skipped": "0",
        "invalid": "0",
        "accuracy_score": "0",
        "avg_response_time_ms": "0",
        "trajectory_smoothness": "0",
        "fatigue_index": "0",
        "midline_crossings": "0",
        "lpi_score": "0",
    }
    insert(SESSIONS_CSV, session)
    return {"session_id": session["id"]}


@router.post("/end", response_model=AnalysisOut)
def end_session(body: SessionEndIn):
    session = read_one(SESSIONS_CSV, body.session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    gestures = body.gestures
    end_time = datetime.utcnow()
    start_time = datetime.fromisoformat(session["start_time"])
    duration = int((end_time - start_time).total_seconds())

    # Aggregate gesture stats
    total = len(gestures)
    
    # Handle zero gestures (warmup closed out immediately)
    if total == 0:
        update(SESSIONS_CSV, body.session_id, {
            "end_time": end_time.isoformat(),
            "duration_seconds": str(duration),
            "scenario": "Warmup Only",
            "lpi_score": "0"
        })
        return AnalysisOut(
            session_id=body.session_id,
            narrative="No motor patterns recorded during this session.",
            lpi_score=0,
            scenario="Warmup Only",
            reflex_scores=[],
            recommendations=[],
            metrics={}
        )

    perfect = sum(1 for g in gestures if g.classification == "Perfect")
    failed  = sum(1 for g in gestures if g.classification == "Failed")
    skipped = sum(1 for g in gestures if g.classification == "Skipped")
    invalid = sum(1 for g in gestures if g.classification == "Invalid")
    accuracy = perfect / total if total > 0 else 0
    avg_rt = sum(g.response_time_ms for g in gestures) / total if total > 0 else 0
    avg_smooth = sum(g.trajectory_smoothness for g in gestures) / total if total > 0 else 0
    avg_fatigue = sum(g.fatigue_indicator for g in gestures) / total if total > 0 else 0
    midline = sum(1 for g in gestures if g.midline_crossing)
    avg_hhc = sum(g.head_hand_coupling for g in gestures) / total if total > 0 else 0.5

    # Save gestures
    for g in gestures:
        insert(GESTURES_CSV, {
            "session_id": body.session_id,
            "timestamp": datetime.utcnow().isoformat(),
            "target_letter": g.target_letter,
            "classification": g.classification,
            "response_time_ms": str(g.response_time_ms),
            "trajectory_smoothness": str(g.trajectory_smoothness),
            "midline_crossing": str(g.midline_crossing),
            "head_hand_coupling": str(g.head_hand_coupling),
            "fatigue_indicator": str(g.fatigue_indicator),
        })

    # Update session record (removing head_hand_coupling which doesn't exist in CSV schema)
    updated_session = update(SESSIONS_CSV, body.session_id, {
        "end_time": end_time.isoformat(),
        "duration_seconds": str(duration),
        "total_attempts": str(total),
        "perfect_grabs": str(perfect),
        "failed_grabs": str(failed),
        "skipped": str(skipped),
        "invalid": str(invalid),
        "accuracy_score": str(round(accuracy, 4)),
        "avg_response_time_ms": str(round(avg_rt, 1)),
        "trajectory_smoothness": str(round(avg_smooth, 4)),
        "fatigue_index": str(round(avg_fatigue, 4)),
        "midline_crossings": str(midline),
    })

    # Run AI engine
    session_data = {**updated_session, "head_hand_coupling": str(avg_hhc)}
    gestures_data = [g.model_dump() for g in gestures]
    analysis = analyse_session(session_data, gestures_data)

    # Save reflex scores
    learner_id = session["learner_id"]
    for rs in analysis["reflex_scores"]:
        insert(REFLEX_SCORES_CSV, {
            "session_id": body.session_id,
            "learner_id": learner_id,
            "reflex_name": rs["reflex"],
            "confidence_level": rs["confidence"],
            "score": str(rs["score"]),
            "indicators_found": str(len(rs["indicators_found"])),
        })

    # Update session with LPI and scenario
    update(SESSIONS_CSV, body.session_id, {
        "lpi_score": str(analysis["lpi_score"]),
        "scenario": analysis["scenario"],
    })

    return AnalysisOut(
        session_id=body.session_id,
        narrative=analysis["narrative"],
        lpi_score=analysis["lpi_score"],
        scenario=analysis["scenario"],
        reflex_scores=analysis["reflex_scores"],
        recommendations=analysis["recommendations"],
        metrics=analysis["metrics"],
    )

@router.get("/learner/{learner_id}", response_model=List[SessionOut])
def sessions_by_learner(learner_id: str, limit: int = 20):
    sessions = read_where(SESSIONS_CSV, learner_id=learner_id)
    # Filter out ghost sessions (those without an end_time)
    valid_sessions = [s for s in sessions if s.get("end_time") and s.get("end_time").strip()]
    valid_sessions.sort(key=lambda s: s.get("start_time", ""), reverse=True)
    return valid_sessions[:limit]


@router.get("/{session_id}/analysis", response_model=AnalysisOut)
def get_session_analysis(session_id: str):
    session = read_one(SESSIONS_CSV, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    gestures = read_where(GESTURES_CSV, session_id=session_id)
    analysis = analyse_session(session, gestures)
    return AnalysisOut(
        session_id=session_id,
        narrative=analysis["narrative"],
        lpi_score=analysis["lpi_score"],
        scenario=analysis["scenario"],
        reflex_scores=analysis["reflex_scores"],
        recommendations=analysis["recommendations"],
        metrics=analysis["metrics"],
    )


@router.get("/{session_id}", response_model=SessionOut)
def get_session(session_id: str):
    session = read_one(SESSIONS_CSV, session_id)
    if not session:
        raise HTTPException(404, "Session not found")
    return session
