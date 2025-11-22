from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.cors import setup_cors
from .config import settings
from .routes.games import router as games_router
from .routes.auth import router as auth_router
from .database import engine
from .models import Base
import logging

# Version identifier for deployment tracking
APP_VERSION = "2025-11-22-v3"

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"🚀 FastAPI app initialized - VERSION: {APP_VERSION}")
logger.info(f"📍 APP_URL configured as: {settings.app_url}")
logger.info(f"🔑 STEAM_API_KEY set: {'Yes' if settings.steam_api_key else 'No'}")

# Create database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title="Steam Priority Picker API",
    description="API for Steam game priority picker web application",
    version="0.1.0",
)

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(games_router)
app.include_router(auth_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "Steam Priority Picker API",
        "version": "0.1.0"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to Steam Priority Picker API",
        "docs": "/docs",
        "health": "/health"
    }

logger.info("FastAPI app initialized")
