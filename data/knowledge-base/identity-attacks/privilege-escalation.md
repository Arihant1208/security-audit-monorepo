# Privilege Escalation

## Description

Privilege escalation occurs when an attacker gains elevated access rights beyond what is authorized. **Vertical escalation** grants a lower-privileged user higher privileges (e.g., user → admin). **Horizontal escalation** allows a user to access another user's resources at the same privilege level.

## Affected Layer

Identity & Access Management, Application Security

## Attack Mechanism

### Vertical Escalation
1. Attacker authenticates as a low-privilege user
2. Attacker identifies a mechanism to gain higher privileges:
   - Exploiting a vulnerability in role assignment
   - Manipulating tokens or session data to add admin roles
   - Accessing admin endpoints that lack proper authorization checks
   - Exploiting insecure direct object references (IDOR) to modify own role
3. Attacker performs admin-level operations

### Horizontal Escalation
1. Attacker authenticates as a normal user
2. Attacker manipulates identifiers (user IDs, resource IDs) in requests
3. Application fails to verify that the requesting user owns the resource
4. Attacker accesses another user's data or functionality

## Detection Checks

- [ ] Are authorization checks enforced on every endpoint (not just the UI)?
- [ ] Do API endpoints validate user permissions server-side?
- [ ] Are role assignments protected against manipulation?
- [ ] Can users modify their own role/privilege claims (in tokens, cookies, or parameters)?
- [ ] Are IDOR vulnerabilities present (predictable resource IDs without ownership checks)?
- [ ] Are admin endpoints access-controlled separately from user endpoints?
- [ ] Is there separation between authentication and authorization logic?
- [ ] Are privilege changes logged and monitored?
- [ ] Is the principle of least privilege applied to all roles?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Full system compromise (vertical) | Critical |
| Unauthorized data access (horizontal) | High |
| Data modification or deletion | High |
| Compliance violations | High |
| Lateral movement potential | High |

## Real-World Examples

- API endpoint that checks role in JWT claims without server-side validation
- Admin panel accessible by changing URL path without authorization check
- User profile endpoint returning data for any user ID without ownership verification
- Function-level authorization missing on destructive operations

## Mitigation

| Control | Priority |
|---------|----------|
| Implement server-side authorization on every endpoint | Critical |
| Use framework-level authorization middleware (not manual checks) | Critical |
| Validate resource ownership on every data access | Critical |
| Never trust client-side role/permission claims | Critical |
| Apply principle of least privilege to all roles | High |
| Use indirect object references (UUIDs, not sequential IDs) | High |
| Implement separate authorization for admin functions | High |
| Log and alert on privilege change events | Medium |
| Conduct regular authorization testing | Medium |

## References

- OWASP: A01:2021 Broken Access Control
- CWE-269: Improper Privilege Management
- CWE-639: Authorization Bypass Through User-Controlled Key (IDOR)
- CWE-862: Missing Authorization
