"""
HowLongToBeat API module for fetching game completion times.
"""
import logging
from typing import Optional, Dict
from howlongtobeatpy import HowLongToBeat as HLTB_Client

logger = logging.getLogger(__name__)


class HowLongToBeat:
    """Handles interactions with HowLongToBeat API using the community wrapper."""
    
    GAME_URL = "https://howlongtobeat.com/game/{}"
    
    def __init__(self):
        """Initialize HowLongToBeat client."""
        self.client = HLTB_Client()
    
    def search_game(self, game_name: str) -> Optional[Dict]:
        """
        Search for a game on HowLongToBeat and return the best match.
        
        Args:
            game_name: Name of the game to search for
            
        Returns:
            Dictionary with game data including main story time, or None if not found
        """
        try:
            logger.info(f"Searching HLTB for: {game_name}")
            results = self.client.search(game_name)
            
            if not results:
                logger.warning(f"No HLTB results found for: {game_name}")
                return None
            
            # Get the first (most relevant) result
            game = results[0]
            
            # Extract main story time
            main_story = game.main_story
            
            if main_story == 0:
                logger.warning(f"No main story time for: {game_name}")
                return None
            
            result = {
                "id": game.game_id,
                "name": game.game_name,
                "main_story_hours": main_story,
                "main_extra_hours": game.main_extra or 0,
                "completionist_hours": game.completionist or 0,
                "url": self.get_game_url(game.game_id)
            }
            
            logger.info(f"Found HLTB data for {game_name}: {result['main_story_hours']:.1f}h")
            return result
            
        except Exception as e:
            logger.error(f"Error searching HLTB for {game_name}: {e}")
            return None
    
    def get_game_url(self, game_id: int) -> str:
        """
        Get HowLongToBeat URL for a game.
        
        Args:
            game_id: HLTB game ID
            
        Returns:
            URL to the game's HLTB page
        """
        return self.GAME_URL.format(game_id) if game_id else ""
