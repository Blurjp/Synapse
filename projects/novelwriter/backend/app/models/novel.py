"""Novel model for SQLAlchemy."""

from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship

from ..database import Base


class Novel(Base):
    """Novel model for individual novels within a project."""

    __tablename__ = "novels"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    author = Column(String)
    genre = Column(String)
    description = Column(Text)
    total_words = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="novels")
