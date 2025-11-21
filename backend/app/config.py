from pydantic_settings import BaseSettings
from typing import Optional
from pathlib import Path

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

settings = Settings()
