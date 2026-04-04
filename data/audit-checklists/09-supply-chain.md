# 09 — Supply Chain Security Checklist

## Dependency Management

- [ ] Dependencies pinned to exact versions in lockfiles
- [ ] Lockfiles committed to source control
- [ ] Dependency checksums verified (integrity hashes)
- [ ] New dependencies reviewed before adoption (popularity, maintenance, security)
- [ ] Transitive dependencies monitored

## Vulnerability Scanning

- [ ] Automated dependency vulnerability scanning in CI/CD
- [ ] Critical vulnerability alerts trigger immediate review
- [ ] SLA defined for patching vulnerable dependencies (critical: 48h, high: 1 week)
- [ ] Dependency scan results tracked over time

## Registry Security

- [ ] Private package registry used for internal packages
- [ ] Internal packages use scoped names (@org/package)
- [ ] Public registry access limited to approved packages (or proxied)
- [ ] Registry accounts secured with MFA
- [ ] Publishing permissions restricted to authorized maintainers

## License Compliance

- [ ] Dependency licenses inventoried
- [ ] License compatibility verified (no copyleft in proprietary code unless approved)
- [ ] License check automated in CI/CD
- [ ] License policy documented and enforced

## Software Bill of Materials (SBOM)

- [ ] SBOM generated for each build/release
- [ ] SBOM includes direct and transitive dependencies with versions
- [ ] SBOM stored and accessible for incident response
- [ ] SBOM format follows standards (SPDX, CycloneDX)

## Third-Party Integrations

- [ ] Third-party services assessed for security before integration
- [ ] API keys for third-party services scoped to minimum access
- [ ] Third-party data handling reviewed against privacy requirements
- [ ] Vendor security certifications verified (SOC 2, ISO 27001)
- [ ] Incident notification clauses in vendor agreements
