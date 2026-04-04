# Secrets Exposure

## Description

Secrets exposure occurs when sensitive credentials (API keys, passwords, tokens, certificates, private keys) are inadvertently committed to source code, embedded in container images, logged in plain text, or stored in insecure locations.

## Affected Layer

Infrastructure & Cloud, Application Security, DevOps

## Attack Mechanism

1. Attacker searches for exposed secrets in:
   - Public repositories (GitHub, GitLab, Bitbucket)
   - Container images (Docker Hub, registries)
   - Application logs and error messages
   - Configuration files in deployed applications
   - Client-side source code (API keys in JavaScript)
2. Attacker uses the credentials to access the associated service
3. Attacker pivots to further systems using the compromised credentials

## Detection Checks

- [ ] Are secrets stored in a dedicated secrets manager (Vault, AWS Secrets Manager, Azure Key Vault)?
- [ ] Is there pre-commit secret scanning configured (GitLeaks, TruffleHog)?
- [ ] Are secrets excluded from version control (.gitignore)?
- [ ] Is the git history clean of previously committed secrets?
- [ ] Are secrets injected at runtime (not baked into images or configs)?
- [ ] Are logs scrubbed of sensitive values?
- [ ] Is there a secret rotation policy?
- [ ] Are expired/unused secrets decommissioned?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Service compromise via leaked API keys | Critical |
| Database access via leaked credentials | Critical |
| Cloud account compromise | Critical |
| Lateral movement to associated systems | High |
| Supply chain compromise (if deploy keys leaked) | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Use a secrets management system for all credentials | Critical |
| Implement pre-commit secret scanning hooks | Critical |
| Revoke and rotate any leaked secrets immediately | Critical |
| Inject secrets at runtime via environment or secrets manager | High |
| Scrub git history if secrets were previously committed | High |
| Never log secret values — use redaction filters | High |
| Implement automated secret rotation | Medium |
| Scan container images for embedded secrets | Medium |
| Audit and decommission unused secrets regularly | Medium |

## References

- OWASP: A02:2021 Cryptographic Failures
- CWE-798: Use of Hard-coded Credentials
- CWE-532: Insertion of Sensitive Information into Log File
