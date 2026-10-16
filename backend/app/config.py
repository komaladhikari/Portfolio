from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    name: str = "Somewhere, a Star API"
    environment: str = "development"
    debug: bool = False
    database_url: str = "sqlite:///./somewhere_star.db"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    allowed_hosts: str = "localhost,127.0.0.1,testserver"
    wish_submit_rate_limit: int = Field(default=10, gt=0)
    wish_grant_rate_limit: int = Field(default=30, gt=0)
    rate_limit_window_seconds: int = Field(default=60, gt=0)

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def trusted_hosts(self) -> list[str]:
        return [host.strip() for host in self.allowed_hosts.split(",") if host.strip()]

    @model_validator(mode="after")
    def validate_production_settings(self) -> "Settings":
        if self.environment.lower() != "production":
            return self
        if self.debug:
            raise ValueError("APP_DEBUG must be false in production")
        if not self.allowed_origins:
            raise ValueError("APP_CORS_ORIGINS must contain at least one origin in production")
        if "*" in self.allowed_origins:
            raise ValueError("APP_CORS_ORIGINS cannot contain '*' in production")
        if not self.trusted_hosts:
            raise ValueError("APP_ALLOWED_HOSTS must contain at least one host in production")
        if "*" in self.trusted_hosts:
            raise ValueError("APP_ALLOWED_HOSTS cannot contain '*' in production")
        if not self.database_url.startswith(("postgresql://", "postgresql+psycopg://")):
            raise ValueError("APP_DATABASE_URL must use PostgreSQL in production")
        return self

    model_config = SettingsConfigDict(
        env_file=".env",
        env_prefix="APP_",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
