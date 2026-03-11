from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter()


@router.get("/")
async def list_documents(
    db: Session = Depends(get_db)
):
    """List all documents"""
    return {"message": "List documents - TODO"}


@router.post("/")
async def create_document(
    db: Session = Depends(get_db)
):
    """Create a new document"""
    return {"message": "Create document - TODO"}


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific document"""
    return {"message": f"Get document {document_id} - TODO"}


@router.put("/{document_id}")
async def update_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Update a document"""
    return {"message": f"Update document {document_id} - TODO"}


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    db: Session = Depends(get_db)
):
    """Delete a document"""
    return {"message": f"Delete document {document_id} - TODO"}
