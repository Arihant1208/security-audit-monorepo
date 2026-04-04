# Typosquatting

## Description

Typosquatting in the software supply chain involves publishing malicious packages with names that are intentional misspellings or variations of popular packages. Developers who mistype a package name or fail to notice the difference install the malicious package.

## Affected Layer

Supply Chain

## Attack Mechanism

1. Attacker identifies popular packages (lodash, requests, express)
2. Attacker creates packages with similar names: `lodahs`, `reqeusts`, `expresss`
3. Developers mistype the package name during installation
4. Malicious package is installed and potentially executes harmful code
5. Attacker steals data, installs backdoors, or exfiltrates secrets

## Detection Checks

- [ ] Are dependencies installed from verified exact names (copy-paste, not typed)?
- [ ] Is there a process to verify package names before adoption?
- [ ] Are lockfiles used to prevent accidental dependency changes?
- [ ] Is dependency scanning configured to flag suspicious packages?
- [ ] Are new dependencies reviewed in code review?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Credential theft | Critical |
| Backdoor installation | Critical |
| Build environment compromise | High |
| Data exfiltration | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Use lockfiles and verify dependency names in code review | Critical |
| Copy-paste package names from official documentation | High |
| Use organization-scoped packages for internal use | High |
| Run dependency scanning that flags suspicious/new packages | Medium |
| Claim common typos of your own packages on public registries | Low |

## References

- CWE-829: Inclusion of Functionality from Untrusted Control Sphere
- OWASP: A06:2021 Vulnerable and Outdated Components
