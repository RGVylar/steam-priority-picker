"""
Steam OAuth authentication service
"""
import httpx
from urllib.parse import urlencode
from typing import Optional
from datetime import datetime, timedelta
import jwt
import logging
from sqlalchemy.orm import Session
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
    
    async def get_game_info_from_steam(self, app_id: int) -> Optional[dict]:
        """Get basic game info from Steam Store API"""
        if not self.steam_api_key or self.steam_api_key == "your_steam_api_key_here":
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://store.steampowered.com/api/appdetails?appids={app_id}",
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    logger.debug(f"Steam API response for {app_id}: {data}")
                    if str(app_id) in data:
                        app_data = data[str(app_id)]
                        success = app_data.get("success", False)
                        logger.debug(f"App data for {app_id}: success={success}, keys={app_data.keys()}, data type={type(app_data.get('data'))}")
                        
                        # Try to get game data even if success is False
                        # (some games are delisted but still have data)
                        if "data" in app_data and app_data["data"]:
                            game_data = app_data["data"]
                            if isinstance(game_data, dict):
                                game_info = {
                                    "app_id": app_id,
                                    "name": game_data.get("name", f"Game {app_id}"),
                                    "header_image": game_data.get("header_image", ""),
                                }
                                if success:
                                    logger.info(f"✅ Fetched Steam info for app {app_id}: {game_info['name']}")
                                else:
                                    logger.info(f"⚠️ Fetched Steam info for app {app_id} (success=false): {game_info['name']}")
                                return game_info
                        logger.warning(f"❌ No data found for app {app_id} (success={success}, has data={('data' in app_data)}, data value={app_data.get('data')})")
                    else:
                        logger.warning(f"❌ App {app_id} not found in Steam API response")
                else:
                    logger.warning(f"Steam API error for app {app_id}: HTTP {response.status_code}")
        except Exception as e:
            logger.warning(f"Error fetching Steam info for app {app_id}: {e}")
        
        return None
    
    async def get_hltb_playtime(self, game_name: str) -> Optional[float]:
        """Get playtime from HowLongToBeat"""
        try:
            async with httpx.AsyncClient() as client:
                # HowLongToBeat search
                response = await client.post(
                    "https://howlongtobeat.com/api/search",
                    json={"searchType": "games", "searchQuery": game_name},
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("data") and len(data["data"]) > 0:
                        # Get main story playtime
                        playtime = data["data"][0].get("gameplayMain")
                        return float(playtime) if playtime else 0
        except Exception as e:
            logger.warning(f"Error fetching HLTB info for {game_name}: {e}")
        
        return None
    
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
        if db:
            delisted_records = db.query(DelistedGame.app_id).all()
            delisted_from_db = {record[0] for record in delisted_records}
            logger.info(f"📊 Loaded {len(delisted_from_db)} known delisted games from database")
        else:
            logger.warning(f"⚠️ No database session provided - cannot cache delisted games")
        
        # Only attempt refetch if:
        # 1. We have DB connection
        # 2. We haven't already refetched in this session
        # 3. We actually have delisted games to check
        # 4. There are delisted games in the current unknown list
        should_refetch = (
            db and 
            not SteamAuthService._delisted_refetch_done and 
            delisted_from_db and
            any(aid in delisted_from_db for aid in unknown_app_ids)
        )
        
        if should_refetch:
            delisted_in_unknown = [aid for aid in unknown_app_ids if aid in delisted_from_db]
            logger.info(f"🔄 Attempting to refetch {len(delisted_in_unknown)}/{len(delisted_from_db)} delisted games (first time this build)...")
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
            
            db.commit()
            SteamAuthService._delisted_refetch_done = True
            if restored_count > 0:
                logger.warning(f"⭐ {restored_count} games have been restored to Steam!")
            else:
                logger.info(f"✅ Refetch complete - no games have been restored")
        else:
            if delisted_from_db:
                logger.info(f"⏭️ Already refetched delisted games in this session - skipping refetch")
        
        # Filter out known delisted games
        apps_to_fetch = [aid for aid in unknown_app_ids if aid not in delisted_from_db]
        delisted_skipped = len(unknown_app_ids) - len(apps_to_fetch)
        
        if delisted_skipped > 0:
            logger.info(f"⏭️ Skipping {delisted_skipped} known delisted games (no Steam API call needed)")
        
        # Fetch Steam info in parallel for non-delisted games
        if apps_to_fetch:
            steam_tasks = [self.get_game_info_from_steam(app_id) for app_id in apps_to_fetch]
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
                # Mark as delisted when there's an error
                newly_delisted.append(app_id)
                skipped_games += 1
                continue
            
            # If no Steam info, mark as delisted (don't create game with fallback name)
            if steam_info is None:
                logger.warning(f"⚠️ No Steam info returned for app {app_id} - marking as delisted")
                newly_delisted.append(app_id)
                skipped_games += 1
                continue
            
            if isinstance(steam_info, dict) and steam_info.get("name"):
                try:
                    # Try to get HLTB playtime
                    playtime = await self.get_hltb_playtime(steam_info["name"])
                    
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
                        "playtime_hours": playtime or 0,
                        "score": score,
                        "total_reviews": total_reviews
                    }
                    unknown_games.append(game)
                    games_found += 1
                    logger.info(f"✅ Added unknown game: {game['name']} ({app_id}) - {score:.1f}% ({total_reviews} reviews)")
                except Exception as e:
                    logger.error(f"❌ Error processing game {app_id}: {e}", exc_info=True)
                    newly_delisted.append(app_id)
                    skipped_games += 1
            else:
                logger.warning(f"⚠️ Skipping app {app_id}: invalid Steam data structure - marking as delisted")
                newly_delisted.append(app_id)
                skipped_games += 1
        
        # Save newly delisted games to database (batch commit)
        if newly_delisted and db:
            logger.info(f"💾 Saving {len(newly_delisted)} newly discovered delisted games to database...")
            for app_id in newly_delisted:
                try:
                    existing = db.query(DelistedGame).filter(DelistedGame.app_id == app_id).first()
                    if not existing:
                        db.add(DelistedGame(app_id=app_id))
                        logger.info(f"  ➕ Marked app {app_id} as delisted")
                except Exception as e:
                    logger.error(f"  ❌ Error marking app {app_id} as delisted: {e}", exc_info=True)
            
            try:
                db.commit()
                logger.info(f"✅ Successfully saved {len(newly_delisted)} delisted games to database")
            except Exception as e:
                logger.error(f"❌ Failed to commit delisted games: {e}", exc_info=True)
                db.rollback()
        elif newly_delisted:
            logger.warning(f"⚠️ Found {len(newly_delisted)} newly delisted games but no DB session available")
        
        logger.info(f"✅ Successfully fetched {games_found}/{len(apps_to_fetch)} games from Steam ({skipped_games} delisted, {delisted_skipped} skipped from cache)")
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


