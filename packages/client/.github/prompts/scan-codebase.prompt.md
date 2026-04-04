---
description: "Scan this codebase for security vulnerabilities"
mode: "agent"
agent: "security-scanner"
---

Perform a comprehensive security scan of this codebase:

1. Discover the project structure, technology stack, and architecture
2. Map all entry points and attack surfaces
3. Run through each relevant security audit layer using the MCP checklists
4. Match suspicious code against known vulnerability patterns
5. Calculate risk scores for all findings
6. Write results to `audit-results/scan-results.md`

Focus on the most critical layers first: application security, identity/access, API security, and data security. Include infrastructure and supply chain checks if relevant configuration files exist.
