"""
LLM API Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict
from app.services.llm import llm_service

router = APIRouter()


class GenerateRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class GenerateResponse(BaseModel):
    response: str
    model: str
    provider: str


class ChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


class ChatResponse(BaseModel):
    response: str
    model: str
    provider: str


@router.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    """
    Generate response from LLM
    
    Default: GLM-5.1 (Zhipu AI)
    """
    try:
        response = await llm_service.generate(
            prompt=request.prompt,
            system_prompt=request.system_prompt,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        return GenerateResponse(
            response=response,
            model=llm_service.model,
            provider=llm_service.provider
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with conversation history
    
    Default: GLM-5.1 (Zhipu AI)
    """
    try:
        response = await llm_service.chat(
            messages=request.messages,
            temperature=request.temperature,
            max_tokens=request.max_tokens
        )
        return ChatResponse(
            response=response,
            model=llm_service.model,
            provider=llm_service.provider
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
