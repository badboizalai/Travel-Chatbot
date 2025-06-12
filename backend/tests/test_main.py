import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert "Travel Chatbot API" in response.json()["message"]

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_auth_endpoints():
    # Test registration
    response = client.post("/api/auth/register", json={
        "email": "test@example.com",
        "password": "testpass123",
        "name": "Test User"
    })
    assert response.status_code in [200, 400]  # 400 if user exists
    
    # Test login
    response = client.post("/api/auth/login", json={
        "email": "test@example.com", 
        "password": "testpass123"
    })
    assert response.status_code in [200, 401]

def test_chatbot_endpoints():
    response = client.get("/api/chatbot/health")
    assert response.status_code == 200

def test_weather_endpoints():
    response = client.get("/api/weather/current?city=Ho Chi Minh City")
    assert response.status_code in [200, 503]  # 503 if API not configured
