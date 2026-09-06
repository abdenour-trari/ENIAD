from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_intro(plan: dict, custom_prompt: str = "") -> str:
    """
    Génère l'introduction avec option de personnalisation.
    """
    try:
        prompt = f"""
        Tu es un expert en rédaction de réponses à des appels d’offres.
        Voici une analyse du cahier des charges : {plan}.

        Rédige uniquement l'introduction de la réponse :
        - Présente brièvement l’entreprise, son expertise et son engagement à répondre à l’appel d’offre.
        - Reformule l’objet du marché et montre la compréhension du besoin.

        Contraintes :
        - Ne pas utiliser le mot "Introduction".
        - Texte fluide, professionnel, logique.

        {"Instructions spécifiques de l'utilisateur : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en marchés publics."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur génération introduction : {str(e)}"
