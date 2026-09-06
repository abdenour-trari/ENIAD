from groq import Groq
from config import GROK_API_KEY

client = Groq(api_key=GROK_API_KEY)

def generate_entreprise(plan: dict, custom_prompt: str = "") -> str:
    """
    Génère la section de présentation de l'entreprise.
    """
    try:
        prompt = f"""
        Voici une analyse du cahier des charges : {plan}.

        Rédige uniquement la partie présentant l’entreprise :
        - Historique et expertise
        - Références similaires
        - Moyens humains, techniques et logistiques
        
        Contraintes :
        - Pas de titres ou numéros
        - Texte fluide et professionnel

        {"Instructions spécifiques de l'utilisateur : " + custom_prompt if custom_prompt else ""}
        """

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "Tu es un assistant expert en marchés publics."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=600
        )

        return response.choices[0].message.content.strip()

    except Exception as e:
        return f"Erreur génération entreprise : {str(e)}"
