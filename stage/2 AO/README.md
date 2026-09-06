# AoAgent - Automatisation appels d'offres (PMMP)

## Setup rapide (local)

1. Copier repo
2. Créer env: `python -m venv .venv && source .venv/bin/activate`
3. `pip install -r docker/requirements.txt`
4. Exporter clé OpenAI (optionnel): `export OPENAI_API_KEY="..."` (ou .env)
5. Lancer: `python src/interfaces/web_ui.py`
6. Ouvrir `http://localhost:5000`

## Docker

`docker-compose up --build`

## Architecture

Voir `docs/architecture.md`
