import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, parse_qs

def scrape_pmmp():
    url = "https://www.marchespublics.gov.ma/pmmp/"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    results = []
    
    tabs = {
        "Travaux": "fragment-1",
        "Fournitures": "fragment-2",
        "Services": "fragment-3"
    }
    
    for rubrique, fragment_id in tabs.items():
        tab_div = soup.find("div", id=fragment_id)
        if not tab_div:
            continue
        
        table = tab_div.find("table", class_="data")
        if not table:
            continue
        
        tbody = table.find("tbody")
        if not tbody:
            continue
        
        rows = tbody.find_all("tr")
        for tr in rows:
            secteur_cell = tr.find("td", headers=lambda x: x and "secteur" in x)
            nb_cell = tr.find("td", headers=lambda x: x and "nb" in x)
            if not secteur_cell or not nb_cell:
                continue
            
            secteur_link = secteur_cell.find("a")
            secteur = secteur_link.text.strip() if secteur_link else secteur_cell.text.strip()
            secteur_url = secteur_link['href'] if secteur_link else None
            nombre_ao = nb_cell.text.strip()
            
            secteur_value = None
            if secteur_url and "ddlSecteur=" in secteur_url:
                query = urlparse(secteur_url).query
                params = parse_qs(query)
                secteur_value = params.get("ddlSecteur", [None])[0]
            
            results.append({
                "rubrique": rubrique,
                "secteur": secteur,
                "secteur_url": secteur_url,
                "nombre_appels": nombre_ao,
                "secteur_value": secteur_value
            })
    
    return results

def scrape_pmmp_advanced_search(secteur_value):
    if not secteur_value:
        return []

    url = "https://www.marchespublics.gov.ma/index.php?page=entreprise.EntrepriseAdvancedSearch&searchAnnCons"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    session = requests.Session()

    # GET initial pour récupérer les champs cachés
    response_get = session.get(url, headers=headers)
    response_get.raise_for_status()
    soup_get = BeautifulSoup(response_get.text, "html.parser")

    payload = {
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
        "ctl00$CONTENU_PAGE$AdvancedSearch$ddlSecteur": secteur_value,
        "ctl00$CONTENU_PAGE$AdvancedSearch$lancerRecherche": "Lancer la recherche"
    }

    for field in ["__VIEWSTATE", "__EVENTVALIDATION", "__VIEWSTATEGENERATOR"]:
        tag = soup_get.find("input", {"name": field})
        if tag and tag.has_attr("value"):
            payload[field] = tag["value"]

    response_post = session.post(url, data=payload, headers=headers)
    response_post.raise_for_status()

    soup = BeautifulSoup(response_post.text, "html.parser")

    results = []

    table = soup.find("table", class_="data")
    if not table:
        return results

    tbody = table.find("tbody")
    if not tbody:
        return results

    for tr in tbody.find_all("tr"):
        tds = tr.find_all("td")
        if len(tds) < 3:
            continue
        numero_ao = tds[0].text.strip()
        objet = tds[1].text.strip()
        date_ouverture = tds[2].text.strip()

        results.append({
            "numero_ao": numero_ao,
            "objet": objet,
            "date_ouverture": date_ouverture
        })

    return results
