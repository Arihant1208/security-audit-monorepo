---
description: "Fix security vulnerabilities found in the scan"
mode: "agent"
agent: "security-fixer"
---

Remediate security vulnerabilities found in the codebase:

1. Read the scan results from `audit-results/scan-results.md`
2. Prioritize findings by risk score (highest first)
3. For each finding, research the fix using MCP remediation guides
4. Present the recommended fix and wait for approval before applying
5. Log all applied fixes to `audit-results/remediation-log.md`

Work through findings one at a time, starting with Critical severity.
