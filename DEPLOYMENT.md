# Deployment Guide - Steam Priority Picker

This document covers deploying both frontend and backend to production.

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐
│  Vercel (CDN)   │◄────────┤  Render (API)    │
│  React Frontend │         │  FastAPI Backend │
│  Port: 443      │         │  Port: 8000      │
└─────────────────┘         └──────────────────┘
     ↓
  Static Assets
  Vite Build
  React 18
```

## Phase 2: Backend + Frontend Deployment

### Prerequisites

- GitHub repository with both `/web` and `/backend` folders
- Vercel account (free tier OK)
- Render account (free tier OK for initial setup)
- Steam API key for data fetching

### Step 1: Deploy Backend to Render

#### Option A: Deploy from GitHub

1. **Create Render Account**
   - Go to https://render.com
   - Sign up / Log in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub repository
   - Select branch: `main` or `feature/phase-2-backend`

3. **Configure Service**
   - **Name:** `steam-priority-picker-api`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`
   - **Instance Type:** Free (for testing)

4. **Environment Variables**
   ```
   DATABASE_URL=sqlite:///./test.db
   STEAM_API_KEY=your_steam_api_key_here
   DEBUG=False
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (3-5 minutes)
   - Note the service URL: `https://steam-priority-picker-api.onrender.com`

### Step 2: Deploy Frontend to Vercel

#### Option A: Deploy from GitHub

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up / Log in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import GitHub repository

3. **Configure Build**
   - **Root Directory:** `web`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Environment Variables**
   ```
   VITE_API_URL=https://steam-priority-picker-api.onrender.com/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build & deployment (2-3 minutes)
   - Your app is live! 🎉

### Step 3: Update CORS on Backend

If you get CORS errors, update `backend/app/config.py`:

```python
cors_origins: list = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://steam-priority-picker.vercel.app",  # Your Vercel domain
    "https://steam-priority-picker-api.onrender.com"
]
```

Then commit and push - both will auto-redeploy.

## Phase 3: Database Integration (Future)

When moving to PostgreSQL:

1. **Create Database on Neon or Heroku Postgres**
   - Get connection string: `postgresql://user:pass@host/dbname`

2. **Update Backend Environment**
   ```
   DATABASE_URL=postgresql://user:pass@host/dbname
   ```

3. **Run Migrations**
   ```bash
   alembic upgrade head
   ```

4. **Redeploy**
   - Push changes to GitHub
   - Vercel/Render auto-deploy

## Troubleshooting

### 422 Validation Error

**Cause:** Query parameters not validating  
**Solution:** Check `backend/app/routes/games.py` parameter constraints

### CORS Error

**Cause:** Frontend domain not in backend CORS list  
**Solution:** Update `cors_origins` in `backend/app/config.py` and redeploy

### Slow Initial Load

**Cause:** Backend loading 1000+ games from JSON  
**Solution:** In Phase 3, use database queries instead

### Build Fails on Vercel

**Cause:** Node modules or build cache issue  
**Solution:** 
- Clear build cache in Vercel dashboard
- Force rebuild with `npm install --legacy-peer-deps`

## Monitoring

### Backend Health Check
```bash
curl https://steam-priority-picker-api.onrender.com/health
```

### API Status
```bash
curl https://steam-priority-picker-api.onrender.com/docs
```

### Frontend Status
- Check https://steam-priority-picker.vercel.app/
- Open DevTools → Console for errors

## Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| Vercel | Unlimited | $0/month |
| Render | 1 web service + sleeps | $0/month (or $7/month for always-on) |
| Total | | $0-7/month |

## Next Steps

1. ✅ Phase 2 complete - Basic API deployment working
2. 📅 Phase 3 - Add PostgreSQL database
3. 📅 Phase 4 - Add authentication (Steam OAuth)
4. 📅 Phase 5 - Add advanced features (recommendations, analytics)
