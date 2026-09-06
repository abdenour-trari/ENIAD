from fastapi import APIRouter, HTTPException
from typing import List, Optional

from app.core.csv_store import EXERCISES_CSV, PRESCRIPTIONS_CSV, read_all, read_where, read_one, insert
from app.models.schemas import ExerciseOut, PrescriptionIn
import uuid

router = APIRouter()


@router.get("/", response_model=List[ExerciseOut])
def list_exercises(reflex: Optional[str] = None):
    exercises = read_all(EXERCISES_CSV)
    if reflex:
        exercises = [e for e in exercises if e.get("target_reflex", "").lower() == reflex.lower()]
    return exercises


@router.get("/{exercise_id}", response_model=ExerciseOut)
def get_exercise(exercise_id: str):
    ex = read_one(EXERCISES_CSV, exercise_id)
    if not ex:
        raise HTTPException(404, "Exercise not found")
    return ex


@router.post("/prescribe")
def prescribe_exercise(body: PrescriptionIn):
    record = {
        "id": str(uuid.uuid4()),
        "learner_id": body.learner_id,
        "ot_id": "",
        "exercise_id": body.exercise_id,
        "session_id": body.session_id or "",
        "notes": body.notes or "",
        "status": "active",
    }
    insert(PRESCRIPTIONS_CSV, record)
    return {"status": "ok", "prescription_id": record["id"]}


@router.get("/prescriptions/{learner_id}")
def get_prescriptions(learner_id: str):
    prescriptions = read_where(PRESCRIPTIONS_CSV, learner_id=learner_id)
    exercises = read_all(EXERCISES_CSV)
    ex_map = {e["id"]: e for e in exercises}
    return [
        {**p, "exercise": ex_map.get(p["exercise_id"], {})}
        for p in prescriptions
    ]
