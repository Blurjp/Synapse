"""
Tests for LLM Service - GLM-5.1
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from app.services.llm import LLMService


class TestLLMService:
    """Test LLM Service with GLM-5.1"""
    
    @pytest.fixture
    def llm_service(self):
        """Create LLM service instance"""
        with patch('app.services.llm.settings') as mock_settings:
            mock_settings.LLM_PROVIDER = "zhipu"
            mock_settings.LLM_MODEL = "glm-5.1"
            mock_settings.LLM_API_KEY = "test-api-key"
            mock_settings.LLM_API_BASE = "https://open.bigmodel.cn/api/paas/v4"
            mock_settings.LLM_TEMPERATURE = 0.7
            mock_settings.LLM_MAX_TOKENS = 4096
            mock_settings.ZHIPU_API_KEY = "test-api-key"
            mock_settings.OPENAI_API_KEY = ""
            mock_settings.OPENAI_MODEL = "gpt-4-turbo-preview"
            
            service = LLMService()
            yield service
            # Cleanup
            import asyncio
            asyncio.run(service.close())
    
    @pytest.mark.asyncio
    async def test_generate_with_zhipu(self, llm_service):
        """Test generation with Zhipu GLM-5.1"""
        mock_response = {
            "choices": [
                {
                    "message": {
                        "content": "This is a test response from GLM-5.1"
                    }
                }
            ]
        }
        
        with patch.object(llm_service.client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = MagicMock(
                json=lambda: mock_response,
                raise_for_status=lambda: None
            )
            
            response = await llm_service.generate("Test prompt")
            
            assert response == "This is a test response from GLM-5.1"
            mock_post.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_generate_with_system_prompt(self, llm_service):
        """Test generation with system prompt"""
        mock_response = {
            "choices": [
                {
                    "message": {
                        "content": "Response with system context"
                    }
                }
            ]
        }
        
        with patch.object(llm_service.client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = MagicMock(
                json=lambda: mock_response,
                raise_for_status=lambda: None
            )
            
            response = await llm_service.generate(
                "Test prompt",
                system_prompt="You are a helpful assistant"
            )
            
            assert response == "Response with system context"
    
    @pytest.mark.asyncio
    async def test_chat_with_messages(self, llm_service):
        """Test chat with conversation history"""
        mock_response = {
            "choices": [
                {
                    "message": {
                        "content": "Chat response"
                    }
                }
            ]
        }
        
        messages = [
            {"role": "system", "content": "You are helpful"},
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi there!"},
            {"role": "user", "content": "How are you?"}
        ]
        
        with patch.object(llm_service.client, 'post', new_callable=AsyncMock) as mock_post:
            mock_post.return_value = MagicMock(
                json=lambda: mock_response,
                raise_for_status=lambda: None
            )
            
            response = await llm_service.chat(messages)
            
            assert response == "Chat response"
