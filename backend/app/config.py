from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # App
    app_name: str = "Steam Priority Picker API"
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    app_url: str = os.getenv("APP_URL", "http://localhost:5173")
    api_url: str = os.getenv("API_URL", "http://localhost:8000")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    
    # APIs
    steam_api_key: str = os.getenv("STEAM_API_KEY", "")
    
    # JWT
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    
    # CORS
    cors_origins: list = ["*"]
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "allow"

settings = Settings()
