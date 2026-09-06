# src/scrapers/pmmp_categories.py
import requests
from bs4 import BeautifulSoup
from config import SCRAPER_SETTINGS

def fetch_pmmp_categories():
    url = f"{SCRAPER_SETTINGS['BASE_URL']}/pmmp/"
    headers = {"User-Agent": SCRAPER_SETTINGS["USER_AGENT"]}

    try:
        response = requests.get(url, headers=headers, timeout=SCRAPER_SETTINGS["TIMEOUT"])
        response.raise_for_status()
    except Exception as e:
        print("Erreur fetch_pmmp_categories:", e)
        return {}

    soup = BeautifulSoup(response.text, "html.parser")

    categories = {}
    cat_map = {
        "fragment-1": "Travaux",
        "fragment-2": "Fournitures",
        "fragment-3": "Services"
    }

    for frag_id, cat_name in cat_map.items():
        fragment = soup.find("div", id=frag_id)
        if not fragment:
            continue
        rows = []
        table = fragment.find("table", class_="data")
        if table:
            for tr in table.find("tbody").find_all("tr"):
                tds = tr.find_all("td")
                if len(tds) >= 2:
                    rows.append({
                        "sector": tds[0].get_text(strip=True),
                        "count": tds[1].get_text(strip=True),
                    })
        categories[cat_name] = rows
    return categories
