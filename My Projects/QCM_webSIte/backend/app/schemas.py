from pydantic import BaseModel, Field
from typing import List, Optional

class QuestionAnswer(BaseModel):
    question_id: int
    type: str
    question: str
    expected_answer: Optional[str] = None
    student_answer: Optional[str] = None
    options: Optional[List[str]] = None
    correct_indices: Optional[List[int]] = None
    student_selected: Optional[List[int]] = None

class GradingPayload(BaseModel):
    answers: List[QuestionAnswer]

class QuestionGrade(BaseModel):
    score: int = Field(..., ge=0, le=20)
    percentage: int = Field(..., ge=0, le=100)
    feedback: str
    strengths: List[str]
    missing_points: List[str]
