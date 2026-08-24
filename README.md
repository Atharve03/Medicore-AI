# MediCore AI

**AI-Powered Hospital Management System** built on the MERN stack with a Hybrid AI
Architecture (local + commercial LLM providers) and the Model Context Protocol (MCP)
for safe, domain-scoped AI data access.

## Monorepo Layout

```
medicore-ai/
├── backend/     Express API, AI Gateway, AI Orchestrator, MCP servers
├── frontend/    React (Vite) client, role-based dashboards
├── docker/      Dockerfiles and compose configuration
├── docs/        Architecture, database, and API design documents
└── scripts/     Dev/ops helper scripts
```

## Documents

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system architecture, hybrid AI design, data flow
- [`docs/DATABASE_DESIGN.md`](docs/DATABASE_DESIGN.md) — MongoDB collection design
- [`docs/API_DESIGN.md`](docs/API_DESIGN.md) — full REST API surface by module
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — 25-phase build plan and current status

## Status

Phase 1 (Architecture & Planning) — **complete**.
Next: Phase 2 — Backend Setup.

## Local Development (once later phases add code)

```bash
# Backend
cd backend && npm install && npm run dev

# First time only: create an admin account (there's no other way to get one)
cd backend && npm run seed:admin
# or: npm run seed:admin -- --email you@hospital.com --password YourPass123! --name "Your Name"
# Log in with those credentials, then create doctor/nurse/receptionist/
# pharmacist/labTechnician accounts from Admin → Users.

# Frontend
cd frontend && npm install && npm run dev

# Full stack via Docker
docker compose -f docker/docker-compose.yml up --build
```
