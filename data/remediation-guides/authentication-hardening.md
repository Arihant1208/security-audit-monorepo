# Authentication Hardening — Remediation Guide

## Password Storage

### Requirement
Passwords must be hashed with a strong, salted algorithm.

### Recommended Algorithms (in order of preference)
1. **Argon2id** — Winner of the Password Hashing Competition
2. **bcrypt** — Widely supported, time-tested
3. **scrypt** — Memory-hard, good alternative

### Configuration Guidelines

**bcrypt:**
```
Work factor: minimum 12 (adjust for ~250ms hash time on your hardware)
```

**Argon2id:**
```
Memory: 64 MB minimum
Iterations: 3 minimum
Parallelism: 1
Salt: 16 bytes (random)
Output: 32 bytes
```

### Never Use
- MD5, SHA-1, SHA-256 alone (too fast, no salt by default)
- Custom/homegrown hashing
- Encryption instead of hashing for passwords

---

## Multi-Factor Authentication

### Implementation Priorities
1. Enforce MFA for all admin/privileged accounts (Critical)
2. Offer MFA for all user accounts (High)
3. Require MFA for sensitive operations even within authenticated sessions (High)

### MFA Methods (strongest to weakest)
1. Hardware security keys (FIDO2/WebAuthn)
2. Authenticator apps (TOTP — Google Authenticator, Authy)
3. Push notifications
4. SMS OTP (vulnerable to SIM swapping — use as fallback only)

### Recovery
- Provide backup codes during MFA enrollment
- Store recovery codes hashed (like passwords)
- Require identity verification for MFA reset

---

## Password Policy

### Modern Best Practices (NIST SP 800-63B)
- Minimum 12 characters length
- No complexity rules (uppercase, numbers, symbols) — they reduce usability without improving security
- Check against breached password databases (Have I Been Pwned API)
- No periodic mandatory password rotation (change only when compromised)
- Allow all printable characters including spaces
- Allow paste into password fields (supports password managers)

---

## Rate Limiting on Authentication

### Configuration
```
Failed login attempts:
- 5 failures → 30-second delay
- 10 failures → 5-minute lockout
- 20 failures → 30-minute lockout + alert

Per-IP limits:
- 20 login attempts/minute per IP
- 100 login attempts/hour per IP

Global:
- Monitor for distributed attacks (many IPs, same target)
```

### Response to Rate Limiting
- Return generic "invalid credentials" message (no user enumeration)
- Log all rate-limited attempts with source IP
- Alert security team on sustained attacks
- Consider CAPTCHA after 3 failed attempts

---

## Session Management

### Session Configuration
```
Session ID: Minimum 128 bits of randomness (cryptographic PRNG)
Idle timeout: 15-30 minutes (adjustable by sensitivity)
Absolute timeout: 8-24 hours
Cookie flags: Secure, HttpOnly, SameSite=Strict
```

### Session Lifecycle
1. Generate new session ID after successful authentication
2. Validate session on every request (server-side)
3. Invalidate session on logout (delete server-side)
4. Invalidate all sessions on password change
5. Set concurrent session limits if appropriate

### Token-Based Authentication (JWT)
- Keep access tokens short-lived (5-15 minutes)
- Use refresh tokens with rotation (invalidate old on use)
- Validate all claims: `iss`, `aud`, `exp`, `iat`
- Store refresh tokens in HttpOnly cookies (not localStorage)
- Implement token revocation for logout

---

## Account Recovery

### Secure Password Reset Flow
1. User requests reset → generate cryptographic random token
2. Send token via registered email (not in URL query params if possible)
3. Token expires in 15-30 minutes
4. Token is single-use (invalidated after use or new request)
5. Old password invalidated immediately on reset
6. All active sessions terminated after reset
7. Notify user of password change via email

### Avoid
- Security questions (often guessable)
- Sending passwords via email
- Revealing whether an account exists via the reset flow
