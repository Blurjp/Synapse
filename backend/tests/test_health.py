"""Tests for health endpoints"""
from fastapi.testclient import TestClient

def test_health_check(client: TestClient):
    """Test health endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
