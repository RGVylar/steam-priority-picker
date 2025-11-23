from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    """Steam user profile"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    steam_id = Column(String(20), unique=True, nullable=False, index=True)
    username = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    profile_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<User {self.username} ({self.steam_id})>"


class Game(Base):
    """Steam game in the database"""
    __tablename__ = "games"
    
    id = Column(Integer, primary_key=True)
    app_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(500), nullable=False)
    header_image = Column(String(500), nullable=True)
    playtime_hours = Column(Float, default=0)  # Generic/average playtime
    score = Column(Float, default=0)
    total_reviews = Column(Integer, default=0)
    hltb_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        """Convert to dictionary for API responses"""
        return {
            "app_id": self.app_id,
            "name": self.name,
            "header_image": self.header_image,
            "playtime_hours": self.playtime_hours,
            "hltb_hours": self.playtime_hours,  # Currently playtime_hours contains HLTB data
            "score": self.score,
            "total_reviews": self.total_reviews,
            "steam_url": f"https://store.steampowered.com/app/{self.app_id}/",
            "image_url": self.header_image,
            "hltb_url": self.hltb_url
        }
    
    def __repr__(self):
        return f"<Game {self.name} ({self.app_id})>"


class UserGame(Base):
    """User's game with personal playtime and stats"""
    __tablename__ = "user_games"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    app_id = Column(Integer, ForeignKey("games.app_id", ondelete="CASCADE"), nullable=False)
    playtime_hours = Column(Float, default=0)  # User's personal playtime
    last_played = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self, game: 'Game' = None):
        """Convert to dictionary for API responses"""
        return {
            "app_id": self.app_id,
            "name": game.name if game else "Unknown",
            "header_image": game.header_image if game else "",
            "playtime_hours": self.playtime_hours,  # User's personal playtime
            "score": game.score if game else 0,
            "total_reviews": game.total_reviews if game else 0
        }
    
    def __repr__(self):
        return f"<UserGame user={self.user_id} app={self.app_id}>"


class Favorite(Base):
    """User's favorite game with priority and notes"""
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    app_id = Column(Integer, nullable=False)
    priority = Column(Integer, default=0)  # 1=high, 0=normal, -1=low
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<Favorite user={self.user_id} app={self.app_id}>"


class Session(Base):
    """User session tracking"""
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token = Column(String(500), unique=True, nullable=False, index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    
    def __repr__(self):
        return f"<Session user={self.user_id}>"


class DelistedGame(Base):
    """Track games that are no longer available on Steam
    
    This prevents repeated Steam API calls for games that have been delisted,
    improving performance on subsequent fetches of the same user's library.
    """
    __tablename__ = "delisted_games"
    
    id = Column(Integer, primary_key=True)
    app_id = Column(Integer, unique=True, nullable=False, index=True)
    checked_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<DelistedGame app_id={self.app_id}>"
