import hashlib
import csv
import os

_PBKDF2_ITERATIONS = 100_000
_SALT = b"nesture-ai-salt-2024"

def _hash_password(plain: str) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode(), _SALT, _PBKDF2_ITERATIONS)
    return "pbkdf2_sha256:" + dk.hex()

def _verify_password(plain: str, hashed: str) -> bool:
    if hashed.startswith("pbkdf2_sha256:"):
        expected = _hash_password(plain)
        return hashed == expected
    return False

# Test with maya
email = "maya@example.com"
password = "password123"

with open("app/data/users.csv", "r", newline="") as f:
    reader = csv.DictReader(f)
    users = list(reader)

found = [u for u in users if u["email"] == email]
if not found:
    print(f"User {email} not found!")
else:
    user = found[0]
    print(f"User found: {user['email']}")
    print(f"Hashed in CSV: {user['hashed_password']}")
    print(f"Computed Hash: {_hash_password(password)}")
    if _verify_password(password, user["hashed_password"]):
        print("Login SUCCESS")
    else:
        print("Login FAILED")
