# Steve — VS Code Agent Package

This directory contains the distributable VS Code agent files for Steve.
Copy this into any project to enable Steve's security audit capabilities.

## Contents

```
.github/
  agents/
    steve.agent.md        — The unified Steve agent (replaces 3 separate agents)
  prompts/
    steve-audit.prompt.md    — /steve-audit: Full 9-phase audit
    steve-scan.prompt.md     — /steve-scan: Quick security scan
    steve-license.prompt.md  — /steve-license: License compliance
    steve-diagram.prompt.md  — /steve-diagram: Architecture diagrams
.vscode/
  mcp.json                — MCP server connection config
```

## Quick Start

1. Copy this directory's contents into your project root
2. Configure the MCP server URL in `.vscode/mcp.json`
3. Open VS Code and use one of the slash commands:
   - `/steve-audit` — Full end-to-end security audit
   - `/steve-scan` — Quick security scan
   - `/steve-license` — License compliance check
   - `/steve-diagram` — Generate architecture diagrams

## Agent: Steve

Steve is a single unified agent that handles all security audit tasks. Unlike the
previous 3-agent setup (scanner, reporter, fixer), Steve runs autonomously through
a 9-phase pipeline:

| Phase | Name | What It Does |
|-------|------|--------------|
| 0 | Business Discovery | Understands what the project is and its business context |
| 1 | System Discovery | Maps tech stack, dependencies, architecture |
| 2 | Architecture Mapping | Generates Mermaid diagrams, provides recommendations |
| 3 | Threat Modeling | STRIDE analysis, attack surface mapping |
| 4 | Layered Security Audit | 12-layer checklist scan with evidence |
| 5 | License Compliance | Dependency license audit + alternatives |
| 6 | AI Opportunity Analysis | Where AI/ML can improve the system |
| 7 | Risk & Remediation | Scoring + prioritized fix plan |
| 8 | Report Generation | Executive summary + full report |

## Connection Modes

### Remote Server (default)
```json
{
  "servers": {
    "steve-security-agent": {
      "type": "http",
      "url": "https://api.steve-security.dev/mcp",
      "headers": { "X-API-Key": "your-key-here" }
    }
  }
}
```

### Local (Docker)
```json
{
  "servers": {
    "steve-security-agent": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": { "X-API-Key": "dev-key" }
    }
  }
}
```

### Stdio (max isolation)
```json
{
  "servers": {
    "steve-security-agent": {
      "type": "stdio",
      "command": "node",
      "args": ["path/to/packages/orchestrator/dist/index.js", "--stdio"]
    }
  }
}
```
