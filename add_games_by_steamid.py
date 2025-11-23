"""
Script to add games from a Steam user's library to the database
Usage: python add_games_by_steamid.py <steam_id>
"""
import asyncio
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from howlongtobeatpy import HowLongToBeat
import httpx
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
from app.models import Game

# Configuration
DATABASE_URL = os.getenv('DATABASE_URL')
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

async def get_steam_user_games(steam_id: str):
    """Get all games from a Steam user's library"""
    url = f"http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key={STEAM_API_KEY}&steamid={steam_id}&format=json&include_appinfo=1"
    
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

async def get_hltb_info(game_name: str):
    """Get HLTB info for a game"""
    try:
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
    print(f"🎮 Fetching games from Steam ID: {steam_id}")
    print("="*60 + "\n")
    
    # Get user's games from Steam
    print("1️⃣ Fetching Steam library...")
    games = await get_steam_user_games(steam_id)
    
    if not games:
        print("❌ No games found or Steam API error")
        sys.exit(1)
    
    print(f"   Found {len(games)} games in library\n")
    
    # Connect to database
    db = SessionLocal()
    
    try:
        # Filter out games that already exist
        print("2️⃣ Checking which games are new...")
        app_ids = [game["appid"] for game in games]
        existing_games = db.query(Game.app_id).filter(Game.app_id.in_(app_ids)).all()
        existing_app_ids = {game[0] for game in existing_games}
        
        new_games = [game for game in games if game["appid"] not in existing_app_ids]
        
        print(f"   Already in database: {len(existing_app_ids)}")
        print(f"   New games to add: {len(new_games)}\n")
        
        if not new_games:
            print("✅ All games already in database!")
            return
        
        # Confirm
        print(f"⚠️ This will add {len(new_games)} new games to the database.")
        response = input("   Continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("❌ Operation cancelled")
            return
        
        print("\n3️⃣ Adding new games...\n")
        
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
                    score=review_data.get("score", 0),
                    total_reviews=review_data.get("total_reviews", 0),
                    hltb_url=hltb_info.get("url")
                )
                
                db.add(new_game)
                db.commit()
                
                print(f"  ✅ Added: {steam_info['name']} - {hltb_info.get('playtime', 0):.1f}h - {review_data.get('score', 0):.1f}%")
                added += 1
                
                # Small delay to avoid rate limiting
                await asyncio.sleep(0.5)
                
            except Exception as e:
                print(f"  ❌ Error: {e}")
                db.rollback()
                failed += 1
        
        print("\n" + "="*60)
        print(f"✅ Process complete!")
        print(f"   Added: {added}")
        print(f"   Failed: {failed}")
        print(f"   Total: {len(new_games)}")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(main())
