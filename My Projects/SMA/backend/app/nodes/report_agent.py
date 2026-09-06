from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage
from app.config import GROQ_API_KEY, MODEL_NAME

try:
    llm = ChatGroq(
        groq_api_key=GROQ_API_KEY,
        model_name=MODEL_NAME
    )
except Exception:
    llm = None


def report_agent(state):
    prompt = f"""
    Génère un rapport médical structuré en français basé sur les informations suivantes.
    Le rapport doit être clair, professionnel, et bien structuré en markdown.
    Il doit inclure le rappel du cadre et la mention exacte et obligatoire en gras ou avertissement :
    "Ce système ne remplace pas une consultation médicale."

    Informations :
    - Nom du Patient : {state.get('patient_name')}
    - Âge : {state.get('age')} ans
    - Symptômes : {state.get('symptoms')}
    - Synthèse préliminaire : {state.get('preliminary_summary')}
    - Recommandation intermédiaire : {state.get('intermediate_recommendation')}
    - Validation et instructions du médecin : {state.get('physician_feedback')}
    """

    if llm:
        try:
            response = llm.invoke([
                HumanMessage(content=prompt)
            ])
            state["final_report"] = response.content
            return state
        except Exception:
            pass

    state["final_report"] = f"""# RAPPORT D'ORIENTATION CLINIQUE PRÉLIMINAIRE

## 1. Informations Patient
- **Nom** : {state.get('patient_name')}
- **Âge** : {state.get('age')} ans
- **Symptômes initiaux** : {state.get('symptoms')}

## 2. Synthèse Clinique Préliminaire
{state.get('preliminary_summary')}

## 3. Recommandation Intermédiaire
{state.get('intermediate_recommendation')}

## 4. Validation et Instructions du Médecin
{state.get('physician_feedback')}

---
> [!IMPORTANT]
> **Ce système ne remplace pas une consultation médicale.**
"""
    return state