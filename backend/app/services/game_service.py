import json
import os
from typing import List, Optional
from pathlib import Path


class GameService:
    def __init__(self):
        self.games: List[dict] = []
        self.games_file_path = None
        self.load_games()
    
    def load_games(self):
        """Load games from JSON file"""
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
                    self.games = json.load(f)
                self.games_file_path = games_file
                print(f"Loaded {len(self.games)} games from {games_file}")
            except Exception as e:
                print(f"Error loading games from {games_file}: {e}")
                self.games = []
        else:
            print(f"Games file not found in any of these locations: {possible_paths}")
    
    def add_games(self, new_games: List[dict]) -> bool:
        """Add new games to the database and save to file"""
        if not new_games or not self.games_file_path:
            return False
        
        try:
            # Add only new games (avoid duplicates)
            existing_app_ids = {g.get("app_id") for g in self.games}
            games_to_add = [g for g in new_games if g.get("app_id") not in existing_app_ids]
            
            if not games_to_add:
                return False
            
            self.games.extend(games_to_add)
            
            # Save to file
            with open(self.games_file_path, 'w', encoding='utf-8') as f:
                json.dump(self.games, f, indent=2, ensure_ascii=False)
            
            print(f"Added {len(games_to_add)} new games. Total: {len(self.games)}")
            return True
        except Exception as e:
            print(f"Error saving games to file: {e}")
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
