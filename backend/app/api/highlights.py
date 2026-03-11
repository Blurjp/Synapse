from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.highlight import Highlight
from app.schemas.highlight import (
    HighlightCreate,
    HighlightUpdate,
    HighlightResponse,
    HighlightListResponse
)
from typing import Optional
import uuid

router = APIRouter()


# Temporary user ID (will be replaced with auth later)
TEMP_USER_ID = "temp-user-123"


@router.get("/", response_model=HighlightListResponse)
async def list_highlights(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    source_url: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all highlights with pagination"""
    query = db.query(Highlight).filter(Highlight.user_id == TEMP_USER_ID)
    
    if source_url:
        query = query.filter(Highlight.source_url == source_url)
    
    total = query.count()
    highlights = query.order_by(Highlight.created_at.desc()).offset(offset).limit(limit).all()
    
    return HighlightListResponse(
        highlights=[HighlightResponse.model_validate(h) for h in highlights],
        total=total,
        page=(offset // limit) + 1,
        per_page=limit
    )


@router.post("/", response_model=HighlightResponse, status_code=status.HTTP_201_CREATED)
async def create_highlight(
    highlight_data: HighlightCreate,
    db: Session = Depends(get_db)
):
    """Create a new highlight from selected text"""
    # Create highlight
    highlight = Highlight(
        id=str(uuid.uuid4()),
        user_id=TEMP_USER_ID,
        text=highlight_data.text,
        source_url=highlight_data.source_url,
        source_title=highlight_data.source_title,
        note=highlight_data.note,
        color=highlight_data.color or "#fef3c7"
    )
    
    db.add(highlight)
    db.commit()
    db.refresh(highlight)
    
    return HighlightResponse.model_validate(highlight)


@router.get("/{highlight_id}", response_model=HighlightResponse)
async def get_highlight(
    highlight_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific highlight"""
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == TEMP_USER_ID
    ).first()
    
    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Highlight {highlight_id} not found"
        )
    
    return HighlightResponse.model_validate(highlight)


@router.patch("/{highlight_id}", response_model=HighlightResponse)
async def update_highlight(
    highlight_id: str,
    highlight_data: HighlightUpdate,
    db: Session = Depends(get_db)
):
    """Update a highlight"""
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == TEMP_USER_ID
    ).first()
    
    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Highlight {highlight_id} not found"
        )
    
    # Update fields
    if highlight_data.text is not None:
        highlight.text = highlight_data.text
    if highlight_data.note is not None:
        highlight.note = highlight_data.note
    if highlight_data.color is not None:
        highlight.color = highlight_data.color
    
    db.commit()
    db.refresh(highlight)
    
    return HighlightResponse.model_validate(highlight)


@router.delete("/{highlight_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_highlight(
    highlight_id: str,
    db: Session = Depends(get_db)
):
    """Delete a highlight"""
    highlight = db.query(Highlight).filter(
        Highlight.id == highlight_id,
        Highlight.user_id == TEMP_USER_ID
    ).first()
    
    if not highlight:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Highlight {highlight_id} not found"
        )
    
    db.delete(highlight)
    db.commit()
    
    return None
