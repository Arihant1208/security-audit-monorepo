# Dependency Confusion

## Description

Dependency confusion exploits the way package managers resolve packages when both a public and private registry contain a package with the same name. By publishing a higher-versioned package to the public registry, an attacker can trick builds into pulling the malicious public package instead of the intended private one.

## Affected Layer

Supply Chain, DevOps

## Attack Mechanism

1. Attacker discovers names of internal/private packages (via leaked configs, error messages, code repos)
2. Attacker publishes packages with the same names on public registries (npm, PyPI, etc.)
3. Attacker sets the version number higher than the internal package
4. Package manager prioritizes the higher version (or public registry) during resolution
5. Malicious package is installed in the build environment
6. Install/post-install scripts execute attacker's code

## Detection Checks

- [ ] Are private packages scoped with an organization prefix (@org/package)?
- [ ] Is the package manager configured to use private registry for internal packages?
- [ ] Are public registry lookups restricted for internal package names?
- [ ] Are package sources explicitly defined in configuration?
- [ ] Is there monitoring for public packages matching internal package names?
- [ ] Are install scripts disabled or reviewed in CI/CD?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Build pipeline compromise | Critical |
| Credential theft from build environment | Critical |
| Code injection into production builds | Critical |
| Lateral movement from build systems | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Use scoped/namespaced packages for all internal packages | Critical |
| Configure package manager to use private registry exclusively for internal names | Critical |
| Claim internal package names on public registries (as placeholders) | High |
| Lock dependency sources in package manager configuration | High |
| Monitor public registries for packages matching internal names | Medium |
| Use a package proxy/mirror that controls source resolution | Medium |

## References

- CWE-427: Uncontrolled Search Path Element
- Alex Birsan's "Dependency Confusion" research (2021)
