# Cross-Site Request Forgery (CSRF)

## Description

CSRF forces an authenticated user's browser to send a forged HTTP request (including session cookies) to a vulnerable web application. The attacker tricks the victim into performing actions they didn't intend, such as changing their email, transferring funds, or modifying settings.

## Affected Layer

Application Security

## Attack Mechanism

1. Victim is authenticated to the target application (active session)
2. Attacker crafts a malicious page with a hidden form or request targeting the application
3. Victim visits the attacker's page (via link, email, ad)
4. Victim's browser automatically includes session cookies with the forged request
5. Application processes the request as legitimate because the session is valid

## Detection Checks

- [ ] Are anti-CSRF tokens used on all state-changing requests?
- [ ] Are CSRF tokens validated server-side on every state-changing request?
- [ ] Is the `SameSite` cookie attribute set to `Strict` or `Lax`?
- [ ] Is the `Origin` or `Referer` header validated for state-changing requests?
- [ ] Are GET requests side-effect-free (no state changes)?
- [ ] Is re-authentication required for sensitive operations?
- [ ] Are custom headers (e.g., `X-Requested-With`) required for API calls?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Unauthorized state changes (settings, email, password) | High |
| Financial transactions | High |
| Account compromise (if email/password changed) | High |
| Data modification | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Implement CSRF tokens (synchronizer token pattern) | Critical |
| Set `SameSite=Strict` or `SameSite=Lax` on session cookies | High |
| Validate `Origin` header on state-changing requests | High |
| Require re-authentication for sensitive operations | High |
| Ensure GET requests are idempotent (no side effects) | Medium |
| Use custom request headers for AJAX calls | Medium |

## References

- OWASP: Cross-Site Request Forgery (owasp.org/www-community/attacks/csrf)
- CWE-352: Cross-Site Request Forgery
