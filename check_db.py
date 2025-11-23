import sqlite3

conn = sqlite3.connect('backend/steam_priority_picker.db')
cursor = conn.cursor()

# Check table structure
cursor.execute('PRAGMA table_info(games)')
columns = cursor.fetchall()

print('📊 Columnas en la tabla games:')
for col in columns:
    print(f'  - {col[1]} ({col[2]})')

# Count games
cursor.execute('SELECT COUNT(*) FROM games')
count = cursor.fetchone()[0]
print(f'\n🎮 Total de juegos en DB: {count}')

# Check if any game has hltb_url
if count > 0:
    cursor.execute('SELECT COUNT(*) FROM games WHERE hltb_url IS NOT NULL AND hltb_url != ""')
    hltb_count = cursor.fetchone()[0]
    print(f'🔗 Juegos con HLTB URL: {hltb_count}')
    
    # Show sample
    cursor.execute('SELECT name, playtime_hours, hltb_url FROM games LIMIT 5')
    games = cursor.fetchall()
    print(f'\n📋 Muestra de 5 juegos:')
    for game in games:
        hltb_status = '✅' if game[2] else '❌'
        print(f'  {hltb_status} {game[0]}: {game[1]:.1f}h | URL: {game[2] or "N/A"}')

conn.close()
