# Credential Stuffing

## Description

Credential stuffing is an automated attack where stolen username/password pairs (from data breaches) are used to attempt logins on other services. It exploits the widespread practice of password reuse across multiple sites.

## Affected Layer

Identity & Access Management

## Attack Mechanism

1. Attacker obtains large credential databases from previous data breaches
2. Attacker uses automated tools to test credentials against target login endpoints
3. Tools rotate through proxy networks to evade IP-based blocking
4. Successful logins are harvested for account takeover
5. Compromised accounts are used for fraud, data theft, or sold on dark markets

**Key difference from brute force:** Credential stuffing uses *known valid credential pairs* rather than generating random combinations, making it significantly more efficient.

## Detection Checks

- [ ] Are login endpoints rate-limited per user and per IP?
- [ ] Is there detection for login attempts from unusual geolocations?
- [ ] Are known breached credentials blocked at registration and login?
- [ ] Is bot detection (behavioral analysis, CAPTCHA) implemented?
- [ ] Are login attempts from known proxy/VPN/Tor networks flagged?
- [ ] Is device fingerprinting used to detect new device logins?
- [ ] Are users notified of logins from new devices or locations?
- [ ] Is MFA enforced or strongly encouraged?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Mass account compromise | Critical |
| Customer data breach | High |
| Financial fraud (if payment data accessible) | High |
| Brand and trust damage | High |
| Regulatory penalties (GDPR, CCPA) | High |

## Real-World Examples

- Large-scale credential stuffing attacks against streaming services using billions of leaked credentials
- E-commerce account takeovers leading to fraudulent purchases
- Corporate email account compromises through credential reuse

## Mitigation

| Control | Priority |
|---------|----------|
| Enforce multi-factor authentication | Critical |
| Check passwords against breach databases (e.g., Have I Been Pwned) | Critical |
| Implement advanced bot detection (behavioral analysis) | High |
| Rate limit login endpoints with progressive penalties | High |
| Implement device fingerprinting and anomaly detection | High |
| Alert users on login from new device/location | Medium |
| Block login attempts from known malicious IP ranges | Medium |
| Encourage/require unique passwords via password manager guidance | Medium |

## References

- OWASP: Credential Stuffing (owasp.org/www-community/attacks/Credential_stuffing)
- CWE-521: Weak Password Requirements
- CWE-307: Improper Restriction of Excessive Authentication Attempts
