from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_risques(plan: dict) -> str:
    """
    Génère la partie 'Gestion des risques' de la réponse.
    """
    try:
        prompt = f"""
        Tu es un expert en gestion des risques.
        Analyse : {plan}

        Rédige un paragraphe qui explique :
        - Les risques potentiels liés à l’exécution du marché.
        - Les mesures de prévention et de mitigation mises en place.
        - L’assurance de continuité et de respect des délais.

        Rédige en texte fluide sans titres ni puces.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en gestion des risques."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=450
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur risques : {str(e)}"
