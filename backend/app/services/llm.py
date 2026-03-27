"""
LLM Service - GLM-5.1 Integration

Default LLM: GLM-5.1 by Zhipu AI
"""
import httpx
from typing import Optional, List, Dict, Any
from app.core.config import settings


class LLMService:
    """
    LLM Service for Synapse
    Default: GLM-5.1 (Zhipu AI)
    """
    
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        self.api_key = self._get_api_key()
        self.api_base = settings.LLM_API_BASE
        self.temperature = settings.LLM_TEMPERATURE
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.client = httpx.AsyncClient(timeout=60.0)
    
    def _get_api_key(self) -> str:
        """Get API key based on provider"""
        if self.provider == "zhipu":
            return settings.ZHIPU_API_KEY or settings.LLM_API_KEY
        elif self.provider == "openai":
            return settings.OPENAI_API_KEY or settings.LLM_API_KEY
        else:
            return settings.LLM_API_KEY
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """
        Generate response from LLM
        
        Args:
            prompt: User prompt
            system_prompt: System prompt (optional)
            temperature: Override default temperature
            max_tokens: Override default max tokens
            
        Returns:
            Generated text response
        """
        if self.provider == "zhipu":
            return await self._generate_zhipu(
                prompt, system_prompt, temperature, max_tokens, **kwargs
            )
        elif self.provider == "openai":
            return await self._generate_openai(
                prompt, system_prompt, temperature, max_tokens, **kwargs
            )
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    async def _generate_zhipu(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """
        Generate using Zhipu AI GLM-5.1
        
        API Documentation: https://open.bigmodel.cn/dev/api
        """
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            **kwargs
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = await self.client.post(
                f"{self.api_base}/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise Exception(f"Zhipu API error: {e.response.text}")
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    async def _generate_openai(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """
        Generate using OpenAI (alternative provider)
        """
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            **kwargs
        }
        
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise Exception(f"OpenAI API error: {e.response.text}")
        except Exception as e:
            raise Exception(f"LLM generation failed: {str(e)}")
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """
        Chat with conversation history
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            temperature: Override default temperature
            max_tokens: Override default max tokens
            
        Returns:
            Generated response
        """
        if self.provider == "zhipu":
            return await self._chat_zhipu(messages, temperature, max_tokens, **kwargs)
        elif self.provider == "openai":
            return await self._chat_openai(messages, temperature, max_tokens, **kwargs)
        else:
            raise ValueError(f"Unsupported LLM provider: {self.provider}")
    
    async def _chat_zhipu(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """Chat using Zhipu AI"""
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            **kwargs
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        try:
            response = await self.client.post(
                f"{self.api_base}/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise Exception(f"Zhipu API error: {e.response.text}")
        except Exception as e:
            raise Exception(f"Chat failed: {str(e)}")
    
    async def _chat_openai(
        self,
        messages: List[Dict[str, str]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """Chat using OpenAI"""
        payload = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature or self.temperature,
            "max_tokens": max_tokens or self.max_tokens,
            **kwargs
        }
        
        headers = {
            "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            response = await self.client.post(
                "https://api.openai.com/v1/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]
        except httpx.HTTPStatusError as e:
            raise Exception(f"OpenAI API error: {e.response.text}")
        except Exception as e:
            raise Exception(f"Chat failed: {str(e)}")
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()


# Singleton instance
llm_service = LLMService()
