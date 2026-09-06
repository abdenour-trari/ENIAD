import hashlib

_PBKDF2_ITERATIONS = 100_000
_SALT = b"nesture-ai-salt-2024"

def _hash_password(plain: str) -> str:
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode(), _SALT, _PBKDF2_ITERATIONS)
    return "pbkdf2_sha256:" + dk.hex()

print(_hash_password("password123"))
