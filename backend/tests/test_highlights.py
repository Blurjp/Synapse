"""Tests for Highlights API"""
from fastapi.testclient import TestClient

def test_create_highlight(client: TestClient):
    """Test creating a highlight"""
    highlight_data = {"text": "Test highlight", "source_url": "https://example.com"}
    response = client.post("/api/highlights/", json=highlight_data)
    assert response.status_code == 201
    data = response.json()
    assert data["text"] == highlight_data["text"]
