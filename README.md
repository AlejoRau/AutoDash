# Automations Dashboard

Full-stack web app to create, manage, and monitor automation workflows. Built as a portfolio project to demonstrate clean architecture with Spring Boot and React.

## Stack

| | Technology |
|-|-----------|
| Frontend | React + Vite |
| Backend | Spring Boot 4 · Java 21 |
| Database | PostgreSQL (Supabase) |
| Auth | JWT |
| Deploy | Vercel (frontend) · Railway (backend) |

## Project Structure

```
├── backend/automations   # Spring Boot REST API
└── frontend/             # React app (coming soon)
```

## Features

- CRUD for automation workflows
- Status management (Active / Inactive / Running)
- Trigger types (Manual, Schedule, Webhook)
- JWT authentication (in progress)
- Layered architecture: Controller → Service → Repository

## Getting Started

See [`backend/automations/README.md`](backend/automations/README.md) for backend setup instructions.

## Roadmap

- [x] Automation CRUD API
- [x] Global error handling & validation
- [ ] JWT auth
- [ ] React frontend
- [ ] Trigger execution engine
