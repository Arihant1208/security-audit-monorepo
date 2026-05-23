# Development Guide

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Orchestrator, core, CLI |
| npm | 10+ | Workspace management |
| Python | 3.11+ | AI engine |
| Docker | 24+ | Local Postgres, full-stack dev |
| Git | 2.40+ | Version control |

## Quick Start

```bash
# Clone
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo

# Install all workspace dependencies
npm install

# Build everything (core → orchestrator → cli)
npm run build

# Start the orchestrator (no DB required — uses env var auth)
cd packages/orchestrator
SECURITY_AUDIT_SKIP_AUTH=true node dist/index.js
# → http://localhost:3000
```

## Full-Stack with Docker Compose

Starts all 4 services: PostgreSQL, Orchestrator, AI Engine, Dashboard.

```bash
docker compose -f infra/docker-compose.yml up -d

# Verify
curl http://localhost:3000/health
# {"status":"ok","agent":"steve-security-agent","version":"2.0.0","tools":19,"phases":9}
```

| Service | Port | URL |
|---------|------|-----|
| PostgreSQL | 5433 | `postgresql://steve:steve_local@localhost:5433/steve` |
| Orchestrator | 3000 | http://localhost:3000 |
| AI Engine | 8100 | http://localhost:8100 |
| Dashboard | 4000 | http://localhost:4000 |

Test API key: `steve_test_localdev1234567890abcdef`

## Directory Layout

```
steve/
├── data/                        ← Security knowledge base (81+ markdown files)
├── packages/
│   ├── core/                    ← Shared TypeScript types (npm workspace: @steve/core)
│   ├── orchestrator/            ← MCP server + API + pipeline engine + static site
│   ├── ai-engine/               ← Python FastAPI (code analysis, diagrams, licenses)
│   ├── cli/                     ← CLI tool (steve audit/scan/license/diagram)
│   ├── dashboard/               ← Next.js web dashboard (Clerk, shadcn/ui, Recharts)
│   ├── vscode/                  ← Distributable VS Code agent + prompts
│   ├── site/                    ← HTML/CSS/JS website (served by orchestrator)
│   ├── db/                      ← PostgreSQL schema + migrations
├── infra/                       ← Docker, docker-compose, Fly.io, Render configs
├── docs/                        ← This documentation
└── scripts/                     ← Setup, build, distribution helpers
```

## Build System

The monorepo uses **npm workspaces**. Build order matters — core must build before orchestrator and CLI.

```bash
# Build everything
npm run build

# Build individual packages
npm run build -w packages/core
npm run build -w packages/orchestrator
npm run build -w packages/cli

# Watch mode (auto-rebuild on save)
npm run dev
```

## Running Individual Services

### Orchestrator (TypeScript)

```bash
# With no auth (simplest for development)
cd packages/orchestrator
SECURITY_AUDIT_SKIP_AUTH=true node dist/index.js

# With env var auth
SECURITY_AUDIT_API_KEYS="my-dev-key" node dist/index.js

# With database auth
DATABASE_URL="postgresql://steve:steve_local@localhost:5433/steve" node dist/index.js

# Custom port
node dist/index.js --port 8080

# Stdio mode (for VS Code MCP)
node dist/index.js --stdio
```

### AI Engine (Python)

```bash
cd packages/ai-engine

# Create virtual environment
python -m venv .venv
source .venv/bin/activate    # Linux/Mac
.venv\Scripts\activate       # Windows

# Install dependencies
pip install -e .

# Run
uvicorn steve.main:app --host 0.0.0.0 --port 8100 --reload
```

### Dashboard (Next.js)

```bash
cd packages/dashboard

# Install dependencies
npm install --legacy-peer-deps

# Copy env template
cp .env.local.example .env.local
# Edit .env.local with your Clerk keys (get from clerk.com/dashboard)

# Run dev server
npm run dev
# → http://localhost:4000
```

**Required env vars for the dashboard:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend key |
| `CLERK_SECRET_KEY` | Clerk backend key |
| `NEXT_PUBLIC_API_URL` | Orchestrator URL (default: `http://localhost:3334`) |

### Database

```bash
# Start just Postgres (via Docker)
docker compose -f infra/docker-compose.yml up db -d

# Apply migrations manually
psql "postgresql://steve:steve_local@localhost:5433/steve" -f packages/db/migrations/001-init.sql
psql "postgresql://steve:steve_local@localhost:5433/steve" -f packages/db/migrations/002-website-auth.sql
psql "postgresql://steve:steve_local@localhost:5433/steve" -f packages/db/seed.sql

# Reset database
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up db -d
```

## Code Structure — Orchestrator

| File/Directory | Purpose |
|------|---------|
| `src/index.ts` | Entry point — MCP server, HTTP/stdio transport, static site serving |
| `src/api.ts` | Website REST API (auth, keys, reports, usage, teams) — 16 endpoints |
| `src/infra/auth.ts` | Auth chain: skip → DB lookup → env var fallback → Clerk JWT |
| `src/infra/data.ts` | File access helpers with path traversal protection |
| `src/infra/db.ts` | PostgreSQL client — key lookup, usage logging |
| `src/infra/sql-client.ts` | Auto-detects Neon vs standard pg, tagged-template SQL interface |
| `src/infra/schema.ts` | Drizzle ORM table definitions (users, apiKeys, usageLogs, pipelineJobs) |
| `src/infra/drizzle.ts` | Lazy-initialized Drizzle client with connection pooling |
| `src/pipeline/index.ts` | StevePipeline class, createInitialState(), getPipelineSummary() |
| `src/pipeline/queue.ts` | PG-backed job queue (enqueue, claim, complete, fail, cancel) |
| `src/pipeline/worker.ts` | Background poll loop (5s interval, max 2 concurrent, stale lock recovery) |
| `src/routes/jobs.routes.ts` | POST/GET /jobs, GET/POST /jobs/:id endpoints |
| `src/tools/checklists.ts` | `list-checklists`, `get-checklist` |
| `src/tools/knowledge-base.ts` | `list-attack-patterns`, `get-attack-pattern`, `match-vulnerabilities` |
| `src/tools/risk-scoring.ts` | `calculate-risk-score` |
| `src/tools/remediation.ts` | `get-remediation` |
| `src/tools/reporting.ts` | `get-report-template`, `map-compliance` |
| `src/tools/methodology.ts` | `get-methodology` |
| `src/tools/threat-models.ts` | `list-threat-models`, `get-threat-model` |
| `src/tools/business-discovery.ts` | `analyze-business-context` |
| `src/tools/architecture.ts` | `generate-architecture-diagram`, `analyze-architecture` |
| `src/tools/license-compliance.ts` | `scan-licenses`, `check-license-compatibility` |
| `src/tools/ai-opportunities.ts` | `analyze-ai-opportunities` |
| `src/tools/pipeline-control.ts` | `start-pipeline`, `get-pipeline-status` |

## Common Tasks

### Add a new MCP tool

1. Create `packages/orchestrator/src/tools/my-tool.ts`
2. Export a `registerMyTools(server: McpServer)` function
3. Import and call it in `src/index.ts` → `createServer()`
4. Rebuild: `npm run build -w packages/orchestrator`

### Add a new data file

1. Add `.md` file to appropriate `data/` subdirectory
2. If needed, update the corresponding tool that reads that directory
3. Rebuild: `npm run build`

### Add a new API endpoint

1. Add route in `packages/orchestrator/src/api.ts`
2. Rebuild: `npm run build -w packages/orchestrator`

### Test MCP in VS Code

1. Set up `.vscode/mcp.json` in a test project (copy from `packages/vscode/`)
2. Point server URL to `http://localhost:3000/mcp`
3. Use API key `steve_test_localdev1234567890abcdef` (or set `SKIP_AUTH=true`)
4. Open Copilot Chat → `@steve List the available security checklists`

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3000` | HTTP server port |
| `DATABASE_URL` | — | PostgreSQL connection string (Neon or local) |
| `SECURITY_AUDIT_SKIP_AUTH` | `false` | Skip API key auth (dev only) |
| `SECURITY_AUDIT_API_KEYS` | — | Comma-separated plaintext keys (fallback auth) |
| `AI_ENGINE_URL` | `http://localhost:8100` | AI engine base URL |
| `CLERK_SECRET_KEY` | — | Clerk secret key (enables JWT auth on orchestrator) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | — | Clerk publishable key (dashboard only) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3334` | API URL for dashboard |
| `OPENAI_API_KEY` | — | OpenAI API key (enables LLM code analysis in AI engine) |
| `ANTHROPIC_API_KEY` | — | Anthropic API key (alternative LLM provider) |
| `LLM_PROVIDER` | auto-detect | Force LLM provider: `openai` or `anthropic` |
| `LLM_MODEL` | — | Override model name (e.g. `gpt-4o`, `claude-sonnet-4-20250514`) |

## Testing

### TypeScript (Vitest)

```bash
# Run all tests
npx vitest run

# Watch mode
npx vitest

# Run specific test file
npx vitest run packages/orchestrator/tests/pipeline.test.ts
```

Tests are in `packages/*/tests/` directories. The test suite covers pipeline state management, job queue operations, and API routes.

### Python (pytest)

```bash
cd packages/ai-engine
pip install -e ".[dev]"
pytest tests/ -v
```

### Database Migrations

When adding new tables, create a new SQL migration file:

```bash
# Create migration
touch packages/db/migrations/006-my-feature.sql

# Apply it
psql "$DATABASE_URL" -f packages/db/migrations/006-my-feature.sql
```

For Drizzle ORM schema changes, update `packages/orchestrator/src/infra/schema.ts` and generate a migration:

```bash
npx drizzle-kit generate
```
