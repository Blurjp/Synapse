"""Tests for Notes API"""
from fastapi.testclient import TestClient

def test_create_note(client: TestClient):
    """Test creating a note"""
    note_data = {"content": "Test note", "tags": ["test"]}
    response = client.post("/api/notes/", json=note_data)
    assert response.status_code == 201
    data = response.json()
    assert data["content"] == note_data["content"]
