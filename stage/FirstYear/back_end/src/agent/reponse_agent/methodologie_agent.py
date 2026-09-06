from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_methodologie(plan: dict, custom_prompt: str = "") -> str:
    """
    Génère la partie 'Méthodologie' de la réponse à l'appel d'offre.
    """
    try:
        prompt = f"""
        Tu es un expert en gestion de projet pour appels d'offres.
        Analyse : {plan}

        Rédige une méthodologie qui explique :
        - Les étapes de réalisation du projet
        - La gestion des ressources
        - Le suivi et le contrôle qualité
        - Le respect des délais et engagements

        Rédige en texte fluide, sans titres ni listes.

        {"Instructions spécifiques de l'utilisateur : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en méthodologie de gestion de projet pour AO."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=600
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur méthodologie : {str(e)}"
