from fastapi import APIRouter, Query, Header, HTTPException, Depends
from typing import Optional
from sqlalchemy.orm import Session
from ..schemas.game import GameResponse, GameListResponse
from ..services.game_service import game_service
from ..services.auth_service import SteamAuthService
from ..database import get_db
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["games"])
auth_service = SteamAuthService()


@router.get("/games", response_model=GameListResponse)
async def get_games(
    limit: int = Query(24, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    """Get all games with pagination"""
    games, total = game_service.get_all_games(limit=limit, offset=offset)
    return {
        "total": total,
        "games": games
    }


@router.get("/games/{app_id}", response_model=GameResponse)
async def get_game(app_id: int):
    """Get a specific game by app_id"""
    game = game_service.get_game_by_id(app_id)
    if not game:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail=f"Game with app_id {app_id} not found")
    return game


@router.get("/search", response_model=GameListResponse)
async def search_games(
    q: Optional[str] = Query(None, min_length=1),
    playtime_min: float = Query(0, ge=0),
    playtime_max: float = Query(10000, ge=0),
    score_min: float = Query(0, ge=0, le=100),
    score_max: float = Query(100, ge=0, le=100),
    limit: int = Query(24, ge=1, le=10000),
    offset: int = Query(0, ge=0),
):
    """Search and filter games"""
    games, total = game_service.search_games(
        query=q,
        playtime_min=playtime_min,
        playtime_max=playtime_max,
        score_min=score_min,
        score_max=score_max,
        limit=limit,
        offset=offset
    )
    return {
        "total": total,
        "games": games
    }


@router.get("/filters")
async def get_filters():
    """Get available filter options"""
    if not game_service.games:
        return {
            "playtime": {"min": 0, "max": 0},
            "score": {"min": 0, "max": 100},
            "total_games": 0
        }
    
    playtimes = [g.get('playtime_hours', 0) for g in game_service.games]
    scores = [g.get('score', 0) for g in game_service.games]
    
    return {
        "playtime": {
            "min": min(playtimes) if playtimes else 0,
            "max": max(playtimes) if playtimes else 0
        },
        "score": {
            "min": min(scores) if scores else 0,
            "max": max(scores) if scores else 100
        },
        "total_games": len(game_service.games)
    }


@router.get("/my-games")
async def get_my_games(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get authenticated user's games from Steam library"""
    
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    # Verify token and get user
    user = auth_service.verify_token(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    logger.info(f"Fetching games for user: {user.username} (Steam ID: {user.steam_id})")
    
    # Get user's owned games from Steam API
    owned_games_data = await auth_service.get_user_owned_games(user.steam_id)
    
    if not owned_games_data:
        logger.warning(f"Could not fetch games for {user.steam_id}")
        return {
            "total": 0,
            "games": [],
            "message": "Could not fetch games from Steam API"
        }
    
    # Get list of app_ids owned by user
    owned_app_ids = set()
    if "games" in owned_games_data:
        owned_app_ids = {game["appid"] for game in owned_games_data["games"]}
    
    logger.info(f"User owns {len(owned_app_ids)} games")
    
    # Filter our games database to only show owned games
    user_games = [g for g in game_service.games if g.get("app_id") in owned_app_ids]
    
    logger.info(f"Found {len(user_games)} games in our database for user {user.username}")
    
    return {
        "total": len(user_games),
        "games": user_games
    }
