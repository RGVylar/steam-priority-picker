# Steam Priority Picker - Web Application

A modern web application to help you prioritize which Steam games to play. Analyzes your Steam library, fetches game completion times from HowLongToBeat, and retrieves review scores to help you decide what to play next.

🔗 **Live Demo:** https://steam-priority-picker.vercel.app (Deploy to Vercel - See VERCEL_DEPLOYMENT.md)

## 🎯 Features

## ✨ MVP Features (Phase 1 - Complete!)

### ✅ Currently Available
- 🎮 **1080+ Games Display**: Browse your full cataloged Steam library  
- 🖼️ **Steam Header Images**: Beautiful game artwork from Steam store
- 🔍 **Advanced Filtering**:
  - ⏱️ Playtime ranges (0-5, 5-10, 10-20, 20+ hours)
  - ⭐ Steam score ranges (75-100%, 50-75%, Below 50%)
  - 📊 Review count slider (min/max filtering)
  - ✓ Played/Unplayed status tracker with counter
- 🔤 **Real-time Search**: Instant filtering by game name
- 📊 **Sorting Options**: 
  - Playtime (ascending/descending)
  - Score (ascending/descending)
  - Default: Highest score first
- ♾️ **Infinite Scroll**: Load 24 games at a time
- 🎨 **Dark Mode**: Auto-detect system preference, toggle manually
- 📱 **Responsive Design**: Optimized for mobile, tablet, and desktop
- 🏷️ **Collapsible Filters**: Keep UI clean, expand only needed sections
- 💾 **Game Tracking**: Mark games as played (persists in localStorage)
- 🌙 **Persistent Settings**: All preferences saved locally
- ▶️ **Play Button Overlay**: Launch games directly via Steam protocol

## ✅ Phase 2 Features (Backend API - Complete!)

### ✅ API Backend (FastAPI)
- 🚀 **FastAPI Server** on port 8000 with auto-reload
- 📡 **REST Endpoints**:
  - `GET /api/games` - Paginated game list
  - `GET /api/games/{app_id}` - Single game details
  - `GET /api/search` - Advanced search with filtering
  - `GET /api/filters` - Available filter ranges
  - `GET /health` - Health check endpoint
- 🔄 **Frontend Integration**: React hooks consume API instead of static JSON
- 🔐 **CORS Middleware**: Configured for development and production
- 📚 **Auto-generated Docs**: Swagger UI at `/docs`

### 🎯 Planned Features (Phase 3)
- 👤 Steam account login (OAuth)  
- 🔄 Real-time library sync without manual export
- 📊 Game statistics and insights
- 🎲 Recommendation engine based on your preferences
- 📈 Playtime analytics and trends
- 🗄️ PostgreSQL Database integration

## 🏗️ Architecture

The project has three main components:

| Component | Technology | Status |
|-----------|-----------|--------|
| **Frontend** | React 18 + Vite | 🚀 MVP Ready |
| **Backend** | FastAPI | 🏗️ Scaffolded |
| **Database** | PostgreSQL | 📅 Phase 3 |

## 🔧 Full Setup Guide

### Initial Setup (First Time)

```bash
# 1. Clone repository
git clone https://github.com/RGVylar/steam-priority-picker.git
cd steam-priority-picker

# 2. Create .env with your Steam credentials
cp .env.example .env
# Edit .env and add:
#   STEAM_API_KEY=your_key_from_steamcommunity.com
#   STEAM_ID=your_steamid64_number

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Fetch all your Steam games
python main.py  # Takes 5-10 minutes (API rate limiting)

# 5. Export to frontend format
python scripts/cache_to_json.py

# 6. Copy data to backend
cp web/src/data/games.json backend/data/games.json

# 7. Install backend dependencies
cd backend && pip install -r requirements.txt && cd ..

# 8. Install frontend dependencies
cd web && npm install
```

### Development (Running Both Servers)

**Terminal 1 - Backend (FastAPI on port 8000):**
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

**Terminal 2 - Frontend (Vite on port 5173):**
```bash
cd web && npm run dev
```

**Result:** 
- Frontend: http://localhost:5173
- Backend API Docs: http://localhost:8000/docs

### Update Game Data (Recurring)

After your first setup, to refresh the game list:

```bash
python main.py
python scripts/cache_to_json.py
cp web/src/data/games.json backend/data/games.json
```

**Note:** First run takes 5-10 minutes due to API rate limiting. Subsequent runs use cache (24-hour TTL).

### Production Deployment

See [DEPLOYMENT.md](#deployment-guide) for detailed instructions on deploying to Vercel (frontend) and Render (backend).




## 📚 Documentation

- **[DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md)** - Complete 3-phase roadmap and specifications
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Instructions to deploy to Vercel for a live demo
- **[PROMPTS.md](./PROMPTS.md)** - GitHub Copilot prompts for guided development

## 🚀 Deploy to Vercel

To make the app publicly available as a demo:

1. **One-Click Deploy:** 
   - Click the Vercel button below
   - Connect GitHub account
   - Select this repository
   - Deploy!

2. **Manual Deploy:**
   - See detailed instructions in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRGVylar%2Fsteam-priority-picker&project-name=steam-priority-picker&repository-name=steam-priority-picker)
- **Original Python Script** - See `main.py`, `steam_api.py`, `hltb_api.py` for the original CLI tool

## 🚀 Deployment (100% Free)

### Frontend → Vercel
```bash
# Auto-deploy from GitHub (requires GitHub connection)
# Environment: VITE_API_URL=https://api.onrender.com
# Free tier: ✅ Unlimited deployments, auto-scaling
```
**URL:** https://steam-priority-picker.vercel.app

### Backend → Render
```bash
# Auto-deploy from GitHub (Docker)
# Environment: DATABASE_URL, STEAM_API_KEY
# Free tier: ✅ One instance (sleeps after 15min inactivity)
```
**URL:** https://steam-priority-picker-api.onrender.com

### Database → Neon
```bash
# Free PostgreSQL
# Limits: 1 project, 3 branches, 100k rows
# Connection string: postgresql://user:pass@host/db
```

## 🏗️ Project Structure

```
steam-priority-picker/
├── 📄 DEVELOPMENT_PLAN.md              # Complete roadmap & specs
├── 📄 PROMPTS.md                       # GitHub Copilot prompts
├── 📁 web/                             # React Frontend (Vercel)
│   ├── src/
│   │   ├── components/                 # React components
│   │   ├── hooks/                      # Custom hooks
│   │   ├── utils/                      # Helper functions
│   │   ├── data/games.json             # Static game data
│   │   └── App.jsx
│   ├── package.json
│   ├── vite.config.js
│   ├── vercel.json                     # Vercel config
│   └── tailwind.config.js
├── 📁 backend/                         # FastAPI Backend (Render)
│   ├── app/
│   │   ├── api/                        # API endpoints (stub)
│   │   ├── db/                         # Database models (stub)
│   │   ├── schemas/                    # Pydantic models (stub)
│   │   ├── services/                   # Business logic (stub)
│   │   ├── main.py                     # FastAPI app
│   │   └── config.py
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── main.py
│   └── .env.example
├── 📁 scripts/                         # Utility scripts
│   └── cache_to_json.py               # Export cache to JSON
├── 📁 cache/                           # Game data cache (1000+ games)
└── [Original Python files]
    ├── main.py                         # CLI script
    ├── steam_api.py
    ├── hltb_api.py
    ├── review_api.py
    ├── cache.py
    └── requirements.txt
```

## 🤖 GitHub Copilot Workflow

The recommended way to develop this project is using GitHub Copilot with the provided prompts:

1. **Read** `PROMPTS.md` - Choose a phase
2. **Copy** the prompt for that phase
3. **Paste** into GitHub Copilot
4. **Generate** code following the prompt specifications
5. **Test** the implementation
6. **Iterate** until complete

**Phases:**
- **Phase 1 (Weeks 1-2):** Frontend MVP with Copilot Prompts 1-2
- **Phase 2 (Weeks 3-4):** Backend API with Copilot Prompts 3-4
- **Phase 3 (Weeks 5-7):** Database & Auth with Copilot Prompts 5-6

## 🔄 Development Branch Workflow

```bash
# Work on development branch (never push to main)
git checkout development
git pull origin development

# Make changes, commit frequently
git add .
git commit -m "feat: description"
git push origin development

# When ready: create a Pull Request to main
# After testing and review: merge to main
```

## 📊 Data Format

Games stored in cache and database:

```json
{
  "app_id": 400,
  "name": "Portal",
  "playtime_hours": 3.5,
  "score": 95,
  "score_source": "Steam",
  "total_reviews": 50234,
  "review_desc": "Overwhelmingly Positive",
  "steam_url": "https://store.steampowered.com/app/400/",
  "hltb_url": "https://howlongtobeat.com/game/7231",
  "hltb_name": "Portal"
}
```

## 🧪 Testing

### Frontend Tests
```bash
cd web
npm run lint      # ESLint
npm run format    # Prettier
```

### Backend Tests (to be implemented)
```bash
cd backend
pytest            # Unit tests
```

## 🔧 Environment Variables

### Frontend (.env in `web/`)
```
VITE_API_URL=http://localhost:8000    # Dev
# VITE_API_URL=https://api.onrender.com  # Prod
```

### Backend (.env in `backend/`)
```
DATABASE_URL=sqlite:///./test.db      # Dev
# DATABASE_URL=postgresql://...         # Prod
STEAM_API_KEY=your_key_here
DEBUG=True
```

## 💾 Using the Original Python Script

The original Python CLI tool still works for generating cache data:

```bash
# Fetch Steam library and enriched data
python main.py

# This generates:
# - cache/ directory with JSON files
# - priority_games.json with final output
```

Then export to frontend:
```bash
python scripts/cache_to_json.py
```

## 🚧 Roadmap

- [x] ✅ Initial planning and architecture design
- [x] ✅ Project structure scaffolding (web, backend, scripts)
- [x] ✅ Frontend components created (React + Vite)
- [x] ✅ Backend FastAPI setup
- [x] ✅ GitHub Copilot prompts documentation
- [ ] **Phase 1 (Weeks 1-2):** Implement frontend
  - Use Prompts 1-2 in GitHub Copilot
  - Deploy to Vercel
- [ ] **Phase 2 (Weeks 3-4):** Implement backend API
  - Use Prompts 3-4 in GitHub Copilot
  - Deploy to Render
- [ ] **Phase 3 (Weeks 5-7):** Database & Advanced Features
  - Use Prompts 5-6 in GitHub Copilot
  - PostgreSQL (Neon)
  - Steam OAuth
  - Real-time sync with WebSocket
- [ ] Beta testing
- [ ] Public release

## 🐛 Troubleshooting

### Frontend won't start
```bash
cd web
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend won't start
```bash
cd backend
pip install --upgrade -r requirements.txt
python main.py
```

### Games data missing
```bash
python scripts/cache_to_json.py
# Verify web/src/data/games.json exists with ~1000 games
```

### Cache needs refresh
```bash
rm -rf cache/
python main.py  # Re-fetch all data
python scripts/cache_to_json.py
```

## 📚 Original Python Tool

The original Python CLI tool is still fully functional:

**Features:**
- 🎮 Fetch Steam library (1000+ games)
- ⏱️ Query HowLongToBeat API
- ⭐ Fetch Steam reviews
- 💾 24-hour cache system
- 📊 JSON output
- 🔄 Rate-limited API calls

**Usage:**
```bash
python main.py            # Process entire library
# Results: cache/ + priority_games.json
```

## 🔗 Resources

- [Steam Web API](https://steamcommunity.com/dev)
- [HowLongToBeat](https://howlongtobeat.com/)
- [React Documentation](https://react.dev)
- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [Vite Documentation](https://vitejs.dev)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Neon Documentation](https://neon.tech/docs)

## 🤝 Contributing

This is a personal project. Feel free to fork and create your own version!

## 📄 License

Personal use only

---

**Current Status:** 🚀 MVP Phase - Scaffolded and ready for development
**Current Branch:** `development` (all changes go here)
**Last Updated:** November 21, 2025
**Version:** 0.1.0-MVP
