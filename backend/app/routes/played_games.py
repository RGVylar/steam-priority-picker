from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import delete
from typing import List
import logging
from ..models import UserPlayedGame, User
from ..database import get_db
from .auth import get_current_user

logger = logging.getLogger(__name__)

# Request model
class SyncPlayedGamesRequest(BaseModel):
    app_ids: List[int]

router = APIRouter(prefix="/api/played-games", tags=["played-games"])


@router.get("/")
async def get_played_games(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all app_ids of games marked as played by the current user"""
    try:
        played_games = db.query(UserPlayedGame.app_id).filter(
            UserPlayedGame.user_id == current_user.id
        ).all()
        
        # Return as list of integers
        app_ids = [game.app_id for game in played_games]
        return {"played_games": app_ids}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/")
async def sync_played_games(
    request: SyncPlayedGamesRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Sync played games status from client.
    Replaces all played games with the provided list.
    
    Request body: {"app_ids": [123456, 789012, ...]}
    """
    try:
        logger.info(f"Syncing played games for user {current_user.id}: {request.app_ids}")
        app_ids = request.app_ids
        
        if not isinstance(app_ids, list):
            raise HTTPException(status_code=400, detail="app_ids must be a list")
        
        # Delete all existing played games for this user
        deleted_count = db.query(UserPlayedGame).filter(
            UserPlayedGame.user_id == current_user.id
        ).delete(synchronize_session=False)
        logger.info(f"Deleted {deleted_count} played games for user {current_user.id}")
        
        # Add new played games
        for app_id in app_ids:
            if isinstance(app_id, int):
                played_game = UserPlayedGame(
                    user_id=current_user.id,
                    app_id=app_id
                )
                db.add(played_game)
        
        db.commit()
        logger.info(f"Successfully synced {len(app_ids)} played games for user {current_user.id}")
        return {
            "status": "success",
            "message": f"Synced {len(app_ids)} played games",
            "app_ids": app_ids
        }
    except Exception as e:
        db.rollback()
        logger.error(f"Error syncing played games for user {current_user.id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/toggle/{app_id}")
async def toggle_played_game(
    app_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle a game as played/unplayed"""
    try:
        existing = db.query(UserPlayedGame).filter(
            UserPlayedGame.user_id == current_user.id,
            UserPlayedGame.app_id == app_id
        ).first()
        
        if existing:
            # Remove from played
            db.delete(existing)
            db.commit()
            return {"status": "removed", "app_id": app_id, "is_played": False}
        else:
            # Add to played
            played_game = UserPlayedGame(
                user_id=current_user.id,
                app_id=app_id
            )
            db.add(played_game)
            db.commit()
            return {"status": "added", "app_id": app_id, "is_played": True}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
