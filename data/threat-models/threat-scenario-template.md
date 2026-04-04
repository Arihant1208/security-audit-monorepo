# Threat Scenario Template

Use this template to document each identified threat in detail.

---

## Threat Scenario

| Field | Value |
|-------|-------|
| **Threat ID** | T-[LAYER]-[NUMBER] (e.g., T-AUTH-001) |
| **Title** | [Short descriptive title] |
| **STRIDE Category** | [Spoofing / Tampering / Repudiation / Info Disclosure / DoS / Elevation of Privilege] |
| **Date Identified** | [Date] |
| **Identified By** | [Name / Role] |

---

### Target

| Field | Value |
|-------|-------|
| **Component** | [The system component targeted] |
| **Layer** | [Architecture / Identity / Application / API / Data / Network / Infrastructure / DevOps / Supply Chain / Client Side / Monitoring / Business Logic] |
| **Trust Boundary** | [Which trust boundary is crossed or exploited] |

---

### Threat Description

[Detailed description of the threat. What does the attacker do? What is the attack flow?]

---

### Threat Actor

| Field | Value |
|-------|-------|
| **Type** | [External / Authenticated User / Insider / Compromised Service / Supply Chain] |
| **Motivation** | [Financial / Espionage / Disruption / Ideology / Opportunistic] |
| **Capability** | [Low / Medium / High] |
| **Access Level** | [None / Authenticated / Internal / Privileged] |

---

### Prerequisites

[What conditions must exist for this attack to be viable?]

- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]
- [ ] [Prerequisite 3]

---

### Attack Steps

1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Step n]

---

### Impact Assessment

| Impact Area | Rating | Description |
|-------------|--------|-------------|
| Confidentiality | [None / Low / Medium / High] | [What data could be exposed?] |
| Integrity | [None / Low / Medium / High] | [What data could be modified?] |
| Availability | [None / Low / Medium / High] | [What services could be disrupted?] |
| Business Impact | [None / Low / Medium / High] | [What is the business consequence?] |

---

### Existing Controls

| Control | Effectiveness |
|---------|-------------|
| [Control 1] | [Effective / Partial / Ineffective] |
| [Control 2] | [Effective / Partial / Ineffective] |

---

### Risk Assessment

| Factor | Value |
|--------|-------|
| **Likelihood** | [1-5] |
| **Impact** | [1-5] |
| **Risk Score** | [Likelihood × Impact] |
| **Risk Level** | [Critical / High / Medium / Low] |

---

### Recommended Mitigations

| Priority | Mitigation | Effort |
|----------|-----------|--------|
| [P0-P4] | [Description] | [Low / Medium / High] |
| | | |

---

### References

- [Link to knowledge base entry]
- [OWASP reference]
- [CWE reference]
