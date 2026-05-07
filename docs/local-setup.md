# Local Setup Guide

Complete guide to running the entire Steve stack on your machine — from zero to working setup.

---

## TL;DR (Fastest Path)

```bash
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo
npm install
npm run build
cd packages/orchestrator
SECURITY_AUDIT_SKIP_AUTH=true node dist/index.js
# Open http://localhost:3000
```

This runs the orchestrator only (MCP server + website + API) with no auth and no database. Enough for local development and VS Code integration.

---

## Full Stack (All Services)

### Prerequisites

| Tool | Install |
|------|---------|
| Docker Desktop | [docker.com/get-started](https://docs.docker.com/get-started/get-docker/) |
| Node.js 20+ | [nodejs.org](https://nodejs.org) |
| Git | [git-scm.com](https://git-scm.com) |

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo

# 2. Start everything
docker compose -f infra/docker-compose.yml up -d

# 3. Wait for services to be healthy (~30 seconds)
docker compose -f infra/docker-compose.yml ps

# 4. Verify
curl http://localhost:3000/health
```

### What's Running

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| PostgreSQL 16 | 5433 | `postgresql://steve:steve_local@localhost:5433/steve` | Database |
| Orchestrator | 3000 | http://localhost:3000 | MCP server + Website + API |
| AI Engine | 8100 | http://localhost:8100 | Python analysis service |
| Dashboard | 4000 | http://localhost:4000 | Next.js dashboard |

### Default Credentials

- **DB port:** `5433` (mapped from container 5432 to avoid conflicts with local Postgres)
- **DB user:** `steve` / `steve_local`
- **Test API key:** `steve_test_localdev1234567890abcdef`
- **Website:** Sign up via http://localhost:3000/signup

---

## Orchestrator Only (No Docker)

If you only need the MCP server and website, no Docker required.

```bash
# 1. Install deps
npm install

# 2. Build
npm run build

# 3. Start
cd packages/orchestrator
SECURITY_AUDIT_SKIP_AUTH=true node dist/index.js
```

This gives you:
- MCP server at http://localhost:3000/mcp
- Website at http://localhost:3000
- API at http://localhost:3000/api (limited — no DB)
- Health check at http://localhost:3000/health

### With a Local Database

If you want the full website experience (signup, API keys, reports):

```bash
# Start just Postgres
docker compose -f infra/docker-compose.yml up db -d

# Apply migrations
psql "postgresql://steve:steve_local@localhost:5433/steve" \
  -f packages/db/migrations/001-init.sql
psql "postgresql://steve:steve_local@localhost:5433/steve" \
  -f packages/db/migrations/002-website-auth.sql
psql "postgresql://steve:steve_local@localhost:5433/steve" \
  -f packages/db/seed.sql

# Start orchestrator with DB
cd packages/orchestrator
DATABASE_URL="postgresql://steve:steve_local@localhost:5433/steve" \
SECURITY_AUDIT_API_KEYS="steve_test_localdev1234567890abcdef" \
node dist/index.js
```

---

## AI Engine Only (No Docker)

```bash
cd packages/ai-engine

# Create virtual environment
python -m venv .venv

# Activate
source .venv/bin/activate    # Linux/Mac
.venv\Scripts\activate       # Windows PowerShell

# Install
pip install -e .

# Run
uvicorn steve.main:app --host 0.0.0.0 --port 8100 --reload
```

Then set `AI_ENGINE_URL=http://localhost:8100` when starting the orchestrator.

---

## VS Code Integration (stdio Mode)

For maximum speed and zero network overhead, run Steve as a direct subprocess:

### 1. Build

```bash
npm install && npm run build
```

### 2. Configure `.vscode/mcp.json` in your target project

```json
{
  "servers": {
    "steve": {
      "type": "stdio",
      "command": "node",
      "args": [
        "C:/absolute/path/to/security-audit-monorepo/packages/orchestrator/dist/index.js",
        "--stdio"
      ],
      "env": {
        "SECURITY_AUDIT_SKIP_AUTH": "true"
      }
    }
  }
}
```

### 3. Test in Copilot Chat

```
@steve List the available security checklists
```

---

## VS Code Integration (HTTP Mode)

If the server is already running (locally or via Docker):

### `.vscode/mcp.json`

```json
{
  "servers": {
    "steve": {
      "type": "sse",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-API-Key": "steve_test_localdev1234567890abcdef"
      }
    }
  }
}
```

---

## Environment Variables Reference

| Variable | Default | Required | Purpose |
|----------|---------|----------|---------|
| `PORT` | `3000` | No | HTTP server port |
| `DATABASE_URL` | — | No | PostgreSQL connection string |
| `SECURITY_AUDIT_SKIP_AUTH` | `false` | No | Skip API key auth (dev only) |
| `SECURITY_AUDIT_API_KEYS` | — | No | Comma-separated plaintext keys |
| `AI_ENGINE_URL` | `http://localhost:8100` | No | AI engine base URL |

---

## Troubleshooting

### Port 3000 is already in use

```bash
node dist/index.js --port 3333
```

### Docker Compose database not initializing

```bash
# Reset volumes and start fresh
docker compose -f infra/docker-compose.yml down -v
docker compose -f infra/docker-compose.yml up -d
```

### Build fails

```bash
# Clean and rebuild
rm -rf packages/core/dist packages/orchestrator/dist packages/cli/dist
npm run build
```

### VS Code doesn't see the MCP server

1. Ensure `.vscode/mcp.json` is in the **project root** (the folder open in VS Code)
2. Reload VS Code window (Ctrl+Shift+P → "Reload Window")
3. Check the MCP output panel for connection errors

### Can't connect to the website

- Orchestrator serves the site from `packages/site/` — ensure you started from the repo root or that the `site` directory is accessible relative to the `dist/` folder
- Check `http://localhost:3000/health` first — if health works but the site doesn't load, it's a static file path issue


