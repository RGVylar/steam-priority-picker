# Development Plan - Steam Priority Picker Web App

## Overview
Convert the existing Steam Priority Picker Python script into a full-stack web application with a modern UI, backend API, and database. The goal is to create a tool where users can enter their Steam ID and get a prioritized list of games to play based on playtime, reviews, and completion time data from HowLongToBeat.

**Tech Stack (100% Free Tier):**
- Frontend: React 18 + Vite + Tailwind CSS → Vercel
- Backend: FastAPI + Uvicorn → Render
- Database: PostgreSQL → Neon
- CI/CD: GitHub Actions
- Version Control: Git + GitHub

---

## Phase 1: MVP Frontend (Weeks 1-2)

### Objectives
- [x] Export cache data to `games.json` static file
- [x] Create React + Vite project in `/web` directory
- [x] Build core components: GameList, GameCard, FilterPanel, SearchBar
- [x] Implement filtering: playtime ranges, score, search
- [x] Add links to Steam Store and HowLongToBeat
- [x] Make responsive (mobile + desktop)
- [ ] Deploy to Vercel (auto-deploy from GitHub)

### Data Display
Each game shows:
- Game name
- Playtime (hours)
- Steam score (%)
- Review description (Overwhelmingly Positive, etc.)
- Total reviews count
- Links: Steam Store, HowLongToBeat page

### Filtering/Sorting ✅ COMPLETED
- **By Playtime:** 0-5 hrs, 5-10 hrs, 10-20 hrs, 20+ hrs ✅
- **By Score:** 75-100%, 50-75%, below 50% ✅
- **By Reviews:** Min/Max sliders ✅
- **By Status:** All/Played/Unplayed (with localStorage persistence) ✅
- **Search:** Real-time search by game name ✅
- **Sort:** Playtime asc/desc, Score asc/desc (default: score_desc) ✅
- **Collapsible Filters:** Para mejor UX ✅

### User Interface ✅ COMPLETED
- [x] Header with logo and dark mode toggle
- [x] Search bar (top) with real-time filtering
- [x] Collapsible filter sidebar (left on desktop, mobile drawer)
- [x] Infinite scroll grid (24 games at a time)
- [x] Game card: Steam header image, title, playtime badge, score, reviews, action buttons
- [x] Dark mode with system preference detection and localStorage persistence
- [x] "Mark as Played" button on each card
- [x] Played games counter in filter panel

---

## Phase 2: Backend API (Weeks 3-4) ✅ COMPLETE

### Objectives
- [x] Create FastAPI project in `/backend` directory
- [x] Implement game service and routes
- [x] Create API endpoints for games data
- [x] Connect frontend to backend API via `useGames` hook
- [x] Add validation, error handling, pagination
- [x] Auto-generated Swagger documentation at `/docs`

### API Endpoints ✅ IMPLEMENTED
```
GET    /api/health              # Health check ✅
GET    /api/games               # List all games (paginated) ✅
GET    /api/games/{app_id}      # Game details ✅
GET    /api/search?q=...        # Search games by name/filters ✅
GET    /api/filters             # Available filter options ✅
```

### Architecture
- **Backend:** FastAPI running on port 8000
- **Data Source:** `backend/data/games.json` (1066 games from cache)
- **Service Layer:** `GameService` handles all data operations
- **Validation:** Pydantic schemas for request/response validation
- **CORS:** Configured for local dev and production URLs

### Integration Status
- [x] Frontend hooks updated to use `/api/search` endpoint
- [x] Environment variable `VITE_API_URL` configured
- [x] Both servers running locally (5173 + 8000)
- [x] All filters working via API
- [x] Infinite scroll functional with pagination

### Deployment
- Backend ready for Render, Railway, or Fly.io
- Frontend ready for Vercel
- See `DEPLOYMENT.md` for production setup instructions

---

## Phase 3: Database Integration (Weeks 5-6) 📅 NEXT
  "games": [
    {
      "app_id": 400,
      "name": "Portal",
      "playtime_hours": 3.5,
      "score": 95.2,
      "score_source": "Steam",
      "total_reviews": 50234,
      "review_desc": "Overwhelmingly Positive",
      "steam_url": "https://store.steampowered.com/app/400/",
      "hltb_url": "https://howlongtobeat.com/game/7231",
      "hltb_name": "Portal"
    }
  ],
  "total": 1080,
  "page": 1,
  "page_size": 20
}
```

---

## Phase 3: Database & Advanced Features (Weeks 5-7)

### Objectives
- [ ] Setup PostgreSQL database in Neon
- [ ] Create database schema for games, users, sync jobs
- [ ] Migrate cache data (1080 games) to PostgreSQL
- [ ] Implement Steam OAuth login
- [ ] Build sync endpoint with background tasks (Celery)
- [ ] Add WebSocket for real-time sync progress
- [ ] Implement user library persistence
- [ ] Deploy everything with Docker

### Features
- **User Accounts:** Steam OAuth login, profile, saved lists
- **Live Sync:** Users enter Steam ID → backend fetches their library → real-time progress updates
- **Background Jobs:** Celery for async processing (fetch Steam API, query HowLongToBeat, scrape reviews)
- **Caching:** Redis for session data and rate limiting
- **Notifications:** Toast notifications for sync status

### Database Schema
```sql
-- Games (static data)
CREATE TABLE games (
  app_id INTEGER PRIMARY KEY,
  name VARCHAR(255),
  playtime_hours FLOAT,
  score FLOAT,
  total_reviews INTEGER,
  review_desc VARCHAR(100),
  steam_url TEXT,
  hltb_url TEXT,
  hltb_name VARCHAR(255)
);

-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  steam_id BIGINT UNIQUE,
  username VARCHAR(255),
  avatar_url TEXT,
  library_count INTEGER,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- User Libraries
CREATE TABLE user_libraries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  app_id INTEGER REFERENCES games(app_id),
  playtime_forever INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Sync Jobs
CREATE TABLE sync_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status VARCHAR(20), -- 'pending', 'processing', 'completed', 'failed'
  progress INTEGER, -- 0-100
  total_games INTEGER,
  processed_games INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);
```

---

## Project Structure

```
steam-priority-picker/
├── web/                              # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameList.jsx           # Main games table/grid
│   │   │   ├── GameCard.jsx           # Single game card
│   │   │   ├── FilterPanel.jsx        # Filters sidebar
│   │   │   ├── SearchBar.jsx          # Search input
│   │   │   ├── Header.jsx             # App header/nav
│   │   │   └── GameDetail.jsx         # Modal/page detail view
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # Main page
│   │   │   ├── GameDetail.jsx         # Detail view
│   │   │   └── Login.jsx              # Steam login (Phase 3)
│   │   ├── hooks/
│   │   │   ├── useGames.js            # Fetch games data
│   │   │   ├── useFilters.js          # Filter state
│   │   │   └── useAuth.js             # Auth state (Phase 3)
│   │   ├── utils/
│   │   │   └── api.js                 # API client
│   │   ├── styles/
│   │   │   └── index.css              # Global styles
│   │   └── App.jsx
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── .gitignore
│
├── backend/                           # FastAPI Backend
│   ├── app/
│   │   ├── main.py                    # FastAPI app entry
│   │   ├── config.py                  # Config, env vars
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── games.py               # Game endpoints
│   │   │   ├── search.py              # Search endpoint
│   │   │   ├── sync.py                # Sync endpoints (Phase 3)
│   │   │   └── auth.py                # Auth endpoints (Phase 3)
│   │   ├── db/
│   │   │   ├── __init__.py
│   │   │   ├── database.py            # SQLAlchemy setup
│   │   │   ├── models.py              # ORM models
│   │   │   └── migrations/            # Alembic migrations (Phase 3)
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── game.py                # Pydantic models
│   │   │   ├── user.py
│   │   │   └── sync.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── game_service.py        # Business logic
│   │   │   ├── steam_service.py       # Steam API calls (Phase 3)
│   │   │   ├── hltb_service.py        # HowLongToBeat calls
│   │   │   └── review_service.py      # Review scraping
│   │   └── middleware/
│   │       └── cors.py
│   ├── tests/
│   │   ├── test_games.py
│   │   └── test_search.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env.example
│   └── main.py
│
├── scripts/                           # Utility Scripts
│   ├── cache_to_json.py              # Export cache → games.json
│   ├── migrate_to_db.py              # Cache → PostgreSQL
│   └── seed_db.py
│
├── .github/
│   └── workflows/
│       ├── backend-deploy.yml        # Auto-deploy to Render
│       └── frontend-deploy.yml       # Auto-deploy to Vercel
│
├── docker-compose.yml                # Local development
├── DEVELOPMENT_PLAN.md               # This file
├── README.md
├── PROMPTS.md                        # GitHub Copilot prompts
│
└── [Original Python files]
    ├── main.py
    ├── steam_api.py
    ├── hltb_api.py
    ├── review_api.py
    ├── cache.py
    └── requirements.txt
```

---

## Implementation Roadmap

### Week 1-2: Frontend MVP
1. Export cache to `games.json`
2. Create React + Vite project scaffold
3. Build GameList, GameCard, FilterPanel components
4. Implement filtering and search logic
5. Add responsive design with Tailwind
6. Deploy to Vercel

### Week 3-4: Backend API
1. Create FastAPI project scaffold
2. Create database models and schema
3. Implement endpoints: /games, /search, /games/{id}, /filters
4. Load cache data into memory or file-based cache
5. Add validation, pagination, error handling
6. Deploy to Render

### Week 5-6: Database & Migrations
1. Setup Neon PostgreSQL account
2. Create database schema
3. Migrate cache data to PostgreSQL
4. Update backend to query database
5. Add connection pooling

### Week 7: Advanced Features
1. Implement Steam OAuth login
2. Build user profile and library management
3. Create sync job system
4. Setup Celery for background tasks
5. Add WebSocket for real-time progress
6. Full end-to-end testing

---

## Deployment Configuration

### Frontend (Vercel)
- **URL:** https://steam-priority-picker.vercel.app
- **Env vars:** `VITE_API_URL=https://steam-priority-picker-api.onrender.com`
- **Auto-deploy:** Push to GitHub → auto-deploy
- **Free tier:** ✅ Unlimited deployments

### Backend (Render)
- **URL:** https://steam-priority-picker-api.onrender.com
- **Env vars:**
  - `DATABASE_URL=postgresql://...` (Neon)
  - `STEAM_API_KEY=...`
  - `CELERY_BROKER_URL=...` (Phase 3)
- **Build:** Docker image
- **Free tier:** ✅ One free instance (auto-sleep after 15 min inactivity)

### Database (Neon)
- **Plan:** Free tier (1 project, 3 branches, 100k rows)
- **Auto-backups:** Yes
- **Connection pooling:** Built-in

---

## GitHub Copilot Prompts

See `PROMPTS.md` for structured prompts to guide development of each phase.

**Prompts:**
1. **Prompt 1:** Frontend Setup - React + Vite scaffold
2. **Prompt 2:** Game List Component - Interactive table/grid
3. **Prompt 3:** Backend Setup - FastAPI structure
4. **Prompt 4:** API Endpoints - CRUD games, search
5. **Prompt 5:** Database Schema - PostgreSQL models
6. **Prompt 6:** Deployment Config - Docker, GitHub Actions, Vercel, Render, Neon

---

## Success Criteria

### Phase 1 MVP
- ✅ Frontend loads and displays 1080 games from cache
- ✅ Filtering and search work smoothly
- ✅ Responsive on mobile and desktop
- ✅ Deployed to Vercel and accessible publicly

### Phase 2 API
- ✅ Backend serves all game data via API
- ✅ Frontend gets data from backend (not static file)
- ✅ All endpoints tested and documented
- ✅ Deployed to Render and accessible

### Phase 3 Full Features
- ✅ Database operational with all data migrated
- ✅ Users can login with Steam account
- ✅ Users can enter Steam ID and sync their library
- ✅ Real-time progress updates during sync
- ✅ User libraries persisted and retrievable

---

## Testing Strategy

### Unit Tests
- Backend: pytest for FastAPI endpoints
- Frontend: Vitest for React components

### Integration Tests
- API endpoints with sample data
- Database queries and transactions

### E2E Tests
- Playwright for full user flows
- Test MVP: Load → Filter → Click game → See details

### Performance
- Frontend bundle size < 200KB (gzipped)
- API response time < 500ms
- Database queries indexed for speed

---

## Known Limitations & Future Enhancements

### Phase 1-3 Limitations
- No user ratings/reviews system
- No custom game lists/collections
- No recommendations engine
- No offline support
- Limited to HowLongToBeat and Steam data sources

### Future Enhancements (Phase 4+)
- [ ] User ratings and reviews
- [ ] Custom game collections
- [ ] Recommendation engine (ML)
- [ ] Mobile app (React Native)
- [ ] Game genre/tags filtering
- [ ] Steam friends comparison
- [ ] Playtime statistics and insights
- [ ] Price history integration
- [ ] Community tags and voting

---

## Getting Started

### Local Development Setup
```bash
# Clone repo
git clone https://github.com/RGVylar/steam-priority-picker.git
cd steam-priority-picker

# Install Python dependencies (existing script)
pip install -r requirements.txt

# Export cache to JSON
python scripts/cache_to_json.py

# Frontend
cd web
npm install
npm run dev

# Backend (separate terminal)
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Environment Variables
Create `.env` files in `backend/` and `web/` directories:

**backend/.env:**
```
DATABASE_URL=sqlite:///./test.db  # Local dev
STEAM_API_KEY=your_key_here
NEON_DATABASE_URL=postgresql://...  # Production
```

**web/.env:**
```
VITE_API_URL=http://localhost:8000
```

---

## References
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Vite Docs](https://vitejs.dev/)
- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Neon Docs](https://neon.tech/docs)

---

**Last Updated:** November 21, 2025
**Status:** Planning Phase
**Next Step:** Create Prompts & Begin Frontend MVP
