---
description: "Generate architecture diagrams with Steve — auto-analyze the codebase and produce Mermaid diagrams."
mode: "agent"
agent: "steve"
---

# Architecture Diagram Generation

Analyze this project's architecture and generate Mermaid diagrams:

1. **System Context** (C4 Level 1) — System in its environment with external actors
2. **Container Diagram** (C4 Level 2) — Services, databases, queues, and their connections
3. **Data Flow Diagram** — How data moves through trust boundaries
4. **Threat Surface Diagram** — Attack vectors overlaid on architecture

For each diagram:
- Analyze the source code structure, config files, and infrastructure definitions
- Generate valid Mermaid syntax
- Include a descriptive title and explanation

Write results to `audit-results/02-architecture-analysis.md` with all diagrams inline.
