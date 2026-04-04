# Cryptographic Best Practices — Remediation Guide

## Symmetric Encryption

### Recommended
| Algorithm | Key Size | Mode | Use Case |
|-----------|----------|------|----------|
| AES | 256-bit | GCM (preferred) | Data encryption at rest and in transit |
| AES | 256-bit | CBC with HMAC | Legacy systems (GCM preferred) |
| ChaCha20-Poly1305 | 256-bit | AEAD | Alternative to AES-GCM |

### Avoid
- DES, 3DES, RC4, Blowfish
- ECB mode (reveals patterns in ciphertext)
- CBC without authentication (HMAC)

### Implementation Rules
- Use authenticated encryption (GCM, CCM, or encrypt-then-MAC)
- Use a unique, random IV/nonce for every encryption operation
- Never reuse a nonce with the same key (especially with GCM)
- Use established cryptographic libraries (not custom implementations)

---

## Hashing

### For Passwords
| Algorithm | Configuration |
|-----------|--------------|
| Argon2id | memory=64MB, iterations=3, parallelism=1 |
| bcrypt | work factor=12+ |
| scrypt | N=32768, r=8, p=1 |

### For Data Integrity
| Algorithm | Use Case |
|-----------|----------|
| SHA-256 | General integrity verification |
| SHA-384/SHA-512 | Higher security requirements |
| BLAKE2 | Performance-sensitive applications |

### Never Use for Passwords
- MD5, SHA-1, SHA-256 (without password-specific KDF)

---

## Key Management

### Storage
- Store keys in a dedicated Key Management System (AWS KMS, Azure Key Vault, HashiCorp Vault)
- Never hard-code keys in source code
- Never store keys in configuration files committed to source control
- Separate encryption keys from encrypted data

### Rotation
- Define key rotation schedule (90-365 days depending on sensitivity)
- Support key versioning (decrypt with old key, encrypt with new key)
- Automate rotation where possible
- Revoke/retire old keys after migration

### Access Control
- Restrict key access to minimum required services
- Log all key usage events
- Use separate keys for separate purposes (encryption vs. signing)
- Use separate keys for separate environments (dev vs. prod)

---

## TLS Configuration

### Server Configuration
```
Minimum version: TLS 1.2 (TLS 1.3 preferred)
Disabled: SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1

Recommended cipher suites (TLS 1.2):
  TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
  TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
  TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
  TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256

TLS 1.3 cipher suites (all are strong):
  TLS_AES_256_GCM_SHA384
  TLS_CHACHA20_POLY1305_SHA256
  TLS_AES_128_GCM_SHA256
```

### Certificate Management
- Use certificates from trusted CAs (not self-signed in production)
- Minimum RSA 2048-bit or ECDSA P-256 keys
- Automate certificate renewal (Let's Encrypt, ACME)
- Enable OCSP stapling
- Configure HSTS with long max-age

### HSTS Header
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

---

## Random Number Generation

### Always Use
- `crypto.getRandomValues()` (JavaScript/browser)
- `secrets` module (Python)
- `SecureRandom` (Java)
- `RandomNumberGenerator` (C#/.NET)
- `/dev/urandom` (Linux)

### Never Use for Security
- `Math.random()` (JavaScript)
- `random` module (Python — predictable)
- `java.util.Random` (Java — predictable)
- `System.Random` (C# — predictable)

---

## Common Mistakes to Avoid

1. Rolling your own cryptography
2. Using encryption without authentication (no integrity check)
3. Reusing IVs/nonces
4. Hard-coding keys or using predictable keys
5. Using ECB mode
6. Using MD5/SHA1 for password hashing
7. Not validating TLS certificates
8. Storing keys alongside encrypted data
