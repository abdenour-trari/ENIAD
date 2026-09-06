from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import sessions, learners, users, reports, exercises, reflexes
from app.core.config import settings
from app.core.startup import check_and_reseed
from app.core.data_init import initialize_data

app = FastAPI(
    title="Nesture AI – LetterQuest API",
    description="Backend API for the Nesture AI EdTech platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    check_and_reseed()   # Fix stale hashes from old seed
    initialize_data()    # Seed fresh if needed


@app.get("/health")
def health():
    return {"status": "ok", "service": "nesture-ai-backend"}


# Routers
app.include_router(users.router,     prefix="/api/users",     tags=["Users"])
app.include_router(learners.router,  prefix="/api/learners",  tags=["Learners"])
app.include_router(sessions.router,  prefix="/api/sessions",  tags=["Sessions"])
app.include_router(reports.router,   prefix="/api/reports",   tags=["Reports"])
app.include_router(exercises.router, prefix="/api/exercises", tags=["Exercises"])
app.include_router(reflexes.router,  prefix="/api/reflexes",  tags=["Reflexes"])
