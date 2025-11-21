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
    hltb_data = {}
    
    print(f"Reading cache from: {cache_dir}")
    
    # First pass: read review data
    for filename in cache_dir.glob("review_*.json"):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if 'value' in data:
                    review_info = data['value']
                    # Extract game name from filename: review_GameName.json
                    game_name = filename.stem.replace("review_", "")
                    review_data[game_name] = review_info
        except Exception as e:
            print(f"Error reading {filename}: {e}")
    
    # Second pass: read HLTB data and create game objects
    for filename in cache_dir.glob("hltb_*.json"):
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Extract game name from filename: hltb_GameName.json
                game_name = filename.stem.replace("hltb_", "")
                
                if 'value' in data:
                    value = data['value']
                    # Skip if not found
                    if isinstance(value, dict) and value.get("not_found"):
                        continue
                    
                    # Get review data for this game
                    review_info = review_data.get(game_name, {})
                    
                    # Create game object
                    game = {
                        "app_id": review_info.get("app_id", 0),
                        "name": game_name.replace("_", " "),
                        "playtime_hours": review_info.get("playtime_hours", 0),
                        "score": review_info.get("score", 0),
                        "score_source": "Steam",
                        "total_reviews": review_info.get("total_reviews", 0),
                        "review_desc": review_info.get("review_desc", "Not rated"),
                        "steam_url": review_info.get("steam_url", ""),
                        "hltb_url": review_info.get("hltb_url", ""),
                        "hltb_name": value.get("name", game_name.replace("_", " ")) if isinstance(value, dict) else "",
                    }
                    
                    if game["app_id"] and game["steam_url"]:  # Only add if valid
                        games.append(game)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
    
    # Sort by playtime ascending
    games.sort(key=lambda g: g["playtime_hours"])
    
    # Write output
    output_file.parent.mkdir(parents=True, exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({"games": games}, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Exported {len(games)} games to {output_file}")

if __name__ == "__main__":
    cache_to_json()
