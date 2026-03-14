"""Character model for NovelWriter."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Character(BaseModel):
    """Represents a character in a novel."""

    id: UUID = Field(default_factory=uuid4)
    name: str
    novel_id: UUID

    # Character details
    age: Optional[int] = None
    gender: Optional[str] = None
    description: Optional[str] = None
    personality: Optional[str] = None
    background: Optional[str] = None
    goals: Optional[str] = None
    fears: Optional[str] = None
    secrets: Optional[str] = None

    # Appearance
    physical_appearance: Optional[str] = None
    clothing_style: Optional[str] = None

    # Relationships
    relationships: Dict[str, str] = Field(default_factory=dict)  # character_id -> relationship

    # AI-generated notes
    ai_notes: List[str] = Field(default_factory=list)

    # Metadata
    is_main_character: bool = False
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    def add_ai_note(self, note: str) -> None:
        """Add an AI-generated note about this character."""
        self.ai_notes.append(note)
        self.update_timestamp()

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()

    def add_relationship(self, character_name: str, relationship: str) -> None:
        """Add or update a relationship."""
        self.relationships[character_name] = relationship
        self.update_timestamp()
