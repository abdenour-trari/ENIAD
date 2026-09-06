from typing import TypedDict, List


class ClinicalState(TypedDict):
    patient_name: str
    age: int
    symptoms: str

    questions: List[str]
    answers: List[str]

    preliminary_summary: str
    intermediate_recommendation: str

    physician_feedback: str

    final_report: str

    current_question_index: int

    next_node: str