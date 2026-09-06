from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_finance(plan: dict) -> str:
    """
    Génère la partie 'Proposition financière' d'une réponse à appel d'offre.
    """
    try:
        prompt = f"""
        Tu es un expert en finance de marchés publics.
        Analyse : {plan}

        Rédige un texte qui présente :
        - Le prix global proposé et sa justification.
        - Les conditions de paiement.
        - La démonstration du rapport qualité/prix.

        Rédige un paragraphe professionnel sans titres ni puces.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en finance pour appels d'offres."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur finance : {str(e)}"
