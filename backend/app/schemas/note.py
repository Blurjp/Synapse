from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class NoteBase(BaseModel):
    content: str
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    tags: Optional[List[str]] = Field(default_factory=list)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    content: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(NoteBase):
    id: str
    user_id: str
    source_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NoteListResponse(BaseModel):
    notes: List[NoteResponse]
    total: int
    page: int
    per_page: int
