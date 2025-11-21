#!/usr/bin/env python3
"""
Export cache data to games.json for use in the React frontend.
This script reads all cached game data and compiles it into a single JSON file.
"""

import json
import os
from pathlib import Path

def cache_to_json():
    # Paths
    cache_dir = Path("cache")
    output_file = Path("web/src/data/games.json")
    
    games = []
    review_data = {}
    
    print(f"Reading cache from: {cache_dir}")
    
    # First pass: read all files to build a map
    # Files are named like: review_GameName.json or hltb_GameName.json
    for filename in cache_dir.glob("*.json"):
        if filename.name == "steam_library_76561198137938956.json":
            continue  # Skip library file
            
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                if 'value' not in data:
                    continue
                    
                value = data['value']
                
                # Extract game name and type from filename
                stem = filename.stem
                if stem.startswith("review_"):
                    game_name = stem.replace("review_", "")
                    if game_name not in review_data:
                        review_data[game_name] = {}
                    review_data[game_name]['review'] = value
                    
                elif stem.startswith("hltb_"):
                    game_name = stem.replace("hltb_", "")
                    if game_name not in review_data:
                        review_data[game_name] = {}
                    # Skip if marked as not found
                    if not (isinstance(value, dict) and value.get("not_found")):
                        review_data[game_name]['hltb'] = value
        except Exception as e:
            pass  # Silently skip errors
    
    # Second pass: create game objects from collected data
    for game_name, data in review_data.items():
        try:
            review_info = data.get('review', {})
            hltb_info = data.get('hltb', {})
            
            # Only include if we have review data
            if not review_info or not review_info.get("app_id"):
                continue
            
            game = {
                "app_id": review_info.get("app_id", 0),
                "name": game_name.replace("_", " "),
                "playtime_hours": review_info.get("playtime_hours", 0),
                "score": review_info.get("score", 0),
                "score_source": "Steam",
                "total_reviews": review_info.get("total_reviews", 0),
                "review_desc": review_info.get("review_desc", "Not rated"),
                "steam_url": review_info.get("steam_url", ""),
                "hltb_url": hltb_info.get("hltb_url", "") if isinstance(hltb_info, dict) else "",
                "hltb_name": hltb_info.get("game_name", game_name.replace("_", " ")) if isinstance(hltb_info, dict) else "",
            }
            
            if game["app_id"] and game["steam_url"]:
                games.append(game)
        except Exception as e:
            pass  # Silently skip errors
    
    # Sort by playtime ascending
    games.sort(key=lambda g: g["playtime_hours"])
    
    # Write output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"games": games}, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(games)} games to {output_file}")

if __name__ == "__main__":
    cache_to_json()
