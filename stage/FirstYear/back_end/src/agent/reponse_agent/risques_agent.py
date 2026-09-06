from groq import Groq
from config import GROK_API_KEY
import json, re

client = Groq(api_key=GROK_API_KEY)

def generate_risques(plan: dict, custom_prompt: str = "") -> dict:
    """
    Génère la partie 'Analyse des risques' avec texte et tableau.
    """
    try:
        prompt = f"""
        Tu es un expert en gestion de risques de projets.
        Analyse suivante : {plan}

        Fournis UNIQUEMENT un objet JSON valide respectant ce format :
        {{
            "texte": "Un paragraphe professionnel de 5 à 6 lignes sur les principaux risques et les mesures de gestion associées.",
            "tableau": [
                {{
                    "Risque": "Retard de livraison",
                    "Probabilité (%)": 30,
                    "Impact": "Moyen",
                    "Mesure d’atténuation": "Suivi hebdomadaire du planning"
                }}
            ]
        }}

        ⚠️ NE PAS inclure d’introduction, d’explication, ni de texte avant ou après le JSON.
        ⚠️ NE PAS copier le texte d’exemple ci-dessus.
        Génère un contenu réaliste basé sur l’analyse du projet.

        {"Instructions spécifiques : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en gestion des risques de projets d’appels d’offres."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.6,
            max_tokens=900
        )

        raw = response.choices[0].message.content.strip()

        # 🔍 Extraire uniquement le JSON
        match = re.search(r"\{[\s\S]*\}", raw)
        if not match:
            raise ValueError(f"Réponse invalide : {raw}")

        json_text = match.group(0)
        json_text = json_text.replace("```json", "").replace("```", "").strip()

        # 🧠 Tenter de parser
        data = json.loads(json_text)

        # ✅ Vérification de structure minimale
        if not isinstance(data, dict):
            raise ValueError("La réponse n’est pas un objet JSON valide.")
        if "texte" not in data:
            data["texte"] = "⚠️ Aucun texte généré par le modèle."
        if "tableau" not in data or not isinstance(data["tableau"], list):
            data["tableau"] = []

        return data

    except Exception as e:
        return {"texte": f"Erreur risques : {str(e)}", "tableau": []}
