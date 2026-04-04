# Cross-Site Scripting (XSS)

## Description

Cross-site scripting allows attackers to inject malicious scripts into web pages viewed by other users. The victim's browser executes the attacker's script in the context of the trusted website, enabling cookie theft, session hijacking, defacement, and redirection.

## Affected Layer

Application Security, Client Side

## Attack Mechanism

### Reflected XSS
1. Attacker crafts a URL containing malicious script in a parameter
2. Victim clicks the link (via phishing, social engineering)
3. Server reflects the parameter into the response HTML without encoding
4. Victim's browser executes the script

### Stored XSS
1. Attacker submits malicious script via an input field (comment, profile, message)
2. Application stores the script in the database without sanitization
3. When other users view the content, the stored script executes in their browsers

### DOM-Based XSS
1. Client-side JavaScript reads data from an attacker-controllable source (URL, postMessage)
2. JavaScript writes the data to the DOM without sanitization
3. Malicious script executes in the browser without server involvement

## Detection Checks

- [ ] Is output encoding applied when rendering user data in HTML?
- [ ] Is a Content Security Policy (CSP) header configured?
- [ ] Are templating engines used with auto-escaping enabled?
- [ ] Is user input sanitized before DOM insertion in client-side code?
- [ ] Are `innerHTML`, `document.write`, `eval` used with user data?
- [ ] Is the `X-XSS-Protection` header set (for legacy browsers)?
- [ ] Are rich text inputs sanitized with a whitelist-based sanitizer?
- [ ] Are cookies marked `HttpOnly` to prevent script access?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Session hijacking (cookie theft) | High |
| Account takeover | High |
| Credential theft (fake login forms) | High |
| Malware distribution | High |
| Defacement | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Apply context-appropriate output encoding (HTML, JS, URL, CSS) | Critical |
| Use templating engines with auto-escaping enabled by default | Critical |
| Implement strict Content Security Policy (CSP) | High |
| Set `HttpOnly` flag on session cookies | High |
| Sanitize rich text with whitelist-based libraries (e.g., DOMPurify) | High |
| Avoid `innerHTML`, `document.write`, `eval` with user data | High |
| Validate and sanitize all user inputs server-side | Medium |
| Use `X-Content-Type-Options: nosniff` header | Medium |

## References

- OWASP: A03:2021 Injection
- OWASP: Cross Site Scripting (owasp.org/www-community/attacks/xss)
- CWE-79: Cross-site Scripting (XSS)
