from flask import Blueprint, jsonify, request
from src.scrapers.finances import scrape_finances_gov_ma
from src.scrapers.credit_agricole import scrape_credit_agricole_ma
from src.scrapers.pmmp import scrape_pmmp
from src.filters.keyword_filter import filter_by_keyword
from src.filters.advanced_filter import filter_advanced

api_bp = Blueprint("api", __name__)

SOURCES = {
    "finances": scrape_finances_gov_ma,
    "credit_agricole": scrape_credit_agricole_ma,
    "pmmp": scrape_pmmp
}

@api_bp.route("/scrape")
def scrape():
    keyword = request.args.get("keyword", "").strip()
    source = request.args.get("source", "finances").strip()

    if source != "all" and source not in SOURCES:
        return jsonify({"error": f"Source inconnue : {source}"}), 400

    try:
        all_offres = []
        if source == "all":
            for scraper_func in SOURCES.values():
                offres = scraper_func()
                all_offres.extend(filter_by_keyword(offres, keyword))
        else:
            offres = SOURCES[source]()
            all_offres = filter_by_keyword(offres, keyword)

        return jsonify({
            "source": source,
            "total": len(all_offres),
            "results": all_offres
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api_bp.route("/scrape_advanced", methods=["POST"])
def scrape_advanced():
    try:
        criteria = request.get_json()
        if not criteria or 'site' not in criteria:
            return jsonify({"error": "Paramètre 'site' obligatoire"}), 400

        site = criteria['site']
        if site not in SOURCES:
            return jsonify({"error": f"Source inconnue : {site}"}), 400

        offres = SOURCES[site]()
        filtered_offres = filter_advanced(offres, criteria)

        return jsonify({
            "source": site,
            "total": len(filtered_offres),
            "results": filtered_offres
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
