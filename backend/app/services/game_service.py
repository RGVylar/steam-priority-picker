import json
import os
from typing import List, Optional
from pathlib import Path


class GameService:
    def __init__(self):
        self.games: List[dict] = []
        self.load_games()
    
    def load_games(self):
        """Load games from JSON file"""
        data_dir = Path(__file__).parent.parent.parent / "data"
        games_file = data_dir / "games.json"
        
        if games_file.exists():
            try:
                with open(games_file, 'r', encoding='utf-8') as f:
                    self.games = json.load(f)
                print(f"Loaded {len(self.games)} games from {games_file}")
            except Exception as e:
                print(f"Error loading games: {e}")
                self.games = []
        else:
            print(f"Games file not found: {games_file}")
    
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
