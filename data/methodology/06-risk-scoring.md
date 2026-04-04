# Phase 6 — Risk Scoring

## Objective

Assign a quantified risk score to every identified vulnerability so findings can be prioritized for remediation based on actual risk rather than arbitrary severity.

## Scoring Model: CVSS-Based Risk Assessment

This framework uses a simplified model inspired by CVSS (Common Vulnerability Scoring System) with business context factors added.

### Risk Formula

```
Risk Score = (Impact × Exploitability × Exposure) + Business Context Modifier
```

**Scale: 0.0 — 10.0**

## Scoring Factors

### Factor 1: Impact (1.0 — 4.0)

What is the damage if the vulnerability is exploited?

| Score | Level | Description |
|-------|-------|-------------|
| 1.0 | Low | Minor inconvenience, no data loss, no service disruption |
| 2.0 | Medium | Limited data exposure, partial service degradation |
| 3.0 | High | Significant data breach, service outage, privilege escalation |
| 4.0 | Critical | Full system compromise, massive data breach, regulatory violation |

**Sub-factors to consider:**
- Confidentiality impact (data exposure)
- Integrity impact (data modification)
- Availability impact (service disruption)
- Scope (limited to component vs. entire system)

### Factor 2: Exploitability (0.5 — 2.0)

How easy is it to exploit?

| Score | Level | Description |
|-------|-------|-------------|
| 0.5 | Very Difficult | Requires physical access, insider knowledge, and complex tooling |
| 1.0 | Difficult | Requires authentication, specific conditions, or specialized skills |
| 1.5 | Moderate | Requires basic tools and some knowledge, partially automated |
| 2.0 | Easy | Publicly known exploit, automated tools available, no auth required |

**Sub-factors to consider:**
- Attack complexity
- Authentication required
- User interaction needed
- Publicly available exploit code

### Factor 3: Exposure (0.5 — 1.5)

How accessible is the vulnerable component?

| Score | Level | Description |
|-------|-------|-------------|
| 0.5 | Internal | Only accessible from internal network |
| 0.75 | Limited | Accessible with VPN or specific network conditions |
| 1.0 | Authenticated | Publicly accessible but requires authentication |
| 1.25 | Partially Public | Publicly accessible with some restrictions |
| 1.5 | Fully Public | Directly exposed to the internet with no restrictions |

### Factor 4: Business Context Modifier (-1.0 to +2.0)

Adjusts the technical score based on business reality.

| Modifier | Condition |
|----------|-----------|
| +2.0 | Affects regulated data (PII, PCI, HIPAA) |
| +1.5 | Affects revenue-critical system |
| +1.0 | Affects customer-facing system |
| +0.5 | Affects internal productivity system |
| 0.0 | No additional business context |
| -0.5 | Compensating controls exist |
| -1.0 | Vulnerability is in deprecated/decommissioning component |

## Risk Score Interpretation

| Score Range | Risk Level | Action Required |
|-------------|-----------|-----------------|
| 9.0 — 10.0 | Critical | Immediate remediation (within 24-48 hours) |
| 7.0 — 8.9 | High | Urgent remediation (within 1-2 weeks) |
| 4.0 — 6.9 | Medium | Planned remediation (within 1-3 months) |
| 2.0 — 3.9 | Low | Address in next development cycle |
| 0.0 — 1.9 | Informational | Accept risk or address opportunistically |

## Scoring Example

```
Vulnerability:     SQL Injection in public search endpoint
Impact:            4.0 (Full database access)
Exploitability:    2.0 (Known attack, automated tools available)
Exposure:          1.5 (Fully public endpoint)
Business Context:  +2.0 (Contains PII, regulatory implications)

Raw Score:         4.0 × 2.0 × 1.5 = 12.0
Capped at 10:     10.0
Context Adjusted:  10.0 + 2.0 = 12.0 → Capped at 10.0

Final Score:       10.0 (Critical)
Action:            Immediate remediation required
```

## Risk Register Format

| ID | Vulnerability | Impact | Exploit | Exposure | Context | Score | Level | Owner | Deadline |
|----|--------------|--------|---------|----------|---------|-------|-------|-------|----------|
| V-001 | SQL Injection in search | 4.0 | 2.0 | 1.5 | +2.0 | 10.0 | Critical | Backend Team | 48 hours |
| V-002 | Missing rate limiting | 2.0 | 2.0 | 1.5 | +1.0 | 7.0 | High | API Team | 2 weeks |
| V-003 | Verbose error messages | 1.0 | 1.5 | 1.0 | 0.0 | 1.5 | Info | Backend Team | Next sprint |

## Aggregate Risk Assessment

After scoring individual vulnerabilities, calculate system-level risk:

```
Total Vulnerabilities:    [count]
Critical:                 [count]
High:                     [count]
Medium:                   [count]
Low:                      [count]
Informational:            [count]

Overall System Risk:      [Critical/High/Medium/Low]
```

**System risk is determined by the highest-severity unmitigated vulnerability.**

## Detailed Model

See `/risk-scoring/` for:
- [Risk Scoring Model](../risk-scoring/risk-scoring-model.md) — Complete scoring methodology
- [Risk Calculator](../risk-scoring/risk-calculator.md) — Step-by-step scoring guide
- [Risk Register Template](../risk-scoring/risk-register-template.md) — Template for tracking scores

## Outputs

1. **Risk register** — All vulnerabilities with scores and priority
2. **Risk summary** — Aggregate risk posture of the system
3. **Priority matrix** — Remediation priority based on scores
4. **Risk acceptance log** — Documented decisions to accept specific risks

## Next Phase

Proceed to → [Phase 7: Remediation Planning](07-remediation-planning.md)
