from flask import Flask, jsonify, request
from flask_cors import CORS
import re
from datetime import datetime
import os , json
import sqlite3
from utils.logger import logger

DB_PATH = os.path.join("./memory_store/agent_memory.db")




from agent.analyse_ao import analyse_appel_offre
from scrapers.pmmp_categories import fetch_pmmp_categories
from scrapers.detailed_tenders import fetch_detailed_tenders
from agent.agent_chat import build_chat_agent
from agent.response_AO import reponse_chat
from db import (init_db, insert_tenders, get_all_tenders ,
                get_analyse, insert_analyse,
                get_reponse, insert_reponse,
                insert_or_update_company, get_company)

from groq import Groq
from config import GROK_API_KEY   # <-- utiliser la clé Groq


app = Flask(__name__)
CORS(app)

# Init DB
init_db()



# Initialiser LangGraph agent (Groq)
chat_agent = build_chat_agent(api_key=GROK_API_KEY)

# Client Groq direct (pour d’autres besoins si besoin)
client = Groq(api_key=GROK_API_KEY)


DATE_REGEX = r"(\d{2}/\d{2}/\d{4})"
def parse_dates_from_msg(msg):
    """Extrait une plage de dates si présente dans le message"""
    matches = re.findall(DATE_REGEX, msg)
    dates = []
    for m in matches:
        try:
            dates.append(datetime.strptime(m, "%d/%m/%Y"))
        except:
            pass
    if len(dates) == 2:
        return min(dates), max(dates)
    return None, None

@app.route("/analysis-ao", methods=["POST"])
def analysis_ao():
    try:
        data = request.get_json()
        url = data.get("url")
        reference = data.get("reference")

        if not url or not reference:
            return jsonify({"success": False, "error": "URL ou référence manquante"}), 400

        # Vérifier en DB
        saved_analyse = get_analyse(reference)
        if saved_analyse:
            return jsonify({
                "success": True,
                "data": [{"filename": "Analyse existante", "summary": saved_analyse}]
            })

        # Sinon analyser
        data_analysed = analyse_appel_offre(url)

        # Convertir en texte unique (pour stocker)
        analyse_text = "\n".join([f"{k}: {v}" for k, v in data_analysed.items()])
        insert_analyse(reference, analyse_text)

        return jsonify({
            "success": True,
            "data": [
                {"filename": filename, "summary": summary}
                for filename, summary in data_analysed.items()
            ]
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/pmmp-categories", methods=["GET"])
def pmmp_tenders():
    try:
        data = fetch_pmmp_categories()
        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/update-tenders", methods=["GET"])
def update_tenders():
    try:
        from db import clear_tenders, insert_tenders

        # Vider les AO existants
        clear_tenders()

        # Re-scraper
        data = fetch_detailed_tenders()

        # Réinsérer tous les AO
        insert_tenders(data)

        return jsonify({"success": True, "message": "Données mises à jour", "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/detailed-tenders", methods=["GET"])
def detailed_tenders():
    try:
        # Vérifier si des AO existent déjà en DB
        data = get_all_tenders()
        if data:  # si trouvé, renvoyer direct
            return jsonify({"success": True, "data": data})

        # sinon, scraper et insérer
        data = fetch_detailed_tenders()
        insert_tenders(data)

        return jsonify({"success": True, "data": data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    user_msg = (data.get("message", "") or "").strip()

    if not user_msg:
        return jsonify({"success": False, "error": "Message vide"}), 400

    try:
        tenders = get_all_tenders()
        matches = []

        # ---- 1) Vérifier si l'utilisateur parle de dates ----
        start, end = parse_dates_from_msg(user_msg)

        # ---- 2) Extraire mots-clés (nettoyés) ----
        keywords = [w.lower() for w in re.findall(r"\w+", user_msg)]
        stopwords = {"donner", "moi", "les", "offres", "offre", "ao", "dans", "la", "date", "entre", "et"}
        keywords = [k for k in keywords if k not in stopwords]

        for t in tenders:
            objet = t.get("objet", "").lower()
            reference = t.get("reference", "").lower()
            categorie = t.get("categorie", "").lower()
            date_str = t.get("date", "")

            # Filtre par mots-clés (doit contenir TOUS les mots)
            if keywords and not all(k in (objet + " " + reference + " " + categorie) for k in keywords):
                continue

            # Filtre par dates
            if start and end:
                try:
                    ao_date = datetime.strptime(date_str, "%d/%m/%Y")
                    if not (start <= ao_date <= end):
                        continue
                except:
                    continue

            # Si passe les filtres → match
            matches.append({
                "reference": t["reference"],
                "objet": t["objet"],
                "date": t["date"],
                "lien": t.get("lien")
            })

        # ---- 3) Réponse ----
        if matches:
            formatted = "\n\n".join([
                f"📌 Référence: {m['reference']}\n📄 Objet: {m['objet']}\n📅 Date: {m['date']}"
                for m in matches
            ])
            return jsonify({"success": True, "reply": formatted, "results": matches})

        return jsonify({"success": True, "reply": "Aucun appel d’offre trouvé pour ces critères."})

    except Exception as e:
        app.logger.exception("Erreur route /chat")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/generate-response", methods=["POST"])
def generate_response():
    try:
        data = request.get_json()
        objet = data.get("objet")
        analysis = data.get("analysis")
        step = data.get("step")
        reference = data.get("reference")
        force_regen = data.get("force", False)
        custom_prompt = data.get("customPrompt", "")

        if not analysis or not step or not reference:
            return jsonify({"success": False, "error": "Paramètres manquants"}), 400

        # ✅ Si déjà sauvegardé et pas de régénération forcée
        if not force_regen:
            saved_response = get_reponse(reference, step)
            if saved_response:
                # 🔹 Ici on traite le JSON avant de renvoyer
                try:
                    parsed = json.loads(saved_response)
                except:
                    parsed = {"texte": saved_response, "tableau": []}

                # Nettoyage & normalisation
                formatted = clean_response(parsed)
                return jsonify({"success": True, "response": formatted})

        # Charger les données de l’entreprise
        company = get_company()

        # Construire le "plan" global (analyse AO + infos entreprise)
        plan_text = ""
        for doc in analysis:
            plan_text += f"\n--- {doc['filename']} ---\n{doc['summary']}\n"

        if company:
            plan_text += f"""
            --- Informations Entreprise ---
            Nom: {company.get('name')}
            Adresse: {company.get('address')}
            Téléphone: {company.get('phone')}
            Email: {company.get('email')}
            Site web: {company.get('website')}
            """

        # Générer la réponse (dict ou str)
        response_data = reponse_chat(plan_text, step, custom_prompt)

        # Sauvegarde complète
        if isinstance(response_data, dict):
            full_json = json.dumps(response_data, ensure_ascii=False)
            insert_reponse(reference, step, full_json)
        else:
            insert_reponse(reference, step, response_data)

        # ✅ Traitement avant envoi au frontend
        formatted = clean_response(response_data)

        return jsonify({"success": True, "response": formatted})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def clean_response(data):
    """
    Nettoie et structure les réponses avant l'envoi au frontend.
    """
    # Si c'est une chaîne JSON → parser
    if isinstance(data, str):
        try:
            data = json.loads(data)
        except:
            data = {"texte": data, "tableau": []}

    # Si le champ texte contient des guillemets ou \n, on les nettoie
    texte = data.get("texte", "").replace("\\n", "\n").strip()

    # Vérifie que le tableau est bien une liste
    tableau = data.get("tableau", [])
    if not isinstance(tableau, list):
        tableau = []

    # Retour propre
    return {
        "texte": texte,
        "tableau": tableau
    }



@app.route("/company", methods=["POST"])
def save_company():
    data = request.get_json()
    name = data.get("name")
    address = data.get("address")
    phone = data.get("phone")
    email = data.get("email")
    website = data.get("website")

    if not name or not email:
        return jsonify({"success": False, "error": "Nom et email obligatoires"}), 400

    insert_or_update_company(name, address, phone, email, website)
    return jsonify({"success": True, "message": "Informations enregistrées"})


@app.route("/company", methods=["GET"])
def fetch_company():
    company = get_company()
    return jsonify({"success": True, "data": company})
    

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
