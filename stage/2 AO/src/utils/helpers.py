from datetime import datetime
import sqlite3, os
from ..utils.logger import logger
from ..utils.config import CONFIG

def ensure_db(db_path=None):
    if db_path is None:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "memory_store", "agent_memory.db")
    os.makedirs(os.path.dirname(db_path), exist_ok=True)
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
    CREATE TABLE IF NOT EXISTS offers (
        id TEXT PRIMARY KEY,
        title TEXT,
        org TEXT,
        deadline TEXT,
        raw_html TEXT,
        fetched_at TEXT
    )
    ''')
    conn.commit()
    conn.close()

def save_offer(offer, db_path=None):
    if db_path is None:
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "memory_store", "agent_memory.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute('''
    INSERT OR REPLACE INTO offers (id, title, org, deadline, raw_html, fetched_at) VALUES (?,?,?,?,?,?)
    ''', (
        offer.get("id"),
        offer.get("title"),
        offer.get("org"),
        offer.get("deadline"),
        offer.get("raw_html"),
        datetime.utcnow().isoformat()
    ))
    conn.commit()
    conn.close()
    logger.info(f"Offer saved: {offer.get('id')}")
