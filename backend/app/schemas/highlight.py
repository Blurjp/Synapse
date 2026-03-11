from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class HighlightBase(BaseModel):
    text: str
    source_url: Optional[str] = None
    source_title: Optional[str] = None
    note: Optional[str] = None
    color: Optional[str] = "#fef3c7"


class HighlightCreate(HighlightBase):
    pass


class HighlightUpdate(BaseModel):
    text: Optional[str] = None
    note: Optional[str] = None
    color: Optional[str] = None


class HighlightResponse(HighlightBase):
    id: str
    user_id: str
    source_id: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class HighlightListResponse(BaseModel):
    highlights: List[HighlightResponse]
    total: int
    page: int
    per_page: int
