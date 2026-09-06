from groq import Groq
from config import GROK_API_KEY
import json, re

client = Groq(api_key=GROK_API_KEY)

def generate_finance(plan: dict, custom_prompt: str = "") -> dict:
    """
    Génère la partie 'Proposition financière' avec texte et tableau.
    """
    try:
        prompt = f"""
        Tu es un expert en finance de marchés publics.
        Analyse suivante : {plan}

        Fournis UNIQUEMENT un objet JSON valide respectant ce format :
        {{
            "texte": "Un paragraphe professionnel de 5 à 6 lignes sur la proposition financière",
            "tableau": [
                {{
                    "Catégorie": "Travaux",
                    "Montant Estimatif": 120000,
                    "Montant Attribué": 115000,
                    "Écart": "-4%",
                    "Mode de Financement": "Budget propre"
                }}
            ]
        }}

        ⚠️ NE PAS inclure d’explication, d’introduction, ni de texte avant/après le JSON.
        ⚠️ Ne pas écrire "Paragraphe ici...".
        Fournis uniquement du contenu réel basé sur l’analyse.

        {"Instructions spécifiques : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en finance d'appels d'offres publiques."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=800
        )

        raw = response.choices[0].message.content.strip()

        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError(f"Réponse invalide : {raw}")

        json_text = match.group(0)

        json_text = json_text.replace("```json", "").replace("```", "").strip()

        data = json.loads(json_text)

        if "texte" not in data or "tableau" not in data:
            raise ValueError("Structure JSON incomplète")

        return data

    except Exception as e:
        return {"texte": f"Erreur finance : {str(e)}", "tableau": []}
