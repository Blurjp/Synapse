from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.note import Note
from app.schemas.note import (
    NoteCreate,
    NoteUpdate,
    NoteResponse,
    NoteListResponse
)
from typing import Optional
import uuid

router = APIRouter()


# Temporary user ID (will be replaced with auth later)
TEMP_USER_ID = "temp-user-123"


@router.get("/", response_model=NoteListResponse)
async def list_notes(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    source_url: Optional[str] = None,
    tag: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all notes with pagination"""
    query = db.query(Note).filter(Note.user_id == TEMP_USER_ID)
    
    if source_url:
        query = query.filter(Note.source_url == source_url)
    
    if tag:
        query = query.filter(Note.tags.contains([tag]))
    
    total = query.count()
    notes = query.order_by(Note.created_at.desc()).offset(offset).limit(limit).all()
    
    return NoteListResponse(
        notes=[NoteResponse.model_validate(n) for n in notes],
        total=total,
        page=(offset // limit) + 1,
        per_page=limit
    )


@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db)
):
    """Create a new quick note"""
    # Create note
    note = Note(
        id=str(uuid.uuid4()),
        user_id=TEMP_USER_ID,
        content=note_data.content,
        source_url=note_data.source_url,
        source_title=note_data.source_title,
        tags=note_data.tags or []
    )
    
    db.add(note)
    db.commit()
    db.refresh(note)
    
    return NoteResponse.model_validate(note)


@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == TEMP_USER_ID
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found"
        )
    
    return NoteResponse.model_validate(note)


@router.patch("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: str,
    note_data: NoteUpdate,
    db: Session = Depends(get_db)
):
    """Update a note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == TEMP_USER_ID
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found"
        )
    
    # Update fields
    if note_data.content is not None:
        note.content = note_data.content
    if note_data.tags is not None:
        note.tags = note_data.tags
    
    db.commit()
    db.refresh(note)
    
    return NoteResponse.model_validate(note)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    db: Session = Depends(get_db)
):
    """Delete a note"""
    note = db.query(Note).filter(
        Note.id == note_id,
        Note.user_id == TEMP_USER_ID
    ).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Note {note_id} not found"
        )
    
    db.delete(note)
    db.commit()
    
    return None
