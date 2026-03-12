"""Tests for Notes API - Extended"""
from fastapi.testclient import TestClient


def test_create_note_with_tags(client: TestClient):
    """Test creating note with tags"""
    note_data = {"content": "Note", "tags": ["important", "reference"]}
    response = client.post("/api/notes/", json=note_data)
    assert response.status_code == 201
    assert response.json()["tags"] == ["important", "reference"]


def test_filter_notes_by_tag(client: TestClient):
    """Test filtering notes by tag"""
    client.post("/api/notes/", json={"content": "Note 1", "tags": ["work"]})
    client.post("/api/notes/", json={"content": "Note 2", "tags": ["personal"]})
    client.post("/api/notes/", json={"content": "Note 3", "tags": ["work"]})

    response = client.get("/api/notes/", params={"tag": "work"})
    assert response.status_code == 200
    assert response.json()["total"] == 2


def test_update_note_tags(client: TestClient):
    """Test updating note tags"""
    create_response = client.post("/api/notes/", json={"content": "Note", "tags": ["old"]})
    note_id = create_response.json()["id"]

    update_data = {"tags": ["new", "updated"]}
    response = client.patch(f"/api/notes/{note_id}", json=update_data)
    assert response.status_code == 200
    assert response.json()["tags"] == ["new", "updated"]
