from agent.reponse_agent.intro_agent import generate_intro
from agent.reponse_agent.entreprise_agent import generate_entreprise
from agent.reponse_agent.methodologie_agent import generate_methodologie
from agent.reponse_agent.finance_agent import generate_finance
from agent.reponse_agent.valeur_agent import generate_valeur
from agent.reponse_agent.risques_agent import generate_risques
from agent.reponse_agent.conclusion_agent import generate_conclusion

def reponse_chat(plan: dict, step: str) -> str:
    """
    Gère la génération étape par étape en appelant le bon agent.
    """
    if step == "intro":
        return generate_intro(plan)
    elif step == "entreprise":
        return generate_entreprise(plan)
    elif step == "methodologie":
        return generate_methodologie(plan)
    elif step == "finance":
        return generate_finance(plan)
    elif step == "valeur":
        return generate_valeur(plan)
    elif step == "risques":
        return generate_risques(plan)
    elif step == "conclusion":
        return generate_conclusion(plan)
    else:
        return "Étape inconnue"
