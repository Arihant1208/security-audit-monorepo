# Broken Access Control

## Description

Broken access control occurs when restrictions on what authenticated users are permitted to do are not properly enforced. Attackers can exploit these flaws to access unauthorized functionality or data, modify other users' data, or perform administrative operations.

## Affected Layer

Application Security, Identity & Access Management

## Attack Mechanism

1. Application enforces access control only at the UI level (hiding buttons/links)
2. Attacker directly accesses API endpoints or manipulates parameters
3. Server fails to verify user permissions for the requested operation
4. Attacker accesses unauthorized data or performs unauthorized actions

**Common patterns:**
- Bypassing path-based access controls by URL manipulation
- Modifying resource identifiers to access other users' data (IDOR)
- Accessing admin API endpoints without admin role verification
- Manipulating JWT claims or cookies to elevate privileges
- Exploiting metadata manipulation (HTTP headers, hidden fields)

## Detection Checks

- [ ] Are access control checks enforced server-side (not just UI)?
- [ ] Is deny-by-default applied (explicit allow, implicit deny)?
- [ ] Are resource ownership checks performed on every data access?
- [ ] Can users access admin functions by modifying the URL or API request?
- [ ] Are access control rules centralized (not scattered across codebase)?
- [ ] Is access control tested in automated test suites?
- [ ] Are access control failures logged and monitored?
- [ ] Are CORS policies properly restrictive?
- [ ] Is directory listing disabled on web servers?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Unauthorized data access | Critical |
| Data modification or deletion | Critical |
| Administrative function access | Critical |
| Compliance violations (GDPR, HIPAA) | High |
| Complete system compromise | Critical |

## Mitigation

| Control | Priority |
|---------|----------|
| Implement server-side access control on every endpoint | Critical |
| Apply deny-by-default: require explicit permission grants | Critical |
| Centralize access control logic in middleware/framework layer | Critical |
| Enforce record-level ownership checks | High |
| Use framework-provided access control mechanisms | High |
| Disable web server directory listing and file metadata | High |
| Invalidate server-side sessions on logout | High |
| Limit CORS to explicitly trusted origins | High |
| Log access control failures and alert on anomalies | Medium |
| Include access control tests in CI/CD pipeline | Medium |

## References

- OWASP: A01:2021 Broken Access Control
- CWE-284: Improper Access Control
- CWE-285: Improper Authorization
- CWE-639: Authorization Bypass Through User-Controlled Key
