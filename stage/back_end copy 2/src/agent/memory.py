import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "memory_store" / "agent_memory.db"
DB_PATH.parent.mkdir(exist_ok=True)

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    # Table pour stocker tous les AO détaillés
    c.execute('''
        CREATE TABLE IF NOT EXISTS tenders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            reference TEXT,
            objet TEXT,
            acheteur TEXT,
            lieu TEXT,
            procedure TEXT,
            categorie TEXT,
            date TEXT,
            lien TEXT
        )
    ''')
    conn.commit()
    conn.close()

def insert_tender(tender: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO tenders (reference, objet, acheteur, lieu, procedure, categorie, date, lien)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        tender.get("reference"),
        tender.get("objet"),
        tender.get("acheteur"),
        tender.get("lieu"),
        tender.get("procedure"),
        tender.get("categorie"),
        tender.get("date"),
        tender.get("lien"),
    ))
    conn.commit()
    conn.close()

def fetch_all_tenders():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute("SELECT * FROM tenders ORDER BY date DESC")
    rows = c.fetchall()
    conn.close()
    return rows

# Initialise la base à l'import
init_db()
