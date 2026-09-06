import sqlite3
import os

DB_PATH = "./agent_memory.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

try:
    # 🔹 Supprime tout le contenu de la table
    cursor.execute("DELETE FROM table_reponse;")
    conn.commit()
    print("✅ Table 'table_reponse' vidée avec succès.")
except sqlite3.OperationalError as e:
    print(f"❌ Erreur lors du vidage : {e}")

# 🔹 (Optionnel) Réinitialiser la base pour libérer l’espace
try:
    cursor.execute("VACUUM;")
    print("🧹 Base optimisée après suppression.")
except sqlite3.OperationalError:
    print("⚠️ Impossible d’exécuter VACUUM (non critique).")

conn.close()
