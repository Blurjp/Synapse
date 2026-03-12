"""Integration tests for API endpoints"""
from fastapi.testclient import TestClient


def test_complete_source_workflow(client: TestClient):
    """Test complete CRUD workflow for sources"""
    # Create
    create_data = {"type": "webpage", "title": "Test Page", "content": "Test content"}
    create_response = client.post("/api/sources/", json=create_data)
    assert create_response.status_code == 201
    source_id = create_response.json()["id"]

    # Read
    get_response = client.get(f"/api/sources/{source_id}")
    assert get_response.status_code == 200

    # Update
    update_response = client.patch(f"/api/sources/{source_id}", json={"title": "Updated"})
    assert update_response.status_code == 200

    # Delete
    delete_response = client.delete(f"/api/sources/{source_id}")
    assert delete_response.status_code == 204


def test_save_page_with_highlights_and_notes(client: TestClient):
    """Test saving a page with related highlights and notes"""
    url = "https://example.com/complete"

    # Save the page
    client.post("/api/sources/", json={"type": "webpage", "title": "Page", "raw_url": url})

    # Save highlight
    client.post("/api/highlights/", json={"text": "Quote", "source_url": url})

    # Add note
    client.post("/api/notes/", json={"content": "Note", "source_url": url})

    # Retrieve all
    sources = client.get("/api/sources/").json()
    highlights = client.get(f"/api/highlights/?source_url={url}").json()
    notes = client.get(f"/api/notes/?source_url={url}").json()

    assert sources["total"] >= 1
    assert highlights["total"] == 1
    assert notes["total"] == 1


def test_large_dataset_performance(client: TestClient):
    """Test API performance with large dataset"""
    for i in range(100):
        client.post("/api/sources/", json={"type": "webpage", "title": f"Source {i}"})

    response = client.get("/api/sources/?limit=50")
    assert response.status_code == 200
    assert response.json()["total"] == 100
