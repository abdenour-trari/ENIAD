# src/agent/agent_chat.py
from langgraph.graph import StateGraph, END
from groq import Groq


class AgentState(dict):
    message: str
    response: str


def build_chat_agent(api_key: str, model_name: str = "llama-3.1-8b-instant"):
    """
    Construit un agent de chat basé sur Groq (LLaMA, Mixtral, Gemma).
    
    :param api_key: Clé API Groq (commence par gsk_)
    :param model_name: Nom du modèle Groq (par défaut "llama-3.1-8b-instant")
    :return: Workflow LangGraph compilé
    """
    # Configurer Groq
    client = Groq(api_key=api_key)

    def chatbot_node(state: AgentState):
        user_msg = state["message"]

        try:
            # Appeler Groq
            result = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": "Tu es un assistant utile et précis."},
                    {"role": "user", "content": user_msg},
                ],
                temperature=0.3,
            )

            # Récupérer le texte de la réponse
            response_text = result.choices[0].message.content

        except Exception as e:
            response_text = f"[Erreur Groq] {str(e)}"

        return {"response": response_text}

    # Construire le graphe LangGraph
    workflow = StateGraph(AgentState)
    workflow.add_node("chatbot", chatbot_node)
    workflow.set_entry_point("chatbot")
    workflow.add_edge("chatbot", END)

    return workflow.compile()
