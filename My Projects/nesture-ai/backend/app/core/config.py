from typing import List, Any
import os

# Use pydantic-settings when available (Docker), stdlib fallback for local tests
try:
    from pydantic import field_validator
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        ENV: str = "development"
        DATA_DIR: str = os.path.join(os.path.dirname(__file__), "..", "data")
        # CORS_ORIGINS accepts either:
        #   - a JSON list:   '["http://localhost:3000"]'
        #   - a comma-sep:   'http://localhost:3000,http://localhost:80'
        #   - a single URL:  'http://localhost:3000'
        CORS_ORIGINS: Any = ["http://localhost:3000", "http://localhost:80"]
        SECRET_KEY: str = "nesture-ai-secret-key-change-in-production"
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

        @field_validator("CORS_ORIGINS", mode="before")
        @classmethod
        def parse_cors(cls, v: Any) -> List[str]:
            if isinstance(v, list):
                return v
            if isinstance(v, str):
                v = v.strip()
                if v.startswith("["):
                    import json
                    return json.loads(v)
                return [origin.strip() for origin in v.split(",") if origin.strip()]
            return v

        class Config:
            env_file = ".env"

    settings = Settings()

except ImportError:
    # Fallback for environments without pydantic-settings (local testing)
    class _Settings:
        ENV: str = os.getenv("ENV", "development")
        DATA_DIR: str = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "..", "data"))
        CORS_ORIGINS: List[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:80").split(",")
        SECRET_KEY: str = os.getenv("SECRET_KEY", "nesture-ai-secret-key-change-in-production")
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    settings = _Settings()

