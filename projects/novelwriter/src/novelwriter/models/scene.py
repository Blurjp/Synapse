"""Scene model for NovelWriter."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Scene(BaseModel):
    """Represents a scene in a novel."""

    id: UUID = Field(default_factory=uuid4)
    chapter_id: UUID
    title: Optional[str] = None

    # Scene content
    content: str = ""
    summary: Optional[str] = None

    # Scene elements
    location: Optional[str] = None
    point_of_view: Optional[str] = None
    characters_present: List[str] = Field(default_factory=list)

    # Structure
    scene_number: int
    word_count: int = 0

    # Scene arc
    goal: Optional[str] = None
    conflict: Optional[str] = None
    disaster: Optional[str] = None

    # AI assistance
    ai_notes: List[str] = Field(default_factory=list)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    def update_word_count(self) -> None:
        """Update the word count based on content."""
        self.word_count = len(self.content.split())

    def add_ai_note(self, note: str) -> None:
        """Add an AI-generated note about this scene."""
        self.ai_notes.append(note)
        self.update_timestamp()

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()

    def set_arc_elements(self, goal: str, conflict: str, disaster: str) -> None:
        """Set scene arc elements (goal, conflict, disaster)."""
        self.goal = goal
        self.conflict = conflict
        self.disaster = disaster
        self.update_timestamp()
