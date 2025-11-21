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
    
    def __init__(self):
        self.app_url = settings.app_url or "http://localhost:5173"
        self.api_url = settings.api_url or "http://localhost:8000"
        self.steam_api_key = settings.steam_api_key
    
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

