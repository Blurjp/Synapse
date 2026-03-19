"""AI-powered endpoints for Synapse"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.source import Source
from sqlalchemy import select
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize OpenAI client
openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


class SummarizeRequest(BaseModel):
    content: str
    title: Optional[str] = None
    source_url: Optional[str] = None
    max_length: Optional[int] = 500
    style: Optional[str] = "concise"  # concise, detailed, bullet_points


class SummarizeResponse(BaseModel):
    summary: str
    key_points: List[str]
    word_count: int
    source_title: Optional[str] = None


class ExtractHighlightsRequest(BaseModel):
    content: str
    title: Optional[str] = None


class ExtractHighlightsResponse(BaseModel):
    highlights: List[str]
    main_topics: List[str]


class AskRequest(BaseModel):
    question: str
    context: Optional[str] = None
    source_id: Optional[int] = None


class AskResponse(BaseModel):
    answer: str
    confidence: Optional[float] = None


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_content(
    request: SummarizeRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Summarize content using AI
    
    - **content**: The text content to summarize
    - **title**: Optional title of the content
    - **max_length**: Maximum length of summary in words
    - **style**: Summary style (concise, detailed, bullet_points)
    """
    if not openai_client:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured. Please set OPENAI_API_KEY."
        )
    
    if not request.content or len(request.content.strip()) < 50:
        raise HTTPException(
            status_code=400,
            detail="Content too short to summarize (minimum 50 characters)"
        )
    
    try:
        # Build prompt based on style
        style_instructions = {
            "concise": "Provide a brief, concise summary in 2-3 sentences.",
            "detailed": "Provide a comprehensive summary covering all main points.",
            "bullet_points": "Summarize the content as a list of key bullet points."
        }
        
        instruction = style_instructions.get(request.style, style_instructions["concise"])
        
        prompt = f"""Summarize the following content.

{instruction}

Title: {request.title or 'Untitled'}

Content:
{request.content[:8000]}

Provide:
1. A summary (max {request.max_length} words)
2. 3-5 key points as a JSON array

Respond in this JSON format:
{{
  "summary": "your summary here",
  "key_points": ["point 1", "point 2", "point 3"]
}}
"""

        response = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes content clearly and accurately. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        # Save summary as a source if URL provided
        if request.source_url and request.title:
            try:
                source = Source(
                    type="summary",
                    title=f"Summary: {request.title}",
                    content=result["summary"],
                    raw_url=request.source_url,
                    metadata={
                        "key_points": result["key_points"],
                        "style": request.style,
                        "original_word_count": len(request.content.split())
                    }
                )
                db.add(source)
                await db.commit()
            except Exception as e:
                logger.warning(f"Failed to save summary to database: {e}")
        
        return SummarizeResponse(
            summary=result["summary"],
            key_points=result["key_points"],
            word_count=len(result["summary"].split()),
            source_title=request.title
        )
        
    except Exception as e:
        logger.error(f"Summarization error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to summarize content: {str(e)}"
        )


@router.post("/extract-highlights", response_model=ExtractHighlightsResponse)
async def extract_highlights(request: ExtractHighlightsRequest):
    """
    Extract key highlights and topics from content
    """
    if not openai_client:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured"
        )
    
    try:
        prompt = f"""Extract the most important highlights and main topics from this content.

Title: {request.title or 'Untitled'}

Content:
{request.content[:6000]}

Return a JSON object with:
1. "highlights": 5-7 key quotes or insights (as strings)
2. "main_topics": 3-5 main topics covered (as strings)

Format:
{{
  "highlights": ["highlight 1", "highlight 2"],
  "main_topics": ["topic 1", "topic 2"]
}}
"""

        response = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Extract key information and always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"}
        )
        
        import json
        result = json.loads(response.choices[0].message.content)
        
        return ExtractHighlightsResponse(
            highlights=result["highlights"],
            main_topics=result["main_topics"]
        )
        
    except Exception as e:
        logger.error(f"Extract highlights error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to extract highlights: {str(e)}"
        )


@router.post("/ask", response_model=AskResponse)
async def ask_question(
    request: AskRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Ask a question about content
    
    If source_id is provided, the question will be answered based on that source.
    If context is provided, it will be used as reference.
    """
    if not openai_client:
        raise HTTPException(
            status_code=503,
            detail="AI service not configured"
        )
    
    context_text = request.context or ""
    
    # Fetch source content if source_id provided
    if request.source_id:
        result = await db.execute(
            select(Source).where(Source.id == request.source_id)
        )
        source = result.scalar_one_or_none()
        if source:
            context_text = source.content or ""
    
    if not context_text:
        raise HTTPException(
            status_code=400,
            detail="No context or source_id provided"
        )
    
    try:
        prompt = f"""Based on the following content, answer the question.

Content:
{context_text[:6000]}

Question: {request.question}

Provide a clear, accurate answer based only on the content provided.
"""

        response = await openai_client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": "You are a helpful assistant. Answer questions accurately based on the provided content."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1000
        )
        
        answer = response.choices[0].message.content
        
        return AskResponse(
            answer=answer,
            confidence=0.85  # Placeholder confidence
        )
        
    except Exception as e:
        logger.error(f"Ask question error: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to answer question: {str(e)}"
        )
