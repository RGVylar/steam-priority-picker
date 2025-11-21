"""
Authentication routes
"""
from fastapi import APIRouter, Depends, HTTPException, Request, Response, Header
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.auth_service import SteamAuthService
from ..models import User
from ..config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["auth"])
auth_service = SteamAuthService()

@router.get("/login")
async def login():
    """Redirect to Steam login"""
    login_url = auth_service.get_login_url()
    return {"login_url": login_url}

@router.get("/callback")
async def auth_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    """Steam OAuth callback endpoint"""
    
    query_params = dict(request.query_params)
    
    # Verify Steam ID
    steam_id = await auth_service.verify_steam_id(query_params)
    
    if not steam_id:
        logger.error("Steam ID verification failed")
        # Redirect to frontend with error
        return RedirectResponse(url=f"{settings.app_url}?error=steam_auth_failed")
    
    logger.info(f"Steam ID verified: {steam_id}")
    
    # Get Steam profile
    steam_profile = await auth_service.get_steam_profile(steam_id)
    
    if not steam_profile:
        logger.error(f"Could not fetch profile for {steam_id}")
        # Redirect to frontend with error
        return RedirectResponse(url=f"{settings.app_url}?error=profile_fetch_failed")
    
    logger.info(f"Steam profile fetched: {steam_profile['username']}")
    
    # Create or update user
    user = auth_service.create_or_update_user(db, steam_profile)
    logger.info(f"User {user.username} created/updated")
    
    # Create session
    token, session = auth_service.create_session(db, user)
    
    # Redirect to frontend with token
    return RedirectResponse(url=f"{settings.app_url}?token={token}")

@router.get("/user")
async def get_current_user(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Extract token from "Bearer <token>"
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    user = auth_service.verify_token(db, token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return {
        "id": user.id,
        "steam_id": user.steam_id,
        "username": user.username,
        "avatar_url": user.avatar_url,
        "profile_url": user.profile_url,
    }

@router.post("/logout")
async def logout(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Logout user"""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    success = auth_service.logout_user(db, token)
    
    if not success:
        raise HTTPException(status_code=400, detail="Logout failed")
    
    return {"message": "Logged out successfully"}
