from fastapi import APIRouter, Query
from typing import Optional
from ..schemas.game import GameResponse, GameListResponse
from ..services.game_service import game_service

router = APIRouter(prefix="/api", tags=["games"])


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
    playtime_max: float = Query(float('inf'), ge=0),
    score_min: float = Query(0, ge=0, le=100),
    score_max: float = Query(100, ge=0, le=100),
    limit: int = Query(24, ge=1, le=100),
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
