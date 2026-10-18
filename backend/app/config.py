"""
Configuration module for SellerBoost AI backend.
Loads settings from environment variables with sensible defaults.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "gemma2:2b"
    frontend_origin: str = "http://localhost:5173"

    # Timeouts (seconds)
    ollama_connect_timeout: float = 10.0
    ollama_generate_timeout: float = 240.0

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
