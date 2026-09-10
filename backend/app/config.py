import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BASE_DIR / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "CloudOps AI"
    APP_VERSION: str = "2.0.0"
    AWS_REGION: str = "us-east-1"
    BEDROCK_MODEL_ID: str = "amazon.nova-lite-v1:0"

    # Groq AI Copilot (platform-owned key)
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "qwen/qwen3.8-27b"

    # Session management
    SESSION_TTL_SECONDS: int = 3600          # 1 hour session TTL
    SESSION_CLEANUP_INTERVAL: int = 300      # Cleanup every 5 minutes

    # Response caching (per session, TTL in seconds)
    CACHE_TTL_SECONDS: int = 300             # 5 minute dashboard cache

    # Parallel AWS call workers
    MAX_WORKERS: int = 8

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
