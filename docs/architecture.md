# Architecture

## Overview

The Security Audit Framework is a three-component system:

```
┌─────────────────────────────────────────────────────────────┐
│  Developer's VS Code                                        │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Scanner    │  │  Reporter   │  │   Fixer     │         │
│  │  Agent      │  │  Agent      │  │   Agent     │         │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘         │
│         └────────┬───────┴────────┬───────┘                │
│                  │  MCP Protocol  │                        │
└──────────────────┼────────────────┼─────────────────────────┘
                   │                │
            ┌──────┴────────────────┴──────┐
            │     MCP Server (Node.js)     │
            │                              │
            │  ┌────────┐   ┌──────────┐   │
            │  │ Auth   │   │ 10 Tools │   │
            │  └───┬────┘   └────┬─────┘   │
            │      │             │         │
            │  ┌───┴───┐   ┌────┴─────┐   │
            │  │ Neon   │   │ data/    │   │
            │  │ Postgres│   │ (markdown)│  │
            │  └────────┘   └──────────┘   │
            └──────────────────────────────┘
```

## Components

### packages/client — Agent Files (Zero IP)

Lightweight markdown files that orchestrate GitHub Copilot. Contains:
- **3 agents** — scanner (read-only), reporter (generates reports), fixer (applies fixes)
- **4 prompts** — `/scan-codebase`, `/generate-report`, `/fix-vulnerabilities`, `/full-audit`
- **MCP config** — `.vscode/mcp.json` connecting to the server

These files contain **no security knowledge** — all expertise comes from the MCP server. Safe to distribute publicly.

### packages/mcp-server — MCP Server (Proprietary)

TypeScript/Node.js server exposing 12 tools via the Model Context Protocol:

| Tool | Purpose |
|------|--------|
| `list-checklists` | Catalog of 12 audit layers |
| `get-checklist` | Full checklist for one layer |
| `list-attack-patterns` | Attack patterns by category |
| `get-attack-pattern` | Detailed attack pattern with detection/mitigation |
| `match-vulnerabilities` | Cross-reference code against known patterns |
| `calculate-risk-score` | Risk = min(10, Impact × Exploitability × Exposure + Context) |
| `get-remediation` | Fix guidance with code examples |
| `get-report-template` | Audit/executive/vulnerability report templates |
| `map-compliance` | Map to OWASP, NIST, CIS, SOC 2 |
| `get-methodology` | 7-phase audit methodology |
| `list-threat-models` | Available threat model templates |
| `get-threat-model` | STRIDE, data flow, threat scenario templates |

**Transports:**
- **HTTP/SSE** — remote/SaaS mode with API key auth (StreamableHTTPServerTransport)
- **stdio** — local/enterprise mode, no network (StdioServerTransport)

### data/ — Security Knowledge (IP)

81 markdown files containing all security expertise:
- 12 audit checklists (one per security layer)
- 31 attack patterns across 7 categories
- 7 remediation guides with language-specific code examples
- 3 report templates
- 4 compliance framework mappings
- 3 threat model templates (STRIDE, data flow, threat scenarios)
- Risk scoring model, methodology, threat model templates

### packages/db — Database Schema

PostgreSQL schema for:
- **users** — synced from Clerk (user accounts)
- **api_keys** — SHA-256 hashed keys with prefix for display, revocation support
- **usage_logs** — per-tool-call analytics (tool name, latency, timestamp)

### packages/site — Marketing Site

Plain HTML/CSS landing page. No framework, no build step.

## Data Flow

### Scan Flow
```
User types /scan-codebase
  → Copilot invokes @security-scanner agent
  → Agent reads project files (read-only)
  → Agent calls MCP tools:
      list-checklists → get-checklist (per layer)
      → match-vulnerabilities (with code snippets)
      → calculate-risk-score (per finding)
  → Agent writes audit-results/scan-results.md
```

### Auth Flow
```
API request with X-API-Key header
  → SKIP_AUTH=true? → bypass (stdio/local)
  → DATABASE_URL set? → SHA-256 hash key → query api_keys table
      → found + not revoked → authenticated (update last_used_at)
  → SECURITY_AUDIT_API_KEYS env? → plaintext match
  → reject with 401
```

## Security Boundaries

- **Agent files** (public) contain zero framework knowledge
- **MCP server** (private) requires API key for HTTP access
- **data/** never leaves the server — tools return content, agents don't access data directly
- **API keys** stored as SHA-256 hashes — server never stores plaintext
- **Path traversal protection** in `data.ts` prevents reading outside `data/`
