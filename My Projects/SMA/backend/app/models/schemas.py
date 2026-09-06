from pydantic import BaseModel


class StartConsultationRequest(BaseModel):
    patient_name: str
    age: int
    symptoms: str


class AnswerRequest(BaseModel):
    answer: str


class PhysicianRequest(BaseModel):
    feedback: str