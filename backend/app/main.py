from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .middleware.cors import setup_cors
from .config import settings
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Steam Priority Picker API",
    description="API for Steam game priority picker web application",
    version="0.1.0",
)

# Setup CORS
setup_cors(app)

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
