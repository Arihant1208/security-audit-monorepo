# Supply Chain Security — Remediation Guide

## Dependency Management

### Lock Dependencies
```
npm:    package-lock.json (committed, npm ci to install)
Python: requirements.txt with hashes (pip install --require-hashes)
        or poetry.lock / pip-tools
Java:   Gradle lock files or Maven dependency management with versions
Go:     go.sum (committed, verified automatically)
```

### Audit Process for New Dependencies
Before adding a dependency, evaluate:
1. **Maintenance** — Active maintainers? Recent releases?
2. **Popularity** — Downloads/stars? (not proof of safety, but signal)
3. **Security history** — Previous CVEs? Response time?
4. **Scope** — Does it need the access it requests?
5. **Alternatives** — Can this be done without a dependency?
6. **License** — Compatible with your project?

### Automated Scanning
```
Configure in CI/CD:
- npm audit / yarn audit (Node.js)
- pip audit (Python)
- dotnet list package --vulnerable (.NET)
- OWASP Dependency Check (Java, .NET, others)
- Snyk/Trivy (multi-language)
- Renovate/Dependabot for automated update PRs
```

**SLA for patching:**
| Severity | Action Timeline |
|----------|----------------|
| Critical | 48 hours |
| High | 1 week |
| Medium | 1 month |
| Low | Next release cycle |

---

## Registry Security

### Private Registry
- Host internal packages on a private registry
- Proxy public registries through the private registry
- Configure package managers to use private registry as primary source

### Namespace Protection
```
npm:    Use @org/ scoped packages for internal
PyPI:   Consider private index for internal packages
Maven:  Use your organization's group ID
```

### Preventing Dependency Confusion
1. Scope all internal packages
2. Configure registry source explicitly for each scope
3. Claim internal package names on public registries as placeholders
4. Pin exact versions with integrity checksums

---

## Build Pipeline Security

### Hardening CI/CD
```
1. Access control: MFA on CI/CD accounts, least privilege
2. Pipeline config: Reviewed via PR (not edited directly)
3. Environments: Ephemeral build environments (fresh each build)
4. Secrets: Managed by CI/CD secret management, masked in logs
5. Artifacts: Signed with verifiable provenance
6. Approvals: Production deployments require approval
```

### Software Bill of Materials (SBOM)
- Generate SBOM at build time (CycloneDX or SPDX format)
- Include in release artifacts
- Store for incident response capability
- Automate SBOM generation in CI/CD

### SLSA Framework Compliance
| Level | Requirements |
|-------|-------------|
| SLSA 1 | Build process documented |
| SLSA 2 | Version control, hosted build, provenance generated |
| SLSA 3 | Auditable build platform, non-falsifiable provenance |
| SLSA 4 | Two-person review, hermetic builds, reproducible |

---

## Incident Response for Supply Chain Compromise

If a malicious dependency is discovered:

1. **Identify scope** — Which projects use the affected package?
2. **Pin to safe version** — Immediately lock to last known good version
3. **Audit** — Review what the malicious code did (network calls, file access, secrets read)
4. **Rotate credentials** — If build environment secrets could be compromised
5. **Rebuild** — Rebuild all artifacts from clean dependencies
6. **Monitor** — Watch for signs of compromise from the affected period
7. **Report** — Notify the registry and community
