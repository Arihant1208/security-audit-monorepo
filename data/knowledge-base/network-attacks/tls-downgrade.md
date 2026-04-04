# TLS Downgrade Attack

## Description

A TLS downgrade attack forces a connection to use a weaker, vulnerable version of TLS or SSL (or no encryption at all). The attacker exploits protocol negotiation to make both parties agree on an insecure cipher suite or protocol version.

## Affected Layer

Network Security

## Attack Mechanism

1. Attacker intercepts the TLS handshake between client and server
2. Attacker modifies the ClientHello or ServerHello to remove strong cipher suites
3. Connection falls back to a weaker protocol (SSL 3.0, TLS 1.0) or weak cipher
4. Attacker exploits known vulnerabilities in the weaker protocol to decrypt traffic

**Related attacks:** POODLE (SSL 3.0), BEAST (TLS 1.0), DROWN (SSLv2), FREAK (export ciphers), Logjam (weak DH)

## Detection Checks

- [ ] Are SSL 2.0, SSL 3.0, TLS 1.0, and TLS 1.1 disabled?
- [ ] Is TLS 1.2 (minimum) or TLS 1.3 enforced?
- [ ] Are weak cipher suites disabled (RC4, DES, export ciphers)?
- [ ] Is TLS_FALLBACK_SCSV supported to prevent downgrade?
- [ ] Are certificates using strong key sizes (RSA 2048+, ECDSA 256+)?
- [ ] Is perfect forward secrecy (PFS) enabled?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Data interception | Critical |
| Credential theft | Critical |
| Session hijacking | High |
| Compliance violations | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Disable all protocols below TLS 1.2 | Critical |
| Enable TLS 1.3 where possible | High |
| Configure strong cipher suites only | High |
| Enable TLS_FALLBACK_SCSV | High |
| Use HSTS to prevent HTTP downgrade | High |
| Enable perfect forward secrecy | High |
| Regularly test TLS configuration (SSL Labs) | Medium |

## References

- CWE-757: Selection of Less-Secure Algorithm During Negotiation
- CWE-327: Use of a Broken or Risky Cryptographic Algorithm
