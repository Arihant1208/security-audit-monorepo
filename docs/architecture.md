# Architecture

## Overview

Steve is a **multi-service autonomous security agent** built as a monorepo with 6 packages. The system runs a 9-phase pipeline that starts from business context discovery and progresses through architecture mapping, threat modeling, 12-layer security auditing, license compliance, AI opportunity analysis, and report generation.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  User Interfaces                                                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  VS Code   │  │    CLI     │  │  Web Site    │  │   Dashboard   │  │
│  │  Agent     │  │  (steve)   │  │  (HTML/CSS)  │  │   (Next.js)   │  │
│  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘  └──────┬────────┘  │
└────────┼────────────────┼────────────────┼─────────────────┼───────────┘
         │ MCP/stdio      │ MCP/HTTP       │ REST             │ REST
         ▼                ▼                ▼                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│  Orchestrator (packages/orchestrator)                                  │
│                                                                        │
│  ┌──────────────┐ ┌──────────────┐ ┌────────────┐ ┌───────────────┐  │
│  │ MCP Server   │ │  Pipeline    │ │  REST API  │ │  Job Queue    │  │
│  │ (19 tools)   │ │  Engine      │ │  (/api)    │ │  (PG-backed)  │  │
│  └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ └──────┬────────┘  │
└─────────┼────────────────┼────────────────┼───────────────┼───────────┘
          │                │                │               │
          ▼                ▼                ▼               ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────────────────┐
│  Knowledge Base  │ │  AI Engine      │ │  PostgreSQL (Neon/local)     │
│  data/ (81+ md)  │ │  Python FastAPI │ │  users, api_keys, sessions,  │
│                  │ │  + LLM (GPT/    │ │  audit_reports, usage_logs,  │
│                  │ │   Claude) :8100 │ │  pipeline_jobs               │
└──────────────────┘ └─────────────────┘ └──────────────────────────────┘
```

## 9-Phase Pipeline

| Phase | Name | Tool Group | Output |
|-------|------|-----------|--------|
| 0 | Business Discovery | `analyze-business-context` | Industry, compliance needs, risk profile |
| 1 | System Discovery | `get-methodology` | Tech stack, entry points, dependencies |
| 2 | Architecture Mapping | `generate-architecture-diagram`, `analyze-architecture` | Mermaid diagrams, architecture recommendations |
| 3 | Threat Modeling | `list-threat-models`, `get-threat-model` | STRIDE analysis, attack surface map |
| 4 | Layered Security Audit | `list-checklists`, `get-checklist`, `match-vulnerabilities` | 12-layer findings with evidence |
| 5 | License Compliance | `scan-licenses`, `check-license-compatibility` | Per-dependency license classification |
| 6 | AI Opportunity Analysis | `analyze-ai-opportunities` | Where AI/ML can improve the system |
| 7 | Risk & Remediation | `calculate-risk-score`, `get-remediation` | Scored findings, prioritized fix plan |
| 8 | Report Generation | `get-report-template`, `map-compliance` | Executive summary + full technical report |

## Packages

### packages/core — Shared Types

TypeScript type definitions shared across all packages:

| File | Types |
|------|-------|
| `pipeline.ts` | `PipelinePhase`, `PipelineState`, `PhaseResult` |
| `business.ts` | `BusinessContext`, `IndustryType`, `ComplianceFramework` |
| `architecture.ts` | `ArchitectureDiagram`, `Component`, `DataFlow` |
| `security.ts` | `SecurityFinding`, `Severity`, `AuditLayer` |
| `license.ts` | `LicenseInfo`, `LicenseConflict`, `LicenseRisk` |
| `ai.ts` | `AIOpportunity`, `AICapability`, `ConfidenceLevel` |
| `state.ts` | `AuditState`, `StateStore` |
| `index.ts` | Re-exports all types |

### packages/orchestrator — MCP Server + Pipeline Engine + Web API + Job Queue

The core service. Registers **19 MCP tools** across 12 tool groups, runs the 9-phase pipeline, serves the REST API, hosts the static site, and runs an async job worker.

**Internal Structure:**

| Directory | Purpose |
|-----------|---------|
| `src/infra/` | Shared infrastructure — auth, DB, Drizzle ORM, SQL client, data file access |
| `src/pipeline/` | Pipeline engine, PG-backed job queue, background worker |
| `src/routes/` | Express route handlers (auth, keys, reports, usage, teams, jobs) |
| `src/tools/` | MCP tool registrations (checklists, KB, risk, remediation, etc.) |
| `src/middleware/` | Session auth, rate limiting, error handling, validation |

**MCP Tools (19):**

| Tool Group | Tools |
|-----------|-------|
| Checklists | `list-checklists`, `get-checklist` |
| Knowledge Base | `list-attack-patterns`, `get-attack-pattern`, `match-vulnerabilities` |
| Risk Scoring | `calculate-risk-score` |
| Remediation | `get-remediation` |
| Reporting | `get-report-template`, `map-compliance` |
| Methodology | `get-methodology` |
| Threat Models | `list-threat-models`, `get-threat-model` |
| Business Discovery | `analyze-business-context` |
| Architecture | `generate-architecture-diagram`, `analyze-architecture` |
| License Compliance | `scan-licenses`, `check-license-compatibility` |
| AI Opportunities | `analyze-ai-opportunities` |
| Pipeline Control | `start-pipeline`, `get-pipeline-status` |

**Transports:**
- **stdio** — local/enterprise: `node dist/index.js --stdio`
- **HTTP/SSE** — remote/SaaS: `node dist/index.js [--port 3000]`

**Website API (11 endpoints):**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/signup` | POST | User registration |
| `/api/auth/login` | POST | Session login |
| `/api/auth/logout` | POST | Session logout |
| `/api/auth/me` | GET | Current user info |
| `/api/keys` | GET | List API keys |
| `/api/keys` | POST | Create API key |
| `/api/keys/:id` | DELETE | Revoke API key |
| `/api/reports` | GET | List audit reports (includes team reports) |
| `/api/reports` | POST | Upload/create audit report |
| `/api/reports/:id` | GET | Get report detail |
| `/api/usage` | GET | Usage analytics (last 30 days) |
| `/api/team` | GET | Get current user's team |
| `/api/teams` | POST | Create a team |
| `/api/teams/:id/invite` | POST | Invite a member by email |
| `/api/teams/:id/members/:userId` | DELETE | Remove a team member |
| `/api/teams/:id/members/:userId` | PATCH | Change team member role |
| `/api/jobs` | POST | Enqueue async pipeline job |
| `/api/jobs` | GET | List current user's jobs |
| `/api/jobs/:id` | GET | Get job status + progress |
| `/api/jobs/:id/cancel` | POST | Cancel a pending/running job |

**Auth:** Supports both legacy session tokens and Clerk JWTs (via `Authorization: Bearer <token>`).

### packages/ai-engine — Python FastAPI + LLM Integration

Analysis service for tasks requiring Python ML/NLP libraries. Supports direct LLM calls (OpenAI/Anthropic) for deep code analysis when API keys are configured, with graceful fallback to heuristic-only mode.

| Router | Endpoints |
|--------|-----------|
| `business` | `/api/v1/business/infer` — industry classification, compliance mapping (LLM-enhanced) |
| `architecture` | `/api/v1/architecture/diagram` — Mermaid diagram generation |
| `licenses` | `/api/v1/licenses/analyze` — dependency license detection |
| `ai_opportunities` | `/api/v1/ai/opportunities` — AI/ML integration opportunities |
| `code_analysis` | `/api/v1/code/analyze` — LLM-powered vulnerability detection |
| `code_analysis` | `/api/v1/code/fix` — LLM-powered fix generation |
| Health | `/api/v1/health` — readiness check |

**LLM Configuration:** Set `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` + `LLM_PROVIDER` (openai/anthropic). Without keys, endpoints fall back to heuristic pattern matching.

### packages/cli — Command-Line Interface

Commander-based CLI wrapping the MCP server:

```
steve audit ./project       Full 9-phase autonomous audit
steve scan ./project        Quick security scan
steve license ./project     License compliance check
steve diagram ./project     Architecture diagrams
steve report ./project      Generate reports from existing scan
steve dashboard             Launch web dashboard
```

### packages/vscode — VS Code Integration

Distributable agent files (zero dependencies):
- `steve.agent.md` — unified 9-phase autonomous agent
- `security-scanner.agent.md` — scan-only agent (read-only)
- `security-fixer.agent.md` — fix agent (recommends + applies patches)
- Prompt files: `steve-audit`, `steve-scan`, `steve-license`, `steve-diagram`, `fix-vulnerabilities`
- `mcp.json` — MCP server connection config

### packages/site — Website (Legacy)

Plain HTML/CSS/JS served by the orchestrator:
- Landing page with pipeline visualization and pricing
- Signup / Login with session-based auth
- Dashboard with reports, API keys, and usage tabs
- Documentation page

> **Note:** The `packages/site` website is being replaced by `packages/dashboard` for authenticated features.

### packages/dashboard — Next.js Dashboard

Full-featured web dashboard built with Next.js 14, shadcn/ui, Tailwind CSS, and Recharts:
- **Clerk authentication** — sign-in/sign-up with SSO support
- **Dashboard overview** — risk trend chart, severity pie, usage sparkline, overview cards
- **Reports** — list with search/sort, detail with risk gauge, findings table, pipeline progress
- **API Keys** — create (one-time reveal), list, revoke
- **Usage analytics** — daily bar chart, tool pie chart, breakdown table
- **Team management** — create teams, invite members, manage roles (admin/member/viewer)
- **Mobile responsive** — collapsible sidebar with mobile overlay

Runs on port 4000. Communicates with the orchestrator API on port 3334.

### packages/db — Database

PostgreSQL schema + migrations:

| Table | Purpose |
|-------|---------|
| `users` | Accounts (email, password_hash, plan, clerk_id) |
| `api_keys` | SHA-256 hashed API keys with prefix display |
| `sessions` | Session tokens for website auth |
| `audit_reports` | Stored audit report data (team_id for shared access) |
| `usage_logs` | Per-tool-call analytics (tool, latency, timestamp) |
| `teams` | Team name, creator |
| `team_members` | User–team associations with role (admin/member/viewer) |
| `team_invites` | Pending invitations by email with token |
| `pipeline_jobs` | Async pipeline job queue (status, progress, results, claimed_at) |

**ORM:** Drizzle ORM (`packages/orchestrator/src/infra/schema.ts`) provides typed access for new code alongside raw SQL for existing queries.

### data/ — Security Knowledge Base

81+ markdown files — the single source of truth for all security expertise:
- **12 audit checklists** — one per security layer
- **31+ attack patterns** across 7 categories
- **7 remediation guides** with language-specific code examples
- **3 report templates** — audit, executive, vulnerability
- **4 compliance mappings** — OWASP Top 10, NIST CSF, CIS Controls, SOC 2
- **3 threat model templates** — STRIDE, data flow, threat scenarios
- **Risk scoring model** + methodology + threat model guides

## Data Flow

### Full Audit Pipeline

```
User triggers /steve-audit (VS Code) or `steve audit` (CLI)
  → Phase 0: Discover business context (industry, compliance needs)
  → Phase 1: Scan codebase for tech stack, deps, entry points
  → Phase 2: Generate architecture diagrams via AI engine
  → Phase 3: Run STRIDE threat modeling per component
  → Phase 4: Audit 12 security layers against checklists
  → Phase 5: Scan dependencies for license compliance
  → Phase 6: Identify AI/ML improvement opportunities
  → Phase 7: Score risks, generate prioritized remediation plan
  → Phase 8: Generate executive summary + technical report
  → Output: audit-results/ directory with all artifacts
```

### Auth Flows

**MCP Auth (API key):**
```
Request with X-API-Key header
  → SKIP_AUTH=true? → bypass (stdio/local)
  → DATABASE_URL set? → SHA-256 hash → query api_keys table
      → found + not revoked → authenticated (update last_used_at)
  → SECURITY_AUDIT_API_KEYS env? → plaintext match
  → reject 401
```

**Website Auth (session):**
```
POST /api/auth/login { email, password }
  → Hash password with stored salt → compare
  → Generate session token → store in sessions table
  → Return token (stored as cookie/header by client)

Subsequent requests: X-Session-Token header
  → Look up in sessions table
  → Expire after 7 days
```

## Security Boundaries

- **Agent files** (packages/vscode) — public, contain zero knowledge
- **MCP server** — requires API key for HTTP access, no auth needed for stdio
- **data/** — never leaves the server; tools return content, agents don't access directly
- **API keys** — stored as SHA-256 hashes; server never stores plaintext
- **Passwords** — salted SHA-256 hashed (production should use bcrypt/argon2)
- **Sessions** — SHA-256 hashed tokens with 7-day expiry
- **Path traversal protection** — `infra/data.ts` prevents reading outside `data/`
- **Job queue** — PG advisory locks (`FOR UPDATE SKIP LOCKED`) prevent double-processing
- **CORS** — configured for cross-origin MCP access
