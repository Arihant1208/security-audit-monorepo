# Session Hijacking

## Description

Session hijacking involves an attacker taking over a legitimate user's session to impersonate them. The attacker obtains or predicts the session token and uses it to gain authenticated access without knowing the user's credentials.

## Affected Layer

Identity & Access Management, Application Security

## Attack Mechanism

### Token Theft
1. Attacker intercepts session tokens via:
   - Network sniffing (unencrypted traffic)
   - Cross-site scripting (XSS) to steal cookies
   - Man-in-the-middle attack
   - Malware on user's device
   - Access to server logs containing tokens
2. Attacker replays the stolen token to impersonate the user

### Session Fixation
1. Attacker obtains a valid session ID from the application
2. Attacker tricks the victim into authenticating with that session ID
3. After authentication, the attacker uses the same session ID (now authenticated)

### Session Prediction
1. Attacker analyzes session token generation patterns
2. Attacker predicts valid session tokens if the generation is weak
3. Attacker uses predicted tokens to access active sessions

## Detection Checks

- [ ] Are session tokens transmitted only over HTTPS?
- [ ] Are cookies marked with `Secure`, `HttpOnly`, and `SameSite` flags?
- [ ] Is session ID regenerated after login (prevents session fixation)?
- [ ] Are session tokens generated using cryptographically secure random generators?
- [ ] Is there session expiration (both idle timeout and absolute timeout)?
- [ ] Are sessions invalidated on logout (server-side)?
- [ ] Is there session binding (IP, device fingerprint)?
- [ ] Are concurrent session limits enforced?
- [ ] Does the application detect and alert on session anomalies?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Full account impersonation | Critical |
| Unauthorized data access | High |
| Unauthorized transactions | High |
| Privilege escalation (if admin session hijacked) | Critical |
| Compliance violations | High |

## Real-World Examples

- XSS vulnerability allowing JavaScript to exfiltrate session cookies
- Session tokens passed in URLs and logged in proxy/server logs
- Cookie not marked HttpOnly, accessible to client-side scripts
- Session not invalidated after password change

## Mitigation

| Control | Priority |
|---------|----------|
| Enforce HTTPS everywhere (HSTS) | Critical |
| Set cookie flags: `Secure`, `HttpOnly`, `SameSite=Strict` | Critical |
| Regenerate session ID after authentication | Critical |
| Use cryptographically secure session token generation | Critical |
| Implement session expiration (idle: 15-30 min, absolute: 8-24 hours) | High |
| Invalidate sessions server-side on logout | High |
| Invalidate all sessions on password change | High |
| Implement session anomaly detection (IP change, device change) | Medium |
| Limit concurrent sessions per user | Medium |
| Never transmit session tokens in URLs | Critical |

## References

- OWASP: Session Hijacking Attack (owasp.org/www-community/attacks/Session_hijacking_attack)
- OWASP: Session Fixation (owasp.org/www-community/attacks/Session_fixation)
- CWE-384: Session Fixation
- CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute
- CWE-1004: Sensitive Cookie Without 'HttpOnly' Flag
