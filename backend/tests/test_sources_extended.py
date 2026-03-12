"""Tests for Sources API - Extended"""
import pytest
from fastapi.testclient import TestClient


class TestSourcesAPIExtended:
    """Extended test cases for Sources API"""

    def test_create_source_with_all_fields(self, client: TestClient):
        """Test creating source with all optional fields"""
        source_data = {
            "type": "webpage",
            "title": "Complete Source",
            "content": "Full content here",
            "raw_url": "https://example.com/full",
            "metadata": {
                "author": "John Doe",
                "wordCount": 500
            }
        }
        response = client.post("/api/sources/", json=source_data)
        assert response.status_code == 201

    def test_create_source_minimal(self, client: TestClient):
        """Test creating source with minimal required fields"""
        source_data = {"type": "webpage", "title": "Minimal Source"}
        response = client.post("/api/sources/", json=source_data)
        assert response.status_code == 201

    def test_create_source_invalid_type(self, client: TestClient):
        """Test creating source with invalid type"""
        source_data = {"type": "invalid_type", "title": "Test"}
        response = client.post("/api/sources/", json=source_data)
        assert response.status_code == 422

    def test_list_sources_pagination(self, client: TestClient):
        """Test pagination in listing sources"""
        for i in range(25):
            client.post("/api/sources/", json={"type": "webpage", "title": f"Source {i}"})

        response = client.get("/api/sources/?limit=10&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 25
        assert len(data["sources"]) == 10
