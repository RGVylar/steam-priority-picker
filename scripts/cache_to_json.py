#!/usr/bin/env python3
"""
Export cache data to games.json for use in the React frontend.
This script reads all cached game data and compiles it into a single JSON file.
"""

import json
import os
from pathlib import Path

def normalize_name(name):
    """Normalize game name for comparison."""
    return name.lower().replace(" ", "_").replace(":", "").replace("-", "_")

def cache_to_json():
    # Paths
    cache_dir = Path("cache")
    output_file = Path("web/src/data/games.json")
    
    games = []
    steam_library = {}
    review_data = {}
    hltb_data = {}
    
    print(f"Reading cache from: {cache_dir}")
    
    # Load Steam library first
    library_file = cache_dir / "steam_library_76561198137938956.json"
    if library_file.exists():
        try:
            with open(library_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'value' in data and isinstance(data['value'], list):
                    for game in data['value']:
                        appid = game.get('appid')
                        name = game.get('name', '')
                        playtime = game.get('playtime_forever', 0)
                        
                        if appid and name:
                            steam_library[appid] = {
                                'name': name,
                                'playtime_minutes': playtime,
                                'playtime_hours': round(playtime / 60, 1)
                            }
                            # Also index by normalized name
                            norm_name = normalize_name(name)
                            steam_library[norm_name] = steam_library[appid]
                    print(f"✅ Loaded {len(steam_library) // 2} games from Steam library")
        except Exception as e:
            print(f"⚠️ Error loading Steam library: {e}")
    
    # Parse review and hltb files
    for filename in cache_dir.glob("*.json"):
        if filename.name == "steam_library_76561198137938956.json":
            continue
            
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                if 'value' not in data:
                    continue
                    
                value = data['value']
                stem = filename.stem
                
                if stem.startswith("review_"):
                    # Extract app_id from filename (format: review_APPID.json)
                    try:
                        app_id = int(stem.replace("review_", ""))
                        review_data[app_id] = value
                    except:
                        pass
                        
                elif stem.startswith("hltb_"):
                    game_name = stem.replace("hltb_", "")
                    # Skip if marked as not found
                    if not (isinstance(value, dict) and value.get("not_found")):
                        norm_name = normalize_name(game_name)
                        hltb_data[norm_name] = value
        except Exception as e:
            pass  # Silently skip errors
    
    print(f"✅ Loaded {len(review_data)} review entries")
    print(f"✅ Loaded {len(hltb_data)} HLTB entries")
    
    # Combine data
    for app_id, steam_info in steam_library.items():
        # Skip normalized names (already in appid)
        if isinstance(app_id, str):
            continue
            
        try:
            review_info = review_data.get(app_id, {})
            game_name = steam_info.get('name', '')
            
            # Skip if no review data
            if not review_info or not isinstance(review_info, dict):
                continue
            
            # Look up HLTB data
            hltb_info = {}
            norm_name = normalize_name(game_name)
            if norm_name in hltb_data:
                hltb_info = hltb_data[norm_name]
            
            game = {
                "app_id": app_id,
                "name": game_name,
                "playtime_hours": steam_info.get('playtime_hours', 0),
                "score": review_info.get('score', 0),
                "total_reviews": review_info.get('total_reviews', 0),
                "review_desc": review_info.get('review_desc', 'Not rated'),
                "steam_url": f"https://steamcommunity.com/app/{app_id}",
                "image_url": f"https://cdn.cloudflare.steamstatic.com/steam/apps/{app_id}/header.jpg",
                "hltb_url": hltb_info.get('url', '') if isinstance(hltb_info, dict) else "",
                "hltb_name": hltb_info.get('name', game_name) if isinstance(hltb_info, dict) else "",
            }
            
            games.append(game)
        except Exception as e:
            pass  # Silently skip errors
    
    # Sort by playtime ascending
    games.sort(key=lambda g: g["playtime_hours"])
    
    # Write output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(games, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(games)} games to {output_file}")

if __name__ == "__main__":
    cache_to_json()
