# Malicious Dependencies

## Description

Malicious dependencies are packages published to package registries (npm, PyPI, Maven, NuGet) that contain intentionally harmful code. When installed, they can steal credentials, open backdoors, exfiltrate data, or modify system behavior.

## Affected Layer

Supply Chain

## Attack Mechanism

1. Attacker creates or takes over a package on a public registry
2. Malicious code is hidden in install scripts, obfuscated code, or build hooks
3. Developers install the package (directly or as transitive dependency)
4. Malicious code executes during install, build, or runtime
5. Attacker achieves data theft, credential harvesting, or backdoor installation

**Vectors:**
- Publishing new malicious packages with appealing names
- Compromising maintainer accounts of popular packages
- Injecting malicious code in package updates
- Hijacking abandoned but still-used packages

## Detection Checks

- [ ] Are dependencies audited before adoption (popularity, maintainers, code review)?
- [ ] Is dependency scanning enabled in CI/CD (Snyk, npm audit, pip audit)?
- [ ] Are install scripts reviewed for new dependencies?
- [ ] Are dependencies pinned to exact versions with integrity checksums?
- [ ] Is a lockfile committed and verified?
- [ ] Are transitive dependencies monitored?
- [ ] Is there a private registry or proxy for package management?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Credential theft (env vars, keys) | Critical |
| Backdoor installation | Critical |
| Data exfiltration | Critical |
| Build pipeline compromise | Critical |
| Widespread impact (if popular package) | Critical |

## Mitigation

| Control | Priority |
|---------|----------|
| Pin dependency versions and verify checksums (lockfiles) | Critical |
| Run automated dependency vulnerability scanning in CI/CD | Critical |
| Review new dependencies before adoption | High |
| Use a private package registry or proxy | High |
| Monitor for dependency updates and review changelogs | High |
| Limit install scripts using `--ignore-scripts` where safe | Medium |
| Audit transitive dependencies periodically | Medium |
| Implement Software Bill of Materials (SBOM) | Medium |

## References

- OWASP: A06:2021 Vulnerable and Outdated Components
- CWE-829: Inclusion of Functionality from Untrusted Control Sphere
