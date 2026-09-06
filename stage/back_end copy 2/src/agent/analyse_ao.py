import os
import time
import PyPDF2
from docx import Document
from pdf2image import convert_from_path
import pytesseract
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from groq import Groq
from config import GROK_API_KEY


# Configurer Grok
grok_client = Groq(api_key=GROK_API_KEY)

# Chemin Poppler pour Windows 
POPPLER_PATH = r"C:\poppler\Library\bin"

# Chemin Tesseract 
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"


def analyse_appel_offre(page_url: str):

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
        print("Section 'Avis de publicité' introuvable.")
    else:
        for idx, avis_div in enumerate(avis_divs):
            try:
                ul = avis_div.find_element(By.XPATH, "./following-sibling::ul")
                links = ul.find_elements(By.XPATH, ".//li[not(contains(@style,'display:none'))]/a")
            except:
                print(f"Aucun fichier trouvé pour la section {idx+1}")
                continue

            for jdx, a in enumerate(links):
                href = a.get_attribute("href")
                if href:
                    print(f"Téléchargement du fichier {jdx+1} depuis : {href}")
                    a.click()
                    time.sleep(5)  # attendre le téléchargement

    driver.quit()

    # Récupérer les fichiers téléchargés
    files = sorted([f for f in os.listdir(download_dir) if f.lower().endswith((".pdf", ".docx"))])
    if not files:
        print(" Aucun fichier téléchargé.")
        return {}

    results = {}

    for filename in files:
        filepath = os.path.join(download_dir, filename)
        print(f"\n--- Lecture du fichier : {filename} ---")
        text = ""

        try:
            if filename.lower().endswith(".pdf"):
                # Lecture PDF
                try:
                    with open(filepath, "rb") as f:
                        reader = PyPDF2.PdfReader(f)
                        for page in reader.pages:
                            page_text = page.extract_text()
                            if page_text:
                                text += page_text + "\n"
                except:
                    text = ""

                # OCR si aucun texte
                if not text.strip():
                    print(f"Texte non détecté dans {filename}, OCR...")
                    pages = convert_from_path(filepath, poppler_path=POPPLER_PATH)
                    for page in pages:
                        text += pytesseract.image_to_string(page, lang='fra') + "\n"

            else:
                # Lecture DOCX
                doc = Document(filepath)
                text = "\n".join([p.text for p in doc.paragraphs])

        except Exception as e:
            print(f"Impossible de lire {filename}: {e}")
            continue

        if not text.strip():
            print(f"Aucun texte exploitable dans {filename}")
            # Supprimer le fichier inutile
            os.remove(filepath)
            continue

        # Analyse avec Grok
        try:
            prompt = f"""
            Tu es un expert en analyse d'appels d'offres.
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
            
                sans ajouter au debut 'Voici l'analyse du document d'appel d'offre en utilisant le canevas fourni '
            Texte du document :
            {text[:8000]}
            """

            try:
                response_ai = grok_client.chat.completions.create(
                    model="llama-3.1-8b-instant",  
                    messages=[
                        {"role": "system", "content": "Tu es un expert en analyse d'appels d'offres."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3
                )

                summary = response_ai.choices[0].message.content
                results[filename] = summary

            except Exception as e:
                results[filename] = f"Erreur lors de l'analyse AI : {e}"

        except Exception as e:
            print(f"Erreur lors de l'analyse AI avec Grok pour {filename} : {e}")

        # Supprimer le fichier une fois traité
        try:
            os.remove(filepath)
            print(f"Fichier supprimé : {filename}")
        except Exception as e:
            print(f"Impossible de supprimer {filename} : {e}")
    
    return results
