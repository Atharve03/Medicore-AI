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
`OLLAMA_MODEL=qwen2.5:3b-instruct`. `OLLAMA_TIMEOUT_MS` controls the request
timeout and defaults to 60000. No commercial-provider key is required in
local mode, and the server returns a controlled 503 instead of silently falling
back if Ollama or the configured model is unavailable.

Authenticated patients, doctors, and admins use the assistant at
`/ai-assistant` through `POST /api/v1/ai/chat`. Application facts are retrieved
only through authorized MCP tools; the orchestrator has no model/repository
imports and removes internal identifiers before sending narrow context to Qwen.
Conversation context is bounded, held per user in memory, and can be cleared.

## General-knowledge RAG

Phase 22 includes a separate RAG subsystem for trusted, non-patient healthcare
knowledge. Admins ingest plain text, Markdown, or JSON text through
`POST /api/v1/rag/documents`; `GET /api/v1/rag/documents` lists the knowledge
base and `DELETE /api/v1/rag/documents/:id` removes a document and its chunks.
Documents are chunked with overlap, embedded locally, and stored behind a
repository abstraction in MongoDB. The default `local-hash` embedder requires
no paid service or model download. It is intended for a modest local knowledge
base and can later be replaced behind the embedding/repository interfaces.

The orchestrator chooses among RAG, MCP, both, or neither. RAG contains only
general knowledge; patient records always come from authorized MCP tools.
Retrieved chunks are treated as untrusted reference data and never as system
instructions. Relevant source metadata is returned to the chat UI.

Example ingestion request (authenticated admin):

```json
{
  "title": "Hospital Diabetes Education Guide",
  "source": "MediCore Clinical Education Team",
  "mimeType": "text/markdown",
  "content": "# Diabetes\nTrusted educational content...",
  "metadata": { "reviewedAt": "2026-08-30" }
}
```

Relevant environment variables are documented in `backend/.env.example`.
RAG tuning variables include `RAG_EMBEDDING_PROVIDER`,
`RAG_EMBEDDING_DIMENSIONS`, `RAG_CHUNK_SIZE`, `RAG_CHUNK_OVERLAP`,
`RAG_TOP_K`, `RAG_MIN_SCORE`, and `RAG_MAX_CANDIDATES`.

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
# Phase 23 — Analytics and AI Insights

Role-scoped analytics are available under `/api/v1/analytics` for overview, appointments, patients, doctors, billing, pharmacy, laboratory, admissions, and departments. Queries accept `range=today|yesterday|last7Days|last30Days|thisMonth|lastMonth` or a bounded custom `from`/`to` ISO date pair (maximum 366 days). The React dashboard is at `/analytics` and uses the existing Axios authentication and Chart.js stack.

Analytics use MongoDB aggregation through the analytics repository; controllers never query MongoDB. AI analytics requests continue through the existing orchestrator and the registered `analytics.getAuthorizedAnalytics` MCP tool, which applies the same role scope as REST. Qwen receives only authorized aggregate results and is instructed not to invent values or comparisons. Patients cannot access hospital analytics.

Admin analytics also track AI requests, prompt/completion tokens, latency, failures, provider/model, and attributable API cost from the time telemetry is enabled. Local Ollama requests have zero provider/API cost; hardware and electricity costs are not estimated. `POST /api/v1/analytics/ai-report` generates a Qwen report using authorized analytics through MCP.

AI governance, token/cost telemetry, and AI report generation are restricted to `superAdmin`. A regular `admin` retains operational administration but cannot create, edit, deactivate, list, or promote super-admin accounts and cannot grant administrator roles. Bootstrap the first super admin locally with `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_NAME`, and a strong `SUPER_ADMIN_PASSWORD`, then run `npm run seed:super-admin` from `backend`. Remove the password variable from the shell afterward.
