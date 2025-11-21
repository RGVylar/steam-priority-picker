"""
Steam Priority Picker - Main Script

Fetches Steam library, queries HowLongToBeat for playtime, retrieves review scores,
and generates a sorted list of short, high-quality games to play next.
"""
import os
import sys
import json
import logging
import time
from typing import List, Dict
from dotenv import load_dotenv

from steam_api import SteamAPI
from hltb_api import HowLongToBeat
from review_api import ReviewScoreAPI
from cache import Cache

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class SteamPriorityPicker:
    """Main application class for Steam Priority Picker."""
    
    def __init__(self, steam_api_key: str, steam_id: str, use_cache: bool = True):
        """
        Initialize Steam Priority Picker.
        
        Args:
            steam_api_key: Steam Web API key
            steam_id: User's Steam ID
            use_cache: Whether to use caching (default: True)
        """
        self.steam = SteamAPI(steam_api_key, steam_id)
        self.hltb = HowLongToBeat()
        self.reviews = ReviewScoreAPI()
        self.cache = Cache() if use_cache else None
        
    def fetch_steam_library(self) -> List[Dict]:
        """
        Fetch user's Steam library.
        
        Returns:
            List of games from Steam library
        """
        cache_key = f"steam_library_{self.steam.steam_id}"
        
        if self.cache:
            cached = self.cache.get(cache_key)
            if cached is not None:
                logger.info("Using cached Steam library data")
                return cached
        
        games = self.steam.get_owned_games()
        
        if self.cache:
            self.cache.set(cache_key, games)
        
        return games
    
    def enrich_game_data(self, game: Dict) -> Dict:
        """
        Enrich a single game with HLTB and review data.
        Falls back to Steam data if HLTB is not available.
        
        Args:
            game: Game data from Steam API
            
        Returns:
            Enriched game data dictionary
        """
        appid = game.get("appid")
        name = game.get("name")
        
        logger.info(f"Processing: {name}")
        
        # Fetch HLTB data
        cache_key_hltb = f"hltb_{name}"
        hltb_data = None
        
        if self.cache:
            hltb_data = self.cache.get(cache_key_hltb)
        
        if hltb_data is None:
            hltb_data = self.hltb.search_game(name)
            if self.cache:
                # Cache even if not found (with sentinel value)
                self.cache.set(cache_key_hltb, hltb_data if hltb_data else {"not_found": True})
            # Rate limiting to be nice to HLTB
            time.sleep(0.5)
        
        # Check if it's a "not found" sentinel - use default values
        if isinstance(hltb_data, dict) and hltb_data.get("not_found"):
            hltb_data = None
        
        # If HLTB data is None, use default values instead of skipping
        if not hltb_data:
            logger.warning(f"HLTB data not available for {name}, using defaults")
            hltb_data = {
                "id": None,
                "name": name,
                "main_story_hours": 0,
                "main_extra_hours": 0,
                "completionist_hours": 0,
                "url": ""
            }
        
        # Fetch review score
        cache_key_review = f"review_{appid}"
        review_data = None
        
        if self.cache:
            review_data = self.cache.get(cache_key_review)
        
        if review_data is None:
            review_data = self.reviews.get_score(appid, name)
            if self.cache and review_data:
                self.cache.set(cache_key_review, review_data)
            # Rate limiting
            time.sleep(0.3)
        
        # Build enriched game data
        enriched = {
            "name": name,
            "appid": appid,
            "playtime_hours": hltb_data.get("main_story_hours", 0),
            "score": review_data.get("score", 0) if review_data else 0,
            "score_source": review_data.get("source", "N/A") if review_data else "N/A",
            "total_reviews": review_data.get("total_reviews", 0) if review_data else 0,
            "review_desc": review_data.get("review_desc", "No reviews") if review_data else "No reviews",
            "steam_url": self.steam.get_store_url(appid),
            "hltb_url": hltb_data.get("url", ""),
            "hltb_name": hltb_data.get("name", name),
            "hltb_available": hltb_data.get("main_story_hours", 0) > 0
        }
        
        return enriched
    
    def process_library(self, max_games: int = None) -> List[Dict]:
        """
        Process entire Steam library and enrich with HLTB and review data.
        
        Args:
            max_games: Maximum number of games to process (for testing)
            
        Returns:
            List of enriched game data
        """
        games = self.fetch_steam_library()
        
        if max_games:
            games = games[:max_games]
            logger.info(f"Processing first {max_games} games for testing")
        
        enriched_games = []
        
        for i, game in enumerate(games, 1):
            logger.info(f"Processing game {i}/{len(games)}")
            
            try:
                enriched = self.enrich_game_data(game)
                if enriched:
                    enriched_games.append(enriched)
            except Exception as e:
                logger.error(f"Error processing {game.get('name')}: {e}")
                continue
        
        logger.info(f"Successfully enriched {len(enriched_games)} games out of {len(games)}")
        return enriched_games
    
    def sort_games(self, games: List[Dict]) -> List[Dict]:
        """
        Sort games by playtime (shortest first) and score (highest first).
        
        Args:
            games: List of enriched game data
            
        Returns:
            Sorted list of games
        """
        # Sort by playtime (ascending), then by score (descending)
        return sorted(games, key=lambda g: (g["playtime_hours"], -g["score"]))
    
    def format_output(self, games: List[Dict]) -> str:
        """
        Format games as human-readable text.
        
        Args:
            games: List of enriched game data
            
        Returns:
            Formatted string
        """
        output = ["=" * 80]
        output.append("STEAM PRIORITY PICKER - RECOMMENDED GAMES")
        output.append("=" * 80)
        output.append("")
        
        for i, game in enumerate(games, 1):
            output.append(f"{i}. {game['name']}")
            output.append(f"   Playtime: {game['playtime_hours']:.1f} hours (main story)")
            output.append(f"   Score: {game['score']:.1f}% ({game['score_source']}) - {game['review_desc']}")
            output.append(f"   Reviews: {game['total_reviews']:,}")
            output.append(f"   Steam: {game['steam_url']}")
            output.append(f"   HLTB: {game['hltb_url']}")
            output.append("")
        
        output.append("=" * 80)
        output.append(f"Total: {len(games)} games")
        output.append("=" * 80)
        
        return "\n".join(output)
    
    def save_json(self, games: List[Dict], filename: str = "priority_games.json") -> None:
        """
        Save games to JSON file.
        
        Args:
            games: List of enriched game data
            filename: Output filename
        """
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(games, f, indent=2, ensure_ascii=False)
        logger.info(f"Saved JSON output to {filename}")
    
    def run(self, max_games: int = None, output_json: bool = True, output_text: bool = True):
        """
        Run the complete workflow.
        
        Args:
            max_games: Maximum number of games to process (for testing)
            output_json: Whether to save JSON output
            output_text: Whether to print text output
        """
        logger.info("Starting Steam Priority Picker...")
        
        # Process library
        enriched_games = self.process_library(max_games)
        
        if not enriched_games:
            logger.warning("No games found with HLTB data")
            return
        
        # Sort games
        sorted_games = self.sort_games(enriched_games)
        
        # Output results
        if output_json:
            self.save_json(sorted_games)
        
        if output_text:
            formatted = self.format_output(sorted_games)
            print(formatted)


def main():
    """Main entry point."""
    # Load environment variables
    load_dotenv()
    
    steam_api_key = os.getenv("STEAM_API_KEY")
    steam_id = os.getenv("STEAM_ID")
    
    if not steam_api_key or not steam_id:
        logger.error("Missing STEAM_API_KEY or STEAM_ID in .env file")
        logger.error("Please copy .env.example to .env and fill in your credentials")
        sys.exit(1)
    
    # Initialize and run
    picker = SteamPriorityPicker(steam_api_key, steam_id)
    
    # For testing, you can limit the number of games processed
    # picker.run(max_games=10)
    
    # For full library processing
    picker.run()


if __name__ == "__main__":
    main()
