from agent.reponse_agent.intro_agent import generate_intro
from agent.reponse_agent.entreprise_agent import generate_entreprise
from agent.reponse_agent.methodologie_agent import generate_methodologie
from agent.reponse_agent.finance_agent import generate_finance
from agent.reponse_agent.valeur_agent import generate_valeur
from agent.reponse_agent.risques_agent import generate_risques
from agent.reponse_agent.conclusion_agent import generate_conclusion

def reponse_chat(plan: dict, step: str, custom_prompt: str = ""):
    """
    Gère la génération étape par étape en appelant le bon agent.
    Pour 'finance' et 'risques', renvoie un dictionnaire :
        {
          "texte": "Paragraphe de 3 à 4 lignes",
          "tableau": [ ... ]
        }
    Pour les autres, renvoie une simple chaîne de texte.
    """

    # Sélection de l’agent selon l’étape
    if step == "intro":
        return generate_intro(plan, custom_prompt)

    elif step == "entreprise":
        return generate_entreprise(plan, custom_prompt)

    elif step == "methodologie":
        return generate_methodologie(plan, custom_prompt)

    elif step == "finance":
        # 🔹 Finance = dict {texte, tableau}
        return generate_finance(plan, custom_prompt)

    elif step == "valeur":
        return generate_valeur(plan, custom_prompt)

    elif step == "risques":
        # 🔹 Risques = dict {texte, tableau}
        return generate_risques(plan, custom_prompt)

    elif step == "conclusion":
        return generate_conclusion(plan, custom_prompt)

    else:
        return "Étape inconnue"
