"""
Check production database status before updating
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

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

def main():
    db = SessionLocal()
    
    try:
        print("\n" + "="*60)
        print("📊 Production Database Status")
        print("="*60 + "\n")
        
        # Check if hltb_url column exists
        print("1️⃣ Checking table structure...")
        result = db.execute(text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'games'
            ORDER BY ordinal_position
        """))
        columns = result.fetchall()
        print(f"   Columns in 'games' table:")
        for col in columns:
            print(f"     - {col[0]} ({col[1]})")
        
        # Check total games
        print("\n2️⃣ Counting games...")
        result = db.execute(text("SELECT COUNT(*) FROM games"))
        total_games = result.scalar()
        print(f"   Total games: {total_games}")
        
        # Check games with hltb_url
        print("\n3️⃣ Checking HLTB data...")
        try:
            result = db.execute(text("""
                SELECT COUNT(*) FROM games 
                WHERE hltb_url IS NOT NULL AND hltb_url != ''
            """))
            games_with_url = result.scalar()
            print(f"   Games with HLTB URL: {games_with_url} ({games_with_url*100/total_games:.1f}%)")
        except Exception as e:
            print(f"   ⚠️ Column 'hltb_url' doesn't exist yet: {e}")
            games_with_url = 0
        
        # Check games with playtime = 0
        result = db.execute(text("""
            SELECT COUNT(*) FROM games 
            WHERE playtime_hours = 0 OR playtime_hours IS NULL
        """))
        games_no_playtime = result.scalar()
        print(f"   Games with playtime = 0: {games_no_playtime} ({games_no_playtime*100/total_games:.1f}%)")
        
        # Show sample of games
        print("\n4️⃣ Sample of 10 games:")
        try:
            result = db.execute(text("""
                SELECT name, playtime_hours, hltb_url 
                FROM games 
                LIMIT 10
            """))
            games = result.fetchall()
            for game in games:
                url_status = '✅' if game[2] else '❌'
                print(f"   {url_status} {game[0][:40]:40} | {game[1]:.1f}h | {game[2] or 'N/A'}")
        except Exception as e:
            print(f"   ⚠️ Can't show sample (hltb_url column missing)")
            result = db.execute(text("""
                SELECT name, playtime_hours
                FROM games 
                LIMIT 10
            """))
            games = result.fetchall()
            for game in games:
                print(f"   {game[0][:40]:40} | {game[1]:.1f}h")
        
        # Estimate games needing update
        print("\n5️⃣ Games that would be updated:")
        try:
            result = db.execute(text("""
                SELECT COUNT(*) FROM games 
                WHERE hltb_url IS NULL OR playtime_hours = 0
            """))
            needs_update = result.scalar()
            print(f"   Games needing HLTB data: {needs_update} ({needs_update*100/total_games:.1f}%)")
        except:
            print(f"   All games need HLTB URL (column doesn't exist yet)")
            print(f"   Games with playtime = 0 need update: {games_no_playtime}")
        
        print("\n" + "="*60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
