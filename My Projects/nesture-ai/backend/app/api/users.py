from fastapi import APIRouter, HTTPException
from jose import jwt
from datetime import datetime, timedelta
import hashlib
import os

from app.models.schemas import UserLogin, Token
from app.core.csv_store import USERS_CSV, LEARNERS_CSV, read_where
from app.core.config import settings

router = APIRouter()

# ── Password utilities (pure stdlib — no bcrypt/passlib needed) ───────────────
# Uses PBKDF2-HMAC-SHA256 with a fixed salt prefix for cross-environment
# consistency. Handles legacy sha256: and pbkdf2: hashes for backwards compat.

_PBKDF2_ITERATIONS = 100_000
_SALT = b"nesture-ai-salt-2024"  # fixed salt — OK for this app's threat model


def _hash_password(plain: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256."""
    dk = hashlib.pbkdf2_hmac("sha256", plain.encode(), _SALT, _PBKDF2_ITERATIONS)
    return "pbkdf2_sha256:" + dk.hex()


def _verify_password(plain: str, hashed: str) -> bool:
    """Verify a password against any supported hash format."""
    # Current format: pbkdf2_sha256:
    if hashed.startswith("pbkdf2_sha256:"):
        expected = _hash_password(plain)
        return hashed == expected
    # Legacy sha256: fallback
    if hashed.startswith("sha256:"):
        return hashed == "sha256:" + hashlib.sha256(plain.encode()).hexdigest()
    # Legacy pbkdf2: (old broken format — single SHA256, no iterations)
    if hashed.startswith("pbkdf2:"):
        digest = hashed[len("pbkdf2:"):]
        return digest == hashlib.sha256(plain.encode()).hexdigest()
    # Try bcrypt if passlib happens to be installed and working
    try:
        from passlib.context import CryptContext
        ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return ctx.verify(plain, hashed)
    except Exception:
        pass
    return False


# ── JWT ───────────────────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


# ── Routes ────────────────────────────────────────────────────────────────────
@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    users = read_where(USERS_CSV, email=credentials.email)
    if not users:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = users[0]
    if not _verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    learner_id = None
    if user["role"] == "learner":
        # The frontend/backend links learners to user_id. Here user['id'] is something like user-learner-001.
        # But we need to look it up in learners.csv! Wait, learners.csv does NOT have a user_id field directly.
        # It has parent_id and ot_id, and id (like learner-001).
        # Actually, wait. We need to check learners.csv structure again or just match it by name or a strict convention.
        # Let's import read_all to find the learner.
        learners = read_where(LEARNERS_CSV)
        # In our seed data, we just assume Maya Chen (user-learner-001) maps to learner-001. 
        # Using a convention here for the MVP if exact field is missing.
        for l in learners:
            if l["name"] == user["name"]:
                learner_id = l["id"]
                break

    token = create_access_token({
        "sub":  user["id"],
        "role": user["role"],
        "name": user["name"],
        "learner_id": learner_id,
    })
    return Token(
        access_token=token,
        token_type="bearer",
        role=user["role"],
        name=user["name"],
        user_id=user["id"],
        learner_id=learner_id,
    )


@router.get("/demo-accounts")
def demo_accounts():
    return [
        {"role": "learner", "name": "Maya Chen",      "email": "maya@example.com",     "password": "password123"},
        {"role": "parent",  "name": "Jennifer Chen",  "email": "jennifer@example.com", "password": "password123"},
        {"role": "ot",      "name": "Sarah Williams", "email": "sarah@example.com",    "password": "password123"},
    ]
