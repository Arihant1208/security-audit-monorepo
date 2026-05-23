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

**New project (empty directory):**

```bash
npx degit Arihant1208/security-audit-monorepo/packages/vscode my-project
```

**Existing project (already has files):**

```bash
# From your project root:
npx degit Arihant1208/security-audit-monorepo/packages/vscode/.vscode .vscode --force
npx degit Arihant1208/security-audit-monorepo/packages/vscode/.github .github --force
```

Or manually copy the files:

```bash
# Clone temporarily and copy what you need
git clone --depth 1 --sparse https://github.com/Arihant1208/security-audit-monorepo.git /tmp/steve
cd /tmp/steve && git sparse-checkout set packages/vscode
cp -r packages/vscode/.vscode /path/to/your-project/
cp -r packages/vscode/.github /path/to/your-project/
rm -rf /tmp/steve
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
├── steve-report.json        Dashboard-uploadable JSON (see below)
└── findings/
    ├── V-001.md             Individual finding reports
    ├── V-002.md
    └── ...
```

### `steve-report.json` — Dashboard Upload Format

Steve automatically generates this file at the end of every audit. It contains all findings in a structured JSON format that can be uploaded to the dashboard.

```json
{
  "project_name": "my-project",
  "status": "completed",
  "risk_score": 6.2,
  "summary": { "critical": 1, "high": 3, "medium": 8, "low": 12, "info": 5 },
  "business_context": {
    "industry": "fintech",
    "data_sensitivity": "high",
    "compliance_requirements": ["SOC2", "PCI-DSS"],
    "description": "Payment processing API"
  },
  "findings": [
    {
      "id": "V-001",
      "title": "SQL Injection in /api/search",
      "severity": "critical",
      "risk_score": 9.2,
      "layer": "Application Security",
      "component": "src/api/search.ts",
      "description": "User input passed directly to query builder",
      "evidence": "Line 42: db.query(`SELECT * FROM users WHERE name = '${req.query.name}'`)",
      "impact": "Full database read/write access",
      "remediation": "Use parameterized queries",
      "owasp": "A03:2021",
      "cwe": "CWE-89"
    }
  ],
  "pipeline_state": {
    "phaseResults": [
      { "phase": 0, "status": "completed" },
      { "phase": 1, "status": "completed" },
      ...
    ]
  }
}
```

**Upload methods:**

1. **Dashboard UI** — go to the dashboard, click "Upload Report", drop the file
2. **API** — `POST /api/reports` with the JSON body (requires session token)
3. **CI/CD** — pipe the file to the API in your CI pipeline:
   ```bash
   curl -X POST https://your-server/api/reports \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d @audit-results/steve-report.json
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

## Web Dashboard

Steve includes a full-featured **Next.js dashboard** at http://localhost:4000 with:

- **Clerk authentication** — secure sign-in/sign-up with SSO support
- **Dashboard overview** — risk trend chart, severity breakdown, usage sparkline, key metrics
- **Reports** — searchable/sortable list, detail view with risk gauge, findings table, pipeline progress
- **API Keys** — create (one-time key reveal + copy), list active/revoked, revoke with confirmation
- **Usage analytics** — daily usage bar chart, tool distribution pie chart, breakdown table
- **Team management** — create teams, invite members by email, manage roles (admin/member/viewer)
- **Responsive** — collapsible sidebar, mobile-friendly overlay menu

### Setup

```bash
cd packages/dashboard
cp .env.local.example .env.local
# Add your Clerk keys from https://clerk.com/dashboard
npm install --legacy-peer-deps
npm run dev
# → http://localhost:4000
```

### Legacy Website

The original HTML/CSS website at the orchestrator URL (http://localhost:3000) is still available with session-based auth. It provides basic reports, API keys, and usage tabs.

### Uploading Findings to the Dashboard

After running an audit locally (via VS Code or CLI), you can upload findings to the hosted dashboard so your team can view them in the web UI.

#### Option 1: API Upload (cURL)

```bash
# 1. Log in to get a session token
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password"}' \
  | jq -r '.token')

# 2. Upload your audit results
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "project_name": "my-project",
    "status": "completed",
    "risk_score": 6.2,
    "summary": { "critical": 1, "high": 3, "medium": 8, "low": 12, "info": 5 },
    "findings": [
      {
        "id": "V-001",
        "title": "SQL Injection in /api/search",
        "severity": "critical",
        "risk_score": 9.2,
        "layer": "Application Security",
        "evidence": "User input passed directly to query builder",
        "remediation": "Use parameterized queries"
      }
    ]
  }'
```

#### Option 2: CLI Upload (planned)

```bash
steve report --upload --server http://localhost:3000
```

#### Option 3: Automatic (Full Stack mode)

When running the full stack (orchestrator + DB), reports created through the MCP tools during a Copilot Chat audit are automatically stored in the database and visible in the dashboard at http://localhost:3000.

### API Reference: `POST /api/reports`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `project_name` | string | Yes | Name of the audited project |
| `status` | string | No | `running`, `completed`, or `failed` (default: `completed`) |
| `risk_score` | number | No | Overall risk score (0–10) |
| `summary` | object | No | Finding counts: `{ critical, high, medium, low, info }` |
| `business_context` | object | No | Business context from Phase 0 |
| `findings` | array | No | Array of finding objects |
| `pipeline_state` | object | No | Full pipeline state snapshot |

Response: `201 Created` with the new report's `id`, `project_name`, `status`, `risk_score`, and `created_at`.

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
