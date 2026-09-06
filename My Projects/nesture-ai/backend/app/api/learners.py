from fastapi import APIRouter, HTTPException
from typing import List

from app.core.csv_store import LEARNERS_CSV, read_all, read_one, read_where
from app.models.schemas import LearnerOut

router = APIRouter()


@router.get("/", response_model=List[LearnerOut])
def list_learners():
    return read_all(LEARNERS_CSV)


@router.get("/{learner_id}", response_model=LearnerOut)
def get_learner(learner_id: str):
    learner = read_one(LEARNERS_CSV, learner_id)
    if not learner:
        raise HTTPException(404, "Learner not found")
    return learner


@router.get("/by-parent/{parent_id}", response_model=List[LearnerOut])
def learners_by_parent(parent_id: str):
    return read_where(LEARNERS_CSV, parent_id=parent_id)


@router.get("/by-ot/{ot_id}", response_model=List[LearnerOut])
def learners_by_ot(ot_id: str):
    return read_where(LEARNERS_CSV, ot_id=ot_id)
