from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class UserLogin(BaseModel):
    email: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    name: str
    user_id: str
    learner_id: Optional[str] = None


class LearnerOut(BaseModel):
    id: str
    name: str
    age: str
    diagnosis: str
    parent_id: str
    ot_id: str
    avatar_color: str


class GestureIn(BaseModel):
    target_letter: str
    classification: str  # Perfect | Failed | Skipped | Invalid
    response_time_ms: float
    trajectory_smoothness: float
    midline_crossing: bool
    head_hand_coupling: float
    fatigue_indicator: float


class SessionStartIn(BaseModel):
    learner_id: str
    difficulty: str = "medium"  # easy | medium | hard


class SessionEndIn(BaseModel):
    session_id: str
    gestures: List[GestureIn] = []


class SessionOut(BaseModel):
    id: str
    learner_id: str
    start_time: str
    end_time: Optional[str]
    duration_seconds: Optional[str]
    difficulty: str
    scenario: Optional[str]
    total_attempts: Optional[str]
    perfect_grabs: Optional[str]
    failed_grabs: Optional[str]
    skipped: Optional[str]
    accuracy_score: Optional[str]
    avg_response_time_ms: Optional[str]
    trajectory_smoothness: Optional[str]
    fatigue_index: Optional[str]
    lpi_score: Optional[str]


class ReflexScoreOut(BaseModel):
    reflex_name: str
    confidence_level: str
    score: str
    indicators_found: str


class ExerciseOut(BaseModel):
    id: str
    name: str
    target_reflex: str
    description: str
    duration_minutes: str
    video_url: str
    difficulty_level: str


class AnalysisOut(BaseModel):
    session_id: str
    narrative: str
    lpi_score: int
    scenario: str
    reflex_scores: List[dict]
    recommendations: List[dict]
    metrics: dict


class PrescriptionIn(BaseModel):
    learner_id: str
    exercise_id: str
    session_id: Optional[str] = None
    notes: Optional[str] = ""
