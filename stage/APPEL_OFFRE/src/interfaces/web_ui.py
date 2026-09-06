import os
from flask import Flask, render_template
from flask_cors import CORS
from src.interfaces.api import api_bp

# Chemin absolu vers templates/
TEMPLATE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../templates"))
STATIC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../static"))

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)
CORS(app)

app.register_blueprint(api_bp)

@app.route("/")
def index():
    return render_template("index.html")

def main():
    app.run(debug=True, port=5000)

if __name__ == "__main__":
    main()
