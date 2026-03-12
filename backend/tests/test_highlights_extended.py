"""Tests for Highlights API - Extended"""
from fastapi.testclient import TestClient


def test_create_highlight_with_note(client: TestClient):
    """Test creating highlight with note"""
    highlight_data = {
        "text": "Important text",
        "source_url": "https://example.com",
        "note": "This is important"
    }
    response = client.post("/api/highlights/", json=highlight_data)
    assert response.status_code == 201
    assert response.json()["note"] == "This is important"


def test_highlight_default_color(client: TestClient):
    """Test highlight gets default color"""
    highlight_data = {"text": "Text", "source_url": "https://example.com"}
    response = client.post("/api/highlights/", json=highlight_data)
    assert response.status_code == 201
    assert response.json()["color"] == "#fef3c7"


def test_filter_highlights_by_url(client: TestClient):
    """Test filtering highlights by source URL"""
    client.post("/api/highlights/", json={"text": "Text 1", "source_url": "https://example.com/page1"})
    client.post("/api/highlights/", json={"text": "Text 2", "source_url": "https://example.com/page2"})

    response = client.get("/api/highlights/", params={"source_url": "https://example.com/page1"})
    assert response.status_code == 200
    assert response.json()["total"] == 1
