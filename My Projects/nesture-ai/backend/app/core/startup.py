"""
startup.py — called at container start.
Detects if existing users.csv has an incompatible hash format and reseeds.
Now uses pure stdlib PBKDF2 — no bcrypt/passlib dependency.
"""
import os
from app.core.config import settings
from app.core.csv_store import USERS_CSV, read_all


def check_and_reseed():
    """If users were seeded with an incompatible hash format, delete and reseed."""
    if not os.path.exists(USERS_CSV):
        return  # Will be seeded fresh

    users = read_all(USERS_CSV)
    if not users:
        return  # Empty — will be seeded

    # Stale if any user hash is NOT the new pbkdf2_sha256: format
    # (covers old bcrypt $2b$, sha256:, pbkdf2: legacy formats)
    stale = any(
        not u.get("hashed_password", "").startswith("pbkdf2_sha256:")
        for u in users
    )

    if stale:
        print("⚠️  Detected incompatible password hashes — reseeding user data...")
        data_dir = settings.DATA_DIR
        for fname in os.listdir(data_dir):
            if fname.endswith(".csv"):
                os.remove(os.path.join(data_dir, fname))
                print(f"   Deleted: {fname}")
        print("   CSVs cleared — reseeding now...")

