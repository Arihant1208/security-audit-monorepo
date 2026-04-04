# DOM-Based XSS

## Description

DOM-based XSS occurs when client-side JavaScript reads data from an attacker-controllable source (URL fragment, postMessage, local storage) and passes it to a dangerous sink (innerHTML, eval, document.write) without sanitization. The attack happens entirely in the browser without the malicious payload being sent to the server.

## Affected Layer

Client Side

## Attack Mechanism

1. Attacker crafts a URL with malicious JavaScript in a fragment or parameter
2. Victim visits the URL
3. Client-side JavaScript reads the attacker-controlled value
4. JavaScript writes the value to a dangerous DOM sink
5. Malicious script executes in the victim's browser context

**Common sources:** `location.hash`, `location.search`, `document.referrer`, `window.name`, `postMessage`
**Common sinks:** `innerHTML`, `outerHTML`, `eval()`, `document.write()`, `setTimeout()` with string argument

## Detection Checks

- [ ] Does client-side JavaScript read from user-controllable sources?
- [ ] Are values from URL parameters/fragments used in DOM manipulation?
- [ ] Is `innerHTML`, `outerHTML`, `eval`, or `document.write` used with dynamic data?
- [ ] Is input sanitized before DOM insertion?
- [ ] Is Content Security Policy configured to block inline scripts?
- [ ] Are client-side frameworks using safe rendering (e.g., React's JSX, Angular's sanitizer)?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Session hijacking | High |
| Credential theft | High |
| Account takeover | High |
| Client-side data theft | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Avoid using `innerHTML`, `eval`, `document.write` with dynamic data | Critical |
| Use `textContent` or `createElement` for DOM manipulation | Critical |
| Implement strict Content Security Policy | High |
| Use frameworks with built-in XSS protection (React, Angular, Vue) | High |
| Sanitize dynamic data with DOMPurify before DOM insertion | High |
| Validate all URL-sourced data before use | Medium |

## References

- OWASP: DOM Based XSS (owasp.org/www-community/attacks/DOM_Based_XSS)
- CWE-79: Cross-site Scripting
