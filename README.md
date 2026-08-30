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

Phases 1–22 are complete. The current application includes all hospital domain
modules, seven role dashboards, OTP authentication, password recovery, domain
MCP servers, and a Qwen 2.5 3B Instruct assistant served by Ollama.

## Authentication and passwords

Public signup requires full name, email, password confirmation, and one of the
existing non-admin roles. The backend rejects public administrator creation;
admins remain available through the admin provisioning command/module. Login
uses email and password only—the account role always comes from MongoDB. Both
registration and login finish through a hashed, purpose-bound email OTP.

Passwords must contain 8–128 characters, uppercase, lowercase, a number, and a
special character. Password recovery uses `forgot-password` → password-reset OTP
→ short-lived single-use reset token → `reset-password`. Authenticated password
changes revoke the current refresh session.

For Gmail SMTP, create an App Password and configure `SMTP_HOST=smtp.gmail.com`,
`SMTP_PORT=587`, `SMTP_USER`, and `SMTP_PASS` in `backend/.env`. Never commit it.
Registration, login, and password-reset codes use reusable responsive HTML
templates with a plain-text fallback, expiry information, and security warnings.

## Local Qwen assistant

Install Ollama, then pull the configured model:

```bash
ollama pull qwen2.5:3b-instruct
ollama serve
```

Configure `AI_PROVIDER=local`, `OLLAMA_BASE_URL=http://localhost:11434`, and
`OLLAMA_MODEL=qwen2.5:3b-instruct`. No commercial-provider key is required in
local mode, and the server returns a controlled 503 instead of silently falling
back if Ollama is unavailable.

Authenticated patients, doctors, and admins use the assistant at
`/ai-assistant` through `POST /api/v1/ai/chat`. Application facts are retrieved
only through authorized MCP tools; the orchestrator has no model/repository
imports and removes internal identifiers before sending narrow context to Qwen.
Conversation context is bounded, held per user in memory, and can be cleared.

Relevant environment variables are documented in `backend/.env.example`.

## Local development

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

Run verification with `cd backend && npm test` and
`cd frontend && npm run build`.
