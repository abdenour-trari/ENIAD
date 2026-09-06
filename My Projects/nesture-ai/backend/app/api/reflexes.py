from fastapi import APIRouter
from typing import List

from app.core.csv_store import REFLEX_SCORES_CSV, read_where

router = APIRouter()

REFLEX_NAMES = ["Moro", "ATNR", "STNR", "TLR", "Spinal Galant", "Palmar Grasp"]


@router.get("/learner/{learner_id}/latest")
def latest_reflex_scores(learner_id: str):
    """Return the most recent score per reflex for a learner."""
    scores = read_where(REFLEX_SCORES_CSV, learner_id=learner_id)
    scores.sort(key=lambda s: s.get("created_at", ""), reverse=True)
    latest = {}
    for s in scores:
        name = s.get("reflex_name", "")
        if name not in latest:
            latest[name] = s
    return list(latest.values())


@router.get("/learner/{learner_id}/trend")
def reflex_trend(learner_id: str, reflex: str):
    """Return all score history for one reflex (for trend chart)."""
    scores = read_where(REFLEX_SCORES_CSV, learner_id=learner_id, reflex_name=reflex)
    scores.sort(key=lambda s: s.get("created_at", ""))
    return scores


@router.get("/learner/{learner_id}/summary")
def reflex_summary(learner_id: str):
    """Return latest score + trend direction for all 6 reflexes."""
    all_scores = read_where(REFLEX_SCORES_CSV, learner_id=learner_id)
    result = []
    for rname in REFLEX_NAMES:
        rscores = [s for s in all_scores if s.get("reflex_name") == rname]
        rscores.sort(key=lambda s: s.get("created_at", ""))
        if not rscores:
            continue
        latest = rscores[-1]
        trend = "stable"
        if len(rscores) >= 2:
            prev = float(rscores[-2].get("score", 50))
            curr = float(latest.get("score", 50))
            trend = "improving" if curr > prev + 2 else ("declining" if curr < prev - 2 else "stable")
        result.append({**latest, "trend": trend})
    return result
