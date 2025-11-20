"""
HowLongToBeat API module for fetching game completion times.
"""
import requests
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class HowLongToBeat:
    """Handles interactions with HowLongToBeat API."""
    
    # Using the unofficial HLTB API endpoint
    API_URL = "https://howlongtobeat.com/api/search"
    GAME_URL = "https://howlongtobeat.com/game/{}"
    
    def __init__(self):
        """Initialize HowLongToBeat client."""
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Referer": "https://howlongtobeat.com/"
        }
    
    def search_game(self, game_name: str) -> Optional[Dict]:
        """
        Search for a game on HowLongToBeat and return the best match.
        
        Args:
            game_name: Name of the game to search for
            
        Returns:
            Dictionary with game data including main story time, or None if not found
        """
        payload = {
            "searchType": "games",
            "searchTerms": game_name.split(),
            "searchPage": 1,
            "size": 20,
            "searchOptions": {
                "games": {
                    "userId": 0,
                    "platform": "",
                    "sortCategory": "popular",
                    "rangeCategory": "main",
                    "rangeTime": {"min": 0, "max": 0},
                    "gameplay": {"perspective": "", "flow": "", "genre": ""},
                    "modifier": ""
                },
                "users": {"sortCategory": "postcount"},
                "filter": "",
                "sort": 0,
                "randomizer": 0
            }
        }
        
        try:
            logger.info(f"Searching HLTB for: {game_name}")
            response = requests.post(
                self.API_URL,
                json=payload,
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            
            data = response.json()
            games = data.get("data", [])
            
            if not games:
                logger.warning(f"No HLTB results found for: {game_name}")
                return None
            
            # Get the first (most relevant) result
            game = games[0]
            
            # Extract main story time (in seconds, need to convert to hours)
            main_story = game.get("comp_main", 0)
            
            if main_story == 0:
                logger.warning(f"No main story time for: {game_name}")
                return None
            
            result = {
                "id": game.get("game_id"),
                "name": game.get("game_name"),
                "main_story_hours": main_story / 3600,  # Convert seconds to hours
                "main_extra_hours": game.get("comp_plus", 0) / 3600,
                "completionist_hours": game.get("comp_100", 0) / 3600,
                "url": self.get_game_url(game.get("game_id"))
            }
            
            logger.info(f"Found HLTB data for {game_name}: {result['main_story_hours']:.1f}h")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error searching HLTB for {game_name}: {e}")
            return None
        except (KeyError, ValueError) as e:
            logger.error(f"Error parsing HLTB response for {game_name}: {e}")
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
