"""Chapter model for NovelWriter."""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class Chapter(BaseModel):
    """Represents a chapter in a novel."""

    id: UUID = Field(default_factory=uuid4)
    novel_id: UUID
    title: str

    # Chapter content
    content: str = ""
    summary: Optional[str] = None
    notes: Optional[str] = None

    # Structure
    chapter_number: int
    word_count: int = 0
    scene_count: int = 0

    # AI assistance
    ai_suggestions: List[str] = Field(default_factory=list)
    ai_feedback: Optional[str] = None

    # Metadata
    status: str = "draft"  # draft, review, final
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    def update_word_count(self) -> None:
        """Update the word count based on content."""
        self.word_count = len(self.content.split())

    def add_ai_suggestion(self, suggestion: str) -> None:
        """Add an AI-generated suggestion."""
        self.ai_suggestions.append(suggestion)
        self.update_timestamp()

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()

    def append_content(self, text: str) -> None:
        """Append text to chapter content."""
        if text:
            self.content += text
            self.update_word_count()
            self.update_timestamp()
