"""Novel model for NovelWriter."""

from datetime import datetime
from pathlib import Path
from typing import Optional, List
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field


class Novel(BaseModel):
    """Represents a novel project."""

    id: UUID = Field(default_factory=uuid4)
    title: str
    description: Optional[str] = None
    author: str
    genre: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    # File storage
    project_dir: Optional[Path] = None

    model_config = ConfigDict(
        json_encoders={
            datetime: lambda v: v.isoformat(),
            Path: lambda v: str(v),
        }
    )

    def update_timestamp(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now()

    def get_project_path(self) -> Path:
        """Get the project directory path."""
        if self.project_dir is None:
            raise ValueError("Project directory not set")
        return self.project_dir

    def set_project_dir(self, base_dir: Path) -> None:
        """Set the project directory based on base dir and novel ID."""
        self.project_dir = base_dir / str(self.id)
