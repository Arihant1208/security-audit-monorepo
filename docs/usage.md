# Usage Guide

Complete guide to using Steve — from setup to your first autonomous security audit.

---

## Prerequisites

- **VS Code** with [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat)
- **GitHub Copilot** subscription (Individual, Business, or Enterprise)
- **API Key** — get one at the Steve website, or self-host with `SKIP_AUTH=true`

---

## Setup Options

### Option A: Hosted (SaaS)

1. Sign up at the Steve website
2. Create an API key from the dashboard
3. Copy the agent files into your project:

```bash
npx degit Arihant1208/security-audit-monorepo/packages/vscode-agent my-project
```

4. VS Code reads `.vscode/mcp.json` and prompts for your server URL and API key

### Option B: Self-Hosted (Docker)

```bash
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo
docker compose -f infra/docker-compose.yml up -d
# Server at http://localhost:3000
# Test key: steve_test_localdev1234567890abcdef
```

### Option C: Local stdio (No Network)

```bash
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo
npm install && npm run build
```

Update `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "steve": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/security-audit-monorepo/packages/orchestrator/dist/index.js", "--stdio"],
      "env": {
        "SECURITY_AUDIT_SKIP_AUTH": "true"
      }
    }
  }
}
```

---

## VS Code Commands

### Prompt Commands

| Command | What It Does |
|---------|-------------|
| `/steve-audit` | Full 9-phase autonomous audit (business discovery → reports) |
| `/steve-scan` | Quick security scan (discovery + 12-layer audit) |
| `/steve-license` | License compliance check on all dependencies |
| `/steve-diagram` | Generate Mermaid architecture diagrams |

### Direct Agent Queries

```
@steve Check this project for SQL injection vulnerabilities
@steve What compliance frameworks apply to a healthcare SaaS?
@steve Generate a STRIDE threat model for the authentication flow
@steve Analyze the license risk of my npm dependencies
```

---

## CLI Commands

```bash
# Full autonomous audit
steve audit ./my-project

# Quick security scan
steve scan ./my-project

# License compliance only
steve license ./my-project

# Architecture diagrams
steve diagram ./my-project

# Generate report from existing scan
steve report ./my-project

# Launch web dashboard
steve dashboard
```

---

## Understanding the Pipeline

Steve runs a **9-phase pipeline** automatically:

| Phase | Name | What Happens |
|-------|------|-------------|
| 0 | Business Discovery | Identifies industry, compliance needs, risk profile |
| 1 | System Discovery | Scans tech stack, dependencies, entry points |
| 2 | Architecture Mapping | Generates Mermaid diagrams, multi-level analysis |
| 3 | Threat Modeling | STRIDE per component, attack surface mapping |
| 4 | Layered Security Audit | 12 checklist layers with evidence-backed findings |
| 5 | License Compliance | Per-dependency license classification + conflict detection |
| 6 | AI Opportunity Analysis | Where AI/ML can improve security or the system |
| 7 | Risk & Remediation | Scored findings (0–10), prioritized fix plan |
| 8 | Report Generation | Executive summary + full technical report |

---

## Review Results

After a scan, output goes to `audit-results/`:

```
audit-results/
├── scan-results.md          All findings with severity, evidence, risk scores
├── audit-report.md          Full technical audit report
├── executive-summary.md     Non-technical leadership summary
├── architecture-diagrams/   Mermaid diagrams
├── license-report.md        Dependency license analysis
├── remediation-log.md       Log of applied fixes
└── findings/
    ├── V-001.md             Individual finding reports
    ├── V-002.md
    └── ...
```

### Risk Scores

| Score | Level | SLA |
|-------|-------|-----|
| 9.0–10.0 | Critical | Fix within 24–48 hours |
| 7.0–8.9 | High | Fix within 1–2 weeks |
| 4.0–6.9 | Medium | Fix within 1–3 months |
| 2.0–3.9 | Low | Next development cycle |
| 0–1.9 | Informational | Address opportunistically |

Formula: `Risk = min(10, Impact × Exploitability × Exposure + Business Context)`

---

## Website Dashboard

The website at the server URL provides:

- **Sign up / Login** — session-based authentication
- **Dashboard** — three tabs:
  - **Reports** — view all audit reports with status and findings count
  - **API Keys** — create, view, and revoke keys
  - **Usage** — tool call analytics for the last 30 days
- **Documentation** — embedded quick start and tool reference

---

## 12 Security Audit Layers

| # | Layer | Examples |
|---|-------|---------|
| 1 | Architecture | Separation of concerns, attack surface minimization |
| 2 | Identity & Access | Authentication, authorization, session management |
| 3 | Application Security | Input validation, output encoding, error handling |
| 4 | API Security | Rate limiting, schema validation, auth tokens |
| 5 | Data Security | Encryption at rest/transit, PII handling, key management |
| 6 | Network Security | TLS, firewall rules, DNS security |
| 7 | Infrastructure & Cloud | IAM, secrets management, container security |
| 8 | DevOps & CI/CD | Pipeline security, artifact signing, SAST/DAST |
| 9 | Supply Chain | Dependency audit, lock files, SCA tools |
| 10 | Client-Side | XSS, CSP, cookie security, DOM manipulation |
| 11 | Monitoring & Logging | Security events, alerting, audit trails |
| 12 | Business Logic | Authorization bypass, race conditions, financial integrity |

---

## Compliance Mappings

Steve maps findings to four compliance frameworks:

| Framework | Coverage |
|-----------|----------|
| OWASP Top 10 | All 10 categories with subcategories |
| NIST CSF | Identify, Protect, Detect, Respond, Recover |
| CIS Controls | Implementation Groups 1–3 |
| SOC 2 | Trust Service Criteria: Security, Availability, Processing Integrity, Confidentiality, Privacy |

---

## MCP Tools Reference

Steve exposes **19 tools** via the Model Context Protocol. Agents and CLI use these automatically — you don't call them directly.

| Tool | Purpose |
|------|---------|
| `list-checklists` | List all 12 security audit layers |
| `get-checklist` | Get full checklist for a specific layer |
| `list-attack-patterns` | List attack patterns by category |
| `get-attack-pattern` | Get detection/mitigation detail for a pattern |
| `match-vulnerabilities` | Cross-reference code against known patterns |
| `calculate-risk-score` | Score a finding (0–10) |
| `get-remediation` | Fix guidance with language-specific code examples |
| `get-report-template` | Get audit/executive/vulnerability report templates |
| `map-compliance` | Map findings to OWASP, NIST, CIS, SOC 2 |
| `get-methodology` | 7-phase audit methodology |
| `list-threat-models` | Available threat model templates |
| `get-threat-model` | STRIDE, data flow, threat scenario templates |
| `analyze-business-context` | Industry classification, compliance mapping |
| `generate-architecture-diagram` | Mermaid diagram generation |
| `analyze-architecture` | Architecture analysis and recommendations |
| `scan-licenses` | Dependency license detection |
| `check-license-compatibility` | License conflict analysis |
| `analyze-ai-opportunities` | AI/ML improvement opportunities |
| `start-pipeline` | Start the 9-phase pipeline |
| `get-pipeline-status` | Check pipeline progress |
