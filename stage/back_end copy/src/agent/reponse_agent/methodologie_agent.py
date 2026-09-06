from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_methodologie(plan: dict) -> str:
    """
    Génère la section 'Méthodologie et organisation' d'une réponse à appel d'offre.
    """
    try:
        prompt = f"""
        Tu es un expert en gestion de projets.
        Analyse : {plan}

        Rédige un texte clair et professionnel expliquant :
        - La compréhension des besoins exprimés.
        - La méthodologie proposée (organisation, étapes clés, outils utilisés).
        - Le planning de mise en œuvre et le contrôle qualité.

        Ne mets pas de titre, ni de puces. Rédige de façon fluide et structurée.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en méthodologie et organisation de projets."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=600
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur méthode : {str(e)}"
