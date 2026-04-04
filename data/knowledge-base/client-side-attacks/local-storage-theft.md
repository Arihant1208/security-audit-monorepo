# Local Storage Theft

## Description

Local storage theft occurs when an attacker extracts sensitive data stored in the browser's localStorage or sessionStorage. Unlike cookies, these storage mechanisms have no server-controlled security flags (HttpOnly, Secure, SameSite) and are accessible to any JavaScript running on the page.

## Affected Layer

Client Side

## Attack Mechanism

1. Attacker exploits an XSS vulnerability in the application
2. Injected JavaScript reads from `localStorage` or `sessionStorage`
3. Attacker exfiltrates tokens, user data, or session information
4. Attacker uses stolen tokens for account impersonation

## Detection Checks

- [ ] Are authentication tokens stored in localStorage or sessionStorage?
- [ ] Is sensitive user data stored in browser storage?
- [ ] Is the application protected against XSS (the prerequisite for this attack)?
- [ ] Are tokens in browser storage short-lived?
- [ ] Is Content Security Policy configured to prevent script injection?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Token theft and account takeover | High |
| Session impersonation | High |
| Sensitive data exposure | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Store authentication tokens in HttpOnly cookies (not localStorage) | Critical |
| Prevent XSS vulnerabilities (eliminates the attack vector) | Critical |
| Minimize sensitive data in browser storage | High |
| Implement strict Content Security Policy | High |
| Use short-lived tokens with server-side refresh | Medium |

## References

- OWASP: HTML5 Security
- CWE-922: Insecure Storage of Sensitive Information
