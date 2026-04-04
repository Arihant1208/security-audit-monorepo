# DDoS Attacks

## Description

Distributed Denial of Service (DDoS) attacks overwhelm a target system with traffic from many sources, making it unavailable to legitimate users. Attacks can target network bandwidth, server resources, or application logic.

## Affected Layer

Network Security, Infrastructure, Application Security

## Attack Mechanism

### Volumetric Attacks
Flood the network link with massive traffic volume (UDP floods, DNS amplification, NTP amplification)

### Protocol Attacks
Exploit protocol weaknesses to exhaust server resources (SYN floods, Ping of Death, Smurf attacks)

### Application Layer Attacks
Target specific application functions with requests that appear legitimate but exhaust server resources (HTTP floods, Slowloris, complex query attacks)

## Detection Checks

- [ ] Is DDoS protection enabled (CDN, cloud-native protection)?
- [ ] Are rate limits configured on public-facing endpoints?
- [ ] Is there auto-scaling to absorb traffic spikes?
- [ ] Are monitoring and alerts configured for traffic anomalies?
- [ ] Is there a DDoS response runbook?
- [ ] Are origin servers hidden behind CDN/proxy?
- [ ] Is there geographic or IP-based filtering capability?
- [ ] Are application-layer rate limits per-user and per-endpoint?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Service unavailability | High |
| Revenue loss | High |
| Reputation damage | High |
| Distraction for other attacks | Medium |
| Infrastructure cost (if auto-scaling) | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Deploy CDN/DDoS protection service (CloudFlare, AWS Shield, Azure DDoS) | Critical |
| Implement rate limiting at network and application layers | High |
| Configure auto-scaling with cost limits | High |
| Hide origin server IPs behind proxies | High |
| Implement application-level request throttling | High |
| Create and test DDoS response runbook | Medium |
| Implement traffic analysis and anomaly detection | Medium |
| Use geographic filtering if applicable | Low |

## References

- CWE-400: Uncontrolled Resource Consumption
- NIST SP 800-189: DoS resilience
