# Étape 1 : choisir une image de base
FROM python:3.10-slim

# Étape 2 : définir le dossier de travail
WORKDIR /app

# Étape 3 : copier les fichiers du projet
COPY . /app

# Étape 4 : installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Étape 5 : exposer le port
EXPOSE 7860

# Étape 6 : définir la commande de lancement
CMD ["python", "app.py"]