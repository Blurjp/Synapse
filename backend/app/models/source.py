from sqlalchemy import Column, String, Text, DateTime, JSON, Enum
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from app.core.database import Base
import uuid
import enum


class SourceType(str, enum.Enum):
    PDF = "pdf"
    WEBPAGE = "webpage"
    YOUTUBE = "youtube"
    PODCAST = "podcast"
    AUDIO = "audio"
    DOCUMENT = "document"
    TEXT = "text"
    LINK = "link"


class Source(Base):
    __tablename__ = "sources"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(SourceType), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(Text, nullable=True)
    raw_url = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    source_metadata = Column('metadata', JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
