import requests


def get_mcp_recommendation(symptoms: str):

    response = requests.post(
        "http://localhost:9000/recommend",
        json={"symptoms": symptoms}
    )

    return response.json()