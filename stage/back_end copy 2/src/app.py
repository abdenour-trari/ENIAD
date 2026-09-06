from flask import Flask, jsonify, request
from flask_cors import CORS

from scrapers.pmmp_categories import fetch_pmmp_categories
from scrapers.detailed_tenders import fetch_detailed_tenders
from agent.agent_chat import build_chat_agent
from agent.response_AO import reponse_chat

from groq import Groq
from config import GROK_API_KEY   # <-- utiliser la clé Groq

from db import (init_db, insert_tenders, get_all_tenders ,
                get_analyse, insert_analyse,
                get_reponse, insert_reponse)

app = Flask(__name__)
CORS(app)

# Init DB
init_db()

# Initialiser LangGraph agent (Groq)
chat_agent = build_chat_agent(api_key=GROK_API_KEY)

# Client Groq direct (pour d’autres besoins si besoin)
client = Groq(api_key=GROK_API_KEY)

from agent.analyse_ao import analyse_appel_offre


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
    user_msg = request.json.get("message", "")
    if not user_msg:
        return jsonify({"error": "Message vide"}), 400

    try:
        # Appeler directement l’agent Groq
        state = {"message": user_msg}
        result = chat_agent.invoke(state)
        return jsonify({"reply": result["response"]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/generate-response", methods=["POST"])
def generate_response():
    try:
        data = request.get_json()
        objet = data.get("objet")
        analysis = data.get("analysis")
        step = data.get("step")
        reference = data.get("reference")
        force_regen = data.get("force", False)  # <- par défaut False

        if not analysis or not step or not reference:
            return jsonify({"success": False, "error": "Paramètres manquants"}), 400

        # Vérifier si déjà en DB et pas de régénération
        if not force_regen:
            saved_response = get_reponse(reference, step)
            if saved_response:
                return jsonify({"success": True, "response": saved_response})

        # Sinon générer (ou régénérer)
        plan_text = ""
        for doc in analysis:
            plan_text += f"\n--- {doc['filename']} ---\n{doc['summary']}\n"

        response_text = reponse_chat(plan_text, step)

        # Sauvegarder (remplace si déjà existant)
        insert_reponse(reference, step, response_text)

        return jsonify({"success": True, "response": response_text})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
