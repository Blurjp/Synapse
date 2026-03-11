from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base
import uuid


class Highlight(Base):
    __tablename__ = "highlights"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    source_id = Column(String(36), ForeignKey("sources.id", ondelete="CASCADE"), nullable=True)
    text = Column(Text, nullable=False)
    source_url = Column(Text, nullable=True)
    source_title = Column(String(500), nullable=True)
    note = Column(Text, nullable=True)
    color = Column(String(20), default="#fef3c7")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
