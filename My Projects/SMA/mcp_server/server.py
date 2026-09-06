from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class RecommendationRequest(BaseModel):
    symptoms: str


@app.post("/recommend")
def recommend(data: RecommendationRequest):

    symptoms = data.symptoms.lower()

    if "toux" in symptoms:
        recommendation = \
            "Hydratation et surveillance."

    elif "fièvre" in symptoms:
        recommendation = \
            "Repos et hydratation."

    else:
        recommendation = \
            "Consultation médicale si aggravation."

    return {
        "recommendation": recommendation
    }