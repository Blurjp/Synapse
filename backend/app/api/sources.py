from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.source import Source
from app.schemas.source import (
    SourceCreate, 
    SourceUpdate, 
    SourceResponse, 
    SourceListResponse,
    SourceType
)
from app.api.auth import get_current_user
from app.models.user import User
from typing import Optional
import uuid
from datetime import datetime

router = APIRouter()


@router.get("/", response_model=SourceListResponse)
async def list_sources(
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
    source_type: Optional[SourceType] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all sources for the current user"""
    query = db.query(Source).filter(Source.user_id == current_user.id)
    
    if source_type:
        query = query.filter(Source.type == source_type)
    
    total = query.count()
    sources = query.order_by(Source.created_at.desc()).offset(offset).limit(limit).all()
    
    return SourceListResponse(
        sources=[SourceResponse.model_validate(s) for s in sources],
        total=total,
        page=(offset // limit) + 1,
        per_page=limit
    )


@router.post("/", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def create_source(
    source_data: SourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new source from webpage or link"""
    # Create source with authenticated user
    source = Source(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=source_data.type,
        title=source_data.title,
        content=source_data.content,
        raw_url=source_data.raw_url,
        file_path=source_data.file_path,
        source_metadata=source_data.source_metadata or {}
    )
    
    db.add(source)
    db.commit()
    db.refresh(source)
    
    return SourceResponse.model_validate(source)


@router.post("/upload", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    title: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a file (PDF, document, etc.)"""
    # Determine source type from file extension
    filename = file.filename.lower()
    if filename.endswith('.pdf'):
        source_type = SourceType.PDF
    elif filename.endswith(('.doc', '.docx')):
        source_type = SourceType.DOCUMENT
    elif filename.endswith('.txt'):
        source_type = SourceType.TEXT
    else:
        source_type = SourceType.DOCUMENT
    
    # Read file content
    content = await file.read()
    content_str = content.decode('utf-8', errors='ignore')
    
    # Create source
    source = Source(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        type=source_type,
        title=title or file.filename,
        content=content_str,
        file_path=f"uploads/{file.filename}",
        source_metadata={
            "filename": file.filename,
            "content_type": file.content_type,
            "size": len(content)
        }
    )
    
    db.add(source)
    db.commit()
    db.refresh(source)
    
    return SourceResponse.model_validate(source)


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific source"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.user_id == current_user.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source {source_id} not found"
        )
    
    return SourceResponse.model_validate(source)


@router.patch("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: str,
    source_data: SourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a source"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.user_id == current_user.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source {source_id} not found"
        )
    
    # Update fields
    if source_data.title is not None:
        source.title = source_data.title
    if source_data.content is not None:
        source.content = source_data.content
    if source_data.source_metadata is not None:
        source.source_metadata = source_data.source_metadata
    
    db.commit()
    db.refresh(source)
    
    return SourceResponse.model_validate(source)


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a source"""
    source = db.query(Source).filter(
        Source.id == source_id,
        Source.user_id == current_user.id
    ).first()
    
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source {source_id} not found"
        )
    
    db.delete(source)
    db.commit()
    
    return None
