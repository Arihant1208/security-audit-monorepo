# Security Audit Framework

AI-powered security auditing for any codebase — powered by GitHub Copilot agents and an MCP knowledge server.

## Repository Structure

```
security-audit/
├── data/                    Security knowledge (markdown IP)
├── packages/
│   ├── mcp-server/          TypeScript MCP server (10 tools)
│   ├── client/              Distributable agent & prompt files
│   ├── site/                Landing page (HTML/CSS)
│   └── db/                  PostgreSQL schema & migrations
├── infra/                   Dockerfile, docker-compose, Fly.io, Render
├── docs/                    Architecture, deployment, development guides
└── scripts/                 Setup, build, and distribution helpers
```

## Quick Start

### Local Development

```bash
git clone https://github.com/YOUR_USER/security-audit.git
cd security-audit
npm install
docker compose -f infra/docker-compose.yml up -d
curl http://localhost:3000/health
```

### Deploy (Free Tier)

See [docs/deployment.md](docs/deployment.md) for Render, Fly.io, Railway, and HF Spaces guides.

### Use in a Project

Copy `packages/client/` into any project you want to audit, configure the MCP connection, then use:

| Command | Action |
|---------|--------|
| `/scan-codebase` | Scan for vulnerabilities across 12 layers |
| `/generate-report` | Generate audit report + executive summary |
| `/fix-vulnerabilities` | Walk through fixes (recommend → approve → apply) |
| `/full-audit` | All three phases end-to-end |

## Packages

| Package | Description |
|---------|-------------|
| [packages/mcp-server](packages/mcp-server) | MCP server — 10 tools, dual transport (HTTP + stdio), DB-backed auth |
| [packages/client](packages/client) | 3 Copilot agents, 4 prompts, MCP config (zero IP — safe to distribute) |
| [packages/site](packages/site) | Landing page — plain HTML/CSS, no build step |
| [packages/db](packages/db) | PostgreSQL schema: users, api_keys, usage_logs |

## Documentation

- [Architecture](docs/architecture.md) — system design, data flow, security boundaries
- [Deployment](docs/deployment.md) — free tier deploy guides (Render, Fly, Railway, HF Spaces)
- [Development](docs/development.md) — local setup, common tasks, code structure
- [API Keys](docs/api-keys.md) — key management, auth chain, usage analytics

## Tech Stack

- **MCP Server:** TypeScript, Node.js 20+, `@modelcontextprotocol/sdk`, Express
- **Auth:** Clerk (accounts) + SHA-256 hashed API keys in PostgreSQL
- **Database:** Neon PostgreSQL (free tier) / local Postgres via Docker
- **Infrastructure:** Docker, Fly.io / Render / Railway
- **Site:** Plain HTML/CSS, no framework
