# Phase 2 — Threat Modeling

## Objective

Systematically identify threats to the system using structured frameworks. This phase transforms the system understanding from Phase 1 into a threat landscape.

## Methodology: STRIDE

STRIDE is the primary threat modeling framework used in this audit methodology.

### STRIDE Categories

| Category | Description | Question to Ask |
|----------|-------------|-----------------|
| **S**poofing | Pretending to be someone or something else | Can an attacker impersonate a user, service, or component? |
| **T**ampering | Modifying data or code without authorization | Can an attacker alter data in transit, at rest, or in processing? |
| **R**epudiation | Denying an action was performed | Can a user deny performing a critical action with no proof otherwise? |
| **I**nformation Disclosure | Exposing data to unauthorized parties | Can sensitive data leak through errors, logs, side channels, or access flaws? |
| **D**enial of Service | Making the system unavailable | Can an attacker exhaust resources or disrupt availability? |
| **E**levation of Privilege | Gaining unauthorized access levels | Can an attacker escalate from low to high privilege? |

## Threat Modeling Process

### Step 1 — Decompose the System

Using the outputs from Phase 1, break the system into:

- **Trust boundaries** — Where privilege levels change
- **Data flows** — How data moves between components
- **Data stores** — Where data is persisted
- **Processes** — Components that transform data
- **External entities** — Users, APIs, third-party services

### Step 2 — Identify Threats per Component

For each component identified in the system decomposition, apply STRIDE:

```
Component: User Authentication Service
├── Spoofing: Attacker uses stolen credentials
├── Tampering: Attacker modifies JWT tokens
├── Repudiation: No audit log for login attempts
├── Info Disclosure: Error messages reveal user existence
├── DoS: No rate limiting on login endpoint
└── Elevation: Default admin account with weak password
```

### Step 3 — Map Threats to Trust Boundaries

Threats are most concentrated at trust boundaries:

| Trust Boundary | Example Threats |
|---------------|-----------------|
| Internet → Application | Injection, DDoS, credential attacks |
| Application → Database | SQL injection, excessive data access |
| User → Admin | Privilege escalation, IDOR |
| Internal → External | Data exfiltration, SSRF |
| CI/CD → Production | Supply chain, deployment tampering |

### Step 4 — Assess Threat Actors

Identify who might attack the system:

| Actor | Motivation | Capability | Access Level |
|-------|-----------|------------|-------------|
| External attacker | Financial gain, disruption | Varies | None (public) |
| Authenticated user | Data theft, abuse | Low-medium | Authenticated |
| Insider threat | Espionage, sabotage | High | Internal |
| Compromised service | Lateral movement | Medium | Service-level |
| Supply chain attacker | Broad access | High | Build pipeline |

### Step 5 — Document Threat Scenarios

For each identified threat, create a structured entry:

```
Threat ID:        T-AUTH-001
Category:         Spoofing
Component:        Authentication Service
Threat:           Credential stuffing attack using leaked credentials
Actor:            External attacker
Prerequisites:    Public login endpoint, no rate limiting
Impact:           Account takeover, data breach
Likelihood:       High (common attack, leaked credentials widely available)
```

## Threat Modeling Templates

Use the templates in `/threat-models/` for structured documentation:

- [STRIDE Analysis Template](../threat-models/stride-template.md)
- [Threat Scenario Template](../threat-models/threat-scenario-template.md)
- [Data Flow Diagram Guide](../threat-models/data-flow-diagram-guide.md)

## Outputs

1. **STRIDE analysis** — Threats mapped per component and category
2. **Threat actor profiles** — Who might attack and why
3. **Trust boundary map** — Where the highest-risk transitions occur
4. **Threat register** — Prioritized list of identified threats

## Next Phase

Proceed to → [Phase 3: Attack Surface Mapping](03-attack-surface-mapping.md)
