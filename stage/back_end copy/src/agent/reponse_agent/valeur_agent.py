from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_valeur(plan: dict) -> str:
    """
    Génère la partie 'Valeur ajoutée et avantages concurrentiels'.
    """
    try:
        prompt = f"""
        Tu es un expert en différenciation concurrentielle.
        Analyse : {plan}

        Rédige un texte qui met en avant :
        - La valeur ajoutée de l’entreprise.
        - Les avantages concurrentiels par rapport aux concurrents.
        - Les engagements supplémentaires apportés.

        Rédige un texte fluide sans titres ni listes à puces.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en différenciation et valeur ajoutée."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur valeur ajoutée : {str(e)}"
