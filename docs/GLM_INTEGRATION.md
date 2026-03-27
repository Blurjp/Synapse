# GLM-5.1 Integration

Synapse now uses **GLM-5.1** as the default LLM (Large Language Model) from Zhipu AI.

## Quick Start

### 1. Get Zhipu API Key

1. Visit: https://open.bigmodel.cn
2. Register/Login
3. Get your API key from the console

### 2. Configure Environment

Add to your `backend/.env` file:

```env
# LLM Configuration (Default: GLM-5.1)
LLM_PROVIDER=zhipu
LLM_MODEL=glm-5.1
LLM_API_KEY=your-zhipu-api-key-here
LLM_API_BASE=https://open.bigmodel.cn/api/paas/v4
LLM_TEMPERATURE=0.7
LLM_MAX_TOKENS=4096

# Zhipu AI (GLM-5.1 - Default)
ZHIPU_API_KEY=your-zhipu-api-key-here
ZHIPU_MODEL=glm-5.1
```

### 3. Use in Code

```python
from app.services.llm import llm_service

# Generate response
response = await llm_service.generate(
    "What is Synapse?",
    system_prompt="You are a helpful assistant"
)

# Chat with history
response = await llm_service.chat([
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"},
])
```

## API Endpoints

### Generate Response

```bash
POST /api/llm/generate
{
    "prompt": "Your question here",
    "system_prompt": "You are a helpful assistant"  # optional
}
```

Response:
```json
{
    "response": "AI generated response",
    "model": "glm-5.1",
    "provider": "zhipu"
}
```

### Chat with History

```bash
POST /api/llm/chat
{
    "messages": [
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello"},
        {"role": "assistant", "content": "Hi there!"}
    ]
}
```

## Alternative: OpenAI

To use OpenAI instead:

```env
# LLM Configuration
LLM_PROVIDER=openai
LLM_MODEL=gpt-4-turbo-preview
LLM_API_KEY=your-openai-api-key-here
```

## Features

- ✅ **GLM-5.1** - Default LLM (Zhipu AI)
- ✅ **OpenAI** - Alternative provider
- ✅ **Async Support** - Non-blocking API calls
- ✅ **Configurable** - Temperature, max tokens
- ✅ **Chat History** - Multi-turn conversations

## Pricing

### Zhipu AI (GLM-5.1)
- **~10x cheaper than GPT-4**
- High performance
- Chinese + English support

---

**GLM-5.1 is now the default LLM for Synapse!** 🚀
