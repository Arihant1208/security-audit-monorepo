# 03 — Application Security Checklist

## Input Validation

- [ ] All user inputs validated server-side (type, length, range, format)
- [ ] Whitelist validation preferred over blacklist
- [ ] File uploads validated (type, size, content, stored outside web root)
- [ ] Input validation applied at the earliest point of entry
- [ ] Structured data validated against schemas (JSON Schema, XML Schema)

## Output Encoding

- [ ] Context-appropriate output encoding applied (HTML, JavaScript, URL, CSS)
- [ ] Templating engines used with auto-escaping enabled
- [ ] Content-Type headers set correctly on all responses
- [ ] `X-Content-Type-Options: nosniff` header set

## Injection Prevention

- [ ] Parameterized queries used for all database operations
- [ ] ORM used consistently (raw queries avoided or parameterized)
- [ ] No OS command execution with user input (or strict whitelisting)
- [ ] LDAP queries parameterized
- [ ] XML parsers configured to disable external entities (XXE prevention)
- [ ] Template engines sandboxed against server-side template injection

## Error Handling

- [ ] Custom error pages — no stack traces, debug info, or internal paths exposed
- [ ] Consistent error responses (no information leakage about existence of resources)
- [ ] Errors logged server-side with context for debugging
- [ ] Exception handling covers all code paths (no unhandled exceptions)

## Cryptography

- [ ] Strong encryption algorithms used (AES-256, RSA-2048+)
- [ ] Passwords hashed with bcrypt, scrypt, or Argon2
- [ ] No custom cryptographic implementations (use established libraries)
- [ ] Encryption keys managed securely (not hard-coded)
- [ ] Random values generated with cryptographically secure generators

## File Operations

- [ ] File paths validated against directory traversal (../ prevention)
- [ ] File uploads stored outside web-accessible directories
- [ ] File permissions follow least privilege
- [ ] Uploaded file types validated by content (not just extension)
- [ ] Anti-virus scanning on uploaded files (if applicable)

## Business Logic

- [ ] Multi-step workflows validated at each step (server-side)
- [ ] Race conditions protected against (idempotency, locking)
- [ ] Price and quantity manipulation prevented
- [ ] Limits enforced on business operations (transfer amounts, API calls)
- [ ] Authorization checked at the business logic level
