#!/usr/bin/env python3
"""
Demo script that shows the Steam Priority Picker functionality using mock data.
This demonstrates the tool without requiring actual Steam API credentials.
"""
import json
from main import SteamPriorityPicker


def demo():
    """Run a demo of the Steam Priority Picker with mock data."""
    print("=" * 80)
    print("STEAM PRIORITY PICKER - DEMO MODE")
    print("=" * 80)
    print()
    print("This demo shows how the tool works with sample data.")
    print("To use with real data, configure your Steam API credentials in .env")
    print()
    
    # Sample enriched game data (as if already processed)
    sample_games = [
        {
            "name": "The Witcher 3: Wild Hunt",
            "appid": 292030,
            "playtime_hours": 51.5,
            "score": 94.3,
            "score_source": "Steam",
            "total_reviews": 548234,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/292030/",
            "hltb_url": "https://howlongtobeat.com/game/10270",
            "hltb_name": "The Witcher 3: Wild Hunt"
        },
        {
            "name": "Portal",
            "appid": 400,
            "playtime_hours": 3.5,
            "score": 95.2,
            "score_source": "Steam",
            "total_reviews": 50234,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/400/",
            "hltb_url": "https://howlongtobeat.com/game/7231",
            "hltb_name": "Portal"
        },
        {
            "name": "Firewatch",
            "appid": 383870,
            "playtime_hours": 4.2,
            "score": 88.5,
            "score_source": "Steam",
            "total_reviews": 32189,
            "review_desc": "Very Positive",
            "steam_url": "https://store.steampowered.com/app/383870/",
            "hltb_url": "https://howlongtobeat.com/game/28107",
            "hltb_name": "Firewatch"
        },
        {
            "name": "Portal 2",
            "appid": 620,
            "playtime_hours": 8.5,
            "score": 98.1,
            "score_source": "Steam",
            "total_reviews": 125456,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/620/",
            "hltb_url": "https://howlongtobeat.com/game/7232",
            "hltb_name": "Portal 2"
        },
        {
            "name": "Celeste",
            "appid": 504230,
            "playtime_hours": 8.0,
            "score": 96.7,
            "score_source": "Steam",
            "total_reviews": 41234,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/504230/",
            "hltb_url": "https://howlongtobeat.com/game/46708",
            "hltb_name": "Celeste"
        },
        {
            "name": "What Remains of Edith Finch",
            "appid": 501300,
            "playtime_hours": 2.5,
            "score": 91.8,
            "score_source": "Steam",
            "total_reviews": 18567,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/501300/",
            "hltb_url": "https://howlongtobeat.com/game/42682",
            "hltb_name": "What Remains of Edith Finch"
        },
        {
            "name": "Half-Life 2",
            "appid": 220,
            "playtime_hours": 12.0,
            "score": 96.8,
            "score_source": "Steam",
            "total_reviews": 89234,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/220/",
            "hltb_url": "https://howlongtobeat.com/game/4035",
            "hltb_name": "Half-Life 2"
        },
        {
            "name": "Stardew Valley",
            "appid": 413150,
            "playtime_hours": 52.5,
            "score": 98.2,
            "score_source": "Steam",
            "total_reviews": 487623,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/413150/",
            "hltb_url": "https://howlongtobeat.com/game/27449",
            "hltb_name": "Stardew Valley"
        },
        {
            "name": "Journey",
            "appid": 638230,
            "playtime_hours": 3.0,
            "score": 92.5,
            "score_source": "Steam",
            "total_reviews": 8456,
            "review_desc": "Overwhelmingly Positive",
            "steam_url": "https://store.steampowered.com/app/638230/",
            "hltb_url": "https://howlongtobeat.com/game/5409",
            "hltb_name": "Journey"
        }
    ]
    
    # Create a minimal picker instance for sorting and formatting
    picker = SteamPriorityPicker("demo_key", "demo_id", use_cache=False)
    
    # Sort the games
    print("Sorting games by playtime (shortest first) and score (highest first)...")
    sorted_games = picker.sort_games(sample_games)
    
    # Display results
    print()
    formatted = picker.format_output(sorted_games)
    print(formatted)
    
    # Save JSON output
    output_file = "demo_output.json"
    picker.save_json(sorted_games, output_file)
    print(f"\n✓ Demo output also saved to {output_file}")
    print()
    print("=" * 80)
    print("To use with your actual Steam library:")
    print("1. Get a Steam API key: https://steamcommunity.com/dev/apikey")
    print("2. Find your Steam ID: https://steamid.io/")
    print("3. Copy .env.example to .env and add your credentials")
    print("4. Run: python main.py")
    print("=" * 80)


if __name__ == "__main__":
    demo()
