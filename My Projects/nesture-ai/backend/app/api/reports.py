from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from typing import List

from app.core.csv_store import (
    SESSIONS_CSV, REFLEX_SCORES_CSV, EXERCISES_CSV, LEARNERS_CSV,
    read_one, read_where, read_all
)
from app.services.ai_engine import analyse_session
from app.services.report_generator import generate_session_report

router = APIRouter()


@router.get("/{session_id}/pdf")
def download_report(session_id: str):
    session = read_one(SESSIONS_CSV, session_id)
    if not session:
        raise HTTPException(404, "Session not found")

    learner = read_one(LEARNERS_CSV, session["learner_id"])
    if not learner:
        raise HTTPException(404, "Learner not found")

    reflex_scores = read_where(REFLEX_SCORES_CSV, session_id=session_id)
    exercises = read_all(EXERCISES_CSV)
    trend = read_where(SESSIONS_CSV, learner_id=session["learner_id"])
    trend.sort(key=lambda s: s.get("start_time", ""))

    analysis = analyse_session(session, [])

    pdf_bytes = generate_session_report(
        learner=learner,
        session=session,
        reflex_scores=reflex_scores if reflex_scores else analysis["reflex_scores"],
        recommendations=analysis["recommendations"],
        exercises=exercises,
        narrative=analysis["narrative"],
        lpi_score=analysis["lpi_score"],
        trend_sessions=trend[-10:],
    )

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="NestureAI_Report_{session_id[:8]}.pdf"'
        }
    )
