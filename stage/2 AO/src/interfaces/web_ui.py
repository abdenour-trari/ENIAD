from flask import Flask, render_template, jsonify, request
from src.agent.tools import ScraperTool
from ..agent.memory import Memory
from ..agent.planner import Planner
from ..agent.executor import Executor
from ..utils.logger import logger
import os

app = Flask(__name__, template_folder=os.path.join(os.path.dirname(__file__), "templates"))

scraper = ScraperTool()
memory = Memory()
planner = Planner()
executor = Executor()

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/scrape", methods=["POST"])
def api_scrape():
    try:
        items = scraper.fetch_listings()
        return jsonify({"status":"ok", "count": len(items), "items": items})
    except Exception as e:
        logger.exception("Scrape failed")
        return jsonify({"status":"error", "msg": str(e)}), 500

@app.route("/api/offers")
def api_offers():
    rows = memory.list_offers()
    offers = [{"id":r[0],"title":r[1],"org":r[2],"deadline":r[3],"fetched_at":r[4]} for r in rows]
    return jsonify({"offers": offers})

@app.route("/api/plan", methods=["POST"])
def api_plan():
    data = request.json
    offer = data.get("offer")
    plan = planner.plan(offer)
    return jsonify({"plan": plan})

@app.route("/api/execute", methods=["POST"])
def api_execute():
    data = request.json
    plan = data.get("plan")
    offer = data.get("offer")
    draft = executor.execute(plan, offer)
    return jsonify({"draft": draft})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
