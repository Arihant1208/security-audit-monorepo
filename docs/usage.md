# Usage Guide

Complete guide to using the Security Audit Framework — from first scan to remediation.

---

## Prerequisites

- **VS Code** with [GitHub Copilot](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) and [Copilot Chat](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot-chat) extensions installed
- **GitHub Copilot** subscription (Individual, Business, or Enterprise)
- **API Key** — get one free at [security-audit.dev](https://security-audit.dev), or self-host

---

## Step 1 — Install Client Files

Copy the agent files into your project. These are lightweight markdown files — no dependencies, no build step.

### Option A: npx degit (quickest)

```bash
npx degit Arihant1208/security-audit/packages/client my-project
```

This copies into your project root:

```
my-project/
├── .vscode/mcp.json
├── .github/
│   ├── agents/
│   │   ├── security-scanner.agent.md
│   │   ├── security-reporter.agent.md
│   │   └── security-fixer.agent.md
│   └── prompts/
│       ├── scan-codebase.prompt.md
│       ├── generate-report.prompt.md
│       ├── fix-vulnerabilities.prompt.md
│       └── full-audit.prompt.md
└── .gitignore
```

### Option B: Manual copy

Clone the repo and copy the client directory:

```bash
git clone https://github.com/Arihant1208/security-audit.git
cp -r security-audit/packages/client/.github your-project/.github
cp -r security-audit/packages/client/.vscode your-project/.vscode
```

### Option C: Copy script

```bash
bash scripts/copy-client.sh /path/to/your-project
```

---

## Step 2 — Connect to the MCP Server

Open your project in VS Code. The first time Copilot Chat loads, it reads `.vscode/mcp.json` and prompts you for:

| Input | Value |
|-------|-------|
| **Server URL** | `https://api.security-audit.dev/mcp` (hosted) or `http://localhost:3000/mcp` (local) |
| **API Key** | Your key from the dashboard |

VS Code stores the API key securely — it never appears in your project files.

### Verify the connection

Open Copilot Chat and type:

```
@security-scanner List the available security checklists
```

If the agent responds with 12 checklist layers, you're connected.

---

## Step 3 — Run Your First Scan

### Full Audit (recommended)

Type in Copilot Chat:

```
/full-audit
```

This runs all three phases automatically:
1. **Scan** — discovers your architecture, maps attack surfaces, runs through all 12 security checklists
2. **Report** — generates a full technical audit report and executive summary
3. **Fix** — walks through each finding with recommended fixes (waits for your approval before editing code)

### Individual Commands

| Command | What it does |
|---------|-------------|
| `/scan-codebase` | Scan only — writes findings to `audit-results/scan-results.md` |
| `/generate-report` | Report only — requires scan results to exist first |
| `/fix-vulnerabilities` | Fix only — walks through findings highest-risk first |

### Direct Agent Invocation

You can also invoke agents directly for custom queries:

```
@security-scanner Check if this project has any SQL injection vulnerabilities
@security-reporter Generate a SOC 2 compliance report from the scan results
@security-fixer Fix the XSS vulnerability in src/handlers/search.ts
```

---

## Step 4 — Review Results

After a scan, you'll find output in `audit-results/`:

```
audit-results/
├── scan-results.md        ← All findings with severity, evidence, risk scores
├── audit-report.md        ← Full technical audit report
├── executive-summary.md   ← Non-technical leadership summary
├── remediation-log.md     ← Log of applied fixes
└── findings/
    ├── V-001.md           ← Individual Critical/High finding reports
    ├── V-002.md
    └── ...
```

### Understanding Risk Scores

Each finding gets a risk score from 0–10:

| Score | Level | SLA |
|-------|-------|-----|
| 9.0–10.0 | Critical | Fix within 24–48 hours |
| 7.0–8.9 | High | Fix within 1–2 weeks |
| 4.0–6.9 | Medium | Fix within 1–3 months |
| 2.0–3.9 | Low | Next development cycle |
| 0–1.9 | Informational | Address opportunistically |

The score is calculated as: `Risk = min(10, Impact × Exploitability × Exposure + Business Context)`

---

## Step 5 — Apply Fixes

When using `/fix-vulnerabilities` or `/full-audit`, the fixer agent:

1. Loads scan results and sorts by risk score (highest first)
2. For each finding, fetches the remediation guide from the MCP server
3. Shows you the **current vulnerable code**, the **recommended fix**, and **why it works**
4. **Waits for your approval** before editing any file
5. Logs every change to `audit-results/remediation-log.md`

No code is modified without your explicit consent.

---

## Available MCP Tools

The agents use these 12 tools behind the scenes. You don't call them directly — the agents orchestrate them automatically.

| Tool | Purpose |
|------|---------|
| `list-checklists` | List all 12 security audit layers |
| `get-checklist` | Get the full checklist for a specific layer |
| `list-attack-patterns` | List attack patterns by category |
| `get-attack-pattern` | Get details for a specific attack pattern |
| `match-vulnerabilities` | Match code against known vulnerability patterns |
| `calculate-risk-score` | Calculate risk score for a finding |
| `get-remediation` | Get fix guidance with language-specific code examples |
| `get-report-template` | Get a report template (audit, executive, vulnerability) |
| `map-compliance` | Map findings to OWASP, NIST CSF, CIS Controls, SOC 2 |
| `get-methodology` | Get the 7-phase audit methodology |
| `list-threat-models` | List available threat model templates |
| `get-threat-model` | Get STRIDE, data flow, or threat scenario templates |

---

## Self-Hosting

### Local (stdio — no network, no API key)

Run the MCP server as a direct subprocess inside VS Code:

1. Clone and build:
   ```bash
   git clone https://github.com/Arihant1208/security-audit.git
   cd security-audit
   npm install
   npm run build
   ```

2. Update `.vscode/mcp.json` in your project:
   ```json
   {
     "servers": {
       "security-audit": {
         "type": "stdio",
         "command": "node",
         "args": ["/path/to/security-audit/packages/mcp-server/dist/index.js", "--stdio"],
         "env": {
           "SECURITY_AUDIT_SKIP_AUTH": "true"
         }
       }
     }
   }
   ```

This runs entirely locally — no network calls, no API keys needed.

### Local (HTTP — with Docker)

```bash
git clone https://github.com/Arihant1208/security-audit.git
cd security-audit
docker compose -f infra/docker-compose.yml up -d
```

Server runs at `http://localhost:3000/mcp` with test key `sa_test_localdev1234567890abcdef`.

### Deploy to Cloud (free tier)

See the [Deployment Guide](deployment.md) for one-click deploys to Render, Fly.io, Railway, or Hugging Face Spaces.

---

## Troubleshooting

### "MCP server not responding"

1. Check the MCP indicator in the VS Code status bar
2. Verify your API key is correct
3. For local servers: `curl http://localhost:3000/health`

### "No tools available"

1. Restart VS Code to re-initialize the MCP connection
2. Check `.vscode/mcp.json` syntax — must be valid JSON
3. Ensure the server URL is reachable

### Agents don't appear in Copilot Chat

1. Agent files must be in `.github/agents/` (not `.github/agent/`)
2. Restart VS Code after adding agent files
3. Verify YAML frontmatter in each `.agent.md` file

### Scan produces no findings

1. Verify the MCP connection is active (ask the scanner to list checklists)
2. Small projects may have fewer findings — that's normal
3. Check `audit-results/scan-results.md` for partial output

### Want to re-scan after applying fixes?

Run `/scan-codebase` again. The scanner always reads current code and overwrites previous results.
