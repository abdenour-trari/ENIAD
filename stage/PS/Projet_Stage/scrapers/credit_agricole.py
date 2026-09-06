import requests
from bs4 import BeautifulSoup

def parse_objet_contact(excerpt):
    objet = ""
    date_ouverture = ""
    contact = ""

    paragraphs = excerpt.find_all("p")

    for i, p in enumerate(paragraphs):
        text = p.get_text(strip=True)

        # Récupérer l'objet dans le paragraphe suivant à "Objet:"
        if "Objet:" in text:
            if i + 1 < len(paragraphs):
                objet = paragraphs[i + 1].get_text(strip=True)

        # Récupérer la date d'ouverture dans le paragraphe suivant à "Date et heure"
        if "Date et heure" in text:
            if i + 1 < len(paragraphs):
                date_ouverture = paragraphs[i + 1].get_text(strip=True)

        # Récupérer tous les contacts après "Contact"
        if "Contact" in text:
            contacts = []
            for c in paragraphs[i + 1:]:
                c_text = c.get_text(strip=True)
                if c_text == "":
                    break
                contacts.append(c_text)
            contact = "\n".join(contacts)

    return objet, date_ouverture, contact


def scrape_credit_agricole_ma():
    url = "https://www.creditagricole.ma/fr/appel-offres"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    }
    response = requests.get(url, headers=headers, timeout=10)
    soup = BeautifulSoup(response.content, "html.parser")

    offres = []
    articles = soup.find_all("article", class_="card")

    for article in articles:
        reference = article.find("div", class_="vactory-tender__field-vactory-reference")
        reference_text = reference.get_text(strip=True) if reference else ""

        date_block = article.find("p", class_="card-date")
        date_text = date_block.get_text(strip=True) if date_block else ""

        objet = ""
        date_ouverture = ""
        contact = ""

        excerpt = article.find("div", class_="card-excerpt")
        if excerpt:
            objet, date_ouverture, contact = parse_objet_contact(excerpt)

        offres.append({
            "site": "creditagricole.ma",
            "numero_ao": reference_text,
            "date_publication": date_text,
            "objet": objet,
            "entite": "Crédit Agricole",
            "etat": "",
            "lieu": "Rabat",
            "date_ouverture": date_ouverture,
            "avis_link": url,
            "dossier_link": "",
            "contact": contact
        })

    return offres
