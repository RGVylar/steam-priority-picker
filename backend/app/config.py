from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # App
    app_name: str = "Steam Priority Picker API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # APIs
    steam_api_key: str = os.getenv("STEAM_API_KEY", "")
    
    # CORS
    cors_origins: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

settings = Settings()
