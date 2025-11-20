# Quick Start Guide

## First Time Setup

1. **Get Your Steam API Key**
   - Visit: https://steamcommunity.com/dev/apikey
   - You'll need to be logged into Steam
   - Enter a domain name (can be anything, e.g., "localhost")
   - Copy your API key

2. **Find Your Steam ID**
   - Visit: https://steamid.io/
   - Enter your Steam profile URL or username
   - Copy your 17-digit Steam ID (steamID64)

3. **Configure the Tool**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your credentials:
   ```
   STEAM_API_KEY=ABC123...
   STEAM_ID=76561198012345678
   ```

## Running the Tool

### Try the Demo First
See how the tool works with sample data:
```bash
python3 demo.py
```

### Process Your Full Library
```bash
python3 main.py
```

This will:
- Fetch your entire Steam library
- Query HowLongToBeat for each game
- Fetch Steam review scores
- Filter out games without HLTB data
- Sort by shortest playtime, then highest score
- Output results to console and `priority_games.json`

**Note:** Processing a large library can take time due to rate limiting. Be patient!

### Test with Limited Games
For testing or faster results, edit `main.py`:

```python
# Change this line in main():
picker.run()

# To this:
picker.run(max_games=10)
```

This will process only the first 10 games from your library.

## Understanding the Output

### Console Output
Shows a ranked list of games with:
- Game name
- Main story playtime in hours
- Review score percentage and description
- Total number of reviews
- Steam store link
- HowLongToBeat link

### JSON Output
`priority_games.json` contains the same data in structured format for:
- Further analysis
- Importing into other tools
- Custom filtering or sorting

## Troubleshooting

### "Missing STEAM_API_KEY or STEAM_ID"
- Verify `.env` file exists in the same directory as `main.py`
- Check that your credentials are correct
- Make sure there are no extra spaces or quotes

### "No games found with HLTB data"
- Ensure your Steam profile is set to **Public**
- Verify your Steam ID is correct (should be 17 digits)
- Try running with `max_games=10` to test with fewer games

### Slow Performance
- This is normal! The tool includes rate limiting to be respectful to APIs
- Cached data is reused for 24 hours
- First run will be slowest; subsequent runs use cache

### Clear Cache
If you want to refresh all data:
```bash
rm -rf cache/
```

## Tips

1. **Start Small**: Test with `max_games=10` before processing your full library
2. **Public Profile**: Make sure your Steam profile is public
3. **Cache**: The tool caches API responses for 24 hours to speed up subsequent runs
4. **Patience**: Large libraries (100+ games) can take 10-30+ minutes on first run

## What Gets Filtered Out?

Games are automatically excluded if:
- HowLongToBeat has no data for them
- The game name doesn't match in HLTB database
- Main story time is 0 or unavailable

This ensures you only see games with reliable completion time estimates.
