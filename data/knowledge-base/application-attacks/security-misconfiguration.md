# Security Misconfiguration

## Description

Security misconfiguration is the most common vulnerability class. It results from insecure default configurations, incomplete configuration, misconfigured HTTP headers, overly permissive cloud settings, verbose error messages, or unnecessary features/services enabled.

## Affected Layer

Application Security, Infrastructure, Network

## Attack Mechanism

1. Attacker scans for common misconfigurations (default credentials, open ports, debug modes)
2. Attacker discovers misconfigured services or overly permissive settings
3. Attacker exploits the misconfiguration to gain information or access
4. Misconfiguration provides a foothold for further attacks

**Common misconfigurations:**
- Default credentials on admin panels, databases, or services
- Debug mode enabled in production
- Unnecessary HTTP methods enabled (TRACE, OPTIONS, DELETE)
- Directory listing enabled
- Missing security headers
- Overly permissive CORS
- Cloud storage buckets with public access
- Unnecessary services running

## Detection Checks

- [ ] Are default credentials changed on all systems and services?
- [ ] Is debug/development mode disabled in production?
- [ ] Are unnecessary HTTP methods disabled?
- [ ] Are security headers configured (CSP, HSTS, X-Frame-Options, etc.)?
- [ ] Are error pages generic (no stack traces or internal details)?
- [ ] Is directory listing disabled?
- [ ] Are all unnecessary features, ports, and services disabled?
- [ ] Is the software up to date with security patches?
- [ ] Are cloud resource permissions following least privilege?
- [ ] Is there a configuration hardening baseline?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Information disclosure | Medium-High |
| Unauthorized access (default credentials) | Critical |
| Full system compromise (debug mode, exposed admin) | Critical |
| Data breach (misconfigured storage) | High |
| Expanded attack surface | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Implement a hardening baseline for all environments | Critical |
| Change all default credentials before deployment | Critical |
| Disable debug mode, stack traces, and verbose errors in production | Critical |
| Remove or disable unnecessary features, services, and ports | High |
| Configure security headers on all HTTP responses | High |
| Implement automated configuration scanning in CI/CD | High |
| Use infrastructure-as-code to enforce consistent configuration | High |
| Conduct regular configuration audits | Medium |
| Implement a patch management process | Medium |

## References

- OWASP: A05:2021 Security Misconfiguration
- CWE-16: Configuration
- CIS Benchmarks (cisecurity.org/cis-benchmarks)
