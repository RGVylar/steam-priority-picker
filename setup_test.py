#!/usr/bin/env python3
"""Test the games sync endpoint with real Steam API"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from app.models import User, Game, UserGame
from app.database import SessionLocal, engine
from app.models import Base
from datetime import datetime

# Create tables
Base.metadata.create_all(engine)

def setup_test_user():
    """Create a test user in the database"""
    db = SessionLocal()
    
    # Check if test user exists
    existing = db.query(User).filter(User.steam_id == "76561197960287930").first()
    if existing:
        print(f"✅ Test user already exists: {existing.username} ({existing.steam_id})")
        db.close()
        return existing
    
    # Create test user
    user = User(
        steam_id="76561197960287930",  # This is a real test Steam ID
        username="TestUser",
        avatar_url="https://example.com/avatar.jpg",
        profile_url="https://steamcommunity.com/profiles/76561197960287930"
    )
    db.add(user)
    db.commit()
    
    print(f"✅ Created test user: {user.username} ({user.steam_id})")
    db.close()
    return user

def verify_games_in_db():
    """Check what games are in the database"""
    db = SessionLocal()
    
    games = db.query(Game).all()
    print(f"\n📊 Total games in database: {len(games)}")
    
    # Show first 10 with generic names
    generic = [g for g in games if g.name.startswith("Game ")]
    print(f"⚠️ Games with generic names: {len(generic)}")
    
    # Show first 10 games
    print(f"\nFirst 10 games in database:")
    for game in games[:10]:
        has_generic = " [GENERIC]" if game.name.startswith("Game ") else ""
        print(f"  {game.app_id}: {game.name}{has_generic} (score: {game.score}, reviews: {game.total_reviews})")
    
    if generic:
        print(f"\nFirst 10 games with generic names:")
        for game in generic[:10]:
            print(f"  {game.app_id}: {game.name}")
    
    db.close()

if __name__ == "__main__":
    print("Setting up test user...")
    setup_test_user()
    
    print("\nVerifying games in database...")
    verify_games_in_db()
    
    print("\n✅ Test environment ready!")
    print("\nTo test the sync endpoint, you can now run:")
    print("  curl -X POST http://localhost:8000/games/owned \\")
    print("    -H 'Authorization: Bearer <YOUR_JWT_TOKEN>'")
