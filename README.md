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

## 🤖 GitHub Actions

### Keep Backend Alive Workflow
The repository includes a GitHub Action that pings the backend every 5 minutes to keep it responsive on free-tier hosting platforms that sleep after inactivity.

**Features:**
- ⏰ Runs automatically every 5 minutes
- 🔄 Can be triggered manually
- 🛡️ Fault-tolerant design

**Setup:**
1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add a secret named `BACKEND_URL` with your backend URL (e.g., `https://your-backend.onrender.com`)

**View workflow runs:**
- Visit: `https://github.com/RGVylar/steam-priority-picker/actions/workflows/keep-alive.yml`
- Or click the **Actions** tab in GitHub and select **"Keep Backend Alive"**

📖 **Full documentation:** [.github/workflows/README.md](.github/workflows/README.md)

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
