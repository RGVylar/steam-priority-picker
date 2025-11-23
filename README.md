# Steam Priority Picker 🎮

A modern web application to help you discover what to play next in your Steam library. Features advanced filtering, HowLongToBeat integration, and Steam review scores with a beautiful glassmorphic UI.

**Live Demo:** https://steam-priority-picker.vercel.app

## ✨ Features

### 🎯 Core Features
- **1000+ Games Display** - Browse your entire cataloged Steam library
- **Advanced Filtering** - By playtime, score, reviews, and played status
- **Real-time Search** - Instant filtering by game name with Ctrl+F
- **HowLongToBeat Integration** - See estimated completion times
- **Steam Review Scores** - Quick ratings and review counts
- **Dark Mode** - Auto-detect system preference with manual toggle
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Game Tracking** - Mark games as played with persistent storage
- **Direct Launch** - Play games directly via Steam protocol

### 🎨 UI/UX
- **Liquid Glass Design** - Apple-style glassmorphism with backdrop blur
- **Dynamic Backgrounds** - Game images appear on hover with smooth transitions
- **Glass Mode Toggle** - Enable/disable glass effects with localStorage persistence
- **Color-Tinted Buttons** - Semi-transparent buttons with color identity
- **Smooth Animations** - 1000ms transitions for immersive experience
- **Infinite Scroll** - Load 24 games at a time for smooth browsing

## 🚀 Tech Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| **Frontend** | React 18 + Vite + Tailwind CSS | ✅ Complete |
| **Backend** | FastAPI + PostgreSQL | ✅ Complete |
| **Deployment** | Vercel (Frontend) + Render (Backend) | ✅ Live |
| **Auth** | Steam OAuth | ✅ Integrated |

## 📋 Prerequisites

- Node.js 18+
- Python 3.9+
- Steam account with games

## 🛠️ Development Setup

### Quick Start (Local Development)

```bash
# 1. Clone repository
git clone https://github.com/RGVylar/steam-priority-picker.git
cd steam-priority-picker

# 2. Frontend setup
cd web
npm install
npm run dev
# Frontend runs on http://localhost:5173

# 3. Backend setup (in new terminal)
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
# Backend runs on http://localhost:8000
# API docs: http://localhost:8000/docs
```

### Environment Variables

**Frontend (`web/.env.local`):**
```
VITE_API_URL=http://localhost:8000
```

**Backend (`backend/.env`):**
```
DATABASE_URL=postgresql://user:password@localhost/steam_picker
STEAM_API_KEY=your_steam_api_key
```

Get your Steam API key: https://steamcommunity.com/dev/apikey

## 📁 Project Structure

```
steam-priority-picker/
├── web/                          # React Frontend (Vercel)
│   ├── src/
│   │   ├── components/          # React components (GameCard, Header, etc)
│   │   ├── hooks/               # Custom hooks (useGames, useFilters, etc)
│   │   ├── context/             # Context providers (Auth, Language)
│   │   ├── pages/               # Page components (AuthCallback)
│   │   ├── App.jsx
│   │   └── index.css            # Liquid Glass design system
│   ├── package.json
│   └── vite.config.js
├── backend/                      # FastAPI Backend (Render)
│   ├── app/
│   │   ├── models/              # Database models
│   │   ├── routes/              # API endpoints
│   │   ├── services/            # Business logic (Auth, Games)
│   │   ├── schemas/             # Pydantic models
│   │   └── main.py              # FastAPI app
│   ├── requirements.txt
│   └── Dockerfile
├── scripts/                      # Utility scripts
│   └── cache_to_json.py         # Export cache to JSON
├── add_games_by_steamid.py       # Import games by Steam ID
├── QUICK_START.md                # Quick start guide
└── README.md                     # This file
```

## 🔐 Authentication

The app uses Steam OAuth for authentication:

1. Click "Log in with Steam" button
2. Authorize on Steam's website
3. Get redirected back with auth token
4. Access your Steam library in the app

## 📊 API Endpoints

All endpoints require authentication (Bearer token):

```
GET  /api/games                  # Get user's games with filters
GET  /api/games/{app_id}         # Get single game details
POST /api/auth/login             # Initiate Steam OAuth
GET  /api/auth/callback          # OAuth callback endpoint
GET  /health                     # Health check
```

## 🎨 Liquid Glass Design

The UI features Apple's Liquid Glass design with:

- **Ultra-transparent backgrounds** - rgba(255,255,255,0.01)
- **Backdrop blur** - blur(60px) for depth effect
- **Color tints** - Semi-transparent colored overlays on buttons
- **Dynamic backgrounds** - Game images on hover
- **Smooth transitions** - 1000ms crossfades
- **Optional toggle** - Enable/disable glass mode in header

## 🚀 Deployment

### Frontend to Vercel
```bash
# Auto-deploys from main branch
# Free tier includes unlimited deployments
# Set VITE_API_URL in Vercel environment variables
```

### Backend to Render
```bash
# Auto-deploys from main branch (Docker)
# Free tier includes one instance (sleeps after 15min inactivity)
# Set DATABASE_URL and STEAM_API_KEY in Render environment
```

### Database (PostgreSQL on Neon)
```
Free tier: 1 project, 3 branches, 100k rows
Get free connection string from neon.tech
```

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
python -m uvicorn app.main:app --reload
```

### Authentication fails
- Verify STEAM_API_KEY is set in backend .env
- Check DATABASE_URL is correct
- Ensure Steam account has games in library

### Games not showing
- Verify you're logged in with a Steam account that has games
- Check backend logs for API errors
- Ensure PostgreSQL database connection is working

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick setup and run guide
- **Backend API Docs** - http://localhost:8000/docs (Swagger UI)

## 🔗 Resources

- [Steam Web API](https://steamcommunity.com/dev)
- [HowLongToBeat API](https://howlongtobeat.com/)
- [React Docs](https://react.dev)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📄 License

Personal use only

---

**Version:** 1.0.0  
**Last Updated:** November 23, 2025  
**Status:** 🚀 Production Ready
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
