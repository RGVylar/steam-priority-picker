# Phase 3: Database + Authentication

## Objetivos
1. Agregar base de datos PostgreSQL para persistencia
2. Implementar Steam OAuth para autenticación
3. Guardar favoritos/prioridades del usuario
4. Mantener histórico de cambios

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│ Frontend (React)                                        │
│ - Login button → Steam OAuth flow                       │
│ - User profile with favorites                           │
│ - Persist favorites to backend                          │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ Backend (FastAPI)                                       │
│ - POST /auth/login (Steam OAuth redirect)              │
│ - POST /auth/callback (OAuth callback)                 │
│ - GET /auth/user (get current user)                    │
│ - POST /auth/logout                                     │
│ - POST /api/favorites (save favorite)                  │
│ - GET /api/favorites (get user favorites)              │
│ - DELETE /api/favorites/{app_id}                       │
└────────────────────┬────────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────────┐
│ PostgreSQL Database                                     │
│ - users table (steam_id, username, avatar_url)         │
│ - favorites table (user_id, app_id, priority, notes)   │
│ - sessions table (for session management)              │
└─────────────────────────────────────────────────────────┘
```

## Tareas

### 1. Base de Datos
- [ ] Install PostgreSQL locally
- [ ] Create database schema
  - [ ] users table
  - [ ] favorites table
  - [ ] sessions table
- [ ] Setup SQLAlchemy ORM in backend
- [ ] Create migrations with Alembic

### 2. Backend - Authentication
- [ ] Register Steam OAuth app
- [ ] Create auth endpoints
  - [ ] GET /auth/login
  - [ ] GET /auth/callback
  - [ ] GET /auth/user
  - [ ] POST /auth/logout
- [ ] Setup JWT tokens
- [ ] Middleware for auth validation

### 3. Backend - Favorites
- [ ] POST /api/favorites
- [ ] GET /api/favorites
- [ ] PUT /api/favorites/{app_id}
- [ ] DELETE /api/favorites/{app_id}

### 4. Frontend - Auth UI
- [ ] Login button with Steam icon
- [ ] User profile dropdown
- [ ] Logout button
- [ ] Auth context/hook

### 5. Frontend - Favorites
- [ ] Save/load favorites from backend
- [ ] UI for managing favorites
- [ ] Sync with backend on changes

### 6. Deployment
- [ ] PostgreSQL on Render/Railway
- [ ] Environment variables setup
- [ ] Migrations in production

## Tecnologías

**Backend:**
- SQLAlchemy (ORM)
- Alembic (migrations)
- python-dotenv (config)
- aiohttp (HTTP requests for Steam API)
- PyJWT (JWT tokens)

**Frontend:**
- React Context (auth state)
- Custom hooks (useAuth)

## Estimado
- Semana 1: DB + Backend auth
- Semana 2: Frontend auth UI + favorites
- Semana 3: Testing + deployment
