"""
Steam API module for fetching owned games from Steam Web API.
"""
import requests
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class SteamAPI:
    """Handles interactions with the Steam Web API."""
    
    BASE_URL = "https://api.steampowered.com"
    
    def __init__(self, api_key: str, steam_id: str):
        """
        Initialize SteamAPI client.
        
        Args:
            api_key: Steam Web API key
            steam_id: User's Steam ID (17-digit SteamID64)
        """
        self.api_key = api_key
        self.steam_id = steam_id
        
    def get_owned_games(self) -> List[Dict]:
        """
        Fetch list of owned games for the configured Steam user.
        
        Returns:
            List of game dictionaries with appid, name, playtime_forever, etc.
        """
        url = f"{self.BASE_URL}/IPlayerService/GetOwnedGames/v1/"
        params = {
            "key": self.api_key,
            "steamid": self.steam_id,
            "include_appinfo": True,
            "include_played_free_games": True,
            "format": "json"
        }
        
        try:
            logger.info(f"Fetching owned games for Steam ID: {self.steam_id}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            games = data.get("response", {}).get("games", [])
            
            logger.info(f"Successfully fetched {len(games)} games")
            return games
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Steam games: {e}")
            raise
            
    @staticmethod
    def get_store_url(appid: int) -> str:
        """
        Get Steam store URL for a game.
        
        Args:
            appid: Steam application ID
            
        Returns:
            URL to the game's Steam store page
        """
        return f"https://store.steampowered.com/app/{appid}/"
