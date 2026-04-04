# OWASP Top 10 (2021) — Compliance Mapping

Maps OWASP Top 10 categories to this framework's audit checklists and knowledge base entries.

---

## A01:2021 — Broken Access Control

**Checklist Coverage:**
- [02 — Identity & Access](../audit-checklists/02-identity-access.md): Authorization section
- [04 — API Security](../audit-checklists/04-api-security.md): Authorization section
- [12 — Business Logic](../audit-checklists/12-business-logic.md): Authorization in business context

**Knowledge Base:**
- [Broken Access Control](../knowledge-base/application-attacks/broken-access-control.md)
- [Privilege Escalation](../knowledge-base/identity-attacks/privilege-escalation.md)

**Remediation:**
- [Access Control Guide](../remediation-guides/access-control.md)

---

## A02:2021 — Cryptographic Failures

**Checklist Coverage:**
- [05 — Data Security](../audit-checklists/05-data-security.md): Encryption at rest, Encryption in transit
- [06 — Network Security](../audit-checklists/06-network-security.md): TLS configuration
- [03 — Application Security](../audit-checklists/03-application-security.md): Cryptography section

**Knowledge Base:**
- [Cryptographic Failures](../knowledge-base/data-attacks/cryptographic-failures.md)
- [Man-in-the-Middle](../knowledge-base/network-attacks/man-in-the-middle.md)
- [TLS Downgrade](../knowledge-base/network-attacks/tls-downgrade.md)

**Remediation:**
- [Cryptographic Best Practices](../remediation-guides/cryptographic-best-practices.md)

---

## A03:2021 — Injection

**Checklist Coverage:**
- [03 — Application Security](../audit-checklists/03-application-security.md): Input validation, Injection prevention

**Knowledge Base:**
- [SQL Injection](../knowledge-base/application-attacks/sql-injection.md)
- [Command Injection](../knowledge-base/application-attacks/command-injection.md)
- [Cross-Site Scripting](../knowledge-base/application-attacks/cross-site-scripting.md)

**Remediation:**
- [Injection Prevention](../remediation-guides/injection-prevention.md)

---

## A04:2021 — Insecure Design

**Checklist Coverage:**
- [01 — Architecture](../audit-checklists/01-architecture.md): All sections
- [12 — Business Logic](../audit-checklists/12-business-logic.md): Workflow integrity, Abuse prevention

**Knowledge Base:**
- Covered across multiple knowledge base entries (design flaws are cross-cutting)

**Remediation:**
- [Access Control](../remediation-guides/access-control.md): Core principles section

---

## A05:2021 — Security Misconfiguration

**Checklist Coverage:**
- [07 — Infrastructure & Cloud](../audit-checklists/07-infrastructure-cloud.md): All sections
- [06 — Network Security](../audit-checklists/06-network-security.md): Firewall rules, TLS configuration
- [10 — Client Side](../audit-checklists/10-client-side.md): Security headers

**Knowledge Base:**
- [Security Misconfiguration](../knowledge-base/application-attacks/security-misconfiguration.md)
- [Cloud Misconfiguration](../knowledge-base/infrastructure-attacks/cloud-misconfiguration.md)
- [Exposed Storage](../knowledge-base/infrastructure-attacks/exposed-storage.md)

**Remediation:**
- [Infrastructure Hardening](../remediation-guides/infrastructure-hardening.md)

---

## A06:2021 — Vulnerable and Outdated Components

**Checklist Coverage:**
- [09 — Supply Chain](../audit-checklists/09-supply-chain.md): All sections
- [10 — Client Side](../audit-checklists/10-client-side.md): Client-side dependencies

**Knowledge Base:**
- [Malicious Dependencies](../knowledge-base/supply-chain-attacks/malicious-dependencies.md)
- [Dependency Confusion](../knowledge-base/supply-chain-attacks/dependency-confusion.md)
- [Typosquatting](../knowledge-base/supply-chain-attacks/typosquatting.md)

**Remediation:**
- [Supply Chain Security](../remediation-guides/supply-chain-security.md)

---

## A07:2021 — Identification and Authentication Failures

**Checklist Coverage:**
- [02 — Identity & Access](../audit-checklists/02-identity-access.md): Authentication, Session management, Password recovery

**Knowledge Base:**
- [Brute Force](../knowledge-base/identity-attacks/brute-force.md)
- [Credential Stuffing](../knowledge-base/identity-attacks/credential-stuffing.md)
- [Session Hijacking](../knowledge-base/identity-attacks/session-hijacking.md)
- [Account Takeover](../knowledge-base/identity-attacks/account-takeover.md)

**Remediation:**
- [Authentication Hardening](../remediation-guides/authentication-hardening.md)

---

## A08:2021 — Software and Data Integrity Failures

**Checklist Coverage:**
- [08 — DevOps & CI/CD](../audit-checklists/08-devops-cicd.md): Artifact security, Code quality
- [09 — Supply Chain](../audit-checklists/09-supply-chain.md): SBOM, Dependency management

**Knowledge Base:**
- [Insecure Deserialization](../knowledge-base/application-attacks/insecure-deserialization.md)
- [Compromised Build Pipeline](../knowledge-base/supply-chain-attacks/compromised-build-pipeline.md)

**Remediation:**
- [Supply Chain Security](../remediation-guides/supply-chain-security.md)

---

## A09:2021 — Security Logging and Monitoring Failures

**Checklist Coverage:**
- [11 — Monitoring & Logging](../audit-checklists/11-monitoring-logging.md): All sections

**Remediation:**
- [Logging and Monitoring](../remediation-guides/logging-and-monitoring.md)

---

## A10:2021 — Server-Side Request Forgery (SSRF)

**Checklist Coverage:**
- [03 — Application Security](../audit-checklists/03-application-security.md): Input validation
- [07 — Infrastructure & Cloud](../audit-checklists/07-infrastructure-cloud.md): Compute security (metadata endpoint)

**Knowledge Base:**
- [Server-Side Request Forgery](../knowledge-base/application-attacks/server-side-request-forgery.md)

**Remediation:**
- [Injection Prevention](../remediation-guides/injection-prevention.md) (SSRF prevention follows similar input validation principles)
