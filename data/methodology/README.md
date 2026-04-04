# Security Audit Methodology

This directory contains the structured, repeatable methodology for conducting a full-stack security audit.

## Audit Phases

The methodology follows seven sequential phases. Each phase builds on the outputs of the previous one.

```
Phase 1: System Discovery
    ↓
Phase 2: Threat Modeling
    ↓
Phase 3: Attack Surface Mapping
    ↓
Phase 4: Layered Security Audit
    ↓
Phase 5: Vulnerability Identification
    ↓
Phase 6: Risk Scoring
    ↓
Phase 7: Remediation Planning
```

## How to Use

1. Start with **Phase 1** for every new audit engagement
2. Work through each phase sequentially
3. Document findings at each phase using the templates in `/templates/`
4. Cross-reference findings with the `/knowledge-base/` for known attack patterns
5. Use `/audit-checklists/` during Phase 4 for systematic coverage
6. Apply the `/risk-scoring/` model during Phase 6
7. Generate remediation plans using `/remediation-guides/` during Phase 7

## Phase Documents

| Phase | Document | Purpose |
|-------|----------|---------|
| 1 | [System Discovery](01-system-discovery.md) | Map the target system |
| 2 | [Threat Modeling](02-threat-modeling.md) | Identify threats using STRIDE |
| 3 | [Attack Surface Mapping](03-attack-surface-mapping.md) | Enumerate entry points |
| 4 | [Layered Security Audit](04-layered-security-audit.md) | Systematic layer-by-layer review |
| 5 | [Vulnerability Identification](05-vulnerability-identification.md) | Detect weaknesses |
| 6 | [Risk Scoring](06-risk-scoring.md) | Quantify risk |
| 7 | [Remediation Planning](07-remediation-planning.md) | Plan and prioritize fixes |
