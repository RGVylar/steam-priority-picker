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


@router.get("/stats")
async def get_stats():
    """Get database statistics"""
    return {
        "total_games": len(game_service.games)
    }


@router.get("/my-games")
async def get_my_games(
    authorization: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get authenticated user's games from Steam library with personal playtime"""
    from ..models import UserGame, Game as GameModel
    
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
    
    # Get list of owned games with playtime
    owned_app_ids = {}
    if "games" in owned_games_data:
        for game in owned_games_data["games"]:
            owned_app_ids[game["appid"]] = game.get("playtime_forever", 0) / 60  # Convert minutes to hours
    
    logger.info(f"User owns {len(owned_app_ids)} games")
    
    # Get or create user_game records for all owned games
    user_games_response = []
    
    for app_id, playtime_hours in owned_app_ids.items():
        # Get game info from database
        game = db.query(GameModel).filter(GameModel.app_id == app_id).first()
        
        # Get or create user_game record
        user_game = db.query(UserGame).filter(
            UserGame.user_id == user.id,
            UserGame.app_id == app_id
        ).first()
        
        if not user_game:
            user_game = UserGame(
                user_id=user.id,
                app_id=app_id,
                playtime_hours=playtime_hours
            )
            db.add(user_game)
        else:
            # Update playtime if changed
            user_game.playtime_hours = playtime_hours
        
        # Build response with user's personal playtime
        if game:
            game_dict = {
                "app_id": game.app_id,
                "name": game.name,
                "header_image": game.header_image,
                "playtime_hours": playtime_hours,  # User's personal playtime
                "score": game.score,
                "total_reviews": game.total_reviews
            }
        else:
            # Unknown game - will be fetched
            game_dict = {
                "app_id": app_id,
                "name": f"Game {app_id}",
                "header_image": "",
                "playtime_hours": playtime_hours,
                "score": 0,
                "total_reviews": 0
            }
        
        user_games_response.append(game_dict)
    
    # Find unknown games
    known_app_ids = {g.get("app_id") for g in game_service.games}
    unknown_app_ids = [aid for aid in owned_app_ids.keys() if aid not in known_app_ids]
    
    logger.info(f"Found {len(owned_app_ids) - len(unknown_app_ids)} known games, {len(unknown_app_ids)} unknown games")
    
    # Fetch and save unknown games
    if unknown_app_ids:
        logger.info(f"Fetching info for {len(unknown_app_ids)} unknown games...")
        unknown_games = await auth_service.fetch_unknown_games_info(unknown_app_ids)
        
        if unknown_games:
            game_service.add_games(unknown_games)
            
            # Update response with newly fetched game info
            for game_dict in user_games_response:
                if game_dict["app_id"] in unknown_app_ids:
                    for unknown_game in unknown_games:
                        if unknown_game["app_id"] == game_dict["app_id"]:
                            # Update with fetched info, but keep user's playtime
                            personal_playtime = game_dict["playtime_hours"]
                            game_dict.update(unknown_game)
                            game_dict["playtime_hours"] = personal_playtime
                            break
            
            logger.info(f"Added {len(unknown_games)} new games to database. Total: {len(game_service.games)}")
    
    # Commit all user_game changes
    db.commit()
    
    return {
        "total": len(user_games_response),
        "games": user_games_response,
        "db_total": len(game_service.games)  # Send total DB count for UI
    }
