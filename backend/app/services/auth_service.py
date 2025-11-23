"""
Steam OAuth authentication service
"""
import asyncio
import httpx
from urllib.parse import urlencode
from typing import Optional
from datetime import datetime, timedelta
import jwt
import logging
from sqlalchemy.orm import Session
from howlongtobeatpy import HowLongToBeat
from ..models import User, Session as SessionModel
from ..config import settings

logger = logging.getLogger(__name__)

class SteamAuthService:
    """Handle Steam OpenID authentication"""
    
    STEAM_API_URL = "https://steamcommunity.com/openid/login"
    STEAM_INFO_URL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/"
    
    # Flag to track if we've already tried to refetch delisted games in this session
    _delisted_refetch_done = False
    
    def __init__(self):
        # Don't cache these - read from settings each time to get production values
        self.steam_api_key = settings.steam_api_key
    
    @property
    def app_url(self):
        """Get app_url from settings (not cached to allow env override)"""
        return settings.app_url or "http://localhost:5173"
    
    @property
    def api_url(self):
        """Get api_url from settings (not cached to allow env override)"""
        return settings.api_url or "http://localhost:8000"
    
    def get_login_url(self) -> str:
        """Generate Steam login redirect URL"""
        return_url = f"{self.api_url}/auth/callback"
        
        params = {
            "openid.ns": "http://specs.openid.net/auth/2.0",
            "openid.mode": "checkid_setup",
            "openid.return_to": return_url,
            "openid.realm": self.api_url,
            "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
            "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
        }
        
        return f"{self.STEAM_API_URL}?{urlencode(params)}"
    
    async def verify_steam_id(self, query_params: dict) -> Optional[str]:
        """Verify Steam OpenID response and extract Steam ID"""
        
        # Check if this is a valid Steam OpenID response
        if query_params.get("openid.mode") != "id_res":
            return None
        
        claimed_id = query_params.get("openid.claimed_id", "")
        
        # Extract Steam ID from claimed_id (format: https://steamcommunity.com/openid/id/STEAMID)
        if "steamcommunity.com/openid/id/" in claimed_id:
            try:
                steam_id = claimed_id.split("/")[-1]
                
                # Verify the signature with Steam
                verify_params = dict(query_params)
                verify_params["openid.mode"] = "check_auth"
                
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        self.STEAM_API_URL,
                        data=verify_params,
                        timeout=10.0
                    )
                    
                    # Check if verification was successful
                    if "is_valid:true" in response.text:
                        return steam_id
                    else:
                        logger.warning(f"Steam verification failed for {steam_id}")
                        # For development, accept anyway if we have a valid steam_id
                        if steam_id.isdigit():
                            logger.info(f"Development mode: accepting Steam ID {steam_id}")
                            return steam_id
                        
            except Exception as e:
                logger.error(f"Error verifying Steam ID: {e}")
        
        return None
    
    async def get_steam_profile(self, steam_id: str) -> Optional[dict]:
        """Get user profile info from Steam API"""
        
        # Development mode: create mock profile if no API key
        if not self.steam_api_key or self.steam_api_key == "your_steam_api_key_here":
            logger.info(f"Development mode: using mock profile for {steam_id}")
            return {
                "steam_id": steam_id,
                "username": f"SteamUser_{steam_id[-6:]}",
                "avatar_url": f"https://avatars.akamai.steamstatic.com/{steam_id}/",
                "profile_url": f"https://steamcommunity.com/profiles/{steam_id}/",
            }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    self.STEAM_INFO_URL,
                    params={
                        "key": self.steam_api_key,
                        "steamids": steam_id,
                    },
                    timeout=10.0
                )
                
                data = response.json()
                players = data.get("response", {}).get("players", [])
                
                if players:
                    player = players[0]
                    return {
                        "steam_id": steam_id,
                        "username": player.get("personaname"),
                        "avatar_url": player.get("avatarfull"),
                        "profile_url": player.get("profileurl"),
                    }
        except Exception as e:
            logger.error(f"Steam profile error: {e}")
        
        return None
    
    def create_or_update_user(
        self, 
        db: Session, 
        steam_profile: dict
    ) -> User:
        """Create or update user in database"""
        
        steam_id = steam_profile["steam_id"]
        
        # Find existing user
        user = db.query(User).filter(User.steam_id == steam_id).first()
        
        if user:
            # Update existing user
            user.username = steam_profile["username"]
            user.avatar_url = steam_profile["avatar_url"]
            user.profile_url = steam_profile["profile_url"]
            user.updated_at = datetime.utcnow()
        else:
            # Create new user
            user = User(
                steam_id=steam_id,
                username=steam_profile["username"],
                avatar_url=steam_profile["avatar_url"],
                profile_url=steam_profile["profile_url"],
            )
            db.add(user)
        
        db.commit()
        db.refresh(user)
        return user
    
    def create_session(
        self,
        db: Session,
        user: User,
        expires_in_days: int = 30
    ) -> tuple[str, SessionModel]:
        """Create JWT session token"""
        
        expires_at = datetime.utcnow() + timedelta(days=expires_in_days)
        
        # Create JWT token
        payload = {
            "user_id": user.id,
            "steam_id": user.steam_id,
            "exp": expires_at,
        }
        
        token = jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm="HS256"
        )
        
        # Store session in database
        session = SessionModel(
            user_id=user.id,
            token=token,
            expires_at=expires_at,
        )
        db.add(session)
        db.commit()
        
        return token, session
    
    def verify_token(self, db: Session, token: str) -> Optional[User]:
        """Verify JWT token and return user"""
        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=["HS256"]
            )
            
            user_id = payload.get("user_id")
            
            # Check if session exists and is active
            session = db.query(SessionModel).filter(
                SessionModel.token == token,
                SessionModel.is_active == True
            ).first()
            
            if not session or session.expires_at < datetime.utcnow():
                return None
            
            # Get user
            user = db.query(User).filter(User.id == user_id).first()
            return user
            
        except jwt.InvalidTokenError:
            return None
    
    def logout_user(self, db: Session, token: str) -> bool:
        """Logout user by deactivating session"""
        session = db.query(SessionModel).filter(
            SessionModel.token == token
        ).first()
        
        if session:
            session.is_active = False
            db.commit()
            return True
        
        return False
    
    async def get_user_owned_games(self, steam_id: str) -> Optional[dict]:
        """Get user's owned games from Steam API"""
        if not self.steam_api_key or self.steam_api_key == "your_steam_api_key_here":
            logger.warning("Steam API key not configured for GetOwnedGames")
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/",
                    params={
                        "key": self.steam_api_key,
                        "steamid": steam_id,
                        "include_appinfo": True,
                        "include_played_free_games": True,
                        "format": "json"
                    },
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return data.get("response", {})
                else:
                    logger.error(f"Steam API error: {response.status_code}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching owned games: {e}")
            return None
    
    async def get_game_info_from_steam(self, app_id: int, retry_count: int = 0, max_retries: int = 3) -> Optional[dict]:
        """Get basic game info from Steam Store API with retry logic for rate limits"""
        if not self.steam_api_key or self.steam_api_key == "your_steam_api_key_here":
            return None
        
        try:
            # Use proper headers to avoid being blocked
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            }
            
            async with httpx.AsyncClient(headers=headers) as client:
                response = await client.get(
                    f"https://store.steampowered.com/api/appdetails?appids={app_id}",
                    timeout=10  # Increased timeout from 5s to 10s
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.debug(f"Steam API response for {app_id}: keys={list(data.keys())}")
                    
                    if str(app_id) in data:
                        app_data = data[str(app_id)]
                        success = app_data.get("success", False)
                        has_data = "data" in app_data
                        data_value = app_data.get("data")
                        
                        logger.debug(f"App {app_id}: success={success}, has_data={has_data}, data_type={type(data_value).__name__}")
                        
                        # Try to get game data even if success is False
                        # (some games are delisted but still have data, or have empty data but might have name elsewhere)
                        if has_data and isinstance(data_value, dict):
                            game_data = data_value
                            name = game_data.get("name")
                            
                            if name:  # Has a real name from Steam
                                game_info = {
                                    "app_id": app_id,
                                    "name": name,
                                    "header_image": game_data.get("header_image", ""),
                                }
                                logger.info(f"✅ Fetched Steam info for app {app_id}: {game_info['name']} (success={success})")
                                return game_info
                            else:
                                # Data exists but no name - likely delisted or hidden game
                                logger.warning(f"❌ App {app_id} has data but no name (success={success}, data keys={list(game_data.keys())[:5]}...)")
                        elif has_data and data_value is None:
                            logger.warning(f"❌ App {app_id} returned null data (success={success}) - likely delisted or region-locked")
                        elif not has_data:
                            logger.warning(f"❌ App {app_id} has no data key in response (success={success})")
                        else:
                            logger.warning(f"❌ App {app_id} data is not a dict, it's {type(data_value).__name__}")
                    else:
                        logger.warning(f"❌ App {app_id} not found in Steam API response keys: {list(data.keys())}")
                        
                elif response.status_code in (429, 403):
                    # Rate limit or forbidden - these are temporary/transient issues
                    if retry_count < max_retries:
                        wait_time = 2 ** retry_count  # Exponential backoff: 1s, 2s, 4s
                        logger.warning(f"⏳ Got HTTP {response.status_code} for app {app_id}, retrying in {wait_time}s (attempt {retry_count + 1}/{max_retries})...")
                        await asyncio.sleep(wait_time)
                        return await self.get_game_info_from_steam(app_id, retry_count + 1, max_retries)
                    else:
                        logger.warning(f"❌ Gave up on app {app_id} after {max_retries} retries (HTTP {response.status_code})")
                else:
                    logger.warning(f"Steam API error for app {app_id}: HTTP {response.status_code}")
                    
        except asyncio.TimeoutError:
            logger.warning(f"⏱️ Timeout fetching app {app_id} (took >10s)")
        except Exception as e:
            logger.warning(f"Error fetching Steam info for app {app_id}: {type(e).__name__}: {e}")
        
        return None
    
    def normalize_game_name(self, name: str) -> str:
        """Normalize game name for better HLTB search results"""
        import re
        # Remove trademark symbols
        name = re.sub(r'[™®©]', '', name)
        # Remove common patterns that cause issues
        name = re.sub(r'\s*:\s*', ' ', name)  # Replace colons with space
        name = re.sub(r'\s+', ' ', name)  # Normalize whitespace
        # Title case (better matching than all caps)
        name = name.title()
        return name.strip()

    async def get_hltb_info(self, game_name: str) -> dict:
        """Get playtime and URL from HowLongToBeat using howlongtobeatpy library"""
        try:
            # Try with normalized name first
            normalized_name = self.normalize_game_name(game_name)
            results = await HowLongToBeat().async_search(normalized_name)
            
            # If no results, try with original name
            if not results or len(results) == 0:
                results = await HowLongToBeat().async_search(game_name)
            
            if results and len(results) > 0:
                # Get the best match (first result has highest similarity)
                best_match = results[0]
                return {
                    "playtime": best_match.main_story if best_match.main_story else 0,
                    "url": f"https://howlongtobeat.com/game/{best_match.game_id}" if best_match.game_id else None
                }
        except Exception as e:
            # Silently fail - HLTB is optional
            pass
        
        return {"playtime": None, "url": None}
    
    async def fetch_unknown_games_info(self, unknown_app_ids: list, db=None) -> list:
        """Fetch info for unknown games from Steam and HowLongToBeat
        
        Skips known delisted games from database to avoid unnecessary Steam API calls.
        On first request of this session, attempts to refetch delisted games to see 
        if they've been restored to Steam.
        
        Args:
            unknown_app_ids: List of app IDs to fetch info for
            db: Database session for checking/storing delisted games
        """
        import asyncio
        from ..models import DelistedGame
        
        unknown_games = []
        logger.info(f"🔍 Fetching info for {len(unknown_app_ids)} unknown games from Steam...")
        logger.info(f"📌 Database session available: {db is not None}")
        
        # Get known delisted games from database
        delisted_from_db = set()
        last_refetch_time = None
        if db:
            delisted_records = db.query(DelistedGame).all()
            delisted_from_db = {record.app_id for record in delisted_records}
            logger.info(f"📊 Loaded {len(delisted_from_db)} known delisted games from database")
            
            # Get the most recent check time
            if delisted_records:
                last_refetch_time = max(record.checked_at for record in delisted_records)
                logger.info(f"🕐 Last refetch was at: {last_refetch_time}")
        else:
            logger.warning(f"⚠️ No database session provided - cannot cache delisted games")
        
        # Check if we should refetch (once per day)
        from datetime import timedelta
        should_refetch = False
        if db and delisted_from_db and any(aid in delisted_from_db for aid in unknown_app_ids):
            if last_refetch_time is None:
                should_refetch = True
                logger.info("🔄 No previous refetch found - will attempt refetch")
            else:
                time_since_refetch = datetime.utcnow() - last_refetch_time
                if time_since_refetch > timedelta(hours=24):
                    should_refetch = True
                    logger.info(f"🔄 Last refetch was {time_since_refetch.total_seconds() / 3600:.1f} hours ago - will attempt refetch")
                else:
                    logger.info(f"⏭️ Last refetch was {time_since_refetch.total_seconds() / 3600:.1f} hours ago - skipping (need 24h)")
        
        if should_refetch:
            delisted_in_unknown = [aid for aid in unknown_app_ids if aid in delisted_from_db]
            logger.info(f"🔄 Attempting to refetch {len(delisted_in_unknown)}/{len(delisted_from_db)} delisted games...")
            steam_tasks = [self.get_game_info_from_steam(app_id) for app_id in delisted_in_unknown]
            steam_results = await asyncio.gather(*steam_tasks, return_exceptions=True)
            
            # Check if any have reappeared
            restored_count = 0
            for app_id, steam_info in zip(delisted_in_unknown, steam_results):
                if steam_info and isinstance(steam_info, dict) and steam_info.get("name"):
                    logger.warning(f"✅ GAME RESTORED: App {app_id} ({steam_info.get('name')}) is now available!")
                    # Remove from delisted list in database
                    db.query(DelistedGame).filter(DelistedGame.app_id == app_id).delete()
                    delisted_from_db.discard(app_id)
                    restored_count += 1
                else:
                    # Update checked_at for games still delisted
                    db.query(DelistedGame).filter(DelistedGame.app_id == app_id).update(
                        {"checked_at": datetime.utcnow()}
                    )
            
            db.commit()
            if restored_count > 0:
                logger.warning(f"⭐ {restored_count} games have been restored to Steam!")
            else:
                logger.info(f"✅ Refetch complete - no games have been restored")
        
        # Filter out known delisted games
        apps_to_fetch = [aid for aid in unknown_app_ids if aid not in delisted_from_db]
        delisted_skipped = len(unknown_app_ids) - len(apps_to_fetch)
        
        if delisted_skipped > 0:
            logger.info(f"⏭️ Skipping {delisted_skipped} known delisted games (no Steam API call needed)")
        
        # Fetch Steam info with limited concurrency to avoid rate limiting
        if apps_to_fetch:
            # Limit to 10 concurrent requests to avoid Steam API timeouts
            semaphore = asyncio.Semaphore(10)
            
            async def fetch_with_semaphore(app_id):
                async with semaphore:
                    return await self.get_game_info_from_steam(app_id)
            
            steam_tasks = [fetch_with_semaphore(app_id) for app_id in apps_to_fetch]
            steam_results = await asyncio.gather(*steam_tasks, return_exceptions=True)
        else:
            steam_results = []
        
        # Process results and collect newly delisted games
        games_found = 0
        skipped_games = 0
        newly_delisted = []
        
        for app_id, steam_info in zip(apps_to_fetch, steam_results):
            if isinstance(steam_info, Exception):
                logger.error(f"❌ Exception fetching app {app_id}: {steam_info}")
                # Don't mark as delisted - could be temporary API error
                skipped_games += 1
                continue
            
            # If no Steam info, mark as delisted
            if steam_info is None:
                logger.warning(f"❌ No Steam info returned for app {app_id} - marking as delisted")
                newly_delisted.append(app_id)
                skipped_games += 1
                continue
            
            if isinstance(steam_info, dict) and steam_info.get("name"):
                try:
                    # Try to get HLTB info (playtime and URL)
                    hltb_info = await self.get_hltb_info(steam_info["name"])
                    
                    # Get Steam review score and total reviews
                    score = 0
                    total_reviews = 0
                    try:
                        review_data = self.get_steam_review_score(app_id)
                        if review_data:
                            score = review_data.get("score", 0)
                            total_reviews = review_data.get("total_reviews", 0)
                            logger.info(f"📊 Got reviews for {steam_info['name']}: {score:.1f}% ({total_reviews} reviews)")
                    except Exception as e:
                        logger.warning(f"⚠️ Could not fetch reviews for app {app_id}: {e}")
                    
                    game = {
                        "app_id": app_id,
                        "name": steam_info["name"],
                        "header_image": steam_info.get("header_image", ""),
                        "playtime_hours": hltb_info.get("playtime") or 0,
                        "score": score,
                        "total_reviews": total_reviews,
                        "hltb_url": hltb_info.get("url")
                    }
                    unknown_games.append(game)
                    games_found += 1
                    logger.info(f"✅ Added unknown game: {game['name']} ({app_id}) - {score:.1f}% ({total_reviews} reviews)")
                except Exception as e:
                    logger.error(f"❌ Error processing game {app_id}: {e}", exc_info=True)
                    skipped_games += 1
            else:
                logger.warning(f"❌ Skipping app {app_id}: invalid Steam data structure - marking as delisted")
                newly_delisted.append(app_id)
                skipped_games += 1
        
        # Save newly delisted games to database
        if newly_delisted and db:
            try:
                for app_id in newly_delisted:
                    # Check if already in delisted table
                    existing = db.query(DelistedGame).filter(DelistedGame.app_id == app_id).first()
                    if not existing:
                        db.add(DelistedGame(app_id=app_id))
                db.commit()
                logger.info(f"💾 Saved {len(newly_delisted)} newly delisted games to database")
            except Exception as e:
                logger.error(f"❌ Error saving delisted games: {e}")
                db.rollback()
        
        logger.info(f"✅ Successfully fetched {games_found}/{len(apps_to_fetch)} games from Steam ({skipped_games} skipped, {delisted_skipped} skipped from cache)")
        return unknown_games
    
    def get_steam_review_score(self, app_id: int) -> Optional[dict]:
        """Get review score from Steam review API (synchronous using httpx)
        
        Args:
            app_id: Steam application ID
            
        Returns:
            Dictionary with score and total_reviews or None if not available
        """
        import httpx
        
        url = f"https://store.steampowered.com/appreviews/{app_id}"
        params = {
            "json": 1,
            "language": "all",
            "purchase_type": "all"
        }
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        
        try:
            response = httpx.get(url, params=params, headers=headers, timeout=5)
            response.raise_for_status()
            
            data = response.json()
            query_summary = data.get("query_summary", {})
            
            total_reviews = query_summary.get("total_reviews", 0)
            if total_reviews == 0:
                return None
            
            total_positive = query_summary.get("total_positive", 0)
            total_negative = query_summary.get("total_negative", 0)
            
            # Calculate percentage score
            score = (total_positive / (total_positive + total_negative) * 100) if (total_positive + total_negative) > 0 else 0
            
            return {
                "score": round(score, 1),
                "total_reviews": total_reviews
            }
            
        except Exception as e:
            logger.warning(f"⚠️ Could not fetch Steam reviews for app {app_id}: {e}")
            return None


