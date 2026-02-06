from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    project_name: str = Field(default="Degururu", alias="PROJECT_NAME")
    api_prefix: str = Field(default="/api", alias="API_PREFIX")

    # Database
    database_dsn: str = Field(
        default="postgresql+asyncpg://degururu:degururu2026@localhost:5433/degururu",
        alias="DATABASE_DSN",
    )

    # Security
    jwt_secret_key: str = Field(default="CHANGE_ME", alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(default=60, alias="ACCESS_TOKEN_EXPIRE_MINUTES")

    # CORS
    cors_allow_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"], alias="CORS_ALLOW_ORIGINS")


@lru_cache
def get_settings() -> Settings:
    return Settings()
