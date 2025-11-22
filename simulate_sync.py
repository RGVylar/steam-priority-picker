#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Simulate a full games sync for the test user"""
import asyncio
import sys
import os

# Fix encoding for Windows PowerShell
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Change to backend directory so database path works
backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
os.chdir(backend_dir)
sys.path.insert(0, backend_dir)

from app.services.auth_service import SteamAuthService
from app.database import SessionLocal, engine
from app.models import Base, Game, User

async def simulate_sync():
    """Simulate a full sync for the test user"""
    
    # Create tables
    Base.metadata.create_all(engine)
    
    db = SessionLocal()
    
    # Get test user
    user = db.query(User).filter(User.steam_id == "76561197960287930").first()
    if not user:
        print("❌ Test user not found. Create it first with setup_test.py")
        db.close()
        return
    
    print(f"✅ Found user: {user.username} ({user.steam_id})")
    
    # Initialize auth service
    auth_service = SteamAuthService()
    
    # Get user's owned games from Steam
    print("\n📥 Fetching owned games from Steam...")
    owned_games_data = await auth_service.get_user_owned_games(user.steam_id)
    
    if not owned_games_data or "games" not in owned_games_data:
        print("❌ Could not fetch games from Steam API")
        db.close()
        return
    
    owned_app_ids = {}
    for game in owned_games_data["games"]:
        owned_app_ids[game["appid"]] = game.get("playtime_forever", 0) / 60
    
    print(f"✅ User owns {len(owned_app_ids)} games")
    
    # Find known and unknown games
    known_games = db.query(Game.app_id, Game.name).filter(Game.app_id.in_(list(owned_app_ids.keys()))).all()
    known_app_ids = {g.app_id for g in known_games}
    games_with_generic_names = {g.app_id for g in known_games if g.name.startswith("Game ")}
    
    unknown_app_ids = [aid for aid in owned_app_ids.keys() if aid not in known_app_ids or aid in games_with_generic_names]
    
    print(f"\n📊 Game Status:")
    print(f"  Known games: {len(known_app_ids)}")
    print(f"  Games with generic names: {len(games_with_generic_names)}")
    print(f"  Unknown/needs refetch: {len(unknown_app_ids)}")
    
    # Process in batches of 50
    if unknown_app_ids:
        print(f"\n🔄 Processing {len(unknown_app_ids)} games in batches of 50...")
        
        for batch_start in range(0, len(unknown_app_ids), 50):
            batch_end = min(batch_start + 50, len(unknown_app_ids))
            batch_app_ids = unknown_app_ids[batch_start:batch_end]
            batch_num = batch_start // 50 + 1
            
            print(f"\n  Batch {batch_num}: fetching {len(batch_app_ids)} games...")
            
            unknown_games = await auth_service.fetch_unknown_games_info(batch_app_ids, db)
            
            if unknown_games:
                games_added = 0
                games_updated = 0
                
                for game_data in unknown_games:
                    app_id = game_data.get("app_id")
                    new_name = game_data.get("name", "Unknown")
                    
                    existing = db.query(Game).filter(Game.app_id == app_id).first()
                    if existing:
                        # Update if we found a real name
                        if not new_name.startswith("Game ") and existing.name.startswith("Game "):
                            print(f"    ⬆️ {app_id}: {existing.name} → {new_name}")
                            existing.name = new_name
                            existing.header_image = game_data.get("header_image", "") or existing.header_image
                            existing.playtime_hours = game_data.get("playtime_hours", 0) or existing.playtime_hours
                            existing.score = game_data.get("score", 0) or existing.score
                            existing.total_reviews = game_data.get("total_reviews", 0) or existing.total_reviews
                            games_updated += 1
                        continue
                    
                    # Add new game
                    from app.models import Game as GameModel
                    game = GameModel(
                        app_id=app_id,
                        name=new_name,
                        header_image=game_data.get("header_image", ""),
                        playtime_hours=game_data.get("playtime_hours", 0),
                        score=game_data.get("score", 0),
                        total_reviews=game_data.get("total_reviews", 0)
                    )
                    db.add(game)
                    games_added += 1
                
                if games_added > 0 or games_updated > 0:
                    try:
                        db.commit()
                        print(f"    ✅ Committed: +{games_added} new, ⬆️{games_updated} updated")
                    except Exception as e:
                        db.rollback()
                        print(f"    ❌ Error committing: {e}")
    
    # Final verification
    print(f"\n📊 Final Status:")
    final_games = db.query(Game).all()
    print(f"  Total games in DB: {len(final_games)}")
    
    generic_count = sum(1 for g in final_games if g.name.startswith("Game "))
    print(f"  Games with generic names: {generic_count}")
    
    if generic_count > 0:
        print(f"\n  First 10 games with generic names:")
        for g in [x for x in final_games if x.name.startswith("Game ")][:10]:
            print(f"    {g.app_id}: {g.name}")
    
    # Show some real names
    real_games = [g for g in final_games if not g.name.startswith("Game ")]
    if real_games:
        print(f"\n  Sample of games with real names:")
        for g in real_games[:10]:
            score_str = f"{g.score:.1f}%" if g.score else "N/A"
            print(f"    {g.app_id}: {g.name} ({score_str}, {g.total_reviews} reviews)")
    
    db.close()

if __name__ == "__main__":
    asyncio.run(simulate_sync())
