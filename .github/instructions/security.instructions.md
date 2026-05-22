---
description: "Use when implementing authentication, authorization, input validation, secrets management, rate limiting, audit logging, dependency security, or reviewing code for vulnerabilities."
---

# Security Standards

## Input Validation
- Validate ALL external input at the boundary (first thing in the handler)
- Use strict schemas (Zod/Pydantic) — allowlist fields, reject unknown
- Validate type, length, format, range — not just presence
- Sanitize HTML output (XSS prevention)
- Parameterize all database queries (SQL injection prevention)
- Reject oversized payloads (request body size limits)

## Authentication
- Tokens validated on every request (not cached indefinitely)
- Check token expiry, signature, audience, issuer
- Secure token storage (httpOnly cookies, not localStorage)
- Implement token refresh with short-lived access tokens
- Rate limit login attempts (prevent brute force)
- Account lockout after N failed attempts

## Authorization
- RBAC checked at the API layer (not just UI)
- Verify resource ownership: user can only access their own data
- Admin operations require explicit admin role check
- Never trust client-side role claims
- Audit all authorization failures

## Secrets Management
- Secrets in environment variables or secret manager (never in code)
- Never log secrets, tokens, API keys, or passwords
- Never include secrets in error messages or responses
- Rotate secrets on schedule and on suspected compromise
- Use `.env.example` with dummy values for documentation

## Rate Limiting
- All public endpoints rate-limited
- Stricter limits on auth endpoints (login, register, forgot-password)
- Per-user AND per-IP limiting
- Return 429 with `Retry-After` header
- Log rate limit violations for abuse detection

## Dependency Security
- Review new dependencies before adding (maintainers, downloads, age)
- Run `npm audit` / `pip audit` in CI
- Pin dependency versions (use lockfiles)
- Update dependencies on schedule (monthly minimum)
- Never auto-merge dependency updates without review

## Audit Logging
- Log all state-changing operations (create, update, delete)
- Include: who, what, when, from where (userId, action, timestamp, IP)
- Never log sensitive data (passwords, tokens, PII beyond what's needed)
- Immutable audit logs (append-only, no modification)
- Retention policy aligned with compliance requirements

## CORS
- Explicit origin allowlist (never `*` in production)
- Limit allowed methods and headers
- Credentials only when required

## Headers
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` (or appropriate for embedding needs)
- Remove server version headers

## Common Vulnerabilities to Check
- [ ] SQL/NoSQL injection (parameterized queries?)
- [ ] XSS (output encoding? CSP?)
- [ ] CSRF (tokens for state-changing requests?)
- [ ] IDOR (authorization check on resource access?)
- [ ] Mass assignment (allowlisted fields only?)
- [ ] Path traversal (sanitized file paths?)
- [ ] SSRF (validated URLs for external requests?)
- [ ] Open redirect (validated redirect targets?)
