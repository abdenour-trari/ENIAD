import sqlite3
import os

DB_PATH = os.path.join("./memory_store/agent_memory.db")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
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
    """)
    conn.commit()
    conn.close()

def clear_tenders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tenders")
    conn.commit()
    conn.close()

def insert_tenders(tenders):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    for t in tenders:
        cursor.execute("""
            INSERT INTO tenders (reference, objet, acheteur, lieu, procedure, categorie, date, lien)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            t["reference"], t["objet"], t["acheteur"], t["lieu"],
            t["procedure"], t["categorie"], t["date"], t["lien"]
        ))
    conn.commit()
    conn.close()

def get_all_tenders():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT reference, objet, acheteur, lieu, procedure, categorie, date, lien FROM tenders")
    rows = cursor.fetchall()
    conn.close()

    # Convertir en liste de dict
    return [
        {
            "reference": r[0],
            "objet": r[1],
            "acheteur": r[2],
            "lieu": r[3],
            "procedure": r[4],
            "categorie": r[5],
            "date": r[6],
            "lien": r[7]
        }
        for r in rows
    ]


