# DNS Poisoning

## Description

DNS poisoning (DNS spoofing) corrupts a DNS resolver's cache so that it returns an incorrect IP address for a domain name, redirecting traffic to an attacker-controlled server.

## Affected Layer

Network Security

## Attack Mechanism

1. Attacker targets a DNS resolver (ISP, corporate, or local)
2. Attacker sends forged DNS responses matching pending queries
3. Resolver caches the forged response with the attacker's IP
4. Users querying that domain are redirected to the attacker's server
5. Attacker can phish credentials, distribute malware, or intercept data

## Detection Checks

- [ ] Is DNSSEC validation enabled on DNS resolvers?
- [ ] Are DNS queries sent over encrypted channels (DoH, DoT)?
- [ ] Is DNS resolution monitored for anomalous responses?
- [ ] Are authoritative DNS servers properly secured?
- [ ] Is source port randomization enabled on resolvers?
- [ ] Are DNS zones protected against unauthorized modifications?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Phishing and credential theft | High |
| Traffic redirection to malicious servers | High |
| Malware distribution | High |
| Data interception | High |
| Trust chain compromise | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Enable DNSSEC on all domains | High |
| Use encrypted DNS (DNS over HTTPS or DNS over TLS) | High |
| Implement DNS monitoring and anomaly detection | Medium |
| Use trusted DNS resolvers | Medium |
| Enable source port randomization | Medium |
| Monitor Certificate Transparency logs for domain impersonation | Medium |

## References

- CWE-350: Reliance on Reverse DNS Resolution for a Security-Critical Action
- RFC 4033-4035: DNSSEC specifications
