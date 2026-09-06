import pytest
from src.interfaces.web_ui import app

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client

def test_homepage(client):
    response = client.get("/")
    assert response.status_code == 200

def test_scrape_route(client):
    response = client.get("/scrape?source=finances")
    assert response.status_code in [200, 500]  # 500 si le site est offline
