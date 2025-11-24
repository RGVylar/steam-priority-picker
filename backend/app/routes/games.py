from fastapi import APIRouter, Query, Header, HTTPException, Depends
from fastapi.responses import StreamingResponse
from typing import Optional
from sqlalchemy.orm import Session
from ..schemas.game import GameResponse, GameListResponse
from ..services.game_service import game_service
from ..services.auth_service import SteamAuthService
from ..database import get_db
from ..models import User, UserPreferences, UserPlayedGame
from .auth import get_current_user
import logging
import time
import json

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


@router.get("/search-with-preferences", response_model=GameListResponse)
async def search_games_with_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    q: Optional[str] = Query(None, min_length=1),
    playtime_min: Optional[float] = Query(None, ge=0),
    playtime_max: Optional[float] = Query(None, ge=0),
    score_min: Optional[float] = Query(None, ge=0, le=100),
    score_max: Optional[float] = Query(None, ge=0, le=100),
    show_played_games: Optional[bool] = Query(None),
    show_unplayed_games: Optional[bool] = Query(None),
    sort_by: Optional[str] = Query(None),
    sort_order: Optional[str] = Query(None),
    limit: Optional[int] = Query(None, ge=1, le=10000),
    offset: int = Query(0, ge=0),
):
    """Search and filter games using user's saved preferences as defaults"""
    
    # Get user's preferences
    preferences = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()
    
    # Use query parameters if provided, otherwise use preferences, otherwise use defaults
    final_playtime_min = playtime_min if playtime_min is not None else (preferences.playtime_min if preferences else 0)
    final_playtime_max = playtime_max if playtime_max is not None else (preferences.playtime_max if preferences else 1000)
    final_score_min = score_min if score_min is not None else (preferences.score_min if preferences else 0)
    final_score_max = score_max if score_max is not None else (preferences.score_max if preferences else 100)
    final_show_played = show_played_games if show_played_games is not None else (preferences.show_played_games if preferences else True)
    final_show_unplayed = show_unplayed_games if show_unplayed_games is not None else (preferences.show_unplayed_games if preferences else True)
    final_sort_by = sort_by if sort_by is not None else (preferences.sort_by if preferences else "name")
    final_sort_order = sort_order if sort_order is not None else (preferences.sort_order if preferences else "asc")
    final_limit = limit if limit is not None else (preferences.items_per_page if preferences else 24)
    
    # Get user's played games for filtering
    played_games = db.query(UserPlayedGame.app_id).filter(
        UserPlayedGame.user_id == current_user.id
    ).all()
    played_game_ids = {game.app_id for game in played_games}
    
    games, total = game_service.search_games(
        query=q,
        playtime_min=final_playtime_min,
        playtime_max=final_playtime_max,
        score_min=final_score_min,
        score_max=final_score_max,
        limit=final_limit,
        offset=offset,
        show_played_games=final_show_played,
        show_unplayed_games=final_show_unplayed,
        played_game_ids=played_game_ids,
        sort_by=final_sort_by,
        sort_order=final_sort_order
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
    
    start_time = time.time()
    logger.debug("⏱️ ========== START /my-games request ==========")
    
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
    
    logger.debug(f"Fetching games for user: {user.username} (Steam ID: {user.steam_id})")
    
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
    
    logger.debug(f"User owns {len(owned_app_ids)} games")
    
    # Find unknown games - query DB directly
    known_games = db.query(GameModel.app_id, GameModel.name).filter(GameModel.app_id.in_(list(owned_app_ids.keys()))).all()
    known_app_ids = {g.app_id for g in known_games}
    games_with_generic_names = {g.app_id for g in known_games if g.name.startswith("Game ")}
    
    # Unknown games = either not in DB, or have generic names (need to refetch from Steam)
    unknown_app_ids = [aid for aid in owned_app_ids.keys() if aid not in known_app_ids or aid in games_with_generic_names]
    
    logger.debug(f"Found {len(known_app_ids)} known games, {len(unknown_app_ids)} unknown/generic games ({len(games_with_generic_names)} with generic names)")
    
    # Fetch and save unknown games FIRST (process in batches of 50 to avoid timeouts)
    if unknown_app_ids:
        logger.debug(f"Found {len(unknown_app_ids)} unknown games - processing in batches of 50...")
        
        # Process all unknown games in batches of 50
        for batch_start in range(0, len(unknown_app_ids), 50):
            batch_end = min(batch_start + 50, len(unknown_app_ids))
            unknown_app_ids_to_fetch = unknown_app_ids[batch_start:batch_end]
            logger.debug(f"Fetching batch {batch_start//50 + 1}: games {batch_start+1}-{batch_end} of {len(unknown_app_ids)}...")
            
            unknown_games = await auth_service.fetch_unknown_games_info(unknown_app_ids_to_fetch, db)
            
            if unknown_games:
                # Insert games directly into database in a separate transaction
                games_added = 0
                logger.debug(f"Processing {len(unknown_games)} unknown games from Steam API (batch {batch_start//50 + 1})")
                
                for game_data in unknown_games:
                    try:
                        app_id = game_data.get("app_id")
                        new_name = game_data.get("name", "Unknown")
                        logger.debug(f"Processing game: app_id={app_id}, name={new_name}")
                        
                        # Check if already exists
                        existing = db.query(GameModel).filter(GameModel.app_id == app_id).first()
                        if existing:
                            # Game already exists in database, skip
                            logger.debug(f"Game {app_id} already in database, skipping")
                            continue
                        
                        game = GameModel(
                            app_id=app_id,
                            name=new_name,
                            header_image=game_data.get("header_image", ""),
                            playtime_hours=game_data.get("playtime_hours", 0),
                            score=game_data.get("score", 0),
                            total_reviews=game_data.get("total_reviews", 0),
                            hltb_url=game_data.get("hltb_url")
                        )
                        db.add(game)
                        games_added += 1
                        logger.debug(f"✅ Added game {app_id} to session")
                    except Exception as e:
                        logger.error(f"❌ Error processing game {game_data.get('app_id')}: {e}", exc_info=True)
                        continue
                
                if games_added > 0:
                    # COMMIT the games in a fresh transaction
                    try:
                        logger.debug(f"Committing {games_added} games to database (batch {batch_start//50 + 1})...")
                        db.commit()
                        logger.debug(f"✅ Successfully committed {games_added} games")
                        
                        # Verify games were actually saved
                        for game_data in unknown_games:
                            app_id = game_data.get("app_id")
                            verified = db.query(GameModel).filter(GameModel.app_id == app_id).first()
                            if verified:
                                logger.debug(f"✅ Verified game {app_id} is in database")
                            else:
                                logger.error(f"❌ VERIFICATION FAILED: Game {app_id} NOT found in database after commit!")
                    except Exception as e:
                        logger.error(f"❌ Failed to commit games (batch {batch_start//50 + 1}): {e}", exc_info=True)
                        db.rollback()
                        raise
            
            logger.debug(f"✅ Batch {batch_start//50 + 1} complete")
    
    # NOW create user_game records ONLY for games that exist in the database
    # Use a single efficient query to get all games at once instead of looping
    user_games_response = []
    
    # Get ALL games from database in ONE query (much faster than looping)
    all_games = db.query(GameModel).all()
    games_by_app_id = {g.app_id: g for g in all_games}
    
    logger.debug(f"Games table has {len(games_by_app_id)} games total")
    
    # Only process games that actually exist in the database
    valid_app_ids = [aid for aid in owned_app_ids.keys() if aid in games_by_app_id]
    logger.debug(f"User has {len(valid_app_ids)} games that exist in database, {len(owned_app_ids) - len(valid_app_ids)} delisted/not found")
    
    for app_id in valid_app_ids:
        playtime_hours = owned_app_ids[app_id]
        game = games_by_app_id[app_id]  # Already fetched above
        
        
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
        
        # Build response with user's personal playtime using game.to_dict()
        game_dict = game.to_dict()
        # game_dict already has hltb_hours from to_dict() - don't override it
        game_dict["playtime_hours"] = playtime_hours  # Override with user's personal playtime
        
        user_games_response.append(game_dict)
    
    # Commit all user_game changes only if there are games to add
    if user_games_response:
        try:
            logger.debug(f"Committing {len(user_games_response)} user_game records...")
            db.commit()
            logger.info(f"✅ Successfully committed {len(user_games_response)} user_game records")
        except Exception as e:
            logger.error(f"❌ Failed to commit user_game records: {e}", exc_info=True)
            db.rollback()
            # Return with games from response even if DB commit failed
            # (games are valid, just DB insert had issues)
            logger.warning(f"⚠️ Returning {len(user_games_response)} games despite DB commit error")
    else:
        logger.info("No valid user_game records to commit (all games delisted or not found)")
    
    # Reload game service cache after any database changes
    # Only reload if the cache is empty to avoid SSL connection issues
    if not game_service.games or len(game_service.games) == 0:
        logger.debug("Game service cache is empty - reloading from database...")
        try:
            game_service.load_games()
            logger.debug(f"✅ Game service cache reloaded with {len(game_service.games)} games")
        except Exception as e:
            logger.warning(f"⚠️ Could not reload game cache: {e} - will use existing cache")
            # Try to reload on next request
    else:
        logger.debug(f"Game service cache already has {len(game_service.games)} games - skipping reload")
    
    elapsed_time = time.time() - start_time
    logger.info(f"⏱️ ========== END /my-games request - Took {elapsed_time:.2f}s ==========")
    
    # Get actual count from database (not cached)
    actual_db_total = db.query(GameModel).count()
    
    return {
        "total": len(user_games_response),
        "games": user_games_response,
        "db_total": actual_db_total  # Real count from database
    }


@router.get("/my-games-stream")
async def get_my_games_stream(token: str = Query(..., description="JWT token for authentication"), db: Session = Depends(get_db)):
    """Get authenticated user's games from Steam library with SSE progress updates"""
    from ..models import UserGame, Game as GameModel

    # Verify token
    user = auth_service.verify_token(db, token)
    if not user:
        # Return error as SSE event
        async def error_generator():
            yield f"data: {json.dumps({'error': 'Invalid or expired token'})}\n\n"
        return StreamingResponse(error_generator(), media_type="text/event-stream")

    async def event_generator():
        """Generate SSE events with progress updates"""
        try:
            # Get user's owned games from Steam API
            owned_games_data = await auth_service.get_user_owned_games(user.steam_id)

            if not owned_games_data or "games" not in owned_games_data:
                yield f"data: {json.dumps({'error': 'Could not fetch games from Steam API'})}\n\n"
                return

            # Get list of owned games
            owned_app_ids = {}
            for game in owned_games_data["games"]:
                owned_app_ids[game["appid"]] = game.get("playtime_forever", 0) / 60

            total_games = len(owned_app_ids)

            # Emit initial progress
            yield f"data: {json.dumps({'count': 0, 'total': total_games, 'status': 'starting'})}\n\n"

            # Get known games count
            known_games = db.query(GameModel.app_id).filter(GameModel.app_id.in_(list(owned_app_ids.keys()))).all()
            known_app_ids = {g.app_id for g in known_games}
            games_loaded = len(known_app_ids)
            
            # If all games are already known, emit complete immediately
            if games_loaded == total_games:
                yield f"data: {json.dumps({'count': total_games, 'total': total_games, 'status': 'complete'})}\n\n"
                return
            
            yield f"data: {json.dumps({'count': games_loaded, 'total': total_games, 'status': 'loading_known'})}\n\n"            # Fetch unknown games in batches and emit progress
            unknown_app_ids = [aid for aid in owned_app_ids.keys() if aid not in known_app_ids]

            if unknown_app_ids:
                batch_size = 50  # Match the batch size used in /my-games endpoint for consistency
                for batch_start in range(0, len(unknown_app_ids), batch_size):
                    batch_end = min(batch_start + batch_size, len(unknown_app_ids))
                    unknown_app_ids_to_fetch = unknown_app_ids[batch_start:batch_end]

                    unknown_games = await auth_service.fetch_unknown_games_info(unknown_app_ids_to_fetch, db)

                    if unknown_games:
                        for game_data in unknown_games:
                            app_id = game_data.get("app_id")
                            existing = db.query(GameModel).filter(GameModel.app_id == app_id).first()
                            if not existing:
                                new_game = GameModel(
                                    app_id=app_id,
                                    name=game_data.get("name", "Unknown"),
                                    header_image=game_data.get("header_image", ""),
                                    score=game_data.get("score", 0),
                                    total_reviews=game_data.get("total_reviews", 0),
                                    hltb_url=game_data.get("hltb_url")
                                )
                                db.add(new_game)

                        db.commit()

                    games_loaded = len(known_app_ids) + batch_end
                    yield f"data: {json.dumps({'count': games_loaded, 'total': total_games, 'status': 'loading_unknown'})}\n\n"

            # Emit complete event
            yield f"data: {json.dumps({'count': total_games, 'total': total_games, 'status': 'complete'})}\n\n"

        except Exception as e:
            logger.error(f"Error in SSE stream: {e}")
            yield f"data: {json.dumps({'error': str(e), 'status': 'error'})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")

