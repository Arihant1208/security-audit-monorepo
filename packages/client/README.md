# Security Audit Framework

AI-powered security auditing for any codebase — powered by GitHub Copilot agents and a proprietary MCP knowledge server.

Drop this into any project, connect to the MCP server, and run a full security audit from VS Code.

## Quick Start

### 1. Get an API Key

Sign up at [security-audit.dev](https://security-audit.dev) to get your API key.

### 2. Open Your Project in VS Code

Clone or copy this repo's agent files into your project (or use it as a template):

```
your-project/
├── .vscode/mcp.json                  ← MCP server connection
├── .github/
│   ├── agents/
│   │   ├── security-scanner.agent.md ← Scans for vulnerabilities
│   │   ├── security-reporter.agent.md← Generates audit reports
│   │   └── security-fixer.agent.md   ← Recommends & applies fixes
│   └── prompts/
│       ├── scan-codebase.prompt.md   ← /scan-codebase
│       ├── generate-report.prompt.md ← /generate-report
│       ├── fix-vulnerabilities.prompt.md ← /fix-vulnerabilities
│       └── full-audit.prompt.md      ← /full-audit (all three phases)
└── ... your code ...
```

### 3. Configure the MCP Connection

When VS Code prompts you for the MCP server URL and API key:
- **URL:** `https://api.security-audit.dev/mcp` (or your self-hosted URL)
- **API Key:** The key from step 1

See [SETUP.md](SETUP.md) for detailed configuration instructions.

### 4. Run an Audit

Use the slash commands in GitHub Copilot Chat:

| Command | What it does |
|---------|-------------|
| `/scan-codebase` | Scan for vulnerabilities across 12 security layers |
| `/generate-report` | Generate audit report + executive summary |
| `/fix-vulnerabilities` | Walk through fixes one by one (recommend → approve → apply) |
| `/full-audit` | Run all three phases end-to-end |

Or invoke agents directly:
- `@security-scanner` — Scan only
- `@security-reporter` — Report only
- `@security-fixer` — Fix only

---

## How It Works

```
┌──────────────────────────────────────────────────────────┐
│  VS Code + GitHub Copilot                                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Scanner    │  │   Reporter   │  │    Fixer     │   │
│  │   Agent      │  │   Agent      │  │    Agent     │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                  │           │
│         └────────┬────────┴──────────┬───────┘           │
│                  │    MCP Protocol   │                   │
└──────────────────┼───────────────────┼───────────────────┘
                   │                   │
            ┌──────┴───────────────────┴──────┐
            │    Security Audit MCP Server    │
            │                                 │
            │  • 12 audit checklists          │
            │  • 27 attack patterns           │
            │  • 7 remediation guides         │
            │  • Risk scoring engine          │
            │  • Compliance mappings          │
            │  • Report templates             │
            │  • 7-phase methodology          │
            └─────────────────────────────────┘
```

The agents are lightweight orchestrators — they read your code, call MCP tools for security knowledge, and produce findings. All security expertise lives on the MCP server.

---

## Audit Coverage

Scans across **12 security layers**:

| Layer | Examples |
|-------|---------|
| Architecture | Defense in depth, trust boundaries, fail-safe design |
| Identity & Access | Authentication, authorization, session management |
| Application Security | Input validation, injection, error handling |
| API Security | Auth, rate limiting, mass assignment, CORS |
| Data Security | Encryption, classification, retention, DLP |
| Network Security | Segmentation, TLS, DNS, DDoS protection |
| Infrastructure & Cloud | IAM, containers, secrets, IaC |
| DevOps & CI/CD | Pipeline security, artifact integrity |
| Supply Chain | Dependencies, lockfiles, SBOM |
| Client Side | XSS prevention, security headers, storage |
| Monitoring & Logging | Security logging, alerting, incident response |
| Business Logic | Workflow integrity, race conditions, abuse prevention |

---

## Output

After running an audit, you'll find:

```
audit-results/
├── scan-results.md          ← All findings with severity, evidence, risk scores
├── audit-report.md          ← Full technical audit report
├── executive-summary.md     ← Non-technical leadership summary
├── remediation-log.md       ← Log of all applied fixes
└── findings/
    ├── V-001.md             ← Individual Critical/High finding reports
    └── ...
```

`audit-results/` is in `.gitignore` by default — results stay local.

---

## Self-Hosted / Enterprise

For air-gapped or on-premises deployments, you can run the MCP server locally. See [SETUP.md](SETUP.md) for Docker and stdio configuration.

---

## License

This framework is provided as a security reference. Use it to improve the security posture of your systems.
