# Security Knowledge Base

The knowledge base is the reference library of attack types, vulnerabilities, and threat patterns. It is organized by attack layer so findings can be quickly cross-referenced during audits.

## Structure

```
knowledge-base/
├── identity-attacks/        Identity and access attack patterns
│   ├── brute-force.md
│   ├── credential-stuffing.md
│   ├── privilege-escalation.md
│   ├── session-hijacking.md
│   └── account-takeover.md
├── application-attacks/     Application-layer attack patterns
│   ├── sql-injection.md
│   ├── command-injection.md
│   ├── cross-site-scripting.md
│   ├── cross-site-request-forgery.md
│   ├── insecure-deserialization.md
│   ├── server-side-request-forgery.md
│   ├── broken-access-control.md
│   └── security-misconfiguration.md
├── infrastructure-attacks/  Cloud and server attack patterns
│   ├── cloud-misconfiguration.md
│   ├── container-escape.md
│   ├── exposed-storage.md
│   └── secrets-exposure.md
├── network-attacks/         Network-layer attack patterns
│   ├── man-in-the-middle.md
│   ├── dns-poisoning.md
│   ├── ddos-attacks.md
│   └── tls-downgrade.md
├── supply-chain-attacks/    Dependency and build pipeline attacks
│   ├── malicious-dependencies.md
│   ├── dependency-confusion.md
│   ├── compromised-build-pipeline.md
│   └── typosquatting.md
├── data-attacks/            Data-focused attack patterns
│   ├── data-exfiltration.md
│   ├── cryptographic-failures.md
│   └── backup-exposure.md
└── client-side-attacks/     Browser and mobile attack patterns
    ├── dom-based-xss.md
    ├── clickjacking.md
    └── local-storage-theft.md
```

## Entry Format

Every knowledge base entry follows this structure:

```markdown
# Attack Name

## Description
What this attack is and how it works.

## Affected Layer
Which audit layer this maps to.

## Attack Mechanism
Step-by-step description of how the attack is executed.

## Detection Checks
How to identify if a system is vulnerable to this attack.

## Impact
What damage can result from successful exploitation.

## Real-World Examples
Notable incidents involving this attack type.

## Mitigation
How to prevent or remediate this vulnerability.

## References
OWASP, CWE, CVE, and other standard references.
```

## Usage

1. During **Phase 4 (Layered Audit)** — Reference relevant attack patterns for each layer
2. During **Phase 5 (Vulnerability ID)** — Match findings to known attack patterns
3. During **Phase 7 (Remediation)** — Use mitigation guidance from entries
