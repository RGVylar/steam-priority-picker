from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path
import os

class Settings(BaseSettings):
    # App
    app_name: str = "Steam Priority Picker API"
    debug: bool = False
    app_url: str = "http://localhost:5173"
    api_url: str = "http://localhost:8000"
    
    # Database
    database_url: str = "sqlite:///./steam_priority_picker.db"
    
    # APIs
    steam_api_key: str = ""
    
    # JWT
    jwt_secret_key: str = "your-secret-key-change-in-production"
    
    # CORS
    cors_origins: list = ["*"]
    
    class Config:
        # Load from project root .env file
        env_file = str(Path(__file__).parent.parent.parent / ".env")
        case_sensitive = False
        extra = "allow"

# Initialize settings
settings = Settings()

# Override from environment variables if present (for production)
if os.getenv("APP_URL"):
    settings.app_url = os.getenv("APP_URL")
if os.getenv("API_URL"):
    settings.api_url = os.getenv("API_URL")
if os.getenv("STEAM_API_KEY"):
    settings.steam_api_key = os.getenv("STEAM_API_KEY")
if os.getenv("DATABASE_URL"):
    settings.database_url = os.getenv("DATABASE_URL")
if os.getenv("JWT_SECRET_KEY"):
    settings.jwt_secret_key = os.getenv("JWT_SECRET_KEY")
