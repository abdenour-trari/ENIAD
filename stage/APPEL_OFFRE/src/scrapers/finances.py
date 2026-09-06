import requests
from bs4 import BeautifulSoup
from src.utils.logger import logger
from src.utils.config import config

def scrape_finances_gov_ma():
    url = config["sources"]["finances"]
    page = requests.get(url, timeout=config["timeout"])
    soup = BeautifulSoup(page.content, 'html.parser')

    offres = []
    table = soup.find('table', {'id': 'tableData'})
    if not table:
        logger.warning("Aucune table trouvée sur finances.gov.ma")
        return []

    tbody = table.find('tbody')
    if not tbody:
        return []

    for row in tbody.find_all('tr'):
        cells = row.find_all('td')
        if len(cells) < 5:
            continue

        text_lines = cells[0].get_text().split('\n')
        num_ao = next((line.strip() for line in text_lines if line.strip()), "")

        rubrique = ""
        etudes_span = cells[0].find('span', class_='etudes')
        if etudes_span:
            rubrique = etudes_span.get_text(strip=True)

        date_text = cells[0].get_text(strip=True).split()
        date_publication = ' '.join(date_text[-2:]) if len(date_text) >= 2 else ""

        objet = cells[1].find('div').get_text(strip=True) if cells[1].find('div') else ""
        entite = ""
        if 'Direction :' in cells[1].get_text():
            entite = cells[1].get_text().split('Direction :')[-1].strip()

        etat = cells[2].get_text(strip=True).split('\n')[0]
        lieu = ""
        cell2_text = cells[2].get_text(strip=True).split('\n')
        if len(cell2_text) > 1:
            lieu = cell2_text[-1]

        date_ouverture = cells[3].get_text(strip=True)

        avis_link = cells[4].find('a', class_='btn-avis')['href'] if cells[4].find('a', class_='btn-avis') else ""
        dossier_link = ""
        if cells[4].find('a', class_='btn-dossier'):
            dossier_link = cells[4].find('a', class_='btn-dossier')['href']
            if not dossier_link.startswith('http'):
                dossier_link = f"https://www.finances.gov.ma{dossier_link}"

        offres.append({
            "site": "finances.gov.ma",
            "rubrique": rubrique,
            "numero_ao": num_ao,
            "date_publication": date_publication,
            "objet": objet,
            "entite": entite,
            "etat": etat,
            "lieu": lieu,
            "date_ouverture": date_ouverture,
            "avis_link": avis_link,
            "dossier_link": dossier_link
        })

    return offres
