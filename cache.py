"""
Cache module for storing API responses to avoid repeated calls.
"""
import json
import os
import time
import logging
from pathlib import Path
from typing import Optional, Any, Dict

logger = logging.getLogger(__name__)


class Cache:
    """Simple file-based cache system."""
    
    def __init__(self, cache_dir: str = "cache", ttl: int = 86400):
        """
        Initialize cache.
        
        Args:
            cache_dir: Directory to store cache files
            ttl: Time-to-live in seconds (default: 24 hours)
        """
        self.cache_dir = Path(cache_dir)
        self.ttl = ttl
        self.cache_dir.mkdir(exist_ok=True)
        
    def _get_cache_file(self, key: str) -> Path:
        """Get cache file path for a key."""
        # Sanitize key for filename
        safe_key = "".join(c if c.isalnum() or c in "_-" else "_" for c in key)
        return self.cache_dir / f"{safe_key}.json"
    
    def get(self, key: str) -> Optional[Any]:
        """
        Get value from cache.
        
        Args:
            key: Cache key
            
        Returns:
            Cached value or None if not found or expired
        """
        cache_file = self._get_cache_file(key)
        
        if not cache_file.exists():
            return None
        
        try:
            with open(cache_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Check if cache has expired
            if time.time() - data.get("timestamp", 0) > self.ttl:
                logger.debug(f"Cache expired for key: {key}")
                return None
            
            logger.debug(f"Cache hit for key: {key}")
            return data.get("value")
            
        except (json.JSONDecodeError, IOError) as e:
            logger.error(f"Error reading cache for key {key}: {e}")
            return None
    
    def set(self, key: str, value: Any) -> None:
        """
        Set value in cache.
        
        Args:
            key: Cache key
            value: Value to cache (must be JSON serializable)
        """
        cache_file = self._get_cache_file(key)
        
        try:
            data = {
                "timestamp": time.time(),
                "value": value
            }
            
            with open(cache_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2)
            
            logger.debug(f"Cached value for key: {key}")
            
        except (IOError, TypeError) as e:
            logger.error(f"Error writing cache for key {key}: {e}")
    
    def clear(self) -> None:
        """Clear all cache files."""
        try:
            for cache_file in self.cache_dir.glob("*.json"):
                cache_file.unlink()
            logger.info("Cache cleared")
        except IOError as e:
            logger.error(f"Error clearing cache: {e}")
