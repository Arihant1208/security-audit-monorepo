# Exposed Storage Buckets

## Description

Exposed storage (S3 buckets, Azure Blob containers, GCS buckets) occurs when cloud storage resources are configured with public or overly permissive access policies, allowing unauthorized users to read, list, or write data.

## Affected Layer

Infrastructure & Cloud, Data Security

## Attack Mechanism

1. Attacker scans for publicly accessible storage URLs (using enumeration tools or search engines)
2. Attacker discovers storage resources with overly permissive ACLs or policies
3. Attacker reads sensitive data (customer records, backups, credentials, source code)
4. In write-enabled cases, attacker modifies or plants malicious content

## Detection Checks

- [ ] Are bucket/container policies set to private by default?
- [ ] Are public access block settings enabled at the account level?
- [ ] Is there monitoring for public access changes?
- [ ] Are bucket policies audited regularly?
- [ ] Are pre-signed URLs used instead of public access for sharing?
- [ ] Are access logs enabled on storage resources?
- [ ] Is data classification applied to stored content?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Data breach (PII, financial, credentials) | Critical |
| Regulatory violations (GDPR, HIPAA, PCI) | Critical |
| Intellectual property theft | High |
| Data manipulation or defacement | High |
| Malware distribution (if writable) | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Enable account-level public access blocking | Critical |
| Set all buckets/containers to private by default | Critical |
| Implement automated scanning for public storage | Critical |
| Use pre-signed URLs for temporary access | High |
| Enable storage access logging | High |
| Apply data classification and encryption | High |
| Implement bucket policies via IaC (enforced, auditable) | Medium |
| Alert on policy changes that expose storage | Medium |

## References

- CWE-284: Improper Access Control
- CIS Cloud Benchmarks — Storage sections
- OWASP: A01:2021 Broken Access Control
