# 02 — Identity & Access Management Checklist

## Authentication

- [ ] Strong password policy enforced (minimum 12 characters, check against breach databases)
- [ ] Multi-factor authentication available and enforced for privileged accounts
- [ ] Account lockout or progressive delays after failed login attempts
- [ ] Rate limiting on authentication endpoints
- [ ] Credentials stored using strong hashing (bcrypt/scrypt/Argon2 with salt)
- [ ] Default credentials changed on all systems
- [ ] Authentication over encrypted channels only (HTTPS)

## Session Management

- [ ] Session tokens generated with cryptographically secure random generator
- [ ] Session ID regenerated after authentication
- [ ] Session cookies have `Secure`, `HttpOnly`, `SameSite` flags
- [ ] Session timeout implemented (idle and absolute)
- [ ] Sessions invalidated on logout (server-side)
- [ ] All sessions invalidated on password change
- [ ] Concurrent session limits enforced (if applicable)
- [ ] Session tokens not exposed in URLs or logs

## Authorization

- [ ] Server-side authorization enforced on every request
- [ ] Deny-by-default access control policy
- [ ] Role-based (RBAC) or attribute-based (ABAC) access control implemented
- [ ] Resource ownership verified on every data access (no IDOR)
- [ ] Admin functions require admin role verification
- [ ] Authorization logic centralized (not scattered in codebase)
- [ ] Privilege escalation between roles tested and prevented

## Password Recovery

- [ ] Reset tokens are cryptographically random and single-use
- [ ] Reset tokens expire within 15-30 minutes
- [ ] Old password invalidated immediately upon reset
- [ ] Account enumeration not possible via reset flow
- [ ] Reset notifications sent to registered email/phone
- [ ] Security questions (if used) are not guessable from public info

## OAuth / SSO

- [ ] OAuth redirect URIs are strictly validated (exact match, no wildcards)
- [ ] State parameter used to prevent CSRF in OAuth flows
- [ ] Token validation includes issuer, audience, and expiration checks
- [ ] Refresh tokens are rotated on use
- [ ] SSO configuration follows provider's security best practices

## Service Identity

- [ ] Service-to-service authentication implemented (mTLS, tokens)
- [ ] Service credentials rotated regularly
- [ ] Service accounts follow least privilege
- [ ] No shared service credentials across environments
