from fastapi import FastAPI, HTTPException
from app.graph import graph
from app.models.schemas import (
    StartConsultationRequest,
    AnswerRequest,
    PhysicianRequest
)

app = FastAPI(title="SMA Orientation Clinique API")

memory = {}


@app.get("/")
def home():
    return {
        "status": "online",
        "message": "SMA orientation clinique active."
    }


@app.post("/consultation/start")
def start_consultation(data: StartConsultationRequest):
    try:
        thread_id = str(len(memory) + 1)

        state = {
            "patient_name": data.patient_name,
            "age": data.age,
            "symptoms": data.symptoms,
            "questions": [],
            "answers": [],
            "preliminary_summary": "",
            "intermediate_recommendation": "",
            "physician_feedback": "",
            "final_report": "",
            "current_question_index": 0,
            "next_node": ""
        }

        state = graph.invoke(state)
        memory[thread_id] = state

        if not state.get("questions"):
            raise HTTPException(
                status_code=500,
                detail="Erreur lors de la génération de la première question par le graphe."
            )

        return {
            "thread_id": thread_id,
            "question": state["questions"][-1]
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/consultation/{thread_id}/answer")
def answer_question(thread_id: str, data: AnswerRequest):
    try:
        if thread_id not in memory:
            raise HTTPException(
                status_code=404,
                detail="Consultation non trouvée."
            )

        state = memory[thread_id]

        if len(state.get("answers", [])) >= 5:
            return {
                "summary": state["preliminary_summary"],
                "recommendation": state["intermediate_recommendation"]
            }

        state["answers"].append(data.answer)

        state = graph.invoke(state)
        memory[thread_id] = state

        if len(state["answers"]) < 5:
            next_q = state["questions"][-1] if len(state["questions"]) > len(state["answers"]) else None
            if not next_q:
                next_q = "Pouvez-vous donner plus de précisions ?"
            return {
                "next_question": next_q
            }

        return {
            "summary": state["preliminary_summary"],
            "recommendation": state["intermediate_recommendation"]
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.post("/consultation/{thread_id}/physician")
def physician_review_route(thread_id: str, data: PhysicianRequest):
    try:
        if thread_id not in memory:
            raise HTTPException(
                status_code=404,
                detail="Consultation non trouvée."
            )

        state = memory[thread_id]

        state["physician_feedback"] = data.feedback

        state = graph.invoke(state)
        memory[thread_id] = state

        return {
            "final_report": state["final_report"]
        }

    except Exception as e:
        return {
            "error": str(e)
        }


@app.get("/consultation/{thread_id}")
def get_consultation(thread_id: str):
    if thread_id not in memory:
        raise HTTPException(
            status_code=404,
            detail="Consultation non trouvée."
        )
    return memory[thread_id]


@app.get("/consultation/{thread_id}/report")
def get_report(thread_id: str):
    if thread_id not in memory:
        raise HTTPException(
            status_code=404,
            detail="Consultation non trouvée."
        )
    return {
        "report": memory[thread_id]["final_report"]
    }
