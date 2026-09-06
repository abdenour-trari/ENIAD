import os
import json
import logging
from groq import AsyncGroq
from app.schemas import QuestionAnswer, QuestionGrade

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client using environment variable
api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key) if api_key else None

async def explain_mcq_error_with_ai(qa: QuestionAnswer) -> QuestionGrade:
    if not client:
        return QuestionGrade(
            score=0,
            percentage=0,
            feedback="Explication impossible : la clé API Groq est manquante sur le serveur.",
            strengths=[],
            missing_points=[]
        )

    prompt = f"""Tu es un professeur universitaire expert.
Explique brièvement et de manière constructive à l'étudiant pourquoi ses choix de réponses pour cette question QCM/QCU sont incorrects, et pourquoi les réponses attendues sont correctes.

Question ({qa.type}) :
{qa.question}

Options de réponses disponibles :
{chr(10).join(f"- Index {i} : {opt}" for i, opt in enumerate(qa.options or []))}

Index des réponses correctes attendues (les bonnes réponses) :
{qa.correct_indices}

Index des choix faits par l'étudiant (qui sont incorrects) :
{qa.student_selected}

Rédige une explication pédagogique concise (2 à 4 phrases maximum) :
1. Pourquoi les options choisies par l'étudiant sont incorrectes.
2. Pourquoi les options attendues sont correctes.

Renvoie uniquement un objet JSON valide correspondant strictement à la structure suivante :
- "score": 0
- "percentage": 0
- "feedback": (l'explication pédagogique rédigée en français)
- "strengths": []
- "missing_points": []

Ne mets aucun texte d'introduction, aucune note explicative et aucun format markdown en dehors du bloc JSON."""

    try:
        logger.info(f"Submitting Q#{qa.question_id} (MCQ Explain) to Groq API...")
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Tu es un tuteur pédagogique qui répond exclusivement sous forme de JSON valide."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=600
        )
        
        response_text = completion.choices[0].message.content
        logger.info(f"Groq API MCQ Explain Response for Q#{qa.question_id}: {response_text}")
        
        data = json.loads(response_text)
        
        return QuestionGrade(
            score=0,
            percentage=0,
            feedback=str(data.get("feedback", "Explication générée par l'IA.")),
            strengths=[],
            missing_points=[]
        )
    except Exception as e:
        logger.error(f"Error explaining Q#{qa.question_id}: {e}")
        return QuestionGrade(
            score=0,
            percentage=0,
            feedback=f"Erreur technique lors de la génération de l'explication : {str(e)}",
            strengths=[],
            missing_points=[]
        )

async def grade_question_with_ai(qa: QuestionAnswer) -> QuestionGrade:
    if qa.type in ['QCU', 'QCM']:
        return await explain_mcq_error_with_ai(qa)

    if not client:
        logger.error("Groq API client is not initialized. Please verify GROQ_API_KEY env variable.")
        return QuestionGrade(
            score=0,
            percentage=0,
            feedback="Correction impossible : le serveur n'a pas configuré la clé API Groq.",
            strengths=[],
            missing_points=["Veuillez configurer la clé API Groq sur le serveur."]
        )

    # Prompt design for structured evaluation
    prompt = f"""Tu es un correcteur universitaire expert.
Évalue la réponse de l'étudiant à la question suivante en te basant sur la réponse attendue.
Attribue une note sur 20.

Informations sur la question :
Type : {qa.type}
Question : {qa.question}

Réponse attendue :
{qa.expected_answer}

Réponse de l'étudiant :
{qa.student_answer}

Prends en compte les critères d'évaluation suivants :
1. Exactitude scientifique et technique
2. Clarté de la compréhension et rigueur
3. Terminologie spécifique employée
4. Exhaustivité de la réponse par rapport aux éléments attendus

Renvoie UNIQUEMENT un objet JSON valide correspondant STRICTEMENT aux types suivants :
- "score": nombre entier de 0 à 20 (obligatoirement compris entre 0 et 20)
- "percentage": nombre entier de 0 à 100 (pourcentage)
- "feedback": chaîne de caractères contenant une appréciation globale et constructive
- "strengths": liste de chaînes répertoriant les points forts de la réponse de l'étudiant
- "missing_points": liste de chaînes répertoriant les éléments manquants, imprécis ou incorrects

Ne mets aucun texte d'introduction, aucune note explicative et aucun format markdown en dehors du bloc JSON."""

    try:
        logger.info(f"Submitting Q#{qa.question_id} to Groq API...")
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "Tu es un correcteur impartial qui répond exclusivement sous forme de JSON valide."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.1,
            max_tokens=800
        )
        
        response_text = completion.choices[0].message.content
        logger.info(f"Groq API Response for Q#{qa.question_id}: {response_text}")
        
        data = json.loads(response_text)
        
        # Validate score bounds
        score = int(data.get("score", 0))
        score = max(0, min(20, score))
        
        percentage = int(data.get("percentage", 0))
        percentage = max(0, min(100, percentage))
        
        return QuestionGrade(
            score=score,
            percentage=percentage,
            feedback=str(data.get("feedback", "Correction effectuée.")),
            strengths=list(data.get("strengths", [])),
            missing_points=list(data.get("missing_points", []))
        )
    except Exception as e:
        logger.error(f"Error grading Q#{qa.question_id}: {e}")
        return QuestionGrade(
            score=0,
            percentage=0,
            feedback=f"Erreur technique lors de la correction : {str(e)}",
            strengths=[],
            missing_points=["La correction par IA a échoué en raison d'une exception technique."]
        )

