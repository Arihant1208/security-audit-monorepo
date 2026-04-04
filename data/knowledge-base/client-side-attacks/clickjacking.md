# Clickjacking

## Description

Clickjacking (UI redress attack) tricks a user into clicking on something different from what they perceive. The attacker embeds the target application in a transparent iframe and overlays it with a deceptive UI, causing the victim to unknowingly interact with the target application.

## Affected Layer

Client Side

## Attack Mechanism

1. Attacker creates a page that loads the target application in a hidden iframe
2. Attacker overlays deceptive content over the iframe (buttons, forms)
3. Victim interacts with the visible content, but clicks pass through to the iframe
4. Victim unknowingly performs actions on the target application (change settings, transfer funds, grant permissions)

## Detection Checks

- [ ] Is `X-Frame-Options` header set to `DENY` or `SAMEORIGIN`?
- [ ] Is `Content-Security-Policy: frame-ancestors` directive configured?
- [ ] Do sensitive actions require additional confirmation (not just a click)?
- [ ] Is re-authentication required for critical operations?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Unauthorized actions performed by victim | High |
| Permission grants (OAuth consent, admin access) | High |
| Account modification | Medium |
| Social engineering amplification | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Set `X-Frame-Options: DENY` or `SAMEORIGIN` | Critical |
| Set `Content-Security-Policy: frame-ancestors 'self'` | Critical |
| Require confirmation dialogs for sensitive actions | Medium |
| Use SameSite cookies to prevent cross-origin framing abuse | Medium |

## References

- OWASP: Clickjacking (owasp.org/www-community/attacks/Clickjacking)
- CWE-1021: Improper Restriction of Rendered UI Layers
