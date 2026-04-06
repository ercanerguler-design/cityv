from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "City-V Smart City Platform"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "city-v-super-secret-key-2024"
    DATABASE_URL: str = "postgresql+psycopg://cityv_user:cityv_secret@localhost:5432/cityv"
    DATABASE_FALLBACK_URL: str = "sqlite:///./cityv_v2.db"
    DB_FALLBACK_ENABLED: bool = True
    CORS_ORIGINS: str = "http://localhost:3000,http://127.0.0.1:3000,http://0.0.0.0:3000"
    CORS_ORIGIN_REGEX: str = r"https?://(localhost|127\.0\.0\.1|0\.0\.0\.0|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+)(:\d+)?$"
    SIMULATION_INTERVAL: int = 5  # seconds
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 720
    ADMIN_BOOTSTRAP_USERNAME: str = "platform-admin"
    ADMIN_BOOTSTRAP_PASSWORD: str = "ChangeMe_123!"

    def get_cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
