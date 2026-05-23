---
description: "Run Steve's license compliance scan — check dependencies for license conflicts, copyleft risks, and policy violations."
mode: "agent"
agent: "steve"
---

# License Compliance Scan

Scan all dependencies in this project for license compliance:

1. Find all package manifests (package.json, Cargo.toml, requirements.txt, go.mod, etc.)
2. Determine the project's own license
3. Analyze each dependency's license for compatibility
4. Flag conflicts (copyleft in proprietary, unknown licenses, AGPL in SaaS)
5. Recommend alternatives for problematic dependencies
6. Generate an SBOM-compatible compliance report

Write results to `audit-results/05-license-compliance.md`.
