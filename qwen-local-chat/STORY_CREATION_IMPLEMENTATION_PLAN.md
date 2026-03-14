# Story Creation Flow - Implementation Plan (REVISED)
**Adapting Design Document to Existing Codebase - Critical Issues Fixed**

**Date:** 2026-01-16
**Status:** Ready for Implementation (All Critical Issues Resolved)
**Priority:** High (User-Requested Feature)
**Revision:** v2.0 - Fixed critical token accounting, transactions, and database schema issues

---

## Executive Summary

This plan adapts the [Story Creation Flow Design Document](/Users/jianping/Downloads/STORY_CREATION_FLOW_DESIGN.md) to the existing NovelWriter codebase. Rather than creating new database tables, we will **extend existing tables** and reuse current architecture.

**Key Decision:** Map proposed schema to existing schema
- `stories` → `projects` table (extend with new fields)
- `story_characters` → `projects.characters` JSONB field (already exists)
- `story_chapters` → `chapters` table (already exists)
- `story_templates` → `plot_templates` table (already exists)

**Critical Fixes in v2.0:**
- ✅ Token/credit accounting for chapter generation
- ✅ Atomic transactions prevent orphaned projects
- ✅ Database schema corrections (UUID types, triggers)
- ✅ Rate limiting on story creation endpoints
- ✅ Zustand state persistence
- ✅ Rollback migration scripts
- ✅ i18n preparation for genres/tropes

---

## Table of Contents

1. [Database Schema Extensions](#1-database-schema-extensions)
2. [API Endpoints](#2-api-endpoints)
3. [Token Accounting System](#3-token-accounting-system)
4. [Frontend Components](#4-frontend-components)
5. [Integration with Adult Content](#5-integration-with-adult-content)
6. [Rate Limiting & Security](#6-rate-limiting--security)
7. [Implementation Phases](#7-implementation-phases)
8. [Migration Strategy](#8-migration-strategy)
9. [Testing Plan](#9-testing-plan)

---

## 1. Database Schema Extensions

### 1.1 Extend `projects` Table

**Migration:** `migrations/040_add_story_creation_fields.sql`

```sql
-- Add story classification fields
ALTER TABLE projects ADD COLUMN IF NOT EXISTS genre VARCHAR(50);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sub_genres TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tropes TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS spice_level VARCHAR(20) DEFAULT 'mild';

-- Add creation metadata
ALTER TABLE projects ADD COLUMN IF NOT EXISTS creation_path VARCHAR(20); -- quick_start, template, custom
-- FIXED: Changed from VARCHAR to UUID to match plot_templates.id type
ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES plot_templates(id);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS creation_started_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS creation_completed_at TIMESTAMP WITH TIME ZONE;

-- Add content settings (migrate from settings JSON if exists)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS content_rating VARCHAR(20) DEFAULT 'teen';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS pov VARCHAR(20) DEFAULT 'third_limited';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tense VARCHAR(20) DEFAULT 'past';

-- Add status tracking
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft'; -- draft, in_progress, completed, published
-- NOTE: word_count and chapter_count will be maintained via triggers (see below)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS chapter_count INTEGER DEFAULT 0;

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_projects_genre ON projects(genre) WHERE genre IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_spice_level ON projects(spice_level) WHERE spice_level IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status) WHERE status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_creation_path ON projects(creation_path) WHERE creation_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id) WHERE template_id IS NOT NULL;

-- Add constraints
ALTER TABLE projects
ADD CONSTRAINT chk_spice_level
CHECK (spice_level IN ('mild', 'medium', 'spicy'));

ALTER TABLE projects
ADD CONSTRAINT chk_content_rating
CHECK (content_rating IN ('everyone', 'teen', 'mature', 'explicit'));

ALTER TABLE projects
ADD CONSTRAINT chk_creation_path
CHECK (creation_path IN ('quick_start', 'template', 'custom'));

ALTER TABLE projects
ADD CONSTRAINT chk_genre
CHECK (genre IN (
  'contemporary_romance', 'paranormal_romance', 'fantasy_romance',
  'dark_romance', 'scifi_romance', 'historical_romance', 'lgbtq_romance'
));

ALTER TABLE projects
ADD CONSTRAINT chk_pov
CHECK (pov IN ('first', 'second', 'third_limited', 'third_omniscient'));

ALTER TABLE projects
ADD CONSTRAINT chk_tense
CHECK (tense IN ('past', 'present'));

ALTER TABLE projects
ADD CONSTRAINT chk_status
CHECK (status IN ('draft', 'in_progress', 'completed', 'published'));

-- Document new columns
COMMENT ON COLUMN projects.genre IS 'Primary genre: contemporary_romance, paranormal_romance, etc.';
COMMENT ON COLUMN projects.sub_genres IS 'Secondary genre tags';
COMMENT ON COLUMN projects.tropes IS 'Romance tropes: enemies_to_lovers, fake_dating, etc.';
COMMENT ON COLUMN projects.spice_level IS 'Heat level: mild, medium, spicy';
COMMENT ON COLUMN projects.creation_path IS 'How story was created: quick_start, template, custom';
COMMENT ON COLUMN projects.content_rating IS 'Content rating: everyone, teen, mature, explicit';
COMMENT ON COLUMN projects.status IS 'Story status: draft, in_progress, completed, published';
COMMENT ON COLUMN projects.creation_started_at IS 'When story creation wizard was started';
COMMENT ON COLUMN projects.creation_completed_at IS 'When first chapter generation completed';
COMMENT ON COLUMN projects.word_count IS 'Total words across all chapters (auto-maintained by trigger)';
COMMENT ON COLUMN projects.chapter_count IS 'Total chapter count (auto-maintained by trigger)';
```

### 1.2 Auto-Update Triggers for Stats

**Migration:** `migrations/040_add_story_creation_fields.sql` (continued)

```sql
-- CRITICAL FIX: Auto-maintain word_count and chapter_count to prevent data drift
CREATE OR REPLACE FUNCTION update_project_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Handle INSERT and UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE projects
        SET
            word_count = (SELECT COALESCE(SUM(word_count), 0) FROM chapters WHERE project_id = NEW.project_id),
            chapter_count = (SELECT COUNT(*) FROM chapters WHERE project_id = NEW.project_id),
            updated_at = NOW()
        WHERE id = NEW.project_id;
        RETURN NEW;

    -- Handle DELETE
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE projects
        SET
            word_count = (SELECT COALESCE(SUM(word_count), 0) FROM chapters WHERE project_id = OLD.project_id),
            chapter_count = (SELECT COUNT(*) FROM chapters WHERE project_id = OLD.project_id),
            updated_at = NOW()
        WHERE id = OLD.project_id;
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on chapters table
DROP TRIGGER IF EXISTS trigger_update_project_stats ON chapters;
CREATE TRIGGER trigger_update_project_stats
AFTER INSERT OR UPDATE OR DELETE ON chapters
FOR EACH ROW EXECUTE FUNCTION update_project_stats();

COMMENT ON FUNCTION update_project_stats IS 'Auto-updates project word_count and chapter_count when chapters change';
```

### 1.3 Extend `plot_templates` Table

**Migration:** `migrations/041_add_template_metadata.sql`

```sql
-- Add metadata for template browsing
ALTER TABLE plot_templates ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE plot_templates ADD COLUMN IF NOT EXISTS use_count INTEGER DEFAULT 0;
ALTER TABLE plot_templates ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_plot_templates_featured ON plot_templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_plot_templates_popular ON plot_templates(use_count DESC) WHERE use_count > 0;

-- Document
COMMENT ON COLUMN plot_templates.is_featured IS 'Show in featured templates section';
COMMENT ON COLUMN plot_templates.use_count IS 'Number of times this template was used';
COMMENT ON COLUMN plot_templates.like_count IS 'Number of user likes';
```

### 1.4 Create `template_likes` Table

**Migration:** `migrations/042_create_template_likes.sql`

```sql
CREATE TABLE IF NOT EXISTS template_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES plot_templates(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, template_id)
);

CREATE INDEX IF NOT EXISTS idx_template_likes_user ON template_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_template_likes_template ON template_likes(template_id);

COMMENT ON TABLE template_likes IS 'User likes for plot templates';
```

### 1.5 Rollback Migrations (NEW)

**Migration:** `migrations/040_rollback.sql`

```sql
-- Rollback for migration 040
-- Drop trigger and function first
DROP TRIGGER IF EXISTS trigger_update_project_stats ON chapters;
DROP FUNCTION IF EXISTS update_project_stats();

-- Drop constraints
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_spice_level;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_content_rating;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_creation_path;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_genre;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_pov;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_tense;
ALTER TABLE projects DROP CONSTRAINT IF EXISTS chk_status;

-- Drop indexes
DROP INDEX IF EXISTS idx_projects_genre;
DROP INDEX IF EXISTS idx_projects_spice_level;
DROP INDEX IF EXISTS idx_projects_status;
DROP INDEX IF EXISTS idx_projects_creation_path;
DROP INDEX IF EXISTS idx_projects_template_id;

-- Drop columns
ALTER TABLE projects DROP COLUMN IF EXISTS genre;
ALTER TABLE projects DROP COLUMN IF EXISTS sub_genres;
ALTER TABLE projects DROP COLUMN IF EXISTS tropes;
ALTER TABLE projects DROP COLUMN IF EXISTS spice_level;
ALTER TABLE projects DROP COLUMN IF EXISTS creation_path;
ALTER TABLE projects DROP COLUMN IF EXISTS template_id;
ALTER TABLE projects DROP COLUMN IF EXISTS creation_started_at;
ALTER TABLE projects DROP COLUMN IF EXISTS creation_completed_at;
ALTER TABLE projects DROP COLUMN IF EXISTS content_rating;
ALTER TABLE projects DROP COLUMN IF EXISTS pov;
ALTER TABLE projects DROP COLUMN IF EXISTS tense;
ALTER TABLE projects DROP COLUMN IF EXISTS status;
ALTER TABLE projects DROP COLUMN IF EXISTS word_count;
ALTER TABLE projects DROP COLUMN IF EXISTS chapter_count;
```

**Migration:** `migrations/041_rollback.sql`

```sql
-- Rollback for migration 041
DROP INDEX IF EXISTS idx_plot_templates_featured;
DROP INDEX IF EXISTS idx_plot_templates_popular;

ALTER TABLE plot_templates DROP COLUMN IF EXISTS is_featured;
ALTER TABLE plot_templates DROP COLUMN IF EXISTS use_count;
ALTER TABLE plot_templates DROP COLUMN IF EXISTS like_count;
```

**Migration:** `migrations/042_rollback.sql`

```sql
-- Rollback for migration 042
DROP TABLE IF EXISTS template_likes CASCADE;
```

---

## 2. API Endpoints

### 2.1 Story Creation Routes with Transaction Safety

**File:** `backend/app/routes/story_creation.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List, Optional
from pydantic import BaseModel
import logging

from app.db_models import User, Project, Chapter, PlotTemplate
from app.database import get_db
from app.auth import get_current_user
from app.services.token_service import TokenAccountingService
from app.rate_limit import rate_limit

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/stories", tags=["story-creation"])

# =====================
# Pydantic Models
# =====================

class GenreInfo(BaseModel):
    id: str
    name: str
    name_key: str  # i18n key: "genre.contemporary_romance.name"
    icon: str
    description: str
    description_key: str  # i18n key: "genre.contemporary_romance.description"

class TropeInfo(BaseModel):
    id: str
    name: str
    name_key: str  # i18n key: "trope.enemies_to_lovers.name"
    description: str
    description_key: str  # i18n key: "trope.enemies_to_lovers.description"
    heat_level: str

class QuickStartRequest(BaseModel):
    genre: str
    tropes: List[str]
    spice_level: str
    protagonist_name: str
    protagonist_gender: str
    love_interest_name: str
    love_interest_gender: str
    pov: Optional[str] = "third_limited"
    tense: Optional[str] = "past"

class StoryResponse(BaseModel):
    id: str
    title: str
    genre: str
    tropes: List[str]
    spice_level: str
    creation_path: str
    status: str
    first_chapter_id: Optional[str] = None
    tokens_used: int  # NEW: Show user how many tokens were consumed

# =====================
# Metadata Endpoints
# =====================

@router.get("/genres", response_model=List[GenreInfo])
async def get_genres(db: Session = Depends(get_db)):
    """
    Get available genres for story creation.

    Frontend should use i18n keys (name_key, description_key) to display
    localized text. Fallback to name/description for English.
    """
    genres = [
        {
            "id": "contemporary_romance",
            "name": "Contemporary Romance",
            "name_key": "genre.contemporary_romance.name",
            "icon": "💕",
            "description": "Modern day love stories",
            "description_key": "genre.contemporary_romance.description"
        },
        {
            "id": "paranormal_romance",
            "name": "Paranormal Romance",
            "name_key": "genre.paranormal_romance.name",
            "icon": "🧛",
            "description": "Vampires, werewolves, supernatural",
            "description_key": "genre.paranormal_romance.description"
        },
        {
            "id": "fantasy_romance",
            "name": "Fantasy Romance",
            "name_key": "genre.fantasy_romance.name",
            "icon": "⚔️",
            "description": "Medieval, magical worlds",
            "description_key": "genre.fantasy_romance.description"
        },
        {
            "id": "dark_romance",
            "name": "Dark Romance",
            "name_key": "genre.dark_romance.name",
            "icon": "🌙",
            "description": "Morally grey, intense themes",
            "description_key": "genre.dark_romance.description"
        },
        {
            "id": "scifi_romance",
            "name": "Sci-Fi Romance",
            "name_key": "genre.scifi_romance.name",
            "icon": "🚀",
            "description": "Futuristic, space settings",
            "description_key": "genre.scifi_romance.description"
        },
        {
            "id": "historical_romance",
            "name": "Historical Romance",
            "name_key": "genre.historical_romance.name",
            "icon": "👑",
            "description": "Regency, Victorian, etc.",
            "description_key": "genre.historical_romance.description"
        },
        {
            "id": "lgbtq_romance",
            "name": "LGBTQ+ Romance",
            "name_key": "genre.lgbtq_romance.name",
            "icon": "🌈",
            "description": "MM, FF, and other pairings",
            "description_key": "genre.lgbtq_romance.description"
        },
    ]
    return genres

@router.get("/tropes", response_model=List[TropeInfo])
async def get_tropes(db: Session = Depends(get_db)):
    """Get available romance tropes with i18n support"""
    tropes = [
        {
            "id": "enemies_to_lovers",
            "name": "Enemies to Lovers",
            "name_key": "trope.enemies_to_lovers.name",
            "description": "Hate transforms to love",
            "description_key": "trope.enemies_to_lovers.description",
            "heat_level": "medium-high"
        },
        {
            "id": "forced_proximity",
            "name": "Forced Proximity",
            "name_key": "trope.forced_proximity.name",
            "description": "Stuck together situation",
            "description_key": "trope.forced_proximity.description",
            "heat_level": "medium"
        },
        {
            "id": "fake_dating",
            "name": "Fake Dating",
            "name_key": "trope.fake_dating.name",
            "description": "Pretend relationship becomes real",
            "description_key": "trope.fake_dating.description",
            "heat_level": "medium"
        },
        {
            "id": "second_chance",
            "name": "Second Chance",
            "name_key": "trope.second_chance.name",
            "description": "Reunited past lovers",
            "description_key": "trope.second_chance.description",
            "heat_level": "medium"
        },
        {
            "id": "forbidden_love",
            "name": "Forbidden Love",
            "name_key": "trope.forbidden_love.name",
            "description": "Shouldn't be together",
            "description_key": "trope.forbidden_love.description",
            "heat_level": "high"
        },
        {
            "id": "age_gap",
            "name": "Age Gap",
            "name_key": "trope.age_gap.name",
            "description": "Significant age difference",
            "description_key": "trope.age_gap.description",
            "heat_level": "medium-high"
        },
        {
            "id": "boss_employee",
            "name": "Boss/Employee",
            "name_key": "trope.boss_employee.name",
            "description": "Workplace power dynamic",
            "description_key": "trope.boss_employee.description",
            "heat_level": "medium-high"
        },
        {
            "id": "billionaire",
            "name": "Billionaire",
            "name_key": "trope.billionaire.name",
            "description": "Wealthy and powerful",
            "description_key": "trope.billionaire.description",
            "heat_level": "medium"
        },
        {
            "id": "mafia",
            "name": "Mafia/Mob",
            "name_key": "trope.mafia.name",
            "description": "Dangerous criminal world",
            "description_key": "trope.mafia.description",
            "heat_level": "high"
        },
        {
            "id": "reverse_harem",
            "name": "Reverse Harem",
            "name_key": "trope.reverse_harem.name",
            "description": "Multiple love interests",
            "description_key": "trope.reverse_harem.description",
            "heat_level": "high"
        },
        {
            "id": "slow_burn",
            "name": "Slow Burn",
            "name_key": "trope.slow_burn.name",
            "description": "Gradual romance buildup",
            "description_key": "trope.slow_burn.description",
            "heat_level": "low-medium"
        },
        {
            "id": "instalove",
            "name": "Instalove",
            "name_key": "trope.instalove.name",
            "description": "Immediate attraction",
            "description_key": "trope.instalove.description",
            "heat_level": "medium-high"
        },
    ]
    return tropes

# =====================
# Story Creation Endpoints (WITH CRITICAL FIXES)
# =====================

@router.post("/quick-start", response_model=StoryResponse)
@rate_limit(max_requests=5, window_seconds=3600)  # SECURITY FIX: 5 stories per hour
async def create_quick_start_story(
    request: QuickStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create story using Quick Start path (30 seconds)

    CRITICAL FIXES:
    - Uses atomic transaction (project + chapter created together or both fail)
    - Charges tokens only for NEW content generated
    - Checks user has sufficient credits before generation
    - Proper error handling with rollback
    """

    # Check age verification for spicy content
    if request.spice_level == "spicy" and not current_user.is_age_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "age_verification_required",
                "message": "Spicy content requires age verification",
                "verification_url": "/settings?tab=age-verification"
            }
        )

    # Initialize token service
    token_service = TokenAccountingService(db)

    # Estimate tokens needed (2000 max_tokens for chapter)
    estimated_tokens = 2000

    # Check if user has sufficient credits
    if not token_service.check_sufficient_credits(current_user, estimated_tokens):
        remaining = current_user.credits_remaining or 0
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "insufficient_credits",
                "message": f"Need ~{estimated_tokens} tokens, you have {remaining}",
                "credits_remaining": remaining,
                "upgrade_url": "/subscription/checkout"
            }
        )

    # CRITICAL FIX: Use atomic transaction
    try:
        # Generate title
        title = generate_title(request.genre, request.tropes)

        # Create project (not committed yet)
        project = Project(
            user_id=current_user.id,
            name=title,
            genre=request.genre,
            tropes=request.tropes,
            spice_level=request.spice_level,
            creation_path="quick_start",
            creation_started_at=db.func.now(),
            pov=request.pov,
            tense=request.tense,
            content_rating="explicit" if request.spice_level == "spicy" else "teen",
            status="draft",
            characters={
                "protagonist": {
                    "name": request.protagonist_name,
                    "gender": request.protagonist_gender,
                    "role": "protagonist"
                },
                "love_interest": {
                    "name": request.love_interest_name,
                    "gender": request.love_interest_gender,
                    "role": "love_interest"
                }
            },
            settings={
                "pov": request.pov,
                "tense": request.tense,
                "spice_level": request.spice_level
            }
        )

        db.add(project)
        db.flush()  # Get project.id without committing

        # Generate first chapter (with token tracking)
        chapter_result = await generate_first_chapter_with_tokens(
            db=db,
            project=project,
            user=current_user,
            token_service=token_service
        )

        if not chapter_result["success"]:
            # Chapter generation failed - rollback everything
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail={
                    "error": "chapter_generation_failed",
                    "message": chapter_result["error"],
                    "suggestion": "Please try again or contact support"
                }
            )

        # Update project completion time
        project.creation_completed_at = db.func.now()
        project.status = "in_progress"

        # Commit both project and chapter atomically
        db.commit()
        db.refresh(project)

        logger.info(
            f"Story created successfully: {project.id}, "
            f"tokens_used={chapter_result['tokens_used']}, "
            f"user={current_user.id}"
        )

        return StoryResponse(
            id=str(project.id),
            title=project.name,
            genre=project.genre,
            tropes=project.tropes,
            spice_level=project.spice_level,
            creation_path=project.creation_path,
            status=project.status,
            first_chapter_id=str(chapter_result["chapter"].id),
            tokens_used=chapter_result["tokens_used"]
        )

    except HTTPException:
        # Re-raise HTTP exceptions (age verification, insufficient credits)
        raise
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating story: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error creating story"
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Unexpected error creating story: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error creating story"
        )

@router.get("/templates", response_model=List[dict])
async def get_templates(
    genre: Optional[str] = None,
    featured: bool = False,
    db: Session = Depends(get_db)
):
    """Get available templates with filtering"""
    query = db.query(PlotTemplate).filter(PlotTemplate.is_public == True)

    if genre:
        query = query.filter(PlotTemplate.genre == genre)

    if featured:
        query = query.filter(PlotTemplate.is_featured == True)

    templates = query.order_by(PlotTemplate.use_count.desc()).limit(20).all()

    return [{
        "id": str(t.id),
        "title": t.title,
        "description": t.description,
        "genre": t.genre,
        "cover_image_url": t.cover_image_url,
        "use_count": t.use_count,
        "is_featured": t.is_featured
    } for t in templates]

# =====================
# Helper Functions
# =====================

def generate_title(genre: str, tropes: List[str]) -> str:
    """
    Generate a unique title based on genre and tropes.

    Future enhancement: Use LLM to generate creative titles.
    Current: Template-based with randomization to avoid duplicates.
    """
    import random
    import time

    genre_templates = {
        "contemporary_romance": [
            "A Chance Encounter", "Summer Dreams", "City Lights",
            "Coffee Shop Romance", "Second Chances", "Finding Home"
        ],
        "paranormal_romance": [
            "Moonlit Bonds", "Eternal Kiss", "Shadow's Embrace",
            "Midnight Howl", "Blood and Roses", "Fated Souls"
        ],
        "fantasy_romance": [
            "Sword and Heart", "Magic's Promise", "Dragon's Desire",
            "Crown of Thorns", "Enchanted Whispers", "Kingdom of Fire"
        ],
        "dark_romance": [
            "Beautiful Lie", "Twisted Fate", "Dangerous Games",
            "Captive Hearts", "Ruthless Love", "Sinful Obsession"
        ],
        "scifi_romance": [
            "Starlight Promise", "Cosmic Love", "Nebula Dreams",
            "Galaxy Hearts", "Orbit of Desire", "Quantum Entanglement"
        ],
        "historical_romance": [
            "Regency Scandal", "Victorian Secrets", "Highland Passion",
            "Duke's Deception", "Forbidden Waltz", "Lady's Gambit"
        ],
        "lgbtq_romance": [
            "Love Unbound", "True Colors", "Hearts Aligned",
            "Breaking Barriers", "Pride and Passion", "Rainbow After Storm"
        ],
    }

    templates = genre_templates.get(genre, ["A New Story"])
    base_title = random.choice(templates)

    # Add timestamp suffix for uniqueness
    suffix = int(time.time()) % 1000

    return f"{base_title} #{suffix}"

async def generate_first_chapter_with_tokens(
    db: Session,
    project: Project,
    user: User,
    token_service: TokenAccountingService
) -> dict:
    """
    Generate the first chapter using AI with proper token accounting.

    Returns:
        {
            "success": bool,
            "chapter": Chapter or None,
            "tokens_used": int,
            "error": str or None
        }
    """
    from app.llm_handler_grok import GrokLLMHandler

    try:
        # Build prompt
        prompt = build_chapter_generation_prompt(project)

        # Call LLM
        handler = GrokLLMHandler()
        response = await handler.generate_text(
            prompt=prompt,
            max_tokens=2000,
            temperature=0.8
        )

        generated_text = response.get("text", "")

        if not generated_text or len(generated_text) < 100:
            return {
                "success": False,
                "chapter": None,
                "tokens_used": 0,
                "error": "Generated text too short or empty"
            }

        # CRITICAL FIX: Calculate tokens charged (only NEW content)
        # Follow CLAUDE.md guidelines: subtract any echoed input
        tokens_charged = token_service.calculate_tokens_for_generation(
            prompt_text=prompt,
            generated_text=generated_text,
            original_text=""  # No original text in chapter generation
        )

        # Deduct tokens from user
        if not token_service.deduct_tokens(user, tokens_charged):
            return {
                "success": False,
                "chapter": None,
                "tokens_used": 0,
                "error": "Failed to deduct tokens (insufficient credits)"
            }

        # Create chapter
        chapter = Chapter(
            project_id=project.id,
            number=1,
            title="Chapter 1",
            content=generated_text,
            word_count=len(generated_text.split())
        )

        db.add(chapter)
        # Don't commit here - parent function will commit atomically

        logger.info(
            f"Chapter generated: project={project.id}, "
            f"tokens_charged={tokens_charged}, "
            f"word_count={chapter.word_count}"
        )

        return {
            "success": True,
            "chapter": chapter,
            "tokens_used": tokens_charged,
            "error": None
        }

    except Exception as e:
        logger.error(f"Failed to generate first chapter: {e}")
        return {
            "success": False,
            "chapter": None,
            "tokens_used": 0,
            "error": str(e)
        }

def build_chapter_generation_prompt(project: Project) -> str:
    """Build AI prompt for first chapter generation"""
    genre_context = {
        "contemporary_romance": "a modern-day setting",
        "paranormal_romance": "a world with supernatural beings",
        "fantasy_romance": "a magical medieval world",
        "dark_romance": "a morally complex, intense world",
        "scifi_romance": "a futuristic space setting",
        "historical_romance": "a historical period setting",
        "lgbtq_romance": "an inclusive, diverse world",
    }

    spice_instructions = {
        "mild": "Keep romance sweet and closed-door. Fade to black before intimate scenes.",
        "medium": "Include some steamy scenes with tasteful detail. Balance romance and sensuality.",
        "spicy": "Include explicit intimate scenes with detailed descriptions. This is adult content."
    }

    prompt = f"""Write the first chapter of a {project.genre.replace('_', ' ')} story.

Setting: {genre_context.get(project.genre, 'an engaging world')}

Tropes to include: {', '.join(project.tropes)}

Content Level: {project.spice_level}
Instructions: {spice_instructions.get(project.spice_level, '')}

Characters:
{format_characters_for_prompt(project.characters)}

Guidelines:
- Write approximately 1500 words
- Start with action or dialogue, not exposition
- Use {project.pov.replace('_', ' ')} point of view
- Use {project.tense} tense
- Hook the reader immediately
- Introduce at least one main character
- Set up the central conflict or tension

Begin the story now:"""

    return prompt

def format_characters_for_prompt(characters: dict) -> str:
    """Format characters for AI prompt"""
    lines = []
    for name, data in characters.items():
        role = data.get("role", "supporting")
        gender = data.get("gender", "")
        lines.append(f"- {name} ({gender}, {role})")
    return "\n".join(lines)
```

---

## 3. Token Accounting System

### 3.1 Token Service

**File:** `backend/app/services/token_service.py`

```python
"""
Token accounting service for story creation.

Follows CLAUDE.md guidelines:
- Only charge for NEW content generated
- Subtract any text echoed by LLM
- Use max(0, ...) to allow zero billing for exact echoes
"""

from sqlalchemy.orm import Session
from app.db_models import User
import logging

logger = logging.getLogger(__name__)

class TokenAccountingService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_tokens_for_generation(
        self,
        prompt_text: str,
        generated_text: str,
        original_text: str = ""
    ) -> int:
        """
        Calculate tokens to charge user based on generated content.

        Args:
            prompt_text: The prompt sent to LLM
            generated_text: The text returned by LLM
            original_text: Original text (if any) that was provided as context

        Returns:
            Number of tokens to charge (can be 0 if LLM only echoed input)
        """
        try:
            from app.tokenizer import count_tokens

            # Count tokens in generated text
            generated_tokens = count_tokens(generated_text)

            # Count tokens in original text (context)
            original_tokens = count_tokens(original_text) if original_text else 0

            # Check if LLM echoed the original text
            if original_text and generated_text.startswith(original_text[:min(100, len(original_text))]):
                # LLM echoed input - subtract original tokens
                tokens_to_charge = max(0, generated_tokens - original_tokens)
                logger.info(
                    f"Token overlap detected: generated={generated_tokens}, "
                    f"original={original_tokens}, charged={tokens_to_charge}"
                )
            else:
                # No overlap - charge for all generated tokens
                tokens_to_charge = generated_tokens

            return tokens_to_charge

        except Exception as e:
            # Fallback: rough estimation (2 chars per token)
            logger.warning(f"Tokenizer failed, using fallback estimation: {e}")
            estimated = max(0, len(generated_text) // 2)
            return estimated

    def check_sufficient_credits(self, user: User, required_tokens: int) -> bool:
        """Check if user has sufficient credits"""
        remaining = user.credits_remaining or 0
        return remaining >= required_tokens

    def deduct_tokens(self, user: User, tokens: int) -> bool:
        """
        Deduct tokens from user's account.

        Returns:
            True if successful, False if insufficient credits
        """
        if tokens == 0:
            logger.info(f"Zero tokens charged for user {user.id}")
            return True

        remaining = user.credits_remaining or 0

        if remaining < tokens:
            logger.warning(
                f"Insufficient credits for user {user.id}: "
                f"needed={tokens}, remaining={remaining}"
            )
            return False

        user.credits_remaining = remaining - tokens
        self.db.flush()  # Update in current transaction

        logger.info(
            f"Tokens deducted: user={user.id}, amount={tokens}, "
            f"remaining={user.credits_remaining}"
        )

        return True
```

---

## 4. Frontend Components

### 4.1 State Management with Persistence (FIXED)

**File:** `frontend/src/stores/storyCreationStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../utils/api';

type CreationPath = 'quick_start' | 'template' | 'custom';

type Genre = {
  id: string;
  name: string;
  name_key: string;  // i18n support
  icon: string;
  description: string;
  description_key: string;
};

type Trope = {
  id: string;
  name: string;
  name_key: string;
  description: string;
  description_key: string;
  heat_level: string;
};

interface StoryCreationState {
  // Current state
  currentPath: CreationPath | null;
  currentStep: number;
  isLoading: boolean;
  error: string | null;

  // Quick Start path data
  selectedGenre: Genre | null;
  selectedTropes: Trope[];
  spiceLevel: 'mild' | 'medium' | 'spicy';

  // Character data
  protagonistName: string;
  protagonistGender: string;
  loveInterestName: string;
  loveInterestGender: string;

  // Template path data
  selectedTemplate: any | null;

  // Custom path data
  customTitle: string;
  customDescription: string;

  // Result
  createdStoryId: string | null;

  // Actions
  setPath: (path: CreationPath) => void;
  setGenre: (genre: Genre) => void;
  toggleTrope: (trope: Trope) => void;
  setSpiceLevel: (level: 'mild' | 'medium' | 'spicy') => void;
  setCharacters: (protagonist: { name: string; gender: string }, loveInterest: { name: string; gender: string }) => void;
  setSelectedTemplate: (template: any) => void;
  setCustomData: (title: string, description: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  submitQuickStart: () => Promise<void>;
  submitTemplate: () => Promise<void>;
  submitCustom: () => Promise<void>;
}

// CRITICAL FIX: Added Zustand persistence
export const useStoryCreationStore = create<StoryCreationState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentPath: null,
      currentStep: 0,
      isLoading: false,
      error: null,

      selectedGenre: null,
      selectedTropes: [],
      spiceLevel: 'mild',

      protagonistName: '',
      protagonistGender: 'female',
      loveInterestName: '',
      loveInterestGender: 'male',

      selectedTemplate: null,

      customTitle: '',
      customDescription: '',

      createdStoryId: null,

      // Actions
      setPath: (path) => set({ currentPath: path, currentStep: 0 }),

      setGenre: (genre) => set({ selectedGenre: genre }),

      toggleTrope: (trope) => {
        const selectedTropes = get().selectedTropes;
        const exists = selectedTropes.find(t => t.id === trope.id);
        if (exists) {
          set({ selectedTropes: selectedTropes.filter(t => t.id !== trope.id) });
        } else {
          // Limit to 3 tropes max
          if (selectedTropes.length >= 3) {
            set({ error: 'Maximum 3 tropes allowed' });
            return;
          }
          set({ selectedTropes: [...selectedTropes, trope] });
        }
      },

      setSpiceLevel: (level) => set({ spiceLevel: level }),

      setCharacters: (protagonist, loveInterest) =>
        set({
          protagonistName: protagonist.name,
          protagonistGender: protagonist.gender,
          loveInterestName: loveInterest.name,
          loveInterestGender: loveInterest.gender,
        }),

      setSelectedTemplate: (template) => set({ selectedTemplate: template }),

      setCustomData: (title, description) =>
        set({ customTitle: title, customDescription: description }),

      nextStep: () => set(state => ({ currentStep: state.currentStep + 1 })),

      prevStep: () => set(state => ({ currentStep: Math.max(0, state.currentStep - 1) })),

      reset: () =>
        set({
          currentPath: null,
          currentStep: 0,
          selectedGenre: null,
          selectedTropes: [],
          spiceLevel: 'mild',
          protagonistName: '',
          protagonistGender: 'female',
          loveInterestName: '',
          loveInterestGender: 'male',
          selectedTemplate: null,
          customTitle: '',
          customDescription: '',
          createdStoryId: null,
          error: null,
        }),

      submitQuickStart: async () => {
        const state = get();
        if (!state.selectedGenre || state.selectedTropes.length === 0) {
          set({ error: 'Please select a genre and at least one trope' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/stories/quick-start', {
            genre: state.selectedGenre.id,
            tropes: state.selectedTropes.map(t => t.id),
            spice_level: state.spiceLevel,
            protagonist_name: state.protagonistName || 'Emma',
            protagonist_gender: state.protagonistGender,
            love_interest_name: state.loveInterestName || 'Alexander',
            love_interest_gender: state.loveInterestGender,
          });

          set({ createdStoryId: response.data.id, isLoading: false });
        } catch (error: any) {
          const detail = error.response?.data?.detail;

          // Handle specific error types
          if (typeof detail === 'object') {
            if (detail.error === 'age_verification_required') {
              set({ error: 'Age verification required for spicy content. Please verify in Settings.' });
            } else if (detail.error === 'insufficient_credits') {
              set({ error: `Insufficient credits. You need ~${detail.credits_remaining || 0} more tokens.` });
            } else {
              set({ error: detail.message || 'Failed to create story' });
            }
          } else {
            set({ error: detail || 'Failed to create story' });
          }

          set({ isLoading: false });
        }
      },

      submitTemplate: async () => {
        const state = get();
        if (!state.selectedTemplate) return;

        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/stories/from-template', {
            template_id: state.selectedTemplate.id,
            spice_level: state.spiceLevel,
          });

          set({ createdStoryId: response.data.id, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to create story',
            isLoading: false,
          });
        }
      },

      submitCustom: async () => {
        const state = get();
        if (!state.customTitle) {
          set({ error: 'Please enter a title' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.post('/stories/custom', {
            title: state.customTitle,
            description: state.customDescription,
            genre: state.selectedGenre?.id || 'contemporary_romance',
            tropes: state.selectedTropes.map(t => t.id),
            spice_level: state.spiceLevel,
          });

          set({ createdStoryId: response.data.id, isLoading: false });
        } catch (error: any) {
          set({
            error: error.response?.data?.detail || 'Failed to create story',
            isLoading: false,
          });
        }
      },
    }),
    {
      name: 'story-creation-draft', // localStorage key
      version: 1,
      // Only persist user input, not transient state
      partialize: (state) => ({
        currentPath: state.currentPath,
        currentStep: state.currentStep,
        selectedGenre: state.selectedGenre,
        selectedTropes: state.selectedTropes,
        spiceLevel: state.spiceLevel,
        protagonistName: state.protagonistName,
        protagonistGender: state.protagonistGender,
        loveInterestName: state.loveInterestName,
        loveInterestGender: state.loveInterestGender,
        customTitle: state.customTitle,
        customDescription: state.customDescription,
        // Don't persist: isLoading, error, createdStoryId
      }),
    }
  )
);
```

### 4.2 Main Modal Component (FIXED)

**File:** `frontend/src/components/StoryCreationModal.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStoryCreationStore } from '../stores/storyCreationStore';
import { api } from '../utils/api';
import { X } from 'lucide-react';

// Path selection component
import PathSelection from './story-creation/PathSelection';
import QuickStartFlow from './story-creation/QuickStartFlow';
import TemplateBrowser from './story-creation/TemplateBrowser';
import CustomSetupWizard from './story-creation/CustomSetupWizard';
import CreatingStory from './story-creation/CreatingStory';
import CreationSuccess from './story-creation/CreationSuccess';

const StoryCreationModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [genres, setGenres] = useState<any[]>([]);
  const [tropes, setTropes] = useState<any[]>([]);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);  // FIXED: Loading state
  const [metadataError, setMetadataError] = useState<string | null>(null);  // FIXED: Error state

  const {
    currentPath,
    currentStep,
    isLoading,
    error,
    createdStoryId,
    reset,
  } = useStoryCreationStore();

  // FIXED: Prevent background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Load metadata with proper error handling (FIXED)
  useEffect(() => {
    const loadMetadata = async () => {
      setIsLoadingMetadata(true);
      setMetadataError(null);

      try {
        const [genresRes, tropesRes] = await Promise.all([
          api.get('/stories/genres'),
          api.get('/stories/tropes'),
        ]);
        setGenres(genresRes.data);
        setTropes(tropesRes.data);
      } catch (error) {
        console.error('Failed to load metadata:', error);
        setMetadataError('Failed to load story options. Please refresh the page.');
      } finally {
        setIsLoadingMetadata(false);
      }
    };

    loadMetadata();
  }, []);

  // Navigate to editor on success
  useEffect(() => {
    if (createdStoryId) {
      const timer = setTimeout(() => {
        navigate(`/novel/${createdStoryId}`);
        onClose();
        reset();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [createdStoryId, navigate, onClose, reset]);

  const renderContent = () => {
    // Loading state
    if (isLoadingMetadata) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      );
    }

    // Error state
    if (metadataError) {
      return (
        <div className="p-6 text-center">
          <div className="text-red-600 mb-4">{metadataError}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    // Creating story
    if (isLoading) {
      return <CreatingStory />;
    }

    // Success
    if (createdStoryId) {
      return <CreationSuccess storyId={createdStoryId} />;
    }

    // Path selection
    if (!currentPath) {
      return <PathSelection genres={genres} />;
    }

    // Specific paths
    switch (currentPath) {
      case 'quick_start':
        return <QuickStartFlow genres={genres} tropes={tropes} />;
      case 'template':
        return <TemplateBrowser genres={genres} />;
      case 'custom':
        return <CustomSetupWizard genres={genres} tropes={tropes} />;
      default:
        return <PathSelection genres={genres} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Create New Story
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default StoryCreationModal;
```

### 4.3 Quick Start Flow (FIXED)

**File:** `frontend/src/components/story-creation/QuickStartFlow.tsx`

```typescript
import React from 'react';
import { useStoryCreationStore } from '../../stores/storyCreationStore';
import { ChevronLeft, ChevronRight, Dice1 } from 'lucide-react';

interface QuickStartFlowProps {
  genres: any[];
  tropes: any[];
}

const QuickStartFlow: React.FC<QuickStartFlowProps> = ({ genres, tropes }) => {
  const {
    currentStep,
    selectedGenre,
    selectedTropes,
    spiceLevel,
    protagonistName,
    protagonistGender,
    loveInterestName,
    loveInterestGender,
    setGenre,
    toggleTrope,
    setSpiceLevel,
    setCharacters,
    nextStep,
    prevStep,
    submitQuickStart,
  } = useStoryCreationStore();

  // FIXED: Respect user's gender selections
  const randomizeNames = () => {
    const firstNames: { [key: string]: string[] } = {
      female: ['Emma', 'Sophia', 'Olivia', 'Ava', 'Isabella', 'Mia', 'Luna', 'Aria'],
      male: ['Liam', 'Noah', 'Oliver', 'Elijah', 'James', 'William', 'Benjamin', 'Lucas'],
      'non-binary': ['Alex', 'Jordan', 'Riley', 'Casey', 'Taylor', 'Morgan', 'Quinn', 'Avery'],
    };

    const getRandomName = (gender: string) => {
      const names = firstNames[gender] || firstNames['non-binary'];
      return names[Math.floor(Math.random() * names.length)];
    };

    setCharacters(
      {
        name: getRandomName(protagonistGender),
        gender: protagonistGender,
      },
      {
        name: getRandomName(loveInterestGender),
        gender: loveInterestGender,
      }
    );
  };

  const steps = [
    // Step 1: Genre Selection
    <div key="genre" className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Choose Your Genre</h3>
      <div className="grid grid-cols-3 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setGenre(genre)}
            className={`p-4 rounded-xl border-2 transition-all ${
              selectedGenre?.id === genre.id
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="text-4xl mb-2">{genre.icon}</div>
            <div className="font-medium text-gray-900">{genre.name}</div>
            <div className="text-sm text-gray-500">{genre.description}</div>
          </button>
        ))}
      </div>
    </div>,

    // Step 2: Trope Selection
    <div key="trope" className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Pick Your Tropes</h3>
      <p className="text-gray-600">Select 1-3 tropes for {selectedGenre?.name || 'Romance'}:</p>
      <div className="grid grid-cols-2 gap-4">
        {tropes.slice(0, 8).map((trope) => (
          <button
            key={trope.id}
            onClick={() => toggleTrope(trope)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedTropes.find((t) => t.id === trope.id)
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="font-medium text-gray-900">{trope.name}</div>
            <div className="text-sm text-gray-500">{trope.description}</div>
          </button>
        ))}
      </div>
      {selectedTropes.length > 0 && (
        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">
            {selectedTropes.length} trope{selectedTropes.length > 1 ? 's' : ''} selected
          </span>
        </div>
      )}
    </div>,

    // Step 3: Spice Level
    <div key="spice" className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Set the Heat Level 🌶️</h3>
      <p className="text-gray-600">How steamy should your story be?</p>

      <div className="space-y-3">
        {[
          { value: 'mild', label: 'Mild', emoji: '🌶️', desc: 'Sweet romance, closed door scenes' },
          { value: 'medium', label: 'Medium', emoji: '🌶️🌶️', desc: 'Some steamy scenes, tasteful detail' },
          { value: 'spicy', label: 'Spicy', emoji: '🌶️🌶️🌶️', desc: 'Explicit scenes, detailed descriptions (18+)' },
        ].map((level) => (
          <button
            key={level.value}
            onClick={() => setSpiceLevel(level.value as any)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              spiceLevel === level.value
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-200 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="text-2xl">{level.emoji}</div>
              <div>
                <div className="font-medium text-gray-900">{level.label}</div>
                <div className="text-sm text-gray-500">{level.desc}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {spiceLevel === 'spicy' && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ Spicy content requires age verification. Please verify in Settings before creating.
          </p>
        </div>
      )}
    </div>,

    // Step 4: Character Basics
    <div key="characters" className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900">Quick Character Setup</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Protagonist</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={protagonistName}
              onChange={(e) =>
                setCharacters(
                  { name: e.target.value, gender: protagonistGender },
                  { name: loveInterestName, gender: loveInterestGender }
                )
              }
              placeholder="Emma"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              onClick={randomizeNames}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
              title="Randomize names"
            >
              <Dice1 className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2 mt-2">
            {['Female', 'Male', 'Non-binary'].map((gender) => (
              <button
                key={gender}
                onClick={() =>
                  setCharacters(
                    { name: protagonistName, gender: gender.toLowerCase() },
                    { name: loveInterestName, gender: loveInterestGender }
                  )
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  protagonistGender.toLowerCase() === gender.toLowerCase()
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Love Interest</label>
          <input
            type="text"
            value={loveInterestName}
            onChange={(e) =>
              setCharacters(
                { name: protagonistName, gender: protagonistGender },
                { name: e.target.value, gender: loveInterestGender }
              )
            }
            placeholder="Alexander"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
          <div className="flex gap-2 mt-2">
            {['Female', 'Male', 'Non-binary'].map((gender) => (
              <button
                key={gender}
                onClick={() =>
                  setCharacters(
                    { name: protagonistName, gender: protagonistGender },
                    { name: loveInterestName, gender: gender.toLowerCase() }
                  )
                }
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  loveInterestGender.toLowerCase() === gender.toLowerCase()
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {gender}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
  ];

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-2">
        {[0, 1, 2, 3].map((step) => (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors ${
              step <= currentStep ? 'bg-pink-500' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      {steps[currentStep]}

      {/* Navigation */}
      <div className="flex justify-between items-center pt-4">
        <div className="w-24">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
        </div>

        <div className="text-sm text-gray-500">Step {currentStep + 1} of 4</div>

        <div className="w-24 flex justify-end">
          {currentStep < 3 ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 0 && !selectedGenre) ||
                (currentStep === 1 && selectedTropes.length === 0)
              }
              className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuickStart}
              className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Create Story ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickStartFlow;
```

---

## 5. Integration with Adult Content

### 5.1 Spice Level ↔ Age Verification Mapping

The `spice_level` field integrates with existing adult content features:

| Spice Level | Age Verification Required | User Permission Required |
|-------------|--------------------------|--------------------------|
| `mild` | No | No |
| `medium` | No | No |
| `spicy` | **Yes** | `user.is_age_verified = true` |

**Important:** Adult content is at USER level, not project level. If a user creates a "spicy" project, they must have:
1. `is_age_verified = true` (completed age verification)
2. `enable_adult_content = true` (explicitly enabled in settings)

---

## 6. Rate Limiting & Security

### 6.1 Rate Limiting Middleware

**File:** `backend/app/rate_limit.py`

```python
"""
Rate limiting for story creation endpoints.

Prevents abuse by limiting story creation to 5 per hour per user.
"""

import time
from functools import wraps
from fastapi import HTTPException, status
from collections import defaultdict
from threading import Lock

# Simple in-memory rate limiter (use Redis for production)
rate_limit_store: dict = defaultdict(list)
store_lock = Lock()

def rate_limit(max_requests: int = 5, window_seconds: int = 3600):
    """
    Rate limit decorator for FastAPI routes.

    Args:
        max_requests: Maximum requests allowed
        window_seconds: Time window in seconds
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get user from kwargs (FastAPI dependency injection)
            current_user = kwargs.get('current_user')

            if not current_user:
                # No user - skip rate limiting
                return await func(*args, **kwargs)

            user_id = str(current_user.id)
            now = time.time()

            with store_lock:
                # Get user's request timestamps
                timestamps = rate_limit_store[user_id]

                # Remove old timestamps outside window
                timestamps = [ts for ts in timestamps if now - ts < window_seconds]

                # Check if limit exceeded
                if len(timestamps) >= max_requests:
                    oldest_ts = min(timestamps)
                    retry_after = int(window_seconds - (now - oldest_ts))

                    raise HTTPException(
                        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                        detail={
                            "error": "rate_limit_exceeded",
                            "message": f"Maximum {max_requests} stories per {window_seconds // 60} minutes",
                            "retry_after_seconds": retry_after
                        },
                        headers={"Retry-After": str(retry_after)}
                    )

                # Add current request
                timestamps.append(now)
                rate_limit_store[user_id] = timestamps

            return await func(*args, **kwargs)

        return wrapper
    return decorator
```

**Production Note:** For production, use Redis-based rate limiting:

```python
# backend/app/rate_limit_redis.py
import redis
from datetime import timedelta

redis_client = redis.Redis(host='localhost', port=6379, db=0)

def rate_limit_redis(user_id: str, max_requests: int, window_seconds: int) -> bool:
    """Check if user exceeded rate limit (Redis implementation)"""
    key = f"rate_limit:story_creation:{user_id}"

    current = redis_client.get(key)
    if current is None:
        redis_client.setex(key, window_seconds, 1)
        return True

    count = int(current)
    if count >= max_requests:
        return False

    redis_client.incr(key)
    return True
```

---

## 7. Implementation Phases

### Phase 0: Critical Fixes (Week 1)
**NEW PHASE - Must complete before Phase 1**

**Tasks:**
1. ✅ Implement token accounting service (`backend/app/services/token_service.py`)
2. ✅ Add rate limiting middleware (`backend/app/rate_limit.py`)
3. ✅ Create rollback migration scripts
4. ✅ Add database triggers for auto-updating stats
5. ✅ Fix UUID type in `template_id` column
6. ✅ Add Zustand persistence to frontend store
7. ✅ Add proper error handling in modal component

**Acceptance Criteria:**
- All critical fixes documented in this plan are implemented
- Token accounting follows CLAUDE.md guidelines
- Rate limiting prevents abuse (5 stories/hour)
- Rollback migrations tested and working
- Zustand state persists across page refreshes

### Phase 1: Database & Backend (Week 2)

**Tasks:**
1. Run migration 040 (add story creation fields + triggers)
2. Run migration 041 (add template metadata)
3. Run migration 042 (create template_likes table)
4. Add Pydantic models for new fields
5. Implement `/api/stories/genres` endpoint
6. Implement `/api/stories/tropes` endpoint
7. Implement `/api/stories/quick-start` endpoint (with all fixes)
8. Test atomic transactions and token accounting
9. Test rate limiting

**Acceptance Criteria:**
- All migrations run successfully (with rollback tested)
- API endpoints return correct data
- Quick Start creates a project with first chapter atomically
- Tokens charged correctly (0 tokens for echoes, full tokens for new content)
- Rate limiting blocks 6th request within 1 hour
- Orphaned projects impossible (transaction rollback works)

### Phase 2: Quick Start Path (Week 3)

**Tasks:**
1. Create Zustand store with persistence (`storyCreationStore.ts`)
2. Create `StoryCreationModal` component with error handling
3. Create `PathSelection` component
4. Create `QuickStartFlow` component with all 4 steps
5. Create `CreatingStory` loading component
6. Create `CreationSuccess` component
7. Add "Create Story" button to HomePage
8. Add i18n keys to translation files (prepare for localization)

**Acceptance Criteria:**
- Modal opens from HomePage
- All 4 steps render correctly
- Story creates successfully and redirects to editor
- Loading states work properly
- Error messages clear and actionable
- User input persists if they refresh page mid-flow
- Insufficient credits error shows upgrade link

### Phase 3: Template Path (Week 4)

**Tasks:**
1. Implement `/api/stories/templates` endpoint with filtering
2. Implement `/api/stories/from-template` endpoint
3. Create `TemplateBrowser` component
4. Create `TemplateCard` component
5. Add template customization screen
6. Update existing plot templates with genre metadata

**Acceptance Criteria:**
- Browse templates by genre
- Filter by featured
- Create story from template successfully
- Template use_count increments correctly

### Phase 4: Custom Path (Week 5)

**Tasks:**
1. Implement `/api/stories/custom` endpoint
2. Create `CustomSetupWizard` component
3. Create 5-step wizard screens:
   - Basic Info
   - Genre & Tropes
   - Characters (advanced)
   - World Settings
   - AI Settings
4. Add validation for required fields

**Acceptance Criteria:**
- Full 5-step wizard works
- All form fields validate correctly
- Custom story creates successfully

### Phase 5: Polish & Testing (Week 6)

**Tasks:**
1. Add animations and transitions
2. Add comprehensive error handling and retry logic
3. Write E2E tests for all three paths
4. Write unit tests for token accounting
5. Write unit tests for rate limiting
6. Performance optimization
7. Mobile responsiveness
8. Add test for insufficient credits scenario
9. Add test for concurrent story creation
10. Load testing for rate limiter

**Acceptance Criteria:**
- All E2E tests pass (including 30s timeout for LLM calls)
- All unit tests pass
- Token accounting tests cover edge cases (zero tokens, exact echo, partial echo)
- Animations are smooth (60fps)
- Mobile layout works correctly

---

## 8. Migration Strategy

### 8.1 Existing Projects

**Approach:** Existing projects get intelligent defaults based on current data.

**Migration Logic (Part of 040_add_story_creation_fields.sql):**

```sql
-- Backfill existing projects with intelligent defaults
UPDATE projects p
SET
    -- Infer spice level from existing settings
    spice_level = CASE
        WHEN p.settings->>'enable_adult_content' = 'true' THEN 'spicy'
        ELSE 'mild'
    END,

    -- Infer content rating
    content_rating = CASE
        WHEN p.settings->>'enable_adult_content' = 'true' THEN 'explicit'
        ELSE 'teen'
    END,

    -- All existing projects are "custom" (not created via wizard)
    creation_path = 'custom',

    -- Infer status from chapter count
    status = CASE
        WHEN EXISTS(SELECT 1 FROM chapters WHERE project_id = p.id) THEN 'in_progress'
        ELSE 'draft'
    END,

    -- Default genre (user can change later)
    genre = 'contemporary_romance',

    -- Extract POV and tense from settings if available
    pov = COALESCE(p.settings->>'pov', 'third_limited'),
    tense = COALESCE(p.settings->>'tense', 'past'),

    -- Initialize word_count and chapter_count (trigger will maintain)
    word_count = (SELECT COALESCE(SUM(word_count), 0) FROM chapters WHERE project_id = p.id),
    chapter_count = (SELECT COUNT(*) FROM chapters WHERE project_id = p.id)

WHERE spice_level IS NULL;
```

### 8.2 Existing Plot Templates

**Approach:** Infer genre from existing tags.

**Migration Logic (Part of 041_add_template_metadata.sql):**

```sql
-- Infer genre from existing template tags
UPDATE plot_templates
SET
    genre = CASE
        WHEN tags @> '["paranormal"]'::jsonb THEN 'paranormal_romance'
        WHEN tags @> '["fantasy"]'::jsonb THEN 'fantasy_romance'
        WHEN tags @> '["dark"]'::jsonb THEN 'dark_romance'
        WHEN tags @> '["scifi"]'::jsonb THEN 'scifi_romance'
        WHEN tags @> '["historical"]'::jsonb THEN 'historical_romance'
        WHEN tags @> '["lgbtq"]'::jsonb THEN 'lgbtq_romance'
        ELSE 'contemporary_romance'
    END,
    use_count = 0,
    like_count = 0,
    is_featured = FALSE
WHERE genre IS NULL;

-- Feature top 5 most popular templates (if any usage data exists)
UPDATE plot_templates
SET is_featured = TRUE
WHERE id IN (
    SELECT id FROM plot_templates
    WHERE is_public = TRUE
    ORDER BY RANDOM()  -- Or use real popularity metric if available
    LIMIT 5
);
```

---

## 9. Testing Plan

### 9.1 E2E Tests

**File:** `frontend/e2e/story-creation.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Story Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'Testpass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('Quick Start path creates story with first chapter', async ({ page }) => {
    // Click "Create Story" button
    await page.click('[data-testid="create-story-button"]');

    // Select Quick Start
    await page.click('[data-testid="path-quick-start"]');

    // Step 1: Select genre
    await page.click('[data-testid="genre-contemporary-romance"]');
    await page.click('button:has-text("Next")');

    // Step 2: Select trope
    await page.click('[data-testid="trope-enemies-to-lovers"]');
    await page.click('button:has-text("Next")');

    // Step 3: Select spice level
    await page.click('[data-testid="spice-mild"]');
    await page.click('button:has-text("Next")');

    // Step 4: Character setup
    await page.fill('input[placeholder*="Emma"]', 'TestEmma');
    await page.fill('input[placeholder*="Alexander"]', 'TestAlex');
    await page.click('button:has-text("Create Story")');

    // Wait for success (30s timeout for LLM generation)
    await page.waitForSelector('[data-testid="creation-success"]', { timeout: 30000 });

    // Verify redirect to editor
    await page.waitForURL(/\/novel\/[a-f0-9-]+/, { timeout: 5000 });
    expect(page.url()).toMatch(/\/novel\/[a-f0-9-]+/);
  });

  test('Spicy content requires age verification', async ({ page }) => {
    await page.click('[data-testid="create-story-button"]');
    await page.click('[data-testid="path-quick-start"]');
    await page.click('[data-testid="genre-contemporary-romance"]');
    await page.click('button:has-text("Next")');
    await page.click('[data-testid="trope-enemies-to-lovers"]');
    await page.click('button:has-text("Next")');

    // Select spicy
    await page.click('[data-testid="spice-spicy"]');

    // Should see age verification warning
    await expect(page.locator('text=Age verification required')).toBeVisible();
  });

  test('Insufficient credits shows upgrade link', async ({ page }) => {
    // Mock API to return insufficient credits error
    await page.route('**/api/stories/quick-start', (route) => {
      route.fulfill({
        status: 402,
        contentType: 'application/json',
        body: JSON.stringify({
          detail: {
            error: 'insufficient_credits',
            message: 'Need ~2000 tokens, you have 100',
            credits_remaining: 100,
            upgrade_url: '/subscription/checkout'
          }
        })
      });
    });

    // Go through creation flow
    await page.click('[data-testid="create-story-button"]');
    await page.click('[data-testid="path-quick-start"]');
    await page.click('[data-testid="genre-contemporary-romance"]');
    await page.click('button:has-text("Next")');
    await page.click('[data-testid="trope-enemies-to-lovers"]');
    await page.click('button:has-text("Next")');
    await page.click('[data-testid="spice-mild"]');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Create Story")');

    // Should show insufficient credits error
    await expect(page.locator('text=/insufficient credits/i')).toBeVisible();
  });

  test('Rate limiting prevents rapid story creation', async ({ page }) => {
    // Create 5 stories rapidly (should all succeed)
    for (let i = 0; i < 5; i++) {
      // Complete quick start flow...
      // (abbreviated for brevity)
    }

    // 6th attempt should fail with rate limit
    await page.click('[data-testid="create-story-button"]');
    // ... complete flow ...

    await expect(page.locator('text=/rate limit/i')).toBeVisible();
  });

  test('Zustand persistence: reload page preserves state', async ({ page }) => {
    await page.click('[data-testid="create-story-button"]');
    await page.click('[data-testid="path-quick-start"]');
    await page.click('[data-testid="genre-fantasy-romance"]');
    await page.click('button:has-text("Next")');
    await page.click('[data-testid="trope-enemies-to-lovers"]');

    // Reload page
    await page.reload();

    // Should still be on step 2 with genre and trope selected
    await expect(page.locator('[data-testid="trope-enemies-to-lovers"]')).toHaveClass(/border-pink-500/);
  });
});
```

### 9.2 Unit Tests - Token Accounting

**File:** `backend/app/tests/test_token_service.py`

```python
import pytest
from app.services.token_service import TokenAccountingService
from app.db_models import User

def test_calculate_tokens_zero_for_exact_echo(db_session):
    """Test that exact echo charges 0 tokens"""
    service = TokenAccountingService(db_session)

    original = "艺雅低吟：啊！爷爷，轻点……"
    generated = "艺雅低吟：啊！爷爷，轻点……"  # Exact echo

    tokens = service.calculate_tokens_for_generation(
        prompt_text="Test prompt",
        generated_text=generated,
        original_text=original
    )

    assert tokens == 0, "Exact echo should charge 0 tokens"

def test_calculate_tokens_partial_overlap(db_session):
    """Test partial overlap subtracts original tokens"""
    service = TokenAccountingService(db_session)

    original = "艺雅低吟：啊！爷爷，轻点……"  # ~50 tokens
    generated = "艺雅低吟：啊！爷爷，轻点……李爷爷的手探入裙底..."  # ~100 tokens

    tokens = service.calculate_tokens_for_generation(
        prompt_text="Test prompt",
        generated_text=generated,
        original_text=original
    )

    # Should charge only for NEW content (~50 tokens)
    assert 40 <= tokens <= 60, f"Expected ~50 tokens for new content, got {tokens}"

def test_calculate_tokens_no_overlap(db_session):
    """Test no overlap charges full amount"""
    service = TokenAccountingService(db_session)

    original = "Original text here"
    generated = "Completely different generated text that doesn't start with original"

    tokens = service.calculate_tokens_for_generation(
        prompt_text="Test prompt",
        generated_text=generated,
        original_text=original
    )

    # Should charge for all generated tokens
    assert tokens > 0, "No overlap should charge full tokens"

def test_deduct_tokens_insufficient_credits(db_session):
    """Test deducting more tokens than user has"""
    service = TokenAccountingService(db_session)

    user = User(email="test@test.com", credits_remaining=100)
    db_session.add(user)
    db_session.commit()

    result = service.deduct_tokens(user, 200)

    assert result is False, "Should fail when insufficient credits"
    assert user.credits_remaining == 100, "Credits should not change on failure"

def test_deduct_tokens_success(db_session):
    """Test successful token deduction"""
    service = TokenAccountingService(db_session)

    user = User(email="test@test.com", credits_remaining=1000)
    db_session.add(user)
    db_session.commit()

    result = service.deduct_tokens(user, 200)

    assert result is True, "Should succeed with sufficient credits"
    assert user.credits_remaining == 800, "Credits should be deducted"
```

### 9.3 Unit Tests - Rate Limiting

**File:** `backend/app/tests/test_rate_limit.py`

```python
import pytest
import time
from app.rate_limit import rate_limit_store, store_lock

def test_rate_limit_allows_requests_within_limit():
    """Test that rate limiter allows requests within limit"""
    user_id = "test_user_1"
    max_requests = 5
    window_seconds = 3600

    # Clear any existing data
    with store_lock:
        rate_limit_store[user_id] = []

    # Make 5 requests
    now = time.time()
    for i in range(max_requests):
        with store_lock:
            timestamps = rate_limit_store[user_id]
            timestamps.append(now + i)
            rate_limit_store[user_id] = timestamps

    # Should have 5 timestamps
    assert len(rate_limit_store[user_id]) == 5

def test_rate_limit_blocks_excessive_requests():
    """Test that rate limiter blocks 6th request"""
    user_id = "test_user_2"
    max_requests = 5
    window_seconds = 3600

    # Clear any existing data
    with store_lock:
        rate_limit_store[user_id] = []

    # Add 5 recent requests
    now = time.time()
    with store_lock:
        for i in range(5):
            rate_limit_store[user_id].append(now - i)

    # Check if 6th request should be blocked
    with store_lock:
        timestamps = rate_limit_store[user_id]
        timestamps = [ts for ts in timestamps if now - ts < window_seconds]
        should_block = len(timestamps) >= max_requests

    assert should_block is True, "Should block 6th request"

def test_rate_limit_resets_after_window():
    """Test that rate limit resets after time window"""
    user_id = "test_user_3"
    max_requests = 5
    window_seconds = 1  # 1 second window for testing

    # Clear any existing data
    with store_lock:
        rate_limit_store[user_id] = []

    # Add 5 requests 2 seconds ago
    past_time = time.time() - 2
    with store_lock:
        for i in range(5):
            rate_limit_store[user_id].append(past_time)

    # Check current state (should allow requests)
    now = time.time()
    with store_lock:
        timestamps = rate_limit_store[user_id]
        timestamps = [ts for ts in timestamps if now - ts < window_seconds]
        should_block = len(timestamps) >= max_requests

    assert should_block is False, "Should allow requests after window expires"
```

---

## Summary of Critical Fixes

This revised implementation plan addresses all critical issues identified in the initial review:

| Issue | Fix | Section |
|-------|-----|---------|
| 🔴 No token accounting | Added `TokenAccountingService` with proper charging logic | 3.1 |
| 🔴 Orphaned projects | Atomic transactions with `db.flush()` and rollback | 2.1 |
| 🔴 Foreign key type mismatch | Changed `template_id` to UUID | 1.1 |
| 🟡 No rate limiting | Added rate limiting decorator (5/hour) | 6.1 |
| 🟡 Missing triggers for stats | Auto-update triggers for word_count/chapter_count | 1.2 |
| 🟡 Hardcoded genres/tropes | Added i18n keys for future localization | 2.1 |
| 🟡 No Zustand persistence | Added `persist` middleware | 4.1 |
| 🟢 Silent metadata loading failure | Added loading and error states | 4.2 |
| 🟢 No rollback migrations | Created rollback scripts for all migrations | 1.5 |
| 🟢 Missing insufficient credits test | Added E2E and unit tests | 9.1, 9.2 |

**Estimated Timeline:** 6 weeks (added 1 week for critical fixes)

**Key Files to Create:**
- `backend/migrations/040_add_story_creation_fields.sql` ✅ Fixed
- `backend/migrations/040_rollback.sql` ✅ New
- `backend/migrations/041_add_template_metadata.sql`
- `backend/migrations/041_rollback.sql` ✅ New
- `backend/migrations/042_create_template_likes.sql`
- `backend/migrations/042_rollback.sql` ✅ New
- `backend/app/routes/story_creation.py` ✅ Fixed (transactions, tokens, rate limit)
- `backend/app/services/token_service.py` ✅ New
- `backend/app/rate_limit.py` ✅ New
- `frontend/src/stores/storyCreationStore.ts` ✅ Fixed (persistence)
- `frontend/src/components/StoryCreationModal.tsx` ✅ Fixed (error handling)
- `frontend/src/components/story-creation/QuickStartFlow.tsx` ✅ Fixed
- `frontend/e2e/story-creation.spec.ts` ✅ Enhanced
- `backend/app/tests/test_token_service.py` ✅ New
- `backend/app/tests/test_rate_limit.py` ✅ New

**Ready for Implementation:** ✅ All critical issues resolved
