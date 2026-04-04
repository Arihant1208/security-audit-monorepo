# Compromised Build Pipeline

## Description

A compromised build pipeline attack targets the CI/CD infrastructure to inject malicious code into software during the build or deployment process. This is one of the most impactful supply chain attacks because it can affect all users of the built software.

## Affected Layer

Supply Chain, DevOps

## Attack Mechanism

1. Attacker gains access to CI/CD system via:
   - Stolen credentials, compromised SCM accounts
   - Vulnerable CI/CD platform
   - Malicious pull request with poisoned pipeline config
   - Compromised build worker/runner
2. Attacker modifies the build process to inject malicious code
3. Malicious code is included in build artifacts
4. Compromised artifacts are deployed to production
5. All users of the software are affected

**Notable examples:** SolarWinds SUNBURST, Codecov bash uploader compromise

## Detection Checks

- [ ] Is CI/CD access restricted with MFA and least privilege?
- [ ] Are pipeline configurations stored as code and reviewed via PR?
- [ ] Are build environments ephemeral (fresh for each build)?
- [ ] Are build artifacts signed and verified before deployment?
- [ ] Is there separation between CI and CD (build vs. deploy permissions)?
- [ ] Are build logs monitored for anomalous activity?
- [ ] Are secrets in CI/CD masked and scoped to specific pipelines?
- [ ] Is there SLSA (Supply-chain Levels for Software Artifacts) compliance?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Mass compromise of all downstream users | Critical |
| Backdoor in production software | Critical |
| Credential theft from build environment | Critical |
| Trust and reputation destruction | Critical |

## Mitigation

| Control | Priority |
|---------|----------|
| Enforce MFA and least privilege on CI/CD accounts | Critical |
| Sign and verify all build artifacts | Critical |
| Use ephemeral build environments | High |
| Review pipeline configuration changes via PR | High |
| Separate build and deploy permissions | High |
| Implement artifact provenance tracking (SLSA) | High |
| Monitor build process for unauthorized changes | Medium |
| Conduct periodic CI/CD security audits | Medium |

## References

- SLSA Framework (slsa.dev)
- CWE-829: Inclusion of Functionality from Untrusted Control Sphere
- OWASP: A08:2021 Software and Data Integrity Failures
