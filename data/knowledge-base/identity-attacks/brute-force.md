# Brute Force Attack

## Description

A brute force attack attempts to gain access to an account or system by systematically trying every possible combination of credentials until the correct one is found. Variants include dictionary attacks (using common passwords), hybrid attacks (combining dictionary words with patterns), and reverse brute force (trying one password against many usernames).

## Affected Layer

Identity & Access Management

## Attack Mechanism

1. Attacker identifies a login endpoint or authentication mechanism
2. Attacker enumerates or obtains a list of valid usernames
3. Attacker submits automated login attempts using password lists or generated combinations
4. Attacker monitors responses for successful authentication
5. If successful, attacker gains access to the compromised account

**Variants:**
- **Online brute force** — Direct attempts against live authentication endpoints
- **Offline brute force** — Cracking stolen password hashes locally
- **Credential spraying** — Trying a few common passwords against many accounts

## Detection Checks

- [ ] Is there a rate limit on authentication endpoints?
- [ ] Is there an account lockout policy after failed attempts?
- [ ] Are failed login attempts logged and monitored?
- [ ] Is CAPTCHA or progressive delay implemented after failed attempts?
- [ ] Does the system detect and block automated login patterns?
- [ ] Are strong password complexity requirements enforced?
- [ ] Is MFA available and enforced for sensitive accounts?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Account compromise | High |
| Data breach (if account has data access) | High |
| Lateral movement (if credentials are reused) | High |
| Service disruption (account lockouts) | Medium |
| Reputation damage | Medium |

## Real-World Examples

- Attacks against SSH servers using common username/password combinations
- WordPress admin panel brute force attacks
- API endpoint credential spraying using leaked credential databases

## Mitigation

| Control | Priority |
|---------|----------|
| Implement rate limiting on all authentication endpoints | Critical |
| Enforce account lockout after N failed attempts (with progressive delays) | Critical |
| Require multi-factor authentication | High |
| Enforce strong password policies (length > complexity) | High |
| Implement CAPTCHA after failed attempts | Medium |
| Monitor and alert on brute force patterns | Medium |
| Use password breach databases to reject compromised passwords | Medium |
| Log all authentication attempts with source IP | Medium |

## References

- OWASP: Brute Force Attack (owasp.org/www-community/attacks/Brute_force_attack)
- CWE-307: Improper Restriction of Excessive Authentication Attempts
- NIST SP 800-63B: Digital Identity Guidelines — Authentication
