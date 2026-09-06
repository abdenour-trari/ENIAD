import requests
from bs4 import BeautifulSoup
from ..utils.config import CONFIG
from ..utils.helpers import save_offer, ensure_db
from ..utils.logger import logger
import hashlib

class ScraperTool:
    def __init__(self):
        cfg = CONFIG["agent"]["scraping"]
        self.base_url = cfg["base_url"]
        self.headers = {"User-Agent": cfg.get("user_agent", "Mozilla/5.0")}

    def fetch_listings(self):
        url = self.base_url
        r = requests.get(url, headers=self.headers, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        # NOTE: structure du site peut changer -> selector example below
        items = []
        # tentative d'extraction générique: chercher les lignes dans des tables ou divs listant consultations
        for tr in soup.select("table tr"):
            tds = tr.find_all("td")
            if not tds:
                continue
            raw = tr
            title = tds[1].get_text(strip=True) if len(tds) > 1 else tr.get_text(strip=True)[:100]
            deadline = tds[2].get_text(strip=True) if len(tds) > 2 else ""
            org = tds[0].get_text(strip=True) if len(tds) > 0 else ""
            uid = hashlib.sha1((title + deadline + org).encode()).hexdigest()[:16]
            items.append({
                "id": uid,
                "title": title,
                "org": org,
                "deadline": deadline,
                "raw_html": str(raw)
            })
        # fallback: chercher liens
        if not items:
            for a in soup.select("a"):
                txt = a.get_text(strip=True)
                if len(txt) > 20 and "appel" in txt.lower():
                    uid = hashlib.sha1(txt.encode()).hexdigest()[:16]
                    items.append({"id": uid, "title": txt, "org": "", "deadline": "", "raw_html": str(a)})
        ensure_db()
        for it in items:
            save_offer(it)
        logger.info(f"Fetched {len(items)} listings")
        return items
