import os
import sys
import json
import asyncio
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from typing import Optional, List

# Add parent directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load env variables from backend/.env
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(dotenv_path=dotenv_path, override=True)

from app.schemas import GradingPayload
from app.evaluator import grade_question_with_ai, client
import pypdf

app = FastAPI(title="QCM Generator Pro AI Grader Backend")

# Enable CORS for the local React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, lock down to the frontend origin e.g. ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ok", 
        "message": "QCM Generator Pro AI Grader Backend is running",
        "api_key_loaded": os.getenv("GROQ_API_KEY") is not None
    }

@app.post("/grade")
async def grade_exam(payload: GradingPayload):
    # Grade all answers concurrently
    tasks = [grade_question_with_ai(qa) for qa in payload.answers]
    results = await asyncio.gather(*tasks)
    
    response = {}
    for qa, grade in zip(payload.answers, results):
        response[str(qa.question_id)] = grade.dict()
        
    return response

@app.post("/grade-stream")
async def grade_exam_stream(payload: GradingPayload):
    async def event_generator():
        for qa in payload.answers:
            # Grade question with Groq LLM
            grade = await grade_question_with_ai(qa)
            event_data = {
                "question_id": qa.question_id,
                "grade": grade.dict()
            }
            # Stream in Server-Sent Events format
            yield f"data: {json.dumps(event_data)}\n\n"
            # Yield control back to event loop
            await asyncio.sleep(0.05)
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de l'extraction du PDF : {str(e)}")


@app.post("/generate-exam")
async def generate_exam(
    file: Optional[UploadFile] = File(None),
    files: Optional[List[UploadFile]] = File(None),
    text_content: Optional[str] = Form(None),
    difficulty: str = Form("moyen"),
    num_questions: int = Form(10),
    pct_qcm: float = Form(30.0),
    pct_qcu: float = Form(30.0),
    pct_open: float = Form(40.0),
    is_tp_mode: bool = Form(False),
    tp_prompt: Optional[str] = Form(None)
):
    document_text = ""
    
    # Compile all input files
    all_files = []
    if file is not None and file.filename != "":
        all_files.append(file)
    if files:
        for f in files:
            if f.filename != "" and f not in all_files:
                all_files.append(f)

    # Server-side validation of max files
    if len(all_files) > 7:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas importer plus de 7 fichiers simultanément.")

    # 1. Extract text from uploaded files if present
    extracted_texts = []
    for f in all_files:
        content = await f.read()
        file_text = ""
        if f.filename.lower().endswith('.pdf'):
            file_text = extract_text_from_pdf(content)
        else:
            try:
                file_text = content.decode('utf-8')
            except UnicodeDecodeError:
                try:
                    file_text = content.decode('latin-1')
                except Exception as e:
                    raise HTTPException(
                        status_code=400, 
                        detail=f"Impossible de décoder le fichier '{f.filename}' : {str(e)}"
                    )
        if file_text.strip():
            extracted_texts.append(f"=== CONTENU DU DOCUMENT : {f.filename} ===\n{file_text.strip()}")

    if extracted_texts:
        document_text = "\n\n".join(extracted_texts)
    
    # 2. If no files, fallback to text_content
    if not document_text.strip():
        if text_content and text_content.strip():
            document_text = text_content
        else:
            raise HTTPException(status_code=400, detail="Veuillez fournir au moins un document (fichier ou texte).")

    if not client:
        raise HTTPException(status_code=500, detail="La clé API Groq n'est pas configurée sur le serveur.")

    # 3. Build system and user prompts
    if is_tp_mode:
        system_prompt = """Tu es un professeur d'université expert et un concepteur d'examens académiques.
Ton rôle est de générer des questions d'examen basées UNIQUEMENT sur le document de TP fourni par l'utilisateur.
Tu dois renvoyer STRICTEMENT un objet JSON contenant une liste de questions sous la clé "questions".
Chaque question doit respecter exactement ce schéma JSON :
{
  "id": entier unique (commençant par 1),
  "type": "OPEN" | "DEFINITION" | "CASE_STUDY" | "ANALYSIS",
  "category": "nom de la catégorie/sujet",
  "question": "le texte de la question",
  "expected_answer": "la réponse attendue détaillée (explications académiques précises)"
}

ATTENTION :
1. PAS de questions de type QCM ou QCU ! Uniquement des questions ouvertes (OPEN, DEFINITION, CASE_STUDY, ANALYSIS).
2. Ne mets AUCUN code de programmation ni dans les questions ni dans les réponses attendues. Concentre-toi sur la compréhension conceptuelle et l'explication des algorithmes (par exemple comment ils fonctionnent, leur logique, leurs étapes).
3. Pose des questions qui traitent de l'ensemble du TP et de son algorithme.
4. Pour les questions de type CASE_STUDY ou ANALYSIS, propose des situations globales fictives hors du TP avec des données chiffrées/concrètes, mais basées sur les concepts du TP.
5. Rédige tout en français.
6. Ne mets aucun texte d'introduction ou de conclusion, renvoie UNIQUEMENT l'objet JSON valide.
"""
        user_prompt = f"""Voici le contenu du document de TP :
---
{document_text}
---

Génère un examen de {num_questions} questions respectant les consignes ci-dessus.
Instructions spécifiques : {tp_prompt or "Compréhension globale du TP, fonctionnement de l'algorithme, et situations pratiques hors TP avec des données."}
Difficulté souhaitée : {difficulty}
"""
    else:
        # Standard mode - calculate counts
        total_pct = pct_qcm + pct_qcu + pct_open
        if total_pct == 0:
            total_pct = 100.0
            
        qcm_count = max(0, round(num_questions * (pct_qcm / total_pct)))
        qcu_count = max(0, round(num_questions * (pct_qcu / total_pct)))
        open_count = max(0, num_questions - qcm_count - qcu_count)
        
        # Adjust counts if they don't sum to num_questions
        current_sum = qcm_count + qcu_count + open_count
        if current_sum != num_questions:
            diff = num_questions - current_sum
            open_count = max(0, open_count + diff)

        system_prompt = """Tu es un professeur d'université expert et un concepteur d'examens académiques.
Ton rôle est de générer des questions d'examen basées UNIQUEMENT sur le document fourni par l'utilisateur.
Tu dois renvoyer STRICTEMENT un objet JSON contenant une liste de questions sous la clé "questions".
Chaque question doit respecter exactement ce schéma JSON :
{
  "id": entier unique (commençant par 1),
  "type": "QCU" | "QCM" | "OPEN" | "DEFINITION" | "CASE_STUDY" | "ANALYSIS",
  "category": "nom de la catégorie/sujet",
  "question": "le texte de la question",
  // Si le type est QCU ou QCM (obligatoire pour ces types, absent sinon) :
  "options": ["choix A", "choix B", "choix C", "choix D"],
  "correct": [index_corrects_0_based],
  // Si le type est OPEN, DEFINITION, CASE_STUDY ou ANALYSIS (obligatoire pour ces types, absent sinon) :
  "expected_answer": "la réponse attendue détaillée (explications académiques précises)",
  "scenario": "contexte/situation" // Requis uniquement pour CASE_STUDY, optionnel sinon
}

ATTENTION :
1. Les QCM doivent avoir plusieurs réponses correctes possibles (au moins 2). Les QCU doivent avoir exactement une réponse correcte.
2. Pour les questions ouvertes (OPEN, DEFINITION, CASE_STUDY, ANALYSIS), fournis une réponse attendue (expected_answer) claire, structurée et académique permettant une notation sur 20.
3. Rédige tout en français.
4. Ne mets aucun texte d'introduction ou de conclusion, renvoie UNIQUEMENT l'objet JSON valide.
"""
        user_prompt = f"""Voici le contenu du support de cours / document :
---
{document_text}
---

Génère un examen de {num_questions} questions respectant les consignes ci-dessus.
Difficulté souhaitée : {difficulty}
Répartition demandée :
- {qcm_count} questions de type QCM
- {qcu_count} questions de type QCU
- {open_count} questions de type ouvert (OPEN, DEFINITION, CASE_STUDY, ANALYSIS)
"""

    # 4. Call Groq API
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.3,
            max_tokens=4000
        )
        response_text = completion.choices[0].message.content
        data = json.loads(response_text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération par l'IA : {str(e)}")

