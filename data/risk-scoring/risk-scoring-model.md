# Risk Scoring Model

## Overview

This model provides a repeatable, consistent method for scoring security vulnerabilities. It combines technical severity with business context to produce actionable risk scores.

## Formula

```
Risk Score = min(10, (Impact × Exploitability × Exposure) + Business Context Modifier)
```

**Final score range: 0.0 — 10.0**

---

## Factor Definitions

### Impact (1.0 — 4.0)

Measures the damage if the vulnerability is successfully exploited.

| Score | Level | Confidentiality | Integrity | Availability |
|-------|-------|----------------|-----------|-------------|
| 1.0 | Low | No sensitive data exposed | No data modification | Brief degradation |
| 2.0 | Medium | Limited PII or internal data | Partial data modification | Partial service outage |
| 3.0 | High | Significant PII/credentials | Bulk data modification | Full service outage |
| 4.0 | Critical | Complete data breach | Full data control | Sustained/unrecoverable |

**Scoring guidance:** Use the highest applicable sub-factor (confidentiality, integrity, availability).

### Exploitability (0.5 — 2.0)

Measures how easy the vulnerability is to exploit.

| Score | Level | Authentication | Complexity | Automation |
|-------|-------|---------------|-----------|-----------|
| 0.5 | Very Hard | Physical access + credentials | Multi-step, specialized | No tools available |
| 1.0 | Hard | Authenticated + specific conditions | Requires skill | Manual only |
| 1.5 | Moderate | Authenticated OR specific setup | Moderate skill | Partially automated |
| 2.0 | Easy | None required | Simple, well-documented | Fully automated tools |

### Exposure (0.5 — 1.5)

Measures the accessibility of the vulnerable component.

| Score | Level | Network Access | Restrictions |
|-------|-------|---------------|-------------|
| 0.5 | Internal | Private network only | Multiple controls required |
| 0.75 | Restricted | VPN or specific network | Some restrictions |
| 1.0 | Authenticated Public | Internet-facing | Requires authentication |
| 1.25 | Partially Public | Internet-facing | Minimal restrictions |
| 1.5 | Fully Public | Internet-facing | No restrictions |

### Business Context Modifier (-1.0 to +2.0)

| Modifier | Condition | Rationale |
|----------|-----------|-----------|
| +2.0 | Regulated data (PCI, HIPAA, GDPR) | Regulatory penalties amplify impact |
| +1.5 | Revenue-critical system | Direct financial impact |
| +1.0 | Customer-facing system | Brand/trust impact |
| +0.5 | Internal productivity system | Operational impact |
| 0.0 | No additional context | Baseline |
| -0.5 | Compensating controls exist | Risk partially mitigated |
| -1.0 | Component being decommissioned | Limited future exposure |

---

## Risk Levels

| Score | Level | Color | SLA |
|-------|-------|-------|-----|
| 9.0 — 10.0 | Critical | Red | Remediate within 24-48 hours |
| 7.0 — 8.9 | High | Orange | Remediate within 1-2 weeks |
| 4.0 — 6.9 | Medium | Yellow | Remediate within 1-3 months |
| 2.0 — 3.9 | Low | Blue | Remediate in next development cycle |
| 0.0 — 1.9 | Informational | Gray | Address opportunistically |

---

## Aggregate System Risk

The overall system risk is determined by:

1. **Highest single vulnerability** — System risk cannot be lower than its worst vulnerability
2. **Vulnerability density** — Many medium-severity findings can elevate overall risk
3. **Coverage gaps** — Areas not audited are assumed medium risk

### Aggregate Risk Formula

```
System Risk Level = max(Highest Vulnerability Level, Density Adjustment)

Density Adjustment:
- 5+ High vulnerabilities → System Risk = Critical
- 10+ Medium vulnerabilities → System Risk = High
- 20+ Low vulnerabilities → System Risk = Medium
```

---

## Comparison with CVSS

| This Model | CVSS Equivalent | Key Difference |
|-----------|----------------|----------------|
| Impact | Base Score (CIA impact) | Simplified to 4 levels |
| Exploitability | Exploitability metrics | Combined auth + complexity |
| Exposure | Environmental metrics | Focused on accessibility |
| Business Context | None (added by org) | Built into model |

This model deliberately simplifies CVSS for practical usability while retaining the critical factors.
