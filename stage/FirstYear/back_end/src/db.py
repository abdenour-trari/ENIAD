import sqlite3
import os

DB_PATH = os.path.join("./memory_store/agent_memory.db")

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Table des AO
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

    # Table analyse
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS table_analyse (
            reference TEXT PRIMARY KEY,
            analyse TEXT
        )
    """)

    # Table réponses
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS table_reponse (
            reference TEXT PRIMARY KEY,
            reponse_intro TEXT,
            reponse_meth TEXT,
            reponse_finance TEXT,
            reponse_valeur TEXT,
            reponse_risque TEXT,
            reponse_conclusion TEXT
        )
    """)

    # Table entreprise
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS company (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            website TEXT
        )
    """)

    conn.commit()
    conn.close()


# ----------------- Entreprise -----------------
def insert_or_update_company(name, address, phone, email, website):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT id FROM company LIMIT 1")
    row = cursor.fetchone()

    if row:
        # Mettre à jour la ligne existante
        cursor.execute("""
            UPDATE company
            SET name=?, address=?, phone=?, email=?, website=?
            WHERE id=?
        """, (name, address, phone, email, website, row[0]))
    else:
        # Insérer la première entreprise
        cursor.execute("""
            INSERT INTO company (name, address, phone, email, website)
            VALUES (?, ?, ?, ?, ?)
        """, (name, address, phone, email, website))

    conn.commit()
    conn.close()


def get_company():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, address, phone, email, website FROM company LIMIT 1")
    row = cursor.fetchone()
    conn.close()
    if row:
        return {
            "id": row[0],
            "name": row[1],
            "address": row[2],
            "phone": row[3],
            "email": row[4],
            "website": row[5]
        }
    return None


# --------- Analyse ---------
def get_analyse(reference):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT analyse FROM table_analyse WHERE reference = ?", (reference,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def insert_analyse(reference, analyse_text):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT OR REPLACE INTO table_analyse (reference, analyse)
        VALUES (?, ?)
    """, (reference, analyse_text))
    conn.commit()
    conn.close()


# --------- Réponses ---------
def get_reponse(reference, step):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    col_map = {
        "intro": "reponse_intro",
        "methodologie": "reponse_meth",
        "finance": "reponse_finance",
        "valeur": "reponse_valeur",
        "risques": "reponse_risque",
        "conclusion": "reponse_conclusion",
    }
    col = col_map.get(step)
    if not col:
        return None

    cursor.execute(f"SELECT {col} FROM table_reponse WHERE reference = ?", (reference,))
    row = cursor.fetchone()
    conn.close()
    return row[0] if row else None

def insert_reponse(reference, step, response_text):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Mapping colonne par étape
    col_map = {
        "intro": "reponse_intro",
        "methodologie": "reponse_meth",
        "finance": "reponse_finance",
        "valeur": "reponse_valeur",
        "risques": "reponse_risque",
        "conclusion": "reponse_conclusion",
    }
    col = col_map.get(step)
    if not col:
        conn.close()
        return

    # Vérifier si la référence existe déjà
    cursor.execute("SELECT reference FROM table_reponse WHERE reference = ?", (reference,))
    row = cursor.fetchone()

    if row:
        # ✅ Mise à jour uniquement de la colonne concernée
        cursor.execute(f"UPDATE table_reponse SET {col} = ? WHERE reference = ?", (response_text, reference))
    else:
        # ✅ Crée la ligne complète avec les autres champs NULL
        cursor.execute(f"""
            INSERT INTO table_reponse (reference, {col})
            VALUES (?, ?)
        """, (reference, response_text))

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



