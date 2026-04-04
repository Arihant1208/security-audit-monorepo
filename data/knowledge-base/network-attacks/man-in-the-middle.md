# Man-in-the-Middle (MITM) Attack

## Description

A man-in-the-middle attack intercepts communication between two parties without their knowledge. The attacker can eavesdrop on, modify, or inject new content into the communication stream.

## Affected Layer

Network Security

## Attack Mechanism

1. Attacker positions themselves between the client and server
2. Methods include ARP spoofing, rogue WiFi, DNS hijacking, BGP hijacking, or compromised network equipment
3. Attacker intercepts traffic, potentially decrypting if TLS is weak or missing
4. Attacker can passively read data or actively modify requests/responses

**Variants:**
- **SSL stripping** — Downgrading HTTPS to HTTP
- **Certificate spoofing** — Presenting a fraudulent certificate
- **ARP spoofing** — Redirecting local network traffic
- **DNS spoofing** — Redirecting domain resolution

## Detection Checks

- [ ] Is HTTPS enforced on all endpoints (HSTS enabled)?
- [ ] Are TLS certificates valid and from trusted CAs?
- [ ] Is certificate pinning implemented for critical connections?
- [ ] Is HTTP Strict Transport Security (HSTS) configured with appropriate max-age?
- [ ] Are all internal service-to-service communications encrypted (mTLS)?
- [ ] Are strong cipher suites enforced (TLS 1.2+ only)?
- [ ] Is HSTS preloading enabled for public domains?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Credential theft | Critical |
| Session hijacking | Critical |
| Data interception | High |
| Data modification in transit | High |
| Malware injection | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Enforce HTTPS everywhere with HSTS | Critical |
| Use TLS 1.2 or higher with strong cipher suites | Critical |
| Implement certificate validation | Critical |
| Use mutual TLS (mTLS) for service-to-service communication | High |
| Enable HSTS preloading for public domains | High |
| Implement certificate pinning for mobile apps | Medium |
| Monitor for rogue certificates (Certificate Transparency logs) | Medium |
| Use DNSSEC to prevent DNS spoofing | Medium |

## References

- CWE-300: Channel Accessible by Non-Endpoint
- CWE-319: Cleartext Transmission of Sensitive Information
- OWASP: A02:2021 Cryptographic Failures
