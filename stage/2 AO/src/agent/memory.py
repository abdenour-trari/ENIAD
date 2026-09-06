import sqlite3
from ..utils.logger import logger
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "memory_store", "agent_memory.db")

class Memory:
    def __init__(self, db_path=DB_PATH):
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self.db_path = db_path

    def list_offers(self, limit=50):
        conn = sqlite3.connect(self.db_path)
        c = conn.cursor()
        c.execute("SELECT id, title, org, deadline, fetched_at FROM offers ORDER BY fetched_at DESC LIMIT ?", (limit,))
        rows = c.fetchall()
        conn.close()
        return rows
