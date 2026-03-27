from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Synapse"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API
    API_V1_PREFIX: str = "/api"
    
    # Database
    DATABASE_URL: str = "postgresql://synapse:synapse@localhost:5432/synapse"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "http://localhost:8001",
        "chrome-extension://*",  # Allow Chrome extensions
    ]
    
    # LLM Configuration
    # Default LLM: GLM-5.1 (Zhipu AI)
    LLM_PROVIDER: str = "zhipu"  # Options: zhipu, openai, anthropic
    LLM_MODEL: str = "glm-5.1"
    LLM_API_KEY: str = ""
    LLM_API_BASE: str = "https://open.bigmodel.cn/api/paas/v4"
    LLM_TEMPERATURE: float = 0.7
    LLM_MAX_TOKENS: int = 4096
    
    # OpenAI (Alternative provider)
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4-turbo-preview"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    
    # Zhipu AI (GLM-5.1 - Default)
    ZHIPU_API_KEY: str = ""
    ZHIPU_MODEL: str = "glm-5.1"  # Options: glm-5.1, glm-4, glm-4-plus
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = "906373584050-qj7pkabvuner8pj1ldqp67ef8jkq1ipt.apps.googleusercontent.com"
    
    # File Upload
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
