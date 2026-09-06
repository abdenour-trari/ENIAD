from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_atlas_profile():
    return {"message": "Atlas AI Profile Engine endpoint reachable"}
