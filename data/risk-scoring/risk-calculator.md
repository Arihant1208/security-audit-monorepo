# Risk Calculator

Step-by-step guide to score a vulnerability.

---

## Step 1: Identify the Vulnerability

```
Vulnerability ID:    _______________
Title:               _______________
Affected Component:  _______________
Affected Layer:      _______________
```

---

## Step 2: Assess Impact

**Question:** What is the worst-case damage if this vulnerability is exploited?

Consider:
- What data could be exposed? (Confidentiality)
- What data could be modified? (Integrity)
- What services could be disrupted? (Availability)
- What is the blast radius? (Scope)

| Score | Select |
|-------|--------|
| 1.0 — Low: Minor, no sensitive data, brief degradation | [ ] |
| 2.0 — Medium: Limited PII, partial disruption | [ ] |
| 3.0 — High: Significant breach, full outage | [ ] |
| 4.0 — Critical: Complete compromise, catastrophic | [ ] |

**Impact Score: _____**

---

## Step 3: Assess Exploitability

**Question:** How easy is it for an attacker to exploit this vulnerability?

Consider:
- Does the attacker need authentication?
- How complex is the attack?
- Are automated tools available?
- Is the attack well-documented?

| Score | Select |
|-------|--------|
| 0.5 — Very Hard: Physical access needed, no tools | [ ] |
| 1.0 — Hard: Auth required, specialized skills | [ ] |
| 1.5 — Moderate: Some prerequisites, partially automatable | [ ] |
| 2.0 — Easy: No auth, automated tools exist | [ ] |

**Exploitability Score: _____**

---

## Step 4: Assess Exposure

**Question:** How accessible is the vulnerable component?

| Score | Select |
|-------|--------|
| 0.5 — Internal only | [ ] |
| 0.75 — VPN / restricted access | [ ] |
| 1.0 — Public but requires authentication | [ ] |
| 1.25 — Public with minimal restrictions | [ ] |
| 1.5 — Fully public, no restrictions | [ ] |

**Exposure Score: _____**

---

## Step 5: Calculate Raw Score

```
Raw Score = Impact × Exploitability × Exposure
Raw Score = _____ × _____ × _____ = _____
```

Cap at 10.0 if raw score exceeds 10.

---

## Step 6: Apply Business Context

**Question:** Are there business factors that increase or decrease the risk?

| Modifier | Applies? |
|----------|----------|
| +2.0 Regulated data (PCI, HIPAA, GDPR) | [ ] |
| +1.5 Revenue-critical system | [ ] |
| +1.0 Customer-facing system | [ ] |
| +0.5 Internal productivity system | [ ] |
| -0.5 Compensating controls exist | [ ] |
| -1.0 Component being decommissioned | [ ] |

**Business Context Modifier: _____**

---

## Step 7: Calculate Final Score

```
Final Score = min(10.0, Raw Score + Business Context Modifier)
Final Score = min(10.0, _____ + _____) = _____
```

---

## Step 8: Determine Risk Level and Action

| Score | Risk Level | Action |
|-------|-----------|--------|
| 9.0 — 10.0 | **CRITICAL** | Immediate remediation (24-48h) |
| 7.0 — 8.9 | **HIGH** | Urgent remediation (1-2 weeks) |
| 4.0 — 6.9 | **MEDIUM** | Planned remediation (1-3 months) |
| 2.0 — 3.9 | **LOW** | Next development cycle |
| 0.0 — 1.9 | **INFO** | Address opportunistically |

---

## Final Record

```
Vulnerability ID:    _______________
Final Score:         _____
Risk Level:          _______________
Owner:               _______________
Remediation Deadline:_______________
```
