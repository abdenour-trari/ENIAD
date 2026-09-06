from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_valeur(plan: dict, custom_prompt: str = "") -> str:
    """
    Génère la partie 'Valeur ajoutée' de la réponse à l'appel d'offre.
    """
    try:
        prompt = f"""
        Tu es un expert en mise en valeur des avantages compétitifs.
        Analyse : {plan}

        Rédige un texte qui met en avant :
        - La valeur ajoutée spécifique de l’entreprise
        - L’innovation et différenciation proposée
        - Les bénéfices pour le client au-delà de la simple exécution

        Texte fluide et convaincant, sans titres ni listes.

        {"Instructions spécifiques de l'utilisateur : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en valorisation des offres pour AO."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur valeur ajoutée : {str(e)}"
