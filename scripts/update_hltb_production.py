"""
Script to update existing games in production with HLTB data
without deleting anything. Run this once after deploying the new code.
"""
import asyncio
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from howlongtobeatpy import HowLongToBeat
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Import models
import sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))
from app.models import Game

# Get database URL from environment
DATABASE_URL = os.getenv('DATABASE_URL')

if not DATABASE_URL:
    print("❌ Error: DATABASE_URL not found in environment variables!")
    print("   Please add it to your .env file")
    exit(1)

print(f"🔗 Connecting to: {DATABASE_URL[:50]}...")

# Create engine and session
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def normalize_game_name(name: str) -> str:
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

async def get_hltb_info(game_name: str) -> dict:
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

async def update_games_batch(games_to_update, db):
    """Update a batch of games with HLTB data"""
    updated = 0
    failed = 0
    
    for game in games_to_update:
        try:
            print(f"🔍 Fetching HLTB data for: {game.name}")
            hltb_info = await get_hltb_info(game.name)
            
            if hltb_info["url"] or hltb_info["playtime"]:
                if hltb_info["url"]:
                    game.hltb_url = hltb_info["url"]
                if hltb_info["playtime"]:
                    game.playtime_hours = hltb_info["playtime"]
                
                print(f"  ✅ Updated: {game.name} - {hltb_info['playtime']}h - {hltb_info['url']}")
                updated += 1
            else:
                # Game not found in HLTB - mark with 0 to avoid retrying
                game.playtime_hours = 0
                print(f"  ⚠️ Not found in HLTB: {game.name} (marked as 0)")
                updated += 1
            else:
                print(f"  ⚠️ No HLTB data found for: {game.name}")
                failed += 1
                
        except Exception as e:
            print(f"  ❌ Error updating {game.name}: {e}")
            failed += 1
    
    return updated, failed

async def main():
    db = SessionLocal()
    
    try:
        # Find games that need updating
        print("\n📊 Checking for games that need HLTB data...")
        
        games_needing_update = db.query(Game).filter(
            Game.playtime_hours == None
        ).all()
        
        total = len(games_needing_update)
        print(f"📋 Found {total} games that need updating\n")
        
        if total == 0:
            print("✅ All games already have HLTB data!")
            return
        
        # Confirm before proceeding
        print(f"⚠️ This will update {total} games in the database.")
        print("   This may take several minutes depending on the number of games.")
        response = input("\n   Continue? (yes/no): ")
        
        if response.lower() != 'yes':
            print("❌ Update cancelled")
            return
        
        print("\n🚀 Starting update...\n")
        
        # Update in batches of 10 to avoid overwhelming HLTB
        batch_size = 10
        total_updated = 0
        total_failed = 0
        
        for i in range(0, total, batch_size):
            batch = games_needing_update[i:i+batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total + batch_size - 1) // batch_size
            
            print(f"📦 Batch {batch_num}/{total_batches} ({len(batch)} games)")
            updated, failed = await update_games_batch(batch, db)
            
            total_updated += updated
            total_failed += failed
            
            # Commit after each batch
            db.commit()
            print(f"   💾 Batch committed to database\n")
            
            # Small delay between batches to avoid rate limiting
            if i + batch_size < total:
                await asyncio.sleep(2)
        
        print("\n" + "="*60)
        print(f"✅ Update complete!")
        print(f"   Updated: {total_updated}")
        print(f"   Failed: {total_failed}")
        print(f"   Total: {total}")
        print("="*60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🎮 HLTB Data Updater for Production")
    print("="*60 + "\n")
    
    asyncio.run(main())
