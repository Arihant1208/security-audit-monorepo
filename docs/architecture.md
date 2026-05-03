# Architecture

## Overview

Steve is a **multi-service autonomous security agent** built as a monorepo with 7 packages. The system runs a 9-phase pipeline that starts from business context discovery and progresses through architecture mapping, threat modeling, 12-layer security auditing, license compliance, AI opportunity analysis, and report generation.

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
│  │ MCP Server   │ │  Pipeline    │ │  Website   │ │  Static Site  │  │
│  │ (19 tools)   │ │  Engine      │ │  API (/api)│ │  Serving      │  │
│  └──────┬───────┘ └──────┬───────┘ └─────┬──────┘ └───────────────┘  │
└─────────┼────────────────┼────────────────┼───────────────────────────┘
          │                │                │
          ▼                ▼                ▼
┌──────────────────┐ ┌─────────────────┐ ┌──────────────────────────────┐
│  Knowledge Base  │ │  AI Engine      │ │  PostgreSQL (Neon)           │
│  data/ (81+ md)  │ │  Python FastAPI │ │  users, api_keys, sessions,  │
│                  │ │  :8100          │ │  audit_reports, usage_logs    │
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

### packages/orchestrator — MCP Server + Pipeline Engine + Web API

The core service. Registers **19 MCP tools** across 12 tool groups, runs the 9-phase pipeline, serves the REST API for the website, and hosts the static site.

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
| `/api/reports` | GET | List audit reports |
| `/api/reports/:id` | GET | Get report detail |
| `/api/usage` | GET | Usage analytics (last 30 days) |

### packages/ai-engine — Python FastAPI

Analysis service for tasks requiring Python ML/NLP libraries:

| Router | Endpoints |
|--------|-----------|
| `business` | `/api/business/analyze` — industry classification, compliance mapping |
| `architecture` | `/api/architecture/diagram` — Mermaid diagram generation |
| `licenses` | `/api/licenses/scan` — dependency license detection |
| `ai_opportunities` | `/api/ai/opportunities` — AI/ML integration opportunities |
| Health | `/health` — readiness check |

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

### packages/vscode-agent — VS Code Integration

Distributable files (zero IP, zero dependencies):
- `steve.agent.md` — agent personality + behavior rules
- `steve-audit.prompt.md`, `steve-scan.prompt.md`, `steve-license.prompt.md`, `steve-diagram.prompt.md`
- `mcp.json` — MCP server connection config

### packages/site — Website

Plain HTML/CSS/JS served by the orchestrator:
- Landing page with pipeline visualization and pricing
- Signup / Login with session-based auth
- Dashboard with reports, API keys, and usage tabs
- Documentation page

### packages/db — Database

PostgreSQL schema + migrations:

| Table | Purpose |
|-------|---------|
| `users` | Accounts (email, password_hash, plan) |
| `api_keys` | SHA-256 hashed API keys with prefix display |
| `sessions` | Session tokens for website auth |
| `audit_reports` | Stored audit report data |
| `usage_logs` | Per-tool-call analytics (tool, latency, timestamp) |

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

- **Agent files** (packages/vscode-agent) — public, contain zero knowledge
- **MCP server** — requires API key for HTTP access, no auth needed for stdio
- **data/** — never leaves the server; tools return content, agents don't access directly
- **API keys** — stored as SHA-256 hashes; server never stores plaintext
- **Passwords** — salted SHA-256 hashed (production should use bcrypt/argon2)
- **Sessions** — SHA-256 hashed tokens with 7-day expiry
- **Path traversal protection** — `data.ts` prevents reading outside `data/`
- **CORS** — configured for cross-origin MCP access
