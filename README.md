# Steam Priority Picker

A Python tool that analyzes your Steam library, fetches game completion times from HowLongToBeat, retrieves review scores, and generates a sorted list of short, high-quality games to help you decide what to play next.

## Features

- 🎮 **Fetch Steam Library**: Automatically retrieves your entire Steam library using the Steam Web API
- ⏱️ **HowLongToBeat Integration**: Queries completion times for each game
- ⭐ **Review Scores**: Fetches review scores from Steam (percentage-based user ratings)
- 🔍 **Smart Filtering**: Automatically filters out games without HowLongToBeat data
- 📊 **Intelligent Sorting**: Prioritizes games by shortest playtime first, then highest score
- 💾 **Caching**: Avoids repeated API calls with intelligent caching system (24-hour TTL)
- 📝 **Multiple Output Formats**: Human-readable text and structured JSON output

## Prerequisites

- Python 3.7+
- Steam Web API key ([Get one here](https://steamcommunity.com/dev/apikey))
- Your Steam ID ([Find yours here](https://steamid.io/))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/RGVylar/steam-priority-picker.git
cd steam-priority-picker
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure your credentials:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Steam API key and Steam ID:
```
STEAM_API_KEY=your_steam_api_key_here
STEAM_ID=your_steam_id_here
```

## Usage

### Basic Usage

Run the script to process your entire Steam library:

```bash
python main.py
```

This will:
1. Fetch your Steam library
2. Query HowLongToBeat for each game
3. Fetch review scores from Steam
4. Filter games without HLTB data
5. Sort by playtime and score
6. Output results to console and `priority_games.json`

### Testing with Limited Games

To test with a smaller subset of games (recommended for first run):

```python
# Edit main.py and uncomment:
picker.run(max_games=10)
```

### Output

The tool generates two outputs:

1. **Console Output**: Human-readable list with game details
2. **JSON File** (`priority_games.json`): Structured data for further processing

Example output:
```
================================================================================
STEAM PRIORITY PICKER - RECOMMENDED GAMES
================================================================================

1. Portal
   Playtime: 3.5 hours (main story)
   Score: 95.2% (Steam) - Overwhelmingly Positive
   Reviews: 50,234
   Steam: https://store.steampowered.com/app/400/
   HLTB: https://howlongtobeat.com/game/7231

2. Portal 2
   Playtime: 8.5 hours (main story)
   Score: 98.1% (Steam) - Overwhelmingly Positive
   Reviews: 125,456
   Steam: https://store.steampowered.com/app/620/
   HLTB: https://howlongtobeat.com/game/7232
```

## Project Structure

```
steam-priority-picker/
├── main.py           # Main application script
├── steam_api.py      # Steam Web API module
├── hltb_api.py       # HowLongToBeat API module
├── review_api.py     # Review score fetching module
├── cache.py          # Caching system
├── requirements.txt  # Python dependencies
├── .env.example      # Example environment configuration
├── .gitignore        # Git ignore rules
└── README.md         # This file
```

## How It Works

1. **Steam Library Fetch**: Uses Steam Web API to retrieve all owned games
2. **HLTB Query**: For each game, searches HowLongToBeat for completion time data
3. **Review Score**: Fetches Steam user review percentage
4. **Filtering**: Removes games without HowLongToBeat data
5. **Sorting**: Orders by playtime (shortest first), then score (highest first)
6. **Caching**: Stores API responses locally to avoid redundant calls

## Configuration

### Cache Settings

The cache system stores API responses for 24 hours by default. Cached data is stored in the `cache/` directory.

To clear the cache manually:
```bash
rm -rf cache/
```

### Rate Limiting

The script includes built-in delays between API calls:
- 0.5 seconds between HowLongToBeat queries
- 0.3 seconds between review score fetches

## Error Handling

- **Network Errors**: Logged and skipped; processing continues with remaining games
- **Missing Data**: Games without HLTB data are automatically filtered out
- **API Failures**: Individual game failures don't stop the entire process

## Limitations

- HowLongToBeat search may not find exact matches for all games
- Review scores are currently limited to Steam user reviews
- Processing large libraries (1000+ games) may take significant time
- Rate limiting ensures responsible API usage but slows down processing

## Future Enhancements

- [ ] Add Metacritic and OpenCritic score integration
- [ ] Implement parallel processing for faster library scanning
- [ ] Add web interface for easier configuration
- [ ] Support for additional sorting options
- [ ] Game genre and tag filtering
- [ ] Export to different formats (CSV, HTML)

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Troubleshooting

### "No games found with HLTB data"
- Check that your Steam profile is public
- Verify your Steam ID is correct
- Try running with `max_games=10` to test with a smaller subset

### API Errors
- Verify your Steam API key is valid
- Check your internet connection
- Review logs for specific error messages

### Cache Issues
- Clear the cache directory: `rm -rf cache/`
- Disable caching by modifying the code: `use_cache=False`
