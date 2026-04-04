# Setup Guide

## Prerequisites

- **VS Code** with GitHub Copilot and Copilot Chat extensions
- **GitHub Copilot** subscription (Individual, Business, or Enterprise)
- **API Key** from [security-audit.dev](https://security-audit.dev) (or a self-hosted server)

---

## Option A: Remote MCP Server (Default)

The simplest setup — connect to the hosted MCP server.

### 1. Copy Agent Files

Copy these directories into your project root:

```
.vscode/mcp.json
.github/agents/
.github/prompts/
```

### 2. Connect to the MCP Server

Open any file in VS Code. The MCP configuration in `.vscode/mcp.json` will prompt you for:

- **Server URL:** `https://api.security-audit.dev/mcp`
- **API Key:** Your key from the dashboard

VS Code stores the API key securely — it won't appear in your project files.

### 3. Verify the Connection

Open Copilot Chat and type:

```
@security-scanner List the available security checklists
```

If the agent replies with 12 checklist layers, the connection is working.

---

## Option B: Self-Hosted MCP Server (Free Tier)

Deploy the MCP server for free on Render, Fly.io, or Hugging Face Spaces. See the full [Deployment Guide](../../docs/deployment.md) in the docs directory.

**Quick deploy with Render (recommended):**

1. Push the `security-audit-mcp-server` repo to a **private** GitHub repo
2. Go to [render.com](https://render.com) → New → Web Service → connect your repo
3. Set runtime to **Docker**, instance type to **Free**
4. Add env var: `SECURITY_AUDIT_API_KEYS` = your key
5. Deploy — your endpoint is `https://your-app.onrender.com/mcp`

Then update `.vscode/mcp.json` to point to your instance.

### Local Server (Docker)

```bash
docker run -d \
  --name security-audit-mcp \
  -p 3000:3000 \
  -e SECURITY_AUDIT_API_KEYS="your-key-here" \
  security-audit-mcp-server:latest
```

Update `.vscode/mcp.json` to point to your local instance:

```json
{
  "servers": {
    "security-audit": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": {
        "X-API-Key": "${input:security-audit-api-key}"
      }
    }
  }
}
```

### stdio (Direct Process)

For maximum isolation, run the server as a stdio subprocess:

```json
{
  "servers": {
    "security-audit": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/security-audit-mcp-server/dist/index.js"],
      "env": {
        "SECURITY_AUDIT_TRANSPORT": "stdio",
        "SECURITY_AUDIT_SKIP_AUTH": "true"
      }
    }
  }
}
```

The stdio transport runs entirely locally — no network, no API keys needed.

Build the server first:

```bash
cd security-audit-mcp-server
npm install
npm run build
```

---

## MCP Tools Reference

These tools are available to the agents via the MCP connection:

| Tool | Description |
|------|-------------|
| `list-checklists` | List all 12 security audit layers |
| `get-checklist` | Get the full checklist for a specific layer |
| `list-attack-patterns` | List attack patterns by category |
| `get-attack-pattern` | Get details for a specific attack pattern |
| `match-vulnerabilities` | Match code against known vulnerability patterns |
| `calculate-risk-score` | Calculate risk score for a finding |
| `get-remediation` | Get fix guidance for a vulnerability type |
| `get-report-template` | Get a report template (audit, executive, vulnerability) |
| `map-compliance` | Map findings to compliance frameworks |
| `get-methodology` | Get audit methodology for a specific phase |
| `list-threat-models` | List available threat model templates |
| `get-threat-model` | Get a specific threat model template (STRIDE, data flow, threat scenario) |

---

## Troubleshooting

### "MCP server not responding"

1. Check that VS Code shows the MCP server as connected (look for the MCP indicator in the status bar)
2. Verify your API key is correct
3. For local servers, check that the process is running: `curl http://localhost:3000/health`

### "No tools available"

1. Restart VS Code to re-initialize the MCP connection
2. Check `.vscode/mcp.json` syntax
3. Ensure the server is reachable from your network

### Agents don't appear in Copilot Chat

1. Agent files must be in `.github/agents/` (not `.github/agent/`)
2. Restart VS Code after adding agent files
3. Verify the YAML frontmatter in each `.agent.md` file is valid

### Scan produces no findings

1. Verify the MCP connection is active by asking the scanner to list checklists
2. The scanner only reports what it can evidence from code — if the project is small, fewer findings are expected
3. Check `audit-results/scan-results.md` for any partial output
