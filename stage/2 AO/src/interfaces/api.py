# optional: skeleton if tu veux migrer vers FastAPI
from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def read_root():
    return {"ok": True}
