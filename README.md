# Steve — End-to-End Autonomous Security Agent

AI-powered, fully autonomous security auditing that understands your business first, maps architecture with diagrams, audits 12 security layers, checks license compliance, and identifies AI/ML improvement opportunities.

## What Steve Does

Steve runs a **9-phase pipeline** — from understanding what your project is to producing actionable security reports:

| Phase | Name | Output |
|-------|------|--------|
| 0 | Business Discovery | Business context, industry, compliance needs |
| 1 | System Discovery | Tech stack, dependencies, entry points |
| 2 | Architecture Mapping | Mermaid diagrams, multi-level analysis, recommendations |
| 3 | Threat Modeling | STRIDE per component, attack surface map |
| 4 | Layered Security Audit | 12-layer checklist findings with evidence |
| 5 | License Compliance | Dependency licenses, conflicts, alternatives |
| 6 | AI Opportunity Analysis | Where AI/ML can improve the system |
| 7 | Risk & Remediation | Scored findings, prioritized fix plan |
| 8 | Report Generation | Executive summary + full technical report |

## Repository Structure

```
steve/
├── data/                        Security knowledge base (81+ markdown files)
├── packages/
│   ├── core/                    Shared TypeScript types & pipeline definitions
│   ├── orchestrator/            MCP server + pipeline engine (19 tools)
│   ├── ai-engine/               Python FastAPI (code analysis, diagrams, license scan)
│   ├── cli/                     CLI tool (`steve audit`, `steve scan`, etc.)
│   ├── dashboard/               Next.js interactive web dashboard
│   ├── vscode/                  VS Code agent + prompts (distributable)
│   ├── site/                    Landing page
│   └── db/                      PostgreSQL schema & migrations
├── infra/                       Docker, docker-compose, Fly.io, Render
├── docs/                        Architecture, deployment, development guides
└── scripts/                     Setup, build, and distribution helpers
```

## Quick Start

### Local Development

```bash
git clone <repo-url>
cd steve
npm install
npm run build

# Start the orchestrator (MCP server)
npm start

# Or with Docker (includes DB + AI engine + dashboard)
docker compose -f infra/docker-compose.yml up -d
curl http://localhost:3000/health
```

### Use in a Project (VS Code)

Copy `packages/vscode/` contents into your project, then use:

| Command | Action |
|---------|--------|
| `/steve-audit` | Full 9-phase autonomous audit |
| `/steve-scan` | Quick security scan (discovery + audit) |
| `/steve-license` | License compliance check |
| `/steve-diagram` | Generate architecture diagrams |

### CLI

```bash
steve audit ./my-project          # Full autonomous audit
steve scan ./my-project           # Quick security scan
steve license ./my-project        # License compliance only
steve diagram ./my-project        # Architecture diagrams
steve dashboard                   # Launch web dashboard
```

### Deploy

See [docs/deployment.md](docs/deployment.md) for Render, Fly.io, Railway, and Docker guides.

## Coverage

- **12 security layers** — architecture, identity, application, API, data, network, infrastructure, DevOps, supply chain, client-side, monitoring, business logic
- **31+ attack patterns** across 7 categories with detection guidance
- **7 remediation guides** with code examples
- **4 compliance mappings** — OWASP Top 10, NIST CSF, CIS Controls, SOC 2
- **License compliance** — per-dependency classification, conflict detection, alternatives
- **AI opportunity analysis** — where AI/ML can strengthen security or improve the system

## Packages

| Package | Description |
|---------|-------------|
| [packages/core](packages/core) | Shared TypeScript types — pipeline, business, architecture, security, license, AI |
| [packages/orchestrator](packages/orchestrator) | MCP server + pipeline engine — 19 tools, dual transport (HTTP + stdio) |
| [packages/ai-engine](packages/ai-engine) | Python FastAPI — code analysis, Mermaid diagrams, license scan, AI inference |
| [packages/cli](packages/cli) | CLI (`steve audit`, `steve scan`, `steve license`, `steve diagram`) |
| [packages/dashboard](packages/dashboard) | Next.js web dashboard for stakeholders |
| [packages/vscode-agent](packages/vscode-agent) | VS Code agent + prompts (distributable, zero IP) |
| [packages/db](packages/db) | PostgreSQL schema: users, api_keys, usage_logs |

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  User Interfaces                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ VS Code  │  │   CLI    │  │   Web Dashboard      │  │
│  │  Agent   │  │  (steve) │  │   (Next.js)          │  │
│  └────┬─────┘  └────┬─────┘  └────────┬─────────────┘  │
└───────┼──────────────┼─────────────────┼────────────────┘
        │ MCP          │ MCP             │ REST
        ▼              ▼                 ▼
┌───────────────────────────────────────────────────────┐
│  Orchestrator (MCP Server + Pipeline Engine)           │
│  19 tools • 9-phase pipeline • dual transport          │
└───────────────────────┬───────────────────────────────┘
                        │ HTTP
                        ▼
┌───────────────────────────────────────────────────────┐
│  AI Engine (Python FastAPI)                            │
│  Code analysis • Diagram gen • License scan • AI ops  │
└───────────────────────┬───────────────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────────────┐
│  Knowledge Base (data/)  +  PostgreSQL (state/auth)    │
└───────────────────────────────────────────────────────┘
```

## Documentation

- [Local Setup](docs/local-setup.md) — zero to running in minutes (Docker, native, stdio)
- [Usage Guide](docs/usage.md) — commands, pipeline, audit layers, compliance mappings
- [Architecture](docs/architecture.md) — system design, 9-phase pipeline, data flow
- [Deployment](docs/deployment.md) — free → starter → production → enterprise multi-cloud
- [Development](docs/development.md) — contributing, build system, adding tools
- [API Keys](docs/api-keys.md) — key management, auth chain, session auth

## Tech Stack

- **Orchestrator:** TypeScript, Node.js 20+, `@modelcontextprotocol/sdk`, Express
- **AI Engine:** Python 3.11+, FastAPI, uvicorn
- **Auth:** Clerk (accounts) + SHA-256 hashed API keys in PostgreSQL
- **Database:** Neon PostgreSQL (free tier) / local Postgres via Docker
- **Dashboard:** Next.js 14, React 18
- **Infrastructure:** Docker Compose, Fly.io / Render / Railway
- **Diagrams:** Mermaid (auto-generated during architecture mapping phase)
