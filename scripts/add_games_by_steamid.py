"""
Script to add a Steam user and their games to the database (simulating a login)
Usage: python add_games_by_steamid.py <steam_id>
"""
import asyncio
import os
import sys
import re
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from howlongtobeatpy import HowLongToBeat
import httpx
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.models import Game, User, UserGame

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL_PROD')
STEAM_API_KEY = os.getenv('STEAM_API_KEY')

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in environment variables!")
    print("   Please add it to your .env file")
    sys.exit(1)

if not STEAM_API_KEY:
    print("❌ Error: STEAM_API_KEY not found in environment variables!")
    print("   Please add it to your .env file")
    sys.exit(1)

print(f"🔗 Connecting to: {DATABASE_URL[:50]}...")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

async def get_steam_user_info(steam_id: str):
    """Get Steam user profile information"""
    url = f"http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key={STEAM_API_KEY}&steamids={steam_id}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                players = data.get("response", {}).get("players", [])
                if players:
                    player = players[0]
                    return {
                        "steam_id": player.get("steamid"),
                        "username": player.get("personaname"),
                        "avatar": player.get("avatarfull"),
                        "profile_url": player.get("profileurl")
                    }
    except Exception as e:
        print(f"❌ Error fetching Steam user info: {e}")
    
    return None

async def get_steam_user_games(steam_id: str):
    """Get all games from a Steam user's library with playtime"""
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=1&include_played_free_games=1"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=30)
            if response.status_code == 200:
                data = response.json()
                if data.get("response") and data["response"].get("games"):
                    return data["response"]["games"]
    except Exception as e:
        print(f"❌ Error fetching Steam library: {e}")
    
    return []

async def get_steam_game_info(app_id: int):
    """Get detailed info for a single game from Steam"""
    url = f"https://store.steampowered.com/api/appdetails?appids={app_id}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get(str(app_id), {}).get("success"):
                    game_data = data[str(app_id)]["data"]
                    return {
                        "name": game_data.get("name"),
                        "header_image": game_data.get("header_image")
                    }
    except Exception as e:
        print(f"  ⚠️ Error fetching Steam info for {app_id}: {e}")
    
    return None

def get_steam_review_score(app_id: int):
    """Get Steam review score and total reviews"""
    import requests
    url = f"https://store.steampowered.com/appreviews/{app_id}?json=1&language=all&purchase_type=all"
    
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data.get("success") == 1:
                query_summary = data.get("query_summary", {})
                total_reviews = query_summary.get("total_reviews", 0)
                positive = query_summary.get("total_positive", 0)
                
                if total_reviews > 0:
                    score = (positive / total_reviews) * 100
                    return {"score": score, "total_reviews": total_reviews}
    except:
        pass
    
    return {"score": 0, "total_reviews": 0}

def normalize_game_name(name: str) -> str:
    """Normalize game name for better HLTB search results"""
    # Remove trademark symbols
    name = re.sub(r'[™®©]', '', name)
    # Remove common patterns that cause issues
    name = re.sub(r'\s*:\s*', ' ', name)  # Replace colons with space
    name = re.sub(r'\s+', ' ', name)  # Normalize whitespace
    # Title case (better matching than all caps)
    name = name.title()
    return name.strip()

async def get_hltb_info(game_name: str):
    """Get HLTB info for a game"""
    try:
        # Try with normalized name first
        normalized_name = normalize_game_name(game_name)
        results = await HowLongToBeat().async_search(normalized_name)
        
        # If no results, try with original name
        if not results or len(results) == 0:
            results = await HowLongToBeat().async_search(game_name)
        
        if results and len(results) > 0:
            best_match = results[0]
            return {
                "playtime": best_match.main_story if best_match.main_story else 0,
                "url": f"https://howlongtobeat.com/game/{best_match.game_id}" if best_match.game_id else None
            }
    except Exception as e:
        print(f"  ⚠️ Error fetching HLTB for {game_name}: {e}")
    
    return {"playtime": None, "url": None}

async def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python add_games_by_steamid.py <steam_id>")
        print("   Example: python add_games_by_steamid.py 76561197960287930")
        sys.exit(1)
    
    steam_id = sys.argv[1]
    
    print("\n" + "="*60)
    print(f"🎮 Adding Steam user: {steam_id}")
    print("="*60 + "\n")
    
    # Get user info from Steam
    print("1️⃣ Fetching Steam user info...")
    user_info = await get_steam_user_info(steam_id)
    
    if not user_info:
        print("❌ Could not fetch Steam user info")
        sys.exit(1)
    
    print(f"   Username: {user_info['username']}")
    print(f"   Profile: {user_info['profile_url']}\n")
    
    # Get user's games from Steam
    print("2️⃣ Fetching Steam library...")
    games = await get_steam_user_games(steam_id)
    
    if not games:
        print("❌ No games found or Steam API error")
        sys.exit(1)
    
    print(f"   Found {len(games)} games in library\n")
    
    # Connect to database
    db = SessionLocal()
    
    try:
        # Check if user already exists
        print("3️⃣ Checking if user exists in database...")
        existing_user = db.query(User).filter(User.steam_id == steam_id).first()
        
        if existing_user:
            print(f"   ⚠️ User already exists: {existing_user.username}")
            print(f"   This will update their game library.")
            response = input("   Continue? (yes/no): ")
            if response.lower() != 'yes':
                print("❌ Operation cancelled")
                return
            user = existing_user
        else:
            # Create new user
            user = User(
                steam_id=user_info['steam_id'],
                username=user_info['username'],
                avatar_url=user_info['avatar'],
                profile_url=user_info['profile_url']
            )
            db.add(user)
            db.commit()
            print(f"   ✅ Created user: {user.username}\n")
        
        # Filter out games that already exist in global catalog
        print("4️⃣ Checking which games need to be added to catalog...")
        app_ids = [game["appid"] for game in games]
        existing_games = db.query(Game.app_id).filter(Game.app_id.in_(app_ids)).all()
        existing_app_ids = {game[0] for game in existing_games}
        
        new_games = [game for game in games if game["appid"] not in existing_app_ids]
        
        print(f"   Already in catalog: {len(existing_app_ids)}")
        print(f"   New games to add: {len(new_games)}\n")
        
        # Confirm
        if new_games:
            print(f"⚠️ This will add {len(new_games)} new games to the global catalog.")
            response = input("   Continue? (yes/no): ")
            
            if response.lower() != 'yes':
                print("❌ Operation cancelled")
                return
        
        print("\n5️⃣ Adding new games to catalog...\n")
        
        added = 0
        failed = 0
        
        for i, game in enumerate(new_games, 1):
            app_id = game["appid"]
            name = game.get("name", "Unknown")
            
            print(f"[{i}/{len(new_games)}] Processing: {name}")
            
            try:
                # Get detailed Steam info
                steam_info = await get_steam_game_info(app_id)
                if not steam_info:
                    print(f"  ⚠️ Could not fetch Steam info, skipping")
                    failed += 1
                    continue
                
                # Get HLTB info
                hltb_info = await get_hltb_info(steam_info["name"])
                
                # Get review score
                review_data = get_steam_review_score(app_id)
                
                # Create game record
                new_game = Game(
                    app_id=app_id,
                    name=steam_info["name"],
                    header_image=steam_info.get("header_image", ""),
                    playtime_hours=hltb_info.get("playtime") or 0,
                    score=review_data.get("score") or 0,
                    total_reviews=review_data.get("total_reviews") or 0,
                    hltb_url=hltb_info.get("url")
                )
                
                db.add(new_game)
                db.commit()
                
                score_display = review_data.get('score', 0) or 0
                hltb_display = hltb_info.get('playtime', 0) or 0
                print(f"  ✅ Added: {steam_info['name']} - {hltb_display:.1f}h - {score_display:.1f}%")
                added += 1
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"  ❌ Error: {e}")
                db.rollback()
                failed += 1
        
        if new_games:
            print(f"\n   Catalog updated: {added} added, {failed} failed\n")
        
        # Now add user's personal games with playtime
        print("6️⃣ Adding user's personal game library...\n")
        
        # Delete existing user games to refresh
        db.query(UserGame).filter(UserGame.user_id == user.id).delete()
        db.commit()
        
        user_games_added = 0
        
        for i, game in enumerate(games, 1):
            app_id = game["appid"]
            name = game.get("name", "Unknown")
            playtime_minutes = game.get("playtime_forever", 0)
            playtime_hours = playtime_minutes / 60.0
            
            print(f"[{i}/{len(games)}] Adding: {name} ({playtime_hours:.1f}h)")
            
            try:
                user_game = UserGame(
                    user_id=user.id,
                    app_id=app_id,
                    playtime_hours=playtime_hours
                )
                db.add(user_game)
                user_games_added += 1
                
                # Commit in batches of 50
                if i % 50 == 0:
                    db.commit()
                    
            except Exception as e:
                print(f"  ⚠️ Error: {e}")
        
        db.commit()
        
        print("\n" + "="*60)
        print(f"✅ Process complete!")
        print(f"   User: {user.username}")
        print(f"   New games in catalog: {added}")
        print(f"   Failed: {failed}")
        print(f"   User's games: {user_games_added}")
        print(f"   Total games in library: {len(games)}")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
