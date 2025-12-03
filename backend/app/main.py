from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .middleware.cors import setup_cors
from .config import settings
from .routes.games import router as games_router
from .routes.auth import router as auth_router
from .routes.played_games import router as played_games_router
from .routes.preferences import router as preferences_router
from .database import engine
from .models import Base
from .services.health_monitor import get_health_monitor
import logging
from datetime import datetime

# Version identifier for deployment tracking
APP_VERSION = "2025-11-24-v1.0.0"
APP_START_TIME = datetime.utcnow()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

logger.info(f"🚀 FastAPI app initialized - VERSION: {APP_VERSION}")
logger.info(f"📍 APP_URL configured as: {settings.app_url}")
logger.info(f"🔑 STEAM_API_KEY set: {'Yes' if settings.steam_api_key else 'No'}")

# Create database tables
Base.metadata.create_all(bind=engine)

# Health monitor lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    health_monitor = get_health_monitor(settings.app_url, interval_minutes=10)
    await health_monitor.start()
    logger.info("🏥 Health monitor iniciado - Ping cada 10 minutos")
    
    yield
    
    # Shutdown
    await health_monitor.stop()
    logger.info("🏥 Health monitor detenido")

# Create FastAPI app
app = FastAPI(
    title="Steam Priority Picker API",
    description="API for Steam game priority picker web application",
    version="0.1.0",
    lifespan=lifespan,
)

# Setup CORS
setup_cors(app)

# Include routers
app.include_router(games_router)
app.include_router(auth_router)
app.include_router(played_games_router)
app.include_router(preferences_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    uptime_seconds = (datetime.utcnow() - APP_START_TIME).total_seconds()
    hours = int(uptime_seconds // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    
    return {
        "status": "ok",
        "service": "Steam Priority Picker API",
        "version": "0.1.0",
        "uptime_seconds": int(uptime_seconds),
        "uptime_formatted": f"{hours}h {minutes}m"
    }

@app.get("/")
async def root():
    return {
        "message": "Welcome to Steam Priority Picker API",
        "docs": "/docs",
        "health": "/health"
    }

logger.info("FastAPI app initialized")
