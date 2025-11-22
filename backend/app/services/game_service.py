import json
import os
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models import Game
from ..database import SessionLocal
import logging

logger = logging.getLogger(__name__)


class GameService:
    def __init__(self):
        self.games: List[dict] = []
        self.games_file_path = None
        self.db_session = None
        self.load_games()
    
    def _get_db_session(self) -> Session:
        """Get a database session"""
        if self.db_session is None:
            self.db_session = SessionLocal()
        return self.db_session
    
    def load_games(self):
        """Load games from database"""
        try:
            db = self._get_db_session()
            games_from_db = db.query(Game).all()
            self.games = [game.to_dict() for game in games_from_db]
            logger.info(f"✅ Loaded {len(self.games)} games from database")
        except Exception as e:
            logger.warning(f"⚠️ Could not load games from database: {e}")
            self.games = []
    
    def add_games(self, new_games: List[dict], db: Optional[Session] = None) -> bool:
        """Add new games to the database. If db session not provided, uses internal session"""
        if not new_games:
            return False
        
        # Use provided session or get internal one
        should_commit = False
        if db is None:
            db = self._get_db_session()
            should_commit = True
        
        try:
            games_added = 0
            
            for game_data in new_games:
                try:
                    app_id = game_data.get("app_id")
                    
                    # Check if game already exists
                    existing = db.query(Game).filter(Game.app_id == app_id).first()
                    if existing:
                        logger.debug(f"Game {app_id} already exists, skipping")
                        continue
                    
                    # Create and add new game
                    game = Game(
                        app_id=app_id,
                        name=game_data.get("name", "Unknown"),
                        header_image=game_data.get("header_image", ""),
                        playtime_hours=game_data.get("playtime_hours", 0),
                        score=game_data.get("score", 0),
                        total_reviews=game_data.get("total_reviews", 0)
                    )
                    db.add(game)
                    games_added += 1
                except Exception as e:
                    logger.warning(f"⚠️ Could not add game {game_data.get('app_id')}: {e}")
                    continue
            
            if games_added > 0:
                try:
                    if should_commit:
                        db.commit()
                        # Refresh in-memory cache
                        self.games = [game.to_dict() for game in db.query(Game).all()]
                    logger.info(f"✅ Saved {games_added} new games to database")
                    return True
                except Exception as e:
                    if should_commit:
                        db.rollback()
                    logger.error(f"❌ Error saving games to database: {e}")
                    return False
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error processing games: {e}")
            return False
    
    def get_all_games(self, limit: int = None, offset: int = 0) -> tuple[List[dict], int]:
        """Get all games with pagination"""
        total = len(self.games)
        games = self.games[offset:offset + limit] if limit else self.games[offset:]
        return games, total
    
    def search_games(
        self, 
        query: Optional[str] = None,
        playtime_min: float = 0,
        playtime_max: float = float('inf'),
        score_min: float = 0,
        score_max: float = 100,
        limit: int = None,
        offset: int = 0
    ) -> tuple[List[dict], int]:
        """Search and filter games"""
        filtered = self.games
        
        # Filter by search query
        if query:
            query_lower = query.lower()
            filtered = [g for g in filtered if query_lower in g.get('name', '').lower()]
        
        # Filter by playtime
        filtered = [g for g in filtered if playtime_min <= g.get('playtime_hours', 0) <= playtime_max]
        
        # Filter by score
        filtered = [g for g in filtered if score_min <= g.get('score', 0) <= score_max]
        
        total = len(filtered)
        games = filtered[offset:offset + limit] if limit else filtered[offset:]
        return games, total
    
    def get_game_by_id(self, app_id: int) -> Optional[dict]:
        """Get a specific game by app_id"""
        for game in self.games:
            if game.get('app_id') == app_id:
                return game
        return None


# Global instance
game_service = GameService()
