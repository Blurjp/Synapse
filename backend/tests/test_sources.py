"""Tests for Sources API"""
from fastapi.testclient import TestClient

def test_create_source(client: TestClient, sample_source_data):
    """Test creating a source"""
    response = client.post("/api/sources/", json=sample_source_data)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == sample_source_data["title"]
    assert "id" in data

def test_list_sources(client: TestClient, sample_source_data):
    """Test listing sources"""
    client.post("/api/sources/", json=sample_source_data)
    response = client.get("/api/sources/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
