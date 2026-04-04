# Cryptographic Failures

## Description

Cryptographic failures occur when sensitive data is not properly protected by encryption, or when encryption is implemented incorrectly. This includes weak algorithms, improper key management, missing encryption, and flawed cryptographic protocols.

## Affected Layer

Data Security, Application Security

## Attack Mechanism

1. Attacker identifies data that should be encrypted but is not
2. Or attacker identifies weak cryptographic implementations:
   - Weak algorithms (MD5, SHA1 for passwords, DES, RC4)
   - Hard-coded or weak encryption keys
   - Missing encryption at rest or in transit
   - Improper initialization vectors or modes
   - Insufficient key lengths
3. Attacker exploits the weakness to access or decrypt sensitive data

## Detection Checks

- [ ] Is all sensitive data encrypted at rest?
- [ ] Is all data encrypted in transit (TLS)?
- [ ] Are passwords hashed with strong algorithms (bcrypt, scrypt, Argon2)?
- [ ] Are encryption keys managed securely (not hard-coded)?
- [ ] Are deprecated algorithms avoided (MD5, SHA1, DES, RC4)?
- [ ] Is key rotation implemented?
- [ ] Are random numbers generated using cryptographically secure generators?
- [ ] Are initialization vectors random and unpredictable?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Data exposure | Critical |
| Credential compromise | Critical |
| Regulatory violations | High |
| Data integrity compromise | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Use strong, current encryption algorithms (AES-256, RSA-2048+) | Critical |
| Hash passwords with bcrypt, scrypt, or Argon2 | Critical |
| Encrypt all sensitive data at rest and in transit | Critical |
| Store encryption keys in a key management system | Critical |
| Implement key rotation policies | High |
| Use cryptographically secure random number generators | High |
| Disable deprecated algorithms and protocols | High |
| Conduct regular cryptographic configuration audits | Medium |

## References

- OWASP: A02:2021 Cryptographic Failures
- CWE-327: Use of a Broken or Risky Cryptographic Algorithm
- CWE-328: Use of Weak Hash
- CWE-326: Inadequate Encryption Strength
