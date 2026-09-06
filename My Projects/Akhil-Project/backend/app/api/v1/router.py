from fastapi import APIRouter
from app.api.v1.endpoints import atlas

api_router = APIRouter()
api_router.include_router(atlas.router, prefix="/atlas", tags=["atlas"])
