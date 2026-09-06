from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_conclusion(plan: dict) -> str:
    """
    Génère la conclusion de la réponse à l'appel d'offre.
    """
    try:
        prompt = f"""
        Tu es un expert en rédaction de conclusions d’appels d’offres.
        Analyse : {plan}

        Rédige une conclusion professionnelle qui :
        - Résume les points forts de l’offre.
        - Réaffirme l’engagement de l’entreprise.
        - Souligne la capacité à livrer avec qualité et dans les délais.

        Ne mets pas de titre. Rédige en style fluide et professionnel.
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en conclusions d'appels d'offres."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=400
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur conclusion : {str(e)}"
