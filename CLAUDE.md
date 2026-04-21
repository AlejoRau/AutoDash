# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

AutoDash is a full-stack automation workflow management dashboard. Users register and await admin approval before accessing the app. Once approved, they can create, configure, and monitor automations that integrate with n8n webhooks.

- **Backend**: Spring Boot 4 + Java 21, deployed on Railway
- **Frontend**: React 19 + TypeScript + Vite, deployed on Vercel
- **Database**: PostgreSQL via Supabase

## Commands

### Backend (`backend/automations/`)
```bash
./mvnw spring-boot:run          # Run locally on :8080
./mvnw clean package            # Build JAR
./mvnw test                     # Run tests
```

### Frontend (`frontend/`)
```bash
npm run dev       # Dev server on :5173
npm run build     # Production build (tsc + vite build)
npm run lint      # ESLint
npm run preview   # Preview production build
```

## Architecture

### Auth Flow
Registration creates a `PENDING` user. An admin must approve it (sets status to `ACTIVE`) before the user can log in. JWT tokens are stateless; the backend is fully sessionless.

### Backend Layer Structure
`Controller → Service → Repository (Spring Data JPA)`

Key packages under `src/main/java/com/dashboard/automations/`:
- `controller/` — REST endpoints
- `service/` — Business logic
- `repository/` — JPA repositories with custom query methods
- `security/` — JWT filter, `SecurityConfig`, `UserDetailsServiceImpl`
- `model/` — `User` (roles: ADMIN/USER, statuses: ACTIVE/PENDING/REJECTED), `Automation` (statuses: ACTIVE/INACTIVE/RUNNING, triggerTypes: MANUAL/SCHEDULE/WEBHOOK)
- `dto/` — Request/response DTOs separate from entities

### Frontend Structure
`src/lib/api.ts` — Axios instance that auto-attaches the JWT Bearer token and redirects to `/login` on 401.

`src/services/` — One file per domain (`automations.service.ts`, `auth.service.ts`, `admin.service.ts`, `n8n.service.ts`). All API calls go through these services, not directly from components.

`src/context/AuthContext.tsx` — Global auth state; wraps the app.

### API Endpoints
```
POST /api/auth/register          # Public
POST /api/auth/login             # Public, returns JWT
GET  /api/auth/me                # Protected

GET/POST   /api/automations      # Paginated list + create
GET/PUT    /api/automations/{id}
PATCH      /api/automations/{id}/status
DELETE     /api/automations/{id}

/api/admin/*                     # ADMIN role only
/api/n8n/*                       # N8n webhook integration
```

## Environment Variables

### Backend (`.env` in `backend/automations/`)
```
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...
JWT_SECRET=...           # 32+ chars minimum
ADMIN_EMAIL=...          # Seeded as first admin on startup
```

### Frontend
- `.env.development`: `VITE_API_URL=http://localhost:8080`
- `.env.production`: `VITE_API_URL=https://autodash-backend-production.up.railway.app`

## Key Dependencies

**Backend**: Spring Security, Spring Data JPA, JJWT 0.12.6, Lombok, Jakarta Bean Validation

**Frontend**: React Query (TanStack), React Hook Form + Zod, Axios, shadcn/ui, Tailwind CSS 4, React Router 7, Sonner (toasts), Lucide icons

Path alias `@/*` maps to `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`).

## Deployment

- **Backend**: Railway with Docker (multi-stage build in `backend/automations/Dockerfile`). Env vars set in Railway dashboard.
- **Frontend**: Vercel auto-detects Vite. `VITE_API_URL` must be set in Vercel project settings for production.
- Hibernate DDL is set to `update` — schema changes are applied automatically on deploy.
