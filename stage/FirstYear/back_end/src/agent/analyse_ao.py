import os
import time
import zipfile
import shutil
import PyPDF2
from docx import Document
from pdf2image import convert_from_path
import pytesseract
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from groq import Groq
from config import GROK_API_KEY
from utils.logger import logger  # <-- logger central

# Configurer Grok
grok_client = Groq(api_key=GROK_API_KEY)

# Chemin Poppler pour Windows 
POPPLER_PATH = r"C:\poppler\Library\bin"

# Chemin Tesseract 
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def analyse_appel_offre(page_url: str):
    logger.info("Début de l'analyse pour l'URL: %s", page_url)

    # Créer le dossier de téléchargement
    download_dir = os.path.join(os.getcwd(), "downloads")
    os.makedirs(download_dir, exist_ok=True)

    # Configurer Selenium Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--disable-gpu")
    prefs = {
        "download.default_directory": download_dir,
        "download.prompt_for_download": False,
        "download.directory_upgrade": True,
        "safebrowsing.enabled": True
    }
    chrome_options.add_experimental_option("prefs", prefs)

    driver = webdriver.Chrome(options=chrome_options)
    driver.get(page_url)
    time.sleep(5)  # attendre le chargement complet

    # Trouver la section "Avis de publicité"
    avis_divs = driver.find_elements(By.XPATH, "//div[contains(@class,'blue bold') and contains(text(),'Avis de publicité')]")

    if not avis_divs:
        logger.warning("Section 'Avis de publicité' introuvable.")
    else:
        for idx, avis_div in enumerate(avis_divs):
            try:
                ul = avis_div.find_element(By.XPATH, "./following-sibling::ul")
                links = ul.find_elements(By.XPATH, ".//li[not(contains(@style,'display:none'))]/a")
            except Exception as e:
                logger.error("Aucun fichier trouvé pour la section %d : %s", idx+1, e)
                continue

            for jdx, a in enumerate(links):
                href = a.get_attribute("href")
                if href:
                    logger.info("Téléchargement du fichier %d depuis : %s", jdx+1, href)
                    a.click()
                    time.sleep(5)  # attendre le téléchargement

    driver.quit()

    # Récupérer les fichiers téléchargés
    files = sorted([f for f in os.listdir(download_dir) if f.lower().endswith((".pdf", ".docx", ".zip"))])
    if not files:
        logger.warning("Aucun fichier téléchargé.")
        return {}

    results = {}  # dictionnaire pour correspondre au frontend

    i = 0
    while i < len(files):  # boucle adaptée pour ajouter les fichiers extraits de ZIP
        filename = files[i]
        filepath = os.path.join(download_dir, filename)
        logger.info("Traitement du fichier : %s", filename)

        # Gestion des fichiers ZIP
        zip_extract_dir = None
        if filename.lower().endswith(".zip"):
            zip_extract_dir = os.path.join(download_dir, filename.replace(".zip", ""))
            os.makedirs(zip_extract_dir, exist_ok=True)
            try:
                with zipfile.ZipFile(filepath, 'r') as zip_ref:
                    zip_ref.extractall(zip_extract_dir)
                logger.info("Fichier ZIP extrait : %s", filename)
                # Ajouter les fichiers extraits à la liste pour analyse
                extracted_files = sorted([os.path.join(zip_extract_dir, f) for f in os.listdir(zip_extract_dir) if f.lower().endswith((".pdf", ".docx"))])
                files.extend(extracted_files)
            except Exception as e:
                logger.error("Impossible d'extraire %s: %s", filename, e)
            finally:
                os.remove(filepath)  # supprimer le zip après extraction
            i += 1
            continue

        # Lecture PDF ou DOCX
        text = ""
        try:
            if filename.lower().endswith(".pdf"):
                try:
                    with open(filepath, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                except Exception as e:
                    logger.error("Erreur lecture PDF %s: %s", filename, e)
                    text = ""

                # OCR si aucun texte
                if not text.strip():
                    logger.info("Texte non détecté dans %s, utilisation OCR...", filename)
                    pages = convert_from_path(filepath, poppler_path=POPPLER_PATH)
                    for page in pages:
                        text += pytesseract.image_to_string(page, lang='fra') + "\n"

            elif filename.lower().endswith(".docx"):
                doc = Document(filepath)
                text = "\n".join([p.text for p in doc.paragraphs])

            else:
                logger.warning("Format non supporté pour %s", filename)
                os.remove(filepath)
                i += 1
                continue

        except Exception as e:
            logger.error("Impossible de lire %s: %s", filename, e)
            i += 1
            continue

        if not text.strip():
            logger.warning("Aucun texte exploitable dans %s", filename)
            os.remove(filepath)
            i += 1
            continue

        # Analyse avec Grok
        try:
            prompt = f"""
            Tu es un expert en analyse d'appels d'offres.
            sans ajouter au debut 'Voici l'analyse du document d'appel d'offre en utilisant le canevas fourni '
            Analyse le document d’appel d’offre en utilisant le canevas suivant :

            1 - Identification générale
                - Référence du marché
                - Autorité contractante
                - Type de procédure
                - Objet du marché

            2 - Objectifs & portée
                - Objectifs recherchés
                - Indicateurs de réussite attendus

            3 - Données financières
                - Budget estimatif
                - Montant du marché attribué
                - Différence estimation vs attribution
                - Mode de financement

            4 - Caractéristiques contractuelles
                - Forme du marché (unique, lots, etc.)
                - Délai d’exécution
                - Conditions de prix (révisables ou non)

            5 - Sélection et attribution
                - Critères de sélection
                - Justification du choix de l’attributaire
                - Nom de l’entreprise retenue

            6 - Forces & opportunités
                - Points positifs du marché pour l’autorité contractante
                - Opportunités éventuelles pour les entreprises

            7 - Risques & limites
                - Contraintes techniques, financières ou organisationnelles
                - Risques liés à l’exécution
            
            8 - Conclusion & recommandations
                - Synthèse professionnelle
                - Conseils ou remarques stratégiques
            
            Texte du document :
            {text[:8000]}
            """

            try:
                response_ai = grok_client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=[
                        {"role": "system", "content": "Tu es un expert en analyse d'appels d'offres. Ne commence jamais la réponse par 'Voici l'analyse du document...' ou toute phrase d'introduction. Donne uniquement l'analyse structurée selon le canevas."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )

                summary = response_ai.choices[0].message.content
                results[filename] = summary
                logger.info("Analyse AI terminée pour %s", filename)

            except Exception as e:
                results[filename] = f"Erreur lors de l'analyse AI : {e}"
                logger.error("Erreur AI pour %s: %s", filename, e)

        except Exception as e:
            logger.error("Erreur lors de l'analyse AI avec Grok pour %s: %s", filename, e)

        # Supprimer le fichier après traitement
        try:
            if os.path.exists(filepath):
                os.remove(filepath)
                logger.info("Fichier supprimé : %s", filename)
        except Exception as e:
            logger.error("Impossible de supprimer %s : %s", filename, e)

        # Supprimer le dossier extrait si existe
        if zip_extract_dir and os.path.exists(zip_extract_dir):
            try:
                shutil.rmtree(zip_extract_dir)
                logger.info("Dossier extrait supprimé : %s", zip_extract_dir)
            except Exception as e:
                logger.error("Impossible de supprimer le dossier %s : %s", zip_extract_dir, e)

        i += 1

    logger.info("Analyse terminée pour l'URL: %s", page_url)
    return results
