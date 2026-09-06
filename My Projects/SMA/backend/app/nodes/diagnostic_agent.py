from app.tools.patient_tools import get_question
from app.tools.care_tools import generate_basic_recommendation
from app.tools.mcp_client import get_mcp_recommendation

def diagnostic_agent(state):
    if "questions" not in state or state["questions"] is None:
        state["questions"] = []
    if "answers" not in state or state["answers"] is None:
        state["answers"] = []

    current_index = len(state["answers"])

    if current_index < 5:
        question = get_question(current_index)
        if question and len(state["questions"]) <= current_index:
            state["questions"].append(question)
            state["current_question_index"] = current_index

    if len(state["answers"]) >= 5:
        qa_pairs = []
        for q, a in zip(state["questions"], state["answers"]):
            qa_pairs.append(f"- **Question**: {q}\n  **Réponse**: {a}")
        qa_text = "\n".join(qa_pairs)

        state["preliminary_summary"] = (
            f"Synthèse Clinique Préliminaire :\n"
            f"- **Symptômes initiaux** : {state['symptoms']}\n"
            f"- **Historique de l'entretien** :\n{qa_text}"
        )

        try:
            mcp_res = get_mcp_recommendation(state["symptoms"])
            state["intermediate_recommendation"] = mcp_res.get(
                "recommendation", "Surveillance générale et repos."
            )
        except Exception:
            state["intermediate_recommendation"] = generate_basic_recommendation(
                state["symptoms"]
            )

    return state
