# Steve — VS Code Agent Package

Drop-in VS Code integration for Steve security audits. Copy into any project to enable AI-powered security analysis.

## Contents

```
.github/
  agents/
    steve.agent.md              — Unified 9-phase autonomous agent
    security-scanner.agent.md   — Focused scan-only agent (read-only)
    security-fixer.agent.md     — Fix agent (recommends + applies patches)
  prompts/
    steve-audit.prompt.md       — /steve-audit: Full 9-phase audit
    steve-scan.prompt.md        — /steve-scan: Quick security scan
    steve-license.prompt.md     — /steve-license: License compliance
    steve-diagram.prompt.md     — /steve-diagram: Architecture diagrams
    fix-vulnerabilities.prompt.md — /fix-vulnerabilities: Step-by-step fixes
.vscode/
  mcp.json                      — MCP server connection config
```

## Quick Start

1. Copy `.github/` and `.vscode/` into your project root
2. Open the project in VS Code
3. When prompted, enter your Steve server URL and API key
4. Use slash commands or invoke agents directly

## Agents

| Agent | Purpose | Mode |
|-------|---------|------|
| `@steve` | Full autonomous security audit (9 phases) | Read + Write |
| `@security-scanner` | Scan-only analysis (no code changes) | Read Only |
| `@security-fixer` | Fix vulnerabilities one by one | Read + Write |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/steve-audit` | Full end-to-end 9-phase audit |
| `/steve-scan` | Quick scan (discovery + audit + risk scoring) |
| `/steve-license` | License compliance check |
| `/steve-diagram` | Generate architecture diagrams |
| `/fix-vulnerabilities` | Step-by-step vulnerability remediation |

## Connection Modes

### Remote (SaaS)
Default — connects to hosted Steve server:
- URL: `https://api.steve-security.dev/mcp`
- Requires API key from dashboard

### Local Development
Run the orchestrator locally:
```bash
npm run build && npm start
```
- URL: `http://localhost:3000/mcp`
- Set `SECURITY_AUDIT_SKIP_AUTH=true` for dev

### Stdio (Enterprise)
For air-gapped or enterprise environments, use stdio transport in `mcp.json`:
```json
{
  "servers": {
    "steve-security-agent": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/steve/packages/orchestrator/dist/index.js", "--stdio"]
    }
  }
}
```
