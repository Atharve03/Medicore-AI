# MediCore AI — System Architecture

## 1. Objective

MediCore AI is a role-based Hospital Management System where an AI Assistant can
answer questions and generate summaries (blood reports, prescriptions, discharge
summaries, hospital analytics) **without the AI model ever seeing the full
hospital database**. This is achieved by routing every AI request through an
AI Orchestrator that pulls only the minimum required data via domain-scoped MCP
servers, then hands that narrow context to a swappable AI provider through a
single AI Gateway.

## 2. High-Level System Diagram

```
┌──────────────┐      ┌──────────────┐      ┌───────────────────┐
│   React SPA  │ ───▶ │  Express API │ ───▶ │  Core Domain       │
│ (role-based  │ ◀─── │  (REST, JWT, │ ◀─── │  Modules (MVC):    │
│  dashboards) │      │   RBAC)      │      │  Patient, Doctor,  │
└──────────────┘      └──────┬───────┘      │  Appointment, ...  │
                              │              └─────────┬─────────┘
                              │                         │
                              ▼                         ▼
                     ┌─────────────────┐        ┌──────────────┐
                     │ AI Orchestrator │        │   MongoDB    │
                     │ (intent, MCP    │        │  (Mongoose)  │
                     │  selection,     │        └──────────────┘
                     │  prompt build)  │               ▲
                     └────────┬────────┘               │
                              │ calls only the          │
                              │ MCP server(s) needed     │
                              ▼                         │
                     ┌─────────────────┐                │
                     │  MCP Servers    │────────────────┘
                     │ (Patient, Lab,  │  each server owns
                     │  Billing, ...)  │  read access to only
                     └────────┬────────┘  its own collections
                              │ returns narrow,
                              │ domain-scoped JSON
                              ▼
                     ┌─────────────────┐
                     │   AI Gateway    │  normalizes request/response
                     │ (provider-      │  across providers
                     │  agnostic)      │
                     └────────┬────────┘
                              │
              ┌───────────────┼───────────────┬───────────────┐
              ▼               ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐    ┌──────────┐    ┌──────────┐
        │  Local   │   │  OpenAI  │    │  Claude  │    │  Gemini  │
        │ (Ollama, │   │          │    │          │    │          │
        │ Qwen 2.5 │   │          │    │          │    │          │
        │   3B)    │   │          │    │          │    │          │
        └──────────┘   └──────────┘    └──────────┘    └──────────┘
```

## 3. Layers

### 3.1 Frontend (React)
- Role-based dashboards (Admin, Doctor, Patient, Receptionist, Nurse,
  Pharmacist, Lab Technician).
- Zustand for global state, React Query-free Axios data layer, React Hook Form
  for validated forms, Chart.js for analytics visualizations.
- Dark-mode-capable Tailwind design system.

### 3.2 Backend (Express, MVC + Clean Architecture)
Standard hospital modules follow: **Routes → Validators → Middlewares →
Controllers → Services → Repositories → Mongoose Models**. Business logic never
lives in controllers; controllers only orchestrate services.

### 3.3 AI Subsystem
Three cleanly separated pieces so providers and data access can evolve
independently:

1. **AI Provider Manager / AI Gateway** (`backend/src/ai/gateway`,
   `backend/src/ai/providers`) — one adapter per provider (`local`, `openai`,
   `claude`, `gemini`), all implementing the same interface
   (`generate({ systemPrompt, messages, context }) -> { text, usage, provider }`).
   Selection is purely via the `AI_PROVIDER` environment variable — no code
   changes required to switch providers.
2. **AI Orchestrator** (`backend/src/ai/orchestrator`) — the only entry point
   the rest of the app calls for AI features. It:
   - classifies user intent (e.g. "explain my blood report" →
     `lab.explainReport`),
   - decides which MCP server(s) satisfy that intent,
   - requests only that data via the MCP client,
   - builds the final prompt (system + retrieved context + user message),
   - calls the AI Gateway,
   - returns the normalized response.
   The Orchestrator has **no direct MongoDB connection** — this is enforced
   structurally (no Mongoose models are imported into `ai/orchestrator`).
3. **MCP Servers** (`backend/src/mcp/servers`) — implemented in Phase 21:
   an in-process registry (`mcp/registry/mcpRegistry.js`), one server per
   domain (Patient, Doctor, Appointment, Medical Record, Laboratory,
   Prescription, Pharmacy, Billing, Inventory, Admission, Analytics,
   Notification — 12 servers, 19 tools total), each registering a small
   set of read-oriented tools scoped to its own collections. Every
   patient-scoped tool enforces the same ownership rule as the REST layer
   via a shared `assertCanAccessPatient` helper (`mcp/servers/_shared/authz.js`),
   so AI access never exceeds what the REST API already allows the same
   role to see. Servers register themselves once at `app.js` load time;
   `GET /api/v1/mcp/tools` (admin-only) lists what's registered for
   verification. The AI Orchestrator (Phase 22) is the only intended
   caller, via `mcp/client/mcpClient.js` — in-process function calls, not
   a separate network transport, since this is a monolith rather than
   independently-deployed MCP servers.

### 3.4 Data Flow Example — "Explain my latest blood report"

```
React → POST /api/ai/assistant
      → Express Controller → AI Orchestrator
      → Orchestrator detects intent = lab.explainReport
      → Orchestrator calls Laboratory MCP.getLatestReport(patientId)
      → Laboratory MCP reads only the LabReport collection (scoped to patientId)
      → Orchestrator builds prompt with ONLY that report's data
      → AI Gateway → selected provider (e.g. local Qwen 2.5 3B via Ollama)
      → Provider response normalized → returned to Orchestrator → Controller → React
```

No other collection (billing, inventory, other patients' records, etc.) is ever
placed in context.

## 4. Hybrid AI Rationale

| | Local (Ollama + Qwen 2.5 3B) | Commercial (OpenAI / Claude / Gemini) |
|---|---|---|
| Cost | Free after model download | Per-token API cost |
| Availability | Works offline | Requires internet + API key |
| Privacy | Data never leaves the server | Data sent to third-party API |
| Reasoning depth / context window | Smaller, good for routine explanations | Larger, better for complex summaries |
| Best for | Default dev/demo mode, cost-sensitive deployments | Production deployments needing higher-quality reasoning |

Switching is a single environment variable:

```
AI_PROVIDER=local
AI_PROVIDER=openai
AI_PROVIDER=claude
AI_PROVIDER=gemini
```

## 5. Security Model

- **AuthN**: JWT access + refresh tokens, bcrypt password hashing.
- **AuthZ**: Role-Based Access Control (RBAC) middleware per route, enforced
  again inside each MCP server before returning data.
- **Hardening**: Helmet, express-rate-limit, input validation (Joi/Zod),
  Mongo sanitization, centralized error handler, structured logging.
- **File uploads**: Multer with type/size restriction, stored under
  `backend/uploads` (or cloud storage in later phases).

## 6. Caching

Redis is used for: session/token blacklisting, rate-limit counters, and
caching expensive read paths (e.g. analytics aggregations).

## 7. Deployment Topology

- `docker/docker-compose.yml` orchestrates: `backend`, `frontend`, `mongo`,
  `redis`, and `ollama` (local model runtime) for local/dev parity.
- Production target: Backend on Render (or similar container host), Frontend
  on Vercel, MongoDB Atlas, managed Redis.

## 8. Why This Impresses Recruiters

- Demonstrates provider-agnostic AI integration (a real enterprise concern —
  vendor lock-in avoidance).
- Demonstrates MCP, a genuinely current protocol, applied to a real
  least-privilege data access problem, not just a buzzword.
- Clean layered backend architecture that maps directly to how large software
  consultancies (Deloitte/Accenture/Cognizant-style delivery) structure
  production systems.
