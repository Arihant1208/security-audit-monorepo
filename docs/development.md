# Development Setup

## Prerequisites

- **Node.js** 20+
- **Docker** and **Docker Compose** (for local Postgres)
- **Git**

## Quick Start

```bash
# Clone
git clone https://github.com/YOUR_USER/security-audit.git
cd security-audit

# Install dependencies (npm workspaces)
npm install

# Start local Postgres + MCP server
docker compose -f infra/docker-compose.yml up -d

# Verify
curl http://localhost:3000/health
```

The docker-compose setup:
- Starts PostgreSQL 16 with the schema auto-applied and seed data loaded
- Builds and starts the MCP server connected to the local DB
- Test API key: `sa_test_localdev1234567890abcdef`

## Development Without Docker

If you prefer running the server directly:

```bash
# 1. Install dependencies
npm install

# 2. Build the MCP server
npm run build

# 3. Run with auth skipped (no DB needed)
cd packages/mcp-server
SECURITY_AUDIT_SKIP_AUTH=true node dist/index.js

# Or use env var auth
SECURITY_AUDIT_API_KEYS="my-dev-key" node dist/index.js
```

## Directory Layout

```
security-audit/
├── data/                    ← Markdown knowledge (single source of truth)
├── packages/
│   ├── mcp-server/          ← TypeScript MCP server
│   ├── client/              ← Distributable agent/prompt files
│   ├── site/                ← Landing page (HTML/CSS)
│   └── db/                  ← SQL schema + migrations
├── infra/                   ← Docker, Fly.io, Render configs
├── docs/                    ← You are here
└── scripts/                 ← Automation helpers
```

## Common Tasks

### Rebuild after code changes

```bash
npm run build
```

### Watch mode (auto-rebuild on save)

```bash
npm run dev
```

### Run with stdio transport (for testing in VS Code)

```bash
npm run start:stdio
```

### Reset local database

```bash
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d
```

### Test with VS Code

1. Set up `.vscode/mcp.json` in a test project (copy from `packages/client/.vscode/`)
2. Point it to `http://localhost:3000/mcp`
3. Use API key `sa_test_localdev1234567890abcdef`
4. Open Copilot Chat and try `@security-scanner List the available security checklists`

### Add a new data file

1. Add the `.md` file to the appropriate `data/` subdirectory
2. If it's a new category/layer, update the corresponding tool file in `packages/mcp-server/src/tools/`
3. Rebuild: `npm run build`

## Code Structure

### packages/mcp-server/src/

| File | Purpose |
|------|---------|
| `index.ts` | Entry point — creates server, starts stdio or HTTP transport |
| `auth.ts` | Auth chain: skip → DB lookup → env var fallback |
| `data.ts` | File access helpers with path traversal protection |
| `db.ts` | Neon PostgreSQL client — key lookup, usage logging |
| `tools/checklists.ts` | `list-checklists`, `get-checklist` |
| `tools/knowledge-base.ts` | `list-attack-patterns`, `get-attack-pattern`, `match-vulnerabilities` |
| `tools/risk-scoring.ts` | `calculate-risk-score` |
| `tools/remediation.ts` | `get-remediation` |
| `tools/reporting.ts` | `get-report-template`, `map-compliance` |
| `tools/methodology.ts` | `get-methodology` |
