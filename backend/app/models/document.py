from sqlalchemy import Column, String, Text, DateTime, JSON, Enum, Integer
from sqlalchemy.sql import func
from sqlalchemy import ForeignKey
from app.core.database import Base
import uuid
import enum


class DocumentType(str, enum.Enum):
    REPORT = "report"
    ESSAY = "essay"
    OUTLINE = "outline"
    NOTES = "notes"
    CUSTOM = "custom"


class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(500), nullable=False)
    content = Column(JSON, nullable=False)
    type = Column(Enum(DocumentType), default=DocumentType.CUSTOM)
    linked_sources = Column(JSON, default=[])
    linked_insights = Column(JSON, default=[])
    version = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
