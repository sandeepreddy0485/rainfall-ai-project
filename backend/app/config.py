from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl
from typing import List


class Settings(BaseSettings):
    environment: str = "development"
    # list of allowed origins for CORS; use comma-separated values in .env
    cors_origins: List[AnyHttpUrl] = []

    # caching / redis
    redis_url: str = "redis://localhost:6379/0"

    # API timeouts (seconds)
    open_meteo_timeout: int = 10
    nominatim_timeout: int = 10

    # drought predictor defaults
    normal_rainfall_mm_per_week: float = 20.0

    # rate limiting policy
    rate_limit: str = "10/minute"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
