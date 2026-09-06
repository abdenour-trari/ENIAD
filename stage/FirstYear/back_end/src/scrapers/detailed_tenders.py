# scrapers/detailed_scraper.py
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import re
import time

BASE_URL = "https://www.marchespublics.gov.ma"

def parse_objet_column(texte):
    """
    Sépare la référence, l'objet réel et l'acheteur public depuis le texte de la colonne 'objet'.
    Fonctionne avec des formats de référence variés.
    """
    reference = ""
    objet_reel = ""
    acheteur = ""

    # Extraire la référence (séquence alphanum + / - _ , souvent au début)
    ref_match = re.match(r"([A-Z0-9/\-_]+)", texte.strip(), re.IGNORECASE)
    if ref_match:
        reference = ref_match.group(1).strip().strip("-_/")

    # Extraire l'acheteur public
    acheteur_match = re.search(r"Acheteur public\s*:\s*(.+)", texte, re.IGNORECASE)
    if acheteur_match:
        acheteur = acheteur_match.group(1).strip()

    # Extraire l'objet réel (entre "Objet :" et "Acheteur public")
    objet_match = re.search(r"Objet\s*:\s*(.*?)(?:Acheteur public\s*:|$)", texte, re.IGNORECASE | re.DOTALL)
    if objet_match:
        objet_reel = objet_match.group(1).strip()

    return reference, objet_reel, acheteur



def clean_value(val):
    """ Nettoie une valeur texte : supprime les répétitions, espaces inutiles, etc. """
    if not val:
        return ""
    # Supprimer les répétitions type "BENSLIMANE...BENSLIMANE..."
    parts = [p.strip() for p in val.replace("...", " ").split() if p.strip()]
    return " ".join(sorted(set(parts), key=parts.index))  # garder l'ordre, supprimer doublons


def parse_procedure(procedure_raw):
    """
    Exemple brut : "AOO...Appel d'offres ouvertServices04/09/2025"
    On extrait : procedure = "Appel d'offres ouvert", categorie = "Services", date = "04/09/2025"
    """
    procedure = ""
    categorie = ""
    date = ""

    # Extraire la date (format JJ/MM/AAAA)
    date_match = re.search(r"(\d{2}/\d{2}/\d{4})", procedure_raw)
    if date_match:
        date = date_match.group(1)

    # Identifier la catégorie
    for cat in ["Services", "Travaux", "Fournitures"]:
        if cat.lower() in procedure_raw.lower():
            categorie = cat
            break

    # Extraire la procédure (juste le texte avant la catégorie ou la date)
    proc_match = re.search(r"(Appel d'offres ouvert|Appel d'offres restreint|Concours|Consultation architecturale|Marché négocié)", procedure_raw, re.IGNORECASE)
    if proc_match:
        procedure = proc_match.group(1)

    return procedure.strip(), categorie, date


def fetch_detailed_tenders():
    options = Options()
    options.headless = True
    driver = webdriver.Chrome(options=options)

    url = f"{BASE_URL}/index.php?page=entreprise.EntrepriseAdvancedSearch&AvisRapportPresentation"
    driver.get(url)

    tenders = []

    try:
        # Lire le nombre total de pages
        total_pages = 1
        try:
            total_pages_span = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.ID, "ctl0_CONTENU_PAGE_resultSearch_nombrePageTop"))
            )
            total_pages_text = total_pages_span.text.strip()
            total_pages = int(total_pages_text)

        except:
            pass

        for page in range(total_pages):
            WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "table.table-results"))
            )

            soup = BeautifulSoup(driver.page_source, "html.parser")
            table = soup.find("table", class_="table-results")
            rows = table.find_all("tr")[1:]

            for row in rows:
                cols = row.find_all("td")
                if len(cols) < 6:
                    continue

                # La colonne objet contient reference + objet + acheteur
                raw_objet = cols[2].get_text(strip=True)
                reference_parsed, objet_reel, acheteur_parsed = parse_objet_column(raw_objet)

                # Nettoyer lieu et procédure
                raw_lieu = cols[3].get_text(strip=True)
                raw_procedure = cols[1].get_text(strip=True)

                # Extraire procedure, categorie, date
                procedure, categorie, date = parse_procedure(raw_procedure)

                # Prioriser les valeurs extraites depuis "objet"
                reference = reference_parsed or cols[0].get_text(strip=True)
                acheteur = acheteur_parsed or cols[4].get_text(strip=True)

                # Nettoyage final
                reference = clean_value(reference)
                objet_reel = clean_value(objet_reel)
                acheteur = clean_value(acheteur)
                lieu = clean_value(raw_lieu)
                procedure = clean_value(procedure)

                # Extraire lien
                lien = ""
                link_tag = cols[5].find("a")
                if link_tag and "href" in link_tag.attrs:
                    href = link_tag["href"]
                    if href.startswith("http"):
                        lien = href
                    else:
                        lien = BASE_URL + "/" + href.lstrip("/")

                tenders.append({
                    "reference": reference,
                    "objet": objet_reel,
                    "acheteur": acheteur,
                    "lieu": lieu,
                    "procedure": procedure,
                    "categorie": categorie,
                    "date": date,
                    "lien": lien,
                })

            # Cliquer sur "suivant" sauf si c’est la dernière page
            if page < total_pages - 1:
                try:
                    next_button = WebDriverWait(driver, 3).until(
                        EC.element_to_be_clickable((By.ID, "ctl0_CONTENU_PAGE_resultSearch_PagerTop_ctl2"))
                    )
                    next_button.click()
                    time.sleep(1)
                except:
                    break

    finally:
        driver.quit()

    return tenders


