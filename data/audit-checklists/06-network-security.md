# 06 — Network Security Checklist

## Network Segmentation

- [ ] Network zones defined (DMZ, application, data, management)
- [ ] Security groups/firewalls enforce zone boundaries
- [ ] Databases not directly accessible from public networks
- [ ] Management interfaces on separate network segment
- [ ] Lateral movement between zones requires explicit access

## Firewall & Access Rules

- [ ] Default deny policy on all firewalls/security groups
- [ ] Only required ports open to required sources
- [ ] Management ports (SSH, RDP) restricted to specific IPs
- [ ] Firewall rules reviewed and cleaned up regularly
- [ ] Unused rules and overly permissive rules removed

## TLS Configuration

- [ ] TLS 1.2 as minimum version (TLS 1.3 preferred)
- [ ] SSL 2.0, SSL 3.0, TLS 1.0, TLS 1.1 disabled
- [ ] Weak cipher suites disabled (RC4, DES, 3DES, export ciphers)
- [ ] Perfect forward secrecy enabled (ECDHE suites)
- [ ] HSTS configured with appropriate max-age
- [ ] OCSP stapling enabled

## DNS Security

- [ ] DNSSEC enabled for all domains
- [ ] DNS records reviewed (no stale/dangling records)
- [ ] DNS zone transfer restricted
- [ ] Subdomain takeover risks assessed
- [ ] CAA records configured to restrict certificate issuance

## DDoS Protection

- [ ] DDoS mitigation service deployed for public endpoints
- [ ] Rate limiting at network layer
- [ ] SYN flood protection enabled
- [ ] Origin server IPs not exposed
- [ ] DDoS response plan documented

## Ingress/Egress Filtering

- [ ] Outbound traffic filtered (only required destinations)
- [ ] Outbound DNS monitored for tunneling
- [ ] Egress proxy for outbound HTTP/HTTPS traffic
- [ ] Internal services cannot make arbitrary outbound connections
