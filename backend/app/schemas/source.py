from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum


class SourceType(str, Enum):
    PDF = "pdf"
    WEBPAGE = "webpage"
    YOUTUBE = "youtube"
    PODCAST = "podcast"
    AUDIO = "audio"
    DOCUMENT = "document"
    TEXT = "text"
    LINK = "link"
    SUMMARY = "summary"


class SourceBase(BaseModel):
    type: SourceType
    title: str = Field(..., max_length=500)
    content: Optional[str] = None
    raw_url: Optional[str] = None
    file_path: Optional[str] = None
    source_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, alias='metadata')
    
    class Config:
        populate_by_name = True


class SourceCreate(SourceBase):
    pass


class SourceUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=500)
    content: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SourceResponse(BaseModel):
    id: str
    user_id: str
    type: SourceType
    title: str
    content: Optional[str] = None
    raw_url: Optional[str] = None
    file_path: Optional[str] = None
    source_metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, serialization_alias='metadata')
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        populate_by_name = True


class SourceListResponse(BaseModel):
    sources: List[SourceResponse]
    total: int
    page: int
    per_page: int
