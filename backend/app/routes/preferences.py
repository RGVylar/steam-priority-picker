from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional
import logging
from ..models import UserPreferences, User
from ..database import get_db
from .auth import get_current_user

logger = logging.getLogger(__name__)

# Request/Response models
class UserPreferencesRequest(BaseModel):
    show_played_games: Optional[bool] = True
    show_unplayed_games: Optional[bool] = True
    playtime_min: Optional[float] = 0
    playtime_max: Optional[float] = 1000
    score_min: Optional[int] = 0
    score_max: Optional[int] = 100
    sort_by: Optional[str] = "name"
    sort_order: Optional[str] = "asc"
    items_per_page: Optional[int] = 50
    last_search_query: Optional[str] = ""

class UserPreferencesResponse(BaseModel):
    show_played_games: bool
    show_unplayed_games: bool
    playtime_min: float
    playtime_max: float
    score_min: int
    score_max: int
    sort_by: str
    sort_order: str
    items_per_page: int
    last_search_query: str

router = APIRouter(prefix="/api/preferences", tags=["preferences"])


@router.get("/", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's filter and display preferences"""
    try:
        preferences = db.query(UserPreferences).filter(
            UserPreferences.user_id == current_user.id
        ).first()
        
        if not preferences:
            # Return default preferences if none exist
            return UserPreferencesResponse(
                show_played_games=True,
                show_unplayed_games=True,
                playtime_min=0,
                playtime_max=1000,
                score_min=0,
                score_max=100,
                sort_by="name",
                sort_order="asc",
                items_per_page=50,
                last_search_query=""
            )
        
        return UserPreferencesResponse(**preferences.to_dict())
    except Exception as e:
        logger.error(f"Error getting preferences for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/", response_model=UserPreferencesResponse)
async def update_user_preferences(
    preferences_data: UserPreferencesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's filter and display preferences"""
    try:
        # Get existing preferences or create new ones
        preferences = db.query(UserPreferences).filter(
            UserPreferences.user_id == current_user.id
        ).first()
        
        if not preferences:
            preferences = UserPreferences(user_id=current_user.id)
            db.add(preferences)
        
        # Update preferences with provided data
        for field, value in preferences_data.dict(exclude_unset=True).items():
            if hasattr(preferences, field):
                setattr(preferences, field, value)
        
        db.commit()
        db.refresh(preferences)
        
        logger.info(f"Updated preferences for user {current_user.id}")
        return UserPreferencesResponse(**preferences.to_dict())
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating preferences for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/")
async def reset_user_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset user's preferences to defaults"""
    try:
        preferences = db.query(UserPreferences).filter(
            UserPreferences.user_id == current_user.id
        ).first()
        
        if preferences:
            db.delete(preferences)
            db.commit()
            logger.info(f"Reset preferences for user {current_user.id}")
        
        return {
            "status": "success",
            "message": "Preferences reset to defaults"
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error resetting preferences for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))