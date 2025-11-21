# Getting Started - Steam Priority Picker Web App

This guide will help you get the project running locally and understand the next steps.

## ✅ What's Already Done

The project scaffold is **100% complete**. Everything is ready for implementation:

- ✅ React + Vite frontend structure with Tailwind CSS
- ✅ FastAPI backend structure with CORS and logging
- ✅ All necessary config files (package.json, requirements.txt, docker-compose, etc.)
- ✅ GitHub Copilot prompts for guided development
- ✅ Complete development plan and roadmap
- ✅ Cache system with 1000+ games ready to display

## 🚀 3-Step Quick Start

### Step 1: View the Frontend (Right Now!)

```bash
cd web
npm install
npm run dev
```

**What you'll see:**
- Header with logo
- Filter panel (left sidebar)
- Search bar
- Game list from cache (3 example games for now)
- Responsive mobile layout

**Try:**
- Search for "Portal"
- Filter by playtime
- Click Steam/HLTB links

### Step 2: Export Real Game Data

In a new terminal:

```bash
python scripts/cache_to_json.py
```

This exports all 1000+ games from your cache. Then refresh the browser to see them!

### Step 3: Start Backend

In another terminal:

```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Backend runs at:** http://localhost:8000
- Docs: http://localhost:8000/docs
- Health: http://localhost:8000/health

## 📚 Next: Using GitHub Copilot

Now that everything is scaffolded, use GitHub Copilot to implement the features:

### Phase 1: Complete Frontend (1-2 weeks)

1. Open **PROMPTS.md**
2. Copy **Prompt 1: Frontend Setup**
3. Paste into GitHub Copilot
4. Let it generate/enhance the code
5. Test in browser
6. When ready, deploy to Vercel

### Phase 2: Complete Backend (1-2 weeks)

After Phase 1 is done:

1. Copy **Prompt 3: Backend Setup** from PROMPTS.md
2. Copy **Prompt 4: API Endpoints**
3. Implement with Copilot
4. Connect frontend to backend API
5. Deploy to Render

### Phase 3: Database & Features (2-3 weeks)

Then:

1. Copy **Prompt 5: Database Schema**
2. Copy **Prompt 6: Deployment & CI/CD**
3. Setup PostgreSQL (Neon free tier)
4. Implement Steam OAuth login
5. Add background sync jobs

## 📁 Where to Make Changes

### Frontend (React)
- **Components:** `web/src/components/`
- **Logic:** `web/src/hooks/` (useGames, useFilters)
- **Styles:** Tailwind CSS in components, main CSS in `web/src/index.css`
- **Data:** `web/src/data/games.json` (refresh with `python scripts/cache_to_json.py`)

### Backend (FastAPI)
- **Endpoints:** `backend/app/api/` (create games.py, search.py, etc.)
- **Models:** `backend/app/db/models.py` (SQLAlchemy ORM)
- **Schema:** `backend/app/schemas/` (Pydantic models)
- **Config:** `backend/app/config.py`

## 🌳 Branch Strategy

Always work on `development` branch:

```bash
git checkout development
git pull origin development

# Make changes...
git add .
git commit -m "feat: description"
git push origin development

# When complete and tested: create PR to main
```

## 📊 Current Architecture

```
User Browser (Vercel)
    ↓
React Frontend (localhost:5173)
    ↓ (calls API)
FastAPI Backend (localhost:8000)
    ↓ (queries)
PostgreSQL Database (localhost:5432 local, Neon in prod)
```

## 🎯 Verification Checklist

Run this to verify everything is set up:

```bash
# 1. Frontend works
cd web && npm run dev
# ✅ Should start on http://localhost:5173

# 2. Backend works
cd backend && python main.py
# ✅ Should start on http://localhost:8000

# 3. Cache has games
ls cache/ | wc -l
# ✅ Should show 200+ files

# 4. Game data exports
python scripts/cache_to_json.py
# ✅ Should create web/src/data/games.json with 1000+ games
```

## ❓ Common Questions

**Q: Why is games.json so small (3 games)?**
A: It's an example. Run `python scripts/cache_to_json.py` to populate with real cache data.

**Q: Can I delete and re-run the Python script?**
A: Yes! `python main.py` will re-fetch all 1000 games (takes a while). Or use `max_games=10` to test quickly.

**Q: Do I deploy before or after Copilot development?**
A: After! Complete and test each phase locally first, then deploy with the deployment prompt.

**Q: What if I mess up the code?**
A: Use git to rollback:
```bash
git reset --hard HEAD~1  # Undo last commit
git checkout -- .       # Discard changes
```

**Q: Can I work on frontend and backend simultaneously?**
A: Yes! They're independent until Phase 2 when they need to talk to each other.

## 📞 Help

1. **Check docs:** Start with DEVELOPMENT_PLAN.md
2. **Read prompts:** PROMPTS.md has detailed instructions
3. **Review code:** Look at component comments for guidance
4. **Check logs:** Browser console (frontend) and terminal (backend)

## 🎉 Ready to Start?

1. Run frontend: `cd web && npm install && npm run dev`
2. Export game data: `python scripts/cache_to_json.py`
3. Refresh browser to see 1000+ games!
4. Follow Phase 1 with GitHub Copilot prompts

---

**You are here:** Project is scaffolded and ready
**Next stop:** Copilot-guided implementation
**Timeline:** 7-10 weeks to complete MVP (including deployment)

Good luck! 🚀
