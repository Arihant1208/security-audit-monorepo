# Phase 4 — Layered Security Audit

## Objective

Perform a systematic, layer-by-layer security review of the system. Each layer is audited independently using the checklists in `/audit-checklists/`.

## Audit Layers

```
┌─────────────────────────────────┐
│       Business Logic            │  ← Application behavior
├─────────────────────────────────┤
│       Application Code          │  ← Source code security
├─────────────────────────────────┤
│       API Layer                 │  ← API security
├─────────────────────────────────┤
│       Identity & Access         │  ← Authentication & authorization
├─────────────────────────────────┤
│       Data Layer                │  ← Data protection
├─────────────────────────────────┤
│       Network Layer             │  ← Network security
├─────────────────────────────────┤
│       Infrastructure            │  ← Cloud/server security
├─────────────────────────────────┤
│       CI/CD & Deployment        │  ← Pipeline security
├─────────────────────────────────┤
│       Supply Chain              │  ← Dependencies & third parties
├─────────────────────────────────┤
│       Client Side               │  ← Browser/mobile security
├─────────────────────────────────┤
│       Monitoring & Logging      │  ← Observability security
└─────────────────────────────────┘
```

## Layer-by-Layer Audit Guide

### Layer 1: System Architecture

**Focus:** Design-level security flaws

| Check | Description |
|-------|-------------|
| Defense in depth | Multiple security layers, not single points of failure |
| Least privilege | Components have minimum required access |
| Separation of concerns | Security-critical components are isolated |
| Fail-safe defaults | System denies by default, allows explicitly |
| Trust boundaries | Clear boundaries with enforced controls |

**Checklist:** [Architecture Security Checklist](../audit-checklists/01-architecture.md)

### Layer 2: Identity & Access Management

**Focus:** Authentication, authorization, session management

| Check | Description |
|-------|-------------|
| Authentication strength | Password policies, MFA, credential storage |
| Authorization model | RBAC/ABAC enforcement, privilege boundaries |
| Session management | Token handling, expiration, revocation |
| Account lifecycle | Registration, recovery, deactivation |
| Service identity | Machine-to-machine authentication |

**Checklist:** [Identity & Access Checklist](../audit-checklists/02-identity-access.md)

### Layer 3: Application Security

**Focus:** Code-level vulnerabilities

| Check | Description |
|-------|-------------|
| Input validation | All inputs sanitized and validated |
| Output encoding | Proper encoding to prevent injection |
| Error handling | No sensitive data in error responses |
| Cryptography | Correct use of encryption and hashing |
| Business logic | Authorization checks in business operations |

**Checklist:** [Application Security Checklist](../audit-checklists/03-application-security.md)

### Layer 4: API Security

**Focus:** API-specific vulnerabilities

| Check | Description |
|-------|-------------|
| Authentication | API key, OAuth, JWT validation |
| Authorization | Endpoint-level access control |
| Rate limiting | Throttling and abuse prevention |
| Input validation | Schema validation, size limits |
| Mass assignment | Protection against over-posting |

**Checklist:** [API Security Checklist](../audit-checklists/04-api-security.md)

### Layer 5: Data Security

**Focus:** Data protection at rest, in transit, and in processing

| Check | Description |
|-------|-------------|
| Encryption at rest | Database, file storage, backups encrypted |
| Encryption in transit | TLS everywhere, certificate management |
| Data classification | Sensitive data identified and labeled |
| Access control | Data access restricted by need |
| Data retention | Retention policies enforced, deletion verified |

**Checklist:** [Data Security Checklist](../audit-checklists/05-data-security.md)

### Layer 6: Network Security

**Focus:** Network-level protections

| Check | Description |
|-------|-------------|
| Segmentation | Network zones with enforced boundaries |
| Firewall rules | Minimal required access, deny by default |
| TLS configuration | Strong cipher suites, current protocols |
| DNS security | DNSSEC, DNS monitoring |
| DDoS protection | Rate limiting, CDN, traffic filtering |

**Checklist:** [Network Security Checklist](../audit-checklists/06-network-security.md)

### Layer 7: Infrastructure & Cloud

**Focus:** Server, container, and cloud configuration

| Check | Description |
|-------|-------------|
| Cloud configuration | IAM, resource policies, service config |
| Container security | Image scanning, runtime policies, orchestration |
| Server hardening | OS patches, unnecessary services removed |
| Secrets management | Vault usage, rotation, access control |
| Infrastructure as Code | IaC scanning, drift detection |

**Checklist:** [Infrastructure Security Checklist](../audit-checklists/07-infrastructure-cloud.md)

### Layer 8: CI/CD & DevOps

**Focus:** Build and deployment pipeline security

| Check | Description |
|-------|-------------|
| Pipeline security | Hardened CI/CD configuration |
| Artifact integrity | Signed builds, verified deployments |
| Secret handling | No secrets in code, secure injection |
| Access control | Pipeline permissions, approval gates |
| Environment isolation | Prod separation from lower environments |

**Checklist:** [DevOps Security Checklist](../audit-checklists/08-devops-cicd.md)

### Layer 9: Supply Chain

**Focus:** Third-party dependencies and integrations

| Check | Description |
|-------|-------------|
| Dependency scanning | Known vulnerabilities in packages |
| License compliance | Compatible and approved licenses |
| Dependency pinning | Locked versions, verified checksums |
| Registry security | Private registry, scoped packages |
| Third-party review | Vendor security assessments |

**Checklist:** [Supply Chain Security Checklist](../audit-checklists/09-supply-chain.md)

### Layer 10: Client Side

**Focus:** Browser and mobile application security

| Check | Description |
|-------|-------------|
| XSS prevention | CSP, output encoding, sanitization |
| Sensitive data exposure | No secrets in client code |
| Dependency security | Client-side library vulnerabilities |
| Storage security | Proper use of local/session storage |
| Communication security | Certificate pinning, secure channels |

**Checklist:** [Client-Side Security Checklist](../audit-checklists/10-client-side.md)

### Layer 11: Monitoring & Logging

**Focus:** Detection and response capabilities

| Check | Description |
|-------|-------------|
| Security logging | Auth events, access changes, errors logged |
| Log protection | Logs tamper-proof and access-controlled |
| Alerting | Security events trigger alerts |
| Incident response | Runbooks exist and are tested |
| Audit trail | Complete audit trail for compliance |

**Checklist:** [Monitoring Security Checklist](../audit-checklists/11-monitoring-logging.md)

### Layer 12: Business Logic

**Focus:** Application-specific security flaws

| Check | Description |
|-------|-------------|
| Workflow integrity | Business processes cannot be bypassed |
| Race conditions | Concurrent operations handled safely |
| Abuse prevention | Anti-fraud, rate limits on business operations |
| Data integrity | Business rules enforced at all layers |
| Authorization in logic | Role checks in business operations |

**Checklist:** [Business Logic Security Checklist](../audit-checklists/12-business-logic.md)

## Outputs

1. **Layer audit reports** — Findings documented per layer
2. **Vulnerability list** — All identified weaknesses
3. **Evidence collection** — Screenshots, logs, proof of vulnerabilities
4. **Coverage matrix** — Which checks passed, failed, or were not applicable

## Next Phase

Proceed to → [Phase 5: Vulnerability Identification](05-vulnerability-identification.md)
