# GitHub Copilot Prompts - Steam Priority Picker Web App Development

This document contains structured prompts to guide GitHub Copilot through the development of the Steam Priority Picker web application. Use these prompts sequentially with GitHub Copilot to ensure consistent, high-quality implementation.

---

## Prompt 1: Frontend Setup - React + Vite Bootstrap

**Context:** We're building a web application to display a prioritized list of Steam games with filtering capabilities. This is the frontend MVP.

**Files to Create:**
- `/web/package.json`
- `/web/vite.config.js`
- `/web/tailwind.config.js`
- `/web/src/App.jsx`
- `/web/src/main.jsx`
- `/web/src/index.css`
- `/web/public/index.html`

**Requirements:**

1. **Project Setup:**
   - Create a React 18 + Vite project with Tailwind CSS for styling
   - Use ES modules and modern JavaScript (ES6+)
   - Include ESLint and Prettier for code quality
   - Configure hot module replacement (HMR) for development

2. **Project Structure:**
   - Organize components in `/src/components/`
   - Create `/src/pages/` for page-level components
   - Setup `/src/hooks/` for custom React hooks
   - Create `/src/utils/` for helper functions and API clients
   - Style with Tailwind CSS (utility-first approach)

3. **Initial App Component:**
   - Create a simple layout with header, main content area
   - Add responsive design (mobile-first)
   - Include basic navigation structure
   - Show placeholder content

4. **Dependencies:**
   - Add: `react`, `react-dom`, `axios` (or `fetch`)
   - Dev: `vite`, `@vitejs/plugin-react`, `tailwindcss`, `postcss`, `autoprefixer`
   - Dev: `eslint`, `prettier`, `eslint-plugin-react`

5. **Configuration:**
   - Vite should be configured for React with SWC
   - Tailwind should be properly integrated with PostCSS
   - ESLint should check for React best practices
   - Prettier should auto-format on save

**Prompt to Use with Copilot:**
```
I'm creating a React + Vite frontend for a Steam games priority picker web app. 
The app will display 1000+ games with filtering/search capabilities.

Create the initial project structure with:
1. Vite + React 18 setup
2. Tailwind CSS for styling
3. Basic App.jsx with a header, sidebar placeholder, and main content area
4. Responsive layout (mobile-first)
5. ESLint and Prettier configuration
6. All necessary config files (vite.config.js, tailwind.config.js, postcss.config.js)

The app needs to be clean, modern, and ready for adding components. 
Use best practices for React, Vite, and Tailwind.
Include comments explaining key decisions.
```

**Deliverables:**
- ✅ Working Vite dev server (`npm run dev`)
- ✅ Hot module replacement working
- ✅ Tailwind CSS applied and working
- ✅ Basic responsive layout visible
- ✅ No console errors or warnings

**Acceptance Criteria:**
- `npm install` completes without errors
- `npm run dev` starts server on http://localhost:5173
- Page loads with header, sidebar placeholder, main area
- Tailwind classes apply correctly
- Mobile view is responsive (test with browser dev tools)

---

## Prompt 2: Game List Component - Interactive Table/Grid

**Context:** The main feature of the app is displaying games with filtering. Create reusable components for showing games and managing filters.

**Files to Create:**
- `/web/src/components/GameList.jsx` - Main grid/table component
- `/web/src/components/GameCard.jsx` - Individual game card
- `/web/src/components/FilterPanel.jsx` - Filter controls sidebar
- `/web/src/components/SearchBar.jsx` - Search input
- `/web/src/hooks/useGames.js` - Custom hook for game data
- `/web/src/hooks/useFilters.js` - Custom hook for filter state
- `/web/src/utils/api.js` - API client utilities
- `/web/src/data/games.json` - Static game data for now

**Requirements:**

1. **GameCard Component:**
   - Display: game name, playtime (hours), Steam score (%), review description, review count
   - Show clickable links to Steam Store and HowLongToBeat
   - Responsive card design (works on mobile and desktop)
   - Hover effects for interactivity
   - Badge for playtime duration (0-5hrs, 5-10hrs, 10+hrs)

2. **GameList Component:**
   - Render grid of GameCards (responsive: 1 col mobile, 2-3 cols tablet, 3-4 cols desktop)
   - Pagination support (show 20 games per page, with next/prev buttons)
   - Display total game count
   - Loading state with skeleton loaders
   - Empty state message if no games match filters
   - Sorting options: by playtime (asc/desc), by score (asc/desc)

3. **FilterPanel Component:**
   - Collapsible on mobile, visible on desktop
   - Filter options:
     - **Playtime:** Radio buttons or checkboxes (0-5, 5-10, 10+, custom range)
     - **Score:** Radio buttons (75-100, 50-75, below 50, all)
     - **Review Count:** Min/max slider
   - "Apply Filters" button (or auto-apply)
   - "Reset Filters" button
   - Show active filter count

4. **SearchBar Component:**
   - Real-time search by game name
   - Debounced input (300ms delay to avoid too many renders)
   - Clear button when text is entered
   - Keyboard shortcut support (Cmd/Ctrl + K)
   - Accessible (ARIA labels)

5. **useGames Hook:**
   - Load games data from `/web/src/data/games.json` (local for now)
   - Support filtering by playtime, score, search term
   - Return: games array, total count, loading state
   - Memoize to avoid unnecessary recalculations

6. **useFilters Hook:**
   - Manage filter state: playtime range, score range, search query
   - Provide setters for each filter
   - Support resetting all filters
   - Store filters in URL params (optional for Phase 1, but consider for UX)

7. **Static Data:**
   - Export cache to `/web/src/data/games.json` with format:
     ```json
     {
       "games": [
         {
           "app_id": 400,
           "name": "Portal",
           "playtime_hours": 3.5,
           "score": 95.2,
           "total_reviews": 50234,
           "review_desc": "Overwhelmingly Positive",
           "steam_url": "https://store.steampowered.com/app/400/",
           "hltb_url": "https://howlongtobeat.com/game/7231",
           "hltb_name": "Portal"
         }
       ]
     }
     ```

**Prompt to Use with Copilot:**
```
I'm building the game display components for a Steam games priority picker app.

Create these components with the following specifications:

1. **GameCard.jsx**: Display individual game with name, playtime, Steam score %, review description, review count. Include links to Steam Store and HowLongToBeat. Add a playtime badge (0-5hrs, 5-10hrs, 10+hrs).

2. **GameList.jsx**: Responsive grid of GameCards (1 col mobile, 3-4 cols desktop). Include:
   - Pagination (20 games per page)
   - Sorting dropdown (by playtime asc/desc, score asc/desc)
   - Loading skeleton state
   - Empty state message

3. **FilterPanel.jsx**: Collapsible sidebar with:
   - Playtime filter (0-5, 5-10, 10+, custom range)
   - Score filter (75-100, 50-75, below 50, all)
   - Review count slider (min/max)
   - Apply and Reset buttons
   - Show active filter count

4. **SearchBar.jsx**: Real-time search by game name with:
   - Debounced input (300ms)
   - Clear button
   - Keyboard shortcut (Cmd/Ctrl + K)
   - Accessible ARIA labels

5. **useGames.js hook**: Load games from JSON, support filtering and sorting. Return {games, total, loading}

6. **useFilters.js hook**: Manage filter state (playtime, score, search). Provide setters and reset function.

7. **api.js utils**: Create helper functions for fetching/filtering games (will be replaced with API calls later).

The app should load 1000+ games and filter them smoothly. Use Tailwind CSS for styling. Ensure responsive design and good UX.
```

**Deliverables:**
- ✅ Games display in responsive grid
- ✅ Filtering works (playtime, score, search)
- ✅ Sorting works (playtime, score)
- ✅ Pagination works (show 20 per page)
- ✅ Mobile layout collapses filters to hamburger menu
- ✅ Links to Steam and HowLongToBeat work

**Acceptance Criteria:**
- All 1000+ games load without lag
- Filtering/sorting is responsive (< 100ms response time)
- Mobile view is fully usable
- Search finds games by partial name match
- No console errors
- Links open in new tab

**Data Export Script:**
```python
# scripts/cache_to_json.py
import json
import os
from datetime import datetime

# Read all cache files and compile into games.json
games = []
cache_dir = "cache"

for filename in os.listdir(cache_dir):
    if filename.startswith("review_") and filename.endswith(".json"):
        with open(os.path.join(cache_dir, filename)) as f:
            data = json.load(f)
            # Process and add to games list

# Write to web/src/data/games.json
with open("web/src/data/games.json", "w") as f:
    json.dump({"games": games}, f, indent=2)
```

---

## Prompt 3: Backend Setup - FastAPI Structure

**Context:** Create the backend API using FastAPI. This will serve the game data to the frontend.

**Files to Create:**
- `/backend/main.py` - Entry point
- `/backend/app/__init__.py`
- `/backend/app/main.py` - FastAPI app setup
- `/backend/app/config.py` - Configuration
- `/backend/app/middleware/__init__.py`
- `/backend/app/middleware/cors.py` - CORS configuration
- `/backend/api/__init__.py`
- `/backend/app/api/games.py` - Game endpoints (stub)
- `/backend/requirements.txt`
- `/backend/.env.example`
- `/backend/Dockerfile`

**Requirements:**

1. **FastAPI Setup:**
   - Create FastAPI app with root `/` that returns {"status": "ok"}
   - Setup CORS middleware to allow requests from Vercel frontend
   - Configure logging for debugging
   - Include request timing middleware for performance monitoring
   - Setup error handling with custom exception handlers

2. **Project Structure:**
   - `/backend/main.py` - Runs the app
   - `/backend/app/` - Core application code
   - `/backend/app/main.py` - FastAPI setup
   - `/backend/app/config.py` - Settings and environment variables
   - `/backend/app/api/` - API endpoints (organized by resource)
   - `/backend/app/schemas/` - Pydantic request/response models (stub)
   - `/backend/app/services/` - Business logic (stub)
   - `/backend/app/db/` - Database layer (stub for Phase 2)

3. **Configuration:**
   - Read from environment variables (.env file)
   - Support development/production environments
   - Configure logging levels
   - Setup request/response validation

4. **Environment:**
   - Create `.env.example` with required variables
   - Load variables safely with error handling

5. **Docker:**
   - Create Dockerfile for deployment on Render
   - Use Python 3.11 slim image
   - Include production-ready config (gunicorn)

6. **Health Check:**
   - Endpoint `GET /health` for monitoring
   - Return {"status": "ok", "timestamp": "..."}

**Prompt to Use with Copilot:**
```
I'm setting up a FastAPI backend for a Steam games priority picker web app.

Create the initial FastAPI project structure with:

1. **FastAPI App Setup:**
   - Create main FastAPI instance
   - Configure CORS to allow requests from Vercel (https://steam-priority-picker.vercel.app)
   - Add request logging and timing middleware
   - Include error handling with proper HTTP status codes
   - Setup health check endpoint GET /health

2. **Project Structure:**
   - /backend/main.py - Entry point (runs uvicorn)
   - /backend/app/main.py - FastAPI app initialization
   - /backend/app/config.py - Environment variables and settings
   - /backend/app/middleware/cors.py - CORS configuration
   - /backend/app/api/ - API endpoints (create stub for games.py)
   - /backend/app/schemas/ - Pydantic models (create stub)
   - /backend/app/services/ - Business logic (create stub)

3. **Configuration:**
   - Load DATABASE_URL, STEAM_API_KEY from .env
   - Support development and production environments
   - Configure logging

4. **Docker:**
   - Dockerfile for deployment on Render
   - Use Python 3.11 slim base image
   - Include Gunicorn for production WSGI server
   - Expose port 8000

5. **Requirements:**
   - fastapi, uvicorn, python-dotenv, pydantic, gunicorn
   - All pinned to specific versions for reproducibility

The backend should be clean, well-structured, and ready for adding API endpoints. Use FastAPI best practices.
```

**Deliverables:**
- ✅ FastAPI app runs with `python main.py`
- ✅ `GET /health` returns 200 with status
- ✅ CORS configured for frontend
- ✅ Logging is working
- ✅ `.env` configuration working
- ✅ Docker builds successfully

**Acceptance Criteria:**
- `pip install -r requirements.txt` completes
- `python main.py` starts server on http://localhost:8000
- `GET http://localhost:8000/health` returns 200
- `GET http://localhost:8000/docs` shows Swagger UI
- Dockerfile builds without errors
- Environment variables load from `.env`

---

## Prompt 4: API Endpoints - CRUD Games & Search

**Context:** Implement the REST API endpoints to serve game data. Start with reading from static JSON file, will connect to database in Phase 3.

**Files to Create/Update:**
- `/backend/app/api/games.py` - Game endpoints
- `/backend/app/schemas/game.py` - Pydantic models
- `/backend/app/services/game_service.py` - Business logic
- `/backend/app/main.py` - Register routes

**Requirements:**

1. **Pydantic Schemas:**
   - `GameBase` - Shared fields
   - `Game` - Full game object with all fields
   - `GameList` - Paginated list response

2. **Endpoints:**
   - `GET /api/games` - List all games (paginated)
   - `GET /api/games/{app_id}` - Single game details
   - `GET /api/search?q=...` - Search games
   - `GET /api/filters` - Available filter options

3. **Query Parameters:**
   - **For `/api/games`:**
     - `page` (default: 1)
     - `limit` (default: 20, max: 100)
     - `sort_by` (options: playtime_asc, playtime_desc, score_asc, score_desc)
     - `playtime_min`, `playtime_max` - Filter by playtime range
     - `score_min`, `score_max` - Filter by score range
   - **For `/api/search`:**
     - `q` - Search query (required)
     - `limit` (default: 20)

4. **Response Format:**
   ```json
   {
     "data": [...],
     "total": 1080,
     "page": 1,
     "page_size": 20,
     "total_pages": 54,
     "has_next": true,
     "has_prev": false
   }
   ```

5. **Error Handling:**
   - Return 400 for invalid query parameters
   - Return 404 for not found
   - Return 500 with error message for server errors
   - Include error detail in response

6. **Service Layer:**
   - `GameService` class with methods:
     - `get_all_games(skip, limit, filters, sort)`
     - `get_game_by_id(app_id)`
     - `search_games(query, limit)`
     - `get_filter_options()`
   - Load games from `/backend/data/games.json` (copy from `/web/src/data/games.json`)

7. **Validation:**
   - Validate query parameters
   - Use Pydantic for request/response validation
   - Return helpful error messages

**Prompt to Use with Copilot:**
```
I'm implementing REST API endpoints for the Steam games backend.

Create these API endpoints:

1. **GET /api/games** - List games with pagination and filtering
   - Query params: page (default 1), limit (default 20, max 100), sort_by, playtime_min, playtime_max, score_min, score_max
   - Response: {data: [...], total: 1080, page, page_size, total_pages, has_next, has_prev}

2. **GET /api/games/{app_id}** - Single game details
   - Path param: app_id
   - Response: full game object
   - Return 404 if not found

3. **GET /api/search?q=...** - Search games by name
   - Query param: q (required), limit (default 20)
   - Response: {data: [...], total, limit}

4. **GET /api/filters** - Available filter options
   - Response: {playtime_ranges: [...], score_ranges: [...], sort_options: [...]}

5. **Pydantic Models:**
   - GameBase (name, app_id, playtime_hours, score, total_reviews, review_desc)
   - Game (GameBase + steam_url, hltb_url, hltb_name)
   - GameList (data: List[Game], total, page, page_size, etc.)

6. **Service Layer:**
   - GameService class that loads games from /backend/data/games.json
   - Methods: get_all_games(), get_game_by_id(), search_games(), get_filter_options()

7. **Error Handling:**
   - Validate query parameters
   - Return 400 for invalid params
   - Return helpful error messages
   - Include request validation

The API should be fast, well-documented, and RESTful. Include proper response schemas for Swagger docs.
```

**Deliverables:**
- ✅ All 4 endpoints working
- ✅ Pagination works correctly
- ✅ Filtering works
- ✅ Search is fast (< 100ms)
- ✅ Response format is consistent
- ✅ Error handling is clear
- ✅ Swagger docs are auto-generated and accurate

**Acceptance Criteria:**
- `GET /api/games` returns paginated list
- `GET /api/games/400` returns Portal game
- `GET /api/search?q=portal` finds Portal
- `GET /api/filters` returns filter options
- Invalid query params return 400 with error message
- Not found returns 404
- All responses include proper status codes
- Swagger UI shows all endpoints correctly

---

## Prompt 5: Database Schema & Models - PostgreSQL

**Context:** Design and implement the database schema for persistence in Phase 3. This includes games, users, libraries, and sync jobs.

**Files to Create:**
- `/backend/app/db/models.py` - SQLAlchemy ORM models
- `/backend/app/db/database.py` - Database connection
- `/backend/migrations/` - Alembic migration files (stub)
- Database migration scripts

**Requirements:**

1. **SQLAlchemy Models:**
   - `Game` - Static game data (from cache)
   - `User` - User accounts (Steam OAuth)
   - `UserLibrary` - User's owned games and playtime
   - `SyncJob` - Background sync status tracking

2. **Game Table:**
   ```sql
   CREATE TABLE games (
     app_id INTEGER PRIMARY KEY,
     name VARCHAR(255) NOT NULL,
     playtime_hours FLOAT,
     score FLOAT,
     score_source VARCHAR(50),
     total_reviews INTEGER,
     review_desc VARCHAR(100),
     steam_url TEXT,
     hltb_url TEXT,
     hltb_name VARCHAR(255),
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **User Table:**
   ```sql
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     steam_id BIGINT UNIQUE NOT NULL,
     username VARCHAR(255),
     avatar_url TEXT,
     library_count INTEGER DEFAULT 0,
     last_sync TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

4. **UserLibrary Table:**
   ```sql
   CREATE TABLE user_libraries (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     app_id INTEGER NOT NULL REFERENCES games(app_id) ON DELETE CASCADE,
     playtime_forever INTEGER DEFAULT 0,
     playtime_last_two_weeks INTEGER DEFAULT 0,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW(),
     UNIQUE(user_id, app_id)
   );
   ```

5. **SyncJob Table:**
   ```sql
   CREATE TABLE sync_jobs (
     id SERIAL PRIMARY KEY,
     user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     status VARCHAR(20) NOT NULL, -- 'pending', 'processing', 'completed', 'failed'
     progress INTEGER DEFAULT 0, -- 0-100%
     total_games INTEGER DEFAULT 0,
     processed_games INTEGER DEFAULT 0,
     started_at TIMESTAMP,
     completed_at TIMESTAMP,
     error_message TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

6. **Indexes:**
   - `users.steam_id` - For fast lookups
   - `user_libraries.user_id` - For user's library queries
   - `sync_jobs.user_id` - For tracking user syncs

7. **Database Connection:**
   - SQLAlchemy sessionmaker
   - Connection pooling (NullPool for serverless, QueuePool for servers)
   - Async support (optional for Phase 3)

**Prompt to Use with Copilot:**
```
I'm designing the PostgreSQL database schema for the Steam games web app.

Create SQLAlchemy ORM models for:

1. **Game Model** - Store game data from cache
   - Fields: app_id (PK), name, playtime_hours, score, score_source, total_reviews, review_desc, steam_url, hltb_url, hltb_name
   - Timestamps: created_at, updated_at
   - No relationships initially

2. **User Model** - Store user accounts (Steam OAuth)
   - Fields: id (PK), steam_id (unique), username, avatar_url, library_count, last_sync
   - Timestamps: created_at, updated_at
   - Relationship: has many UserLibrary and SyncJob

3. **UserLibrary Model** - User's owned games
   - Fields: id (PK), user_id (FK), app_id (FK), playtime_forever, playtime_last_two_weeks
   - Constraint: unique(user_id, app_id)
   - Timestamps: created_at, updated_at
   - Relationships: belongs to User and Game

4. **SyncJob Model** - Track background sync operations
   - Fields: id (PK), user_id (FK), status, progress (0-100), total_games, processed_games, error_message
   - Timestamps: started_at, completed_at, created_at
   - Relationship: belongs to User

5. **Database Setup:**
   - SQLAlchemy Engine and SessionLocal
   - Connection pooling strategy (for Render free tier)
   - Support for async (optional)
   - Base class for all models

6. **Migrations:**
   - Setup Alembic for database migrations
   - Create initial migration for all tables
   - Support up/down migrations

Use best practices for SQLAlchemy, add indexes for common queries, include proper foreign key constraints and cascading deletes.
```

**Deliverables:**
- ✅ All 4 models defined
- ✅ SQLAlchemy relationships setup
- ✅ Migration files created
- ✅ Database can be initialized from migrations
- ✅ Indexes created for performance

**Acceptance Criteria:**
- Models use SQLAlchemy best practices
- Relationships are correctly defined
- Foreign keys reference correct tables
- Migrations run successfully
- Database schema matches design
- Tables have appropriate indexes
- Cascading deletes work correctly

---

## Prompt 6: Deployment & CI/CD Configuration

**Context:** Configure deployment for all services (Vercel for frontend, Render for backend, Neon for database) and setup GitHub Actions for automated deployments.

**Files to Create:**
- `/web/vercel.json` - Vercel configuration
- `/backend/render.yaml` - Render deployment config
- `/docker-compose.yml` - Local development
- `/.github/workflows/frontend-deploy.yml` - Auto-deploy frontend
- `/.github/workflows/backend-deploy.yml` - Auto-deploy backend
- `/backend/Dockerfile` - Backend container image

**Requirements:**

1. **Vercel Frontend:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
   - Environment: `VITE_API_URL=https://steam-priority-picker-api.onrender.com`
   - Auto-deploy on push to main branch

2. **Render Backend:**
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn -w 2 -b 0.0.0.0:8000 app.main:app`
   - Environment variables: `DATABASE_URL`, `STEAM_API_KEY`
   - Health check: `GET /health`
   - Auto-deploy on push to main branch

3. **Neon Database:**
   - Create free PostgreSQL instance
   - Get connection string: `postgresql://user:password@host/database`
   - Set as `DATABASE_URL` in Render environment

4. **GitHub Actions:**
   - Trigger on push to `main` branch
   - Run tests (optional for MVP)
   - Build and deploy automatically
   - Notify on success/failure

5. **Docker:**
   - Multi-stage build for optimization
   - Python 3.11 slim base image
   - Include gunicorn for production
   - Expose port 8000

6. **Environment Management:**
   - `.env.example` files for reference
   - Use GitHub Secrets for sensitive data
   - Document all required variables

**Prompt to Use with Copilot:**
```
I'm setting up deployment infrastructure for the Steam games web app.

Create deployment configurations:

1. **Vercel Frontend (vercel.json):**
   - Build: npm run build
   - Output: dist
   - Environment: VITE_API_URL = backend API URL
   - Framework: React with Vite

2. **Render Backend (render.yaml):**
   - Type: Node.js web service (or Python)
   - Build command: pip install -r requirements.txt
   - Start command: gunicorn -w 2 -b 0.0.0.0:8000 app.main:app
   - Health check: GET /health
   - Environment: DATABASE_URL, STEAM_API_KEY, etc.
   - Auto-deploy on push to main

3. **Docker (Dockerfile):**
   - Base: python:3.11-slim
   - Install requirements
   - Expose port 8000
   - Start with gunicorn
   - Production-ready configuration

4. **GitHub Actions (.github/workflows/):**
   - Frontend deployment workflow
   - Backend deployment workflow
   - Trigger on push to main
   - Include build tests/checks
   - Deploy to Vercel and Render automatically

5. **Local Development (docker-compose.yml):**
   - Services: backend (FastAPI), frontend (React dev server), database (PostgreSQL)
   - Network: all services can communicate
   - Volumes for development (auto-reload)
   - Environment variables from .env

6. **Environment Files:**
   - backend/.env.example - DATABASE_URL, STEAM_API_KEY, etc.
   - web/.env.example - VITE_API_URL
   - Document all required variables

The deployment should be secure, automated, and easy to setup. Include proper error handling and logging.
```

**Deliverables:**
- ✅ Frontend deploys automatically to Vercel
- ✅ Backend deploys automatically to Render
- ✅ Database connection string secured
- ✅ Environment variables properly configured
- ✅ GitHub Actions workflows run successfully
- ✅ Docker container builds and runs
- ✅ Local development with docker-compose works

**Acceptance Criteria:**
- Push to GitHub main branch triggers deployments
- Frontend deployed at https://steam-priority-picker.vercel.app
- Backend deployed at https://steam-priority-picker-api.onrender.com
- API calls from frontend work (no CORS errors)
- Database connected and accessible from backend
- Environment variables are not exposed in code
- Deployments complete in < 5 minutes

---

## Implementation Order

**Recommended sequence to follow with Copilot:**

1. **Week 1:** Prompt 1 (Frontend Setup) + Prompt 2 (Game List Components)
   - Result: Working React UI with static data

2. **Week 2:** Deploy to Vercel (Part of Prompt 6)
   - Result: Frontend publicly accessible

3. **Week 3:** Prompt 3 (Backend Setup) + Prompt 4 (API Endpoints)
   - Result: Working API serving game data

4. **Week 4:** Deploy to Render (Part of Prompt 6)
   - Result: API publicly accessible, frontend talking to backend

5. **Week 5:** Prompt 5 (Database Schema)
   - Result: Database designed and initialized

6. **Week 6:** Migrate cache to database, connect backend to DB

7. **Week 7:** Advanced features (Steam OAuth, sync jobs, WebSockets)

---

## Tips for Using These Prompts with GitHub Copilot

1. **Copy-paste each prompt into GitHub Copilot** (available in VS Code or GitHub.com)
2. **Let Copilot generate code**, then review for:
   - Code quality and style
   - Correctness of logic
   - Performance considerations
   - Security best practices
3. **Ask follow-up questions** if something is unclear
4. **Request specific changes** as needed
5. **Test incrementally** - don't wait until everything is done
6. **Commit after each phase** - helps with version control and rollback

---

## Success Metrics

**Phase 1 Complete When:**
- ✅ Frontend loads 1000+ games
- ✅ Filtering and search work
- ✅ Deployed to Vercel
- ✅ Mobile responsive

**Phase 2 Complete When:**
- ✅ Backend serves all endpoints
- ✅ Frontend talks to API
- ✅ Deployed to Render
- ✅ No errors in logs

**Phase 3 Complete When:**
- ✅ Database operational
- ✅ Data migrated from cache
- ✅ Users can login with Steam
- ✅ Sync jobs working
- ✅ Real-time progress updates

---

**Last Updated:** November 21, 2025
**Status:** Ready for Implementation
**Next Step:** Copy Prompt 1 into GitHub Copilot and start Frontend Setup
