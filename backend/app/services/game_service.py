import json
import os
from typing import List, Optional
from pathlib import Path
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
        """Load games from database, fallback to JSON if needed"""
        try:
            db = self._get_db_session()
            games_from_db = db.query(Game).all()
            
            if games_from_db:
                self.games = [game.to_dict() for game in games_from_db]
                logger.info(f"✅ Loaded {len(self.games)} games from database")
                return
            else:
                logger.info("📂 Database is empty, trying to load from JSON...")
                self._load_from_json_and_migrate()
        except Exception as e:
            logger.warning(f"⚠️ Could not load from database: {e}, trying JSON...")
            self._load_from_json_and_migrate()
    
    def _load_from_json_and_migrate(self):
        """Load games from JSON file and migrate to database"""
        # Try multiple possible locations
        possible_paths = [
            Path(__file__).parent.parent.parent / "data" / "games.json",  # backend/data/games.json
            Path(__file__).parent.parent.parent.parent / "web" / "src" / "data" / "games.json",  # web/src/data/games.json
            Path("/opt/render/project/src/web/src/data/games.json"),  # Render production path
            Path("/opt/render/project/src/backend/data/games.json"),  # Render alt path
        ]
        
        games_file = None
        for path in possible_paths:
            if path.exists():
                games_file = path
                break
        
        if games_file:
            try:
                with open(games_file, 'r', encoding='utf-8') as f:
                    json_games = json.load(f)
                
                # Migrate to database
                db = self._get_db_session()
                games_added = 0
                
                for game_data in json_games:
                    # Check if game already exists
                    try:
                        existing = db.query(Game).filter(Game.app_id == game_data.get("app_id")).first()
                    except Exception as e:
                        logger.debug(f"Could not query games table: {e}")
                        existing = None
                    
                    if not existing:
                        game = Game(
                            app_id=game_data.get("app_id"),
                            name=game_data.get("name", "Unknown"),
                            header_image=game_data.get("header_image") or game_data.get("image_url"),
                            playtime_hours=game_data.get("playtime_hours", 0),
                            score=game_data.get("score", 0),
                            total_reviews=game_data.get("total_reviews", 0)
                        )
                        db.add(game)
                        games_added += 1
                
                if games_added > 0:
                    db.commit()
                
                # Load from database or fallback to in-memory list
                try:
                    self.games = [game.to_dict() for game in db.query(Game).all()]
                except Exception as e:
                    logger.warning(f"Could not load games from DB after migration: {e}")
                    # Fallback: keep games from JSON in memory
                    self.games = json_games
                
                logger.info(f"✅ Migrated {games_added} games from JSON to database. Total in memory: {len(self.games)}")
                self.games_file_path = games_file
                
            except Exception as e:
                logger.error(f"❌ Error loading games from {games_file}: {e}")
                self.games = []
        else:
            logger.warning(f"⚠️ Games file not found in any of these locations: {possible_paths}")
    
    def add_games(self, new_games: List[dict]) -> bool:
        """Add new games to the database"""
        if not new_games:
            return False
        
        try:
            db = self._get_db_session()
            games_added = 0
            
            for game_data in new_games:
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
                logger.info(f"➕ Added game to DB: {game.name} ({app_id})")
            
            if games_added > 0:
                db.commit()
                # Refresh in-memory cache
                self.games = [game.to_dict() for game in db.query(Game).all()]
                logger.info(f"✅ Saved {games_added} new games to database. Total: {len(self.games)}")
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"❌ Error saving games to database: {e}")
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
