from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
from scrapers.finances import scrape_finances_gov_ma
from scrapers.credit_agricole import scrape_credit_agricole_ma
from scrapers.equipement import scrape_equipement_gov_ma

app = Flask(__name__)
CORS(app)

SOURCES = {
    "finances": scrape_finances_gov_ma,
    "credit_agricole": scrape_credit_agricole_ma,
    "equipement": scrape_equipement_gov_ma
}

def filter_by_keyword(offres, keyword):
    if not keyword:
        return offres
    keyword = keyword.lower()
    return [
        offre for offre in offres
        if any(keyword in str(value).lower() for value in offre.values())
    ]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/scrape')
def scrape():
    keyword = request.args.get('keyword', '').strip()
    source = request.args.get('source', 'finances').strip()

    if source not in SOURCES:
        return jsonify({"error": f"Source inconnue : {source}"}), 400

    # Récupérer tous les appels d'offres du site
    try:
        all_offres = SOURCES[source]()

        # Filtrer selon mot-clé général
        filtered = filter_by_keyword(all_offres, keyword)

        # Filtrage avancé : parcourir les paramètres avancés
        advanced_params = request.args.to_dict()
        ignore_keys = ['keyword', 'source']
        for param in ignore_keys:
            advanced_params.pop(param, None)

        if advanced_params:
            def match_advanced(offre):
                for key, val in advanced_params.items():
                    if key not in offre:
                        return False
                    # Comparaison insensible à la casse et partielle
                    if val.lower() not in str(offre[key]).lower():
                        return False
                return True
            filtered = list(filter(match_advanced, filtered))

        return jsonify({
            "source": source,
            "total": len(all_offres),
            "filtered": len(filtered),
            "results": filtered
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
