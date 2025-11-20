"""
Review score module for fetching game review scores from various sources.
"""
import requests
import logging
from typing import Optional, Dict

logger = logging.getLogger(__name__)


class ReviewScoreAPI:
    """Handles fetching review scores from Steam store page."""
    
    def __init__(self):
        """Initialize ReviewScoreAPI client."""
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
    
    def get_steam_score(self, appid: int) -> Optional[Dict]:
        """
        Get review score from Steam store API.
        
        Args:
            appid: Steam application ID
            
        Returns:
            Dictionary with review score data or None if not available
        """
        url = f"https://store.steampowered.com/appreviews/{appid}"
        params = {
            "json": 1,
            "language": "all",
            "purchase_type": "all"
        }
        
        try:
            logger.info(f"Fetching Steam reviews for appid: {appid}")
            response = requests.get(url, params=params, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            query_summary = data.get("query_summary", {})
            
            total_reviews = query_summary.get("total_reviews", 0)
            if total_reviews == 0:
                logger.warning(f"No reviews found for appid: {appid}")
                return None
            
            total_positive = query_summary.get("total_positive", 0)
            total_negative = query_summary.get("total_negative", 0)
            
            # Calculate percentage score
            score = (total_positive / (total_positive + total_negative) * 100) if (total_positive + total_negative) > 0 else 0
            
            result = {
                "source": "Steam",
                "score": round(score, 1),
                "total_reviews": total_reviews,
                "positive_reviews": total_positive,
                "negative_reviews": total_negative,
                "review_desc": query_summary.get("review_score_desc", "No reviews")
            }
            
            logger.info(f"Steam score for appid {appid}: {score:.1f}% ({total_reviews} reviews)")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Steam reviews for appid {appid}: {e}")
            return None
        except (KeyError, ValueError, ZeroDivisionError) as e:
            logger.error(f"Error parsing Steam review data for appid {appid}: {e}")
            return None
    
    def get_score(self, appid: int, game_name: str) -> Optional[Dict]:
        """
        Get review score for a game. Currently uses Steam reviews.
        
        Args:
            appid: Steam application ID
            game_name: Name of the game
            
        Returns:
            Dictionary with review score data or None if not available
        """
        # For now, we'll use Steam reviews as they're the most accessible
        # In the future, this could be extended to try Metacritic or OpenCritic
        return self.get_steam_score(appid)
