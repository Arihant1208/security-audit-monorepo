# 11 — Monitoring & Logging Security Checklist

## Security Event Logging

- [ ] Authentication events logged (success,  failure, lockout)
- [ ] Authorization failures logged
- [ ] Privilege changes logged (role assignment, permission changes)
- [ ] Data access logged for sensitive resources
- [ ] Administrative actions logged
- [ ] Account changes logged (email, password, MFA)
- [ ] API errors and anomalies logged

## Log Content & Quality

- [ ] Logs include timestamp, source, actor, action, result, target
- [ ] Sensitive data NOT included in logs (passwords, tokens, PII redacted)
- [ ] Logs are structured (JSON format) for parsing
- [ ] Log levels used appropriately (INFO, WARN, ERROR)
- [ ] Sufficient context for incident investigation

## Log Protection

- [ ] Logs stored in append-only / tamper-evident storage
- [ ] Log access restricted to authorized personnel
- [ ] Log integrity verified (checksums, signing)
- [ ] Logs not modifiable by application accounts
- [ ] Log retention meets compliance requirements

## Log Aggregation

- [ ] Centralized log aggregation configured
- [ ] Logs from all components forwarded (app, infra, network)
- [ ] Log forwarding is reliable (buffering, retry)
- [ ] Log search and analysis tools available (ELK, Splunk, etc.)

## Alerting

- [ ] Alerts configured for brute force / credential stuffing patterns
- [ ] Alerts for privilege escalation attempts
- [ ] Alerts for unusual data access patterns
- [ ] Alerts for infrastructure security events (config changes, new resources)
- [ ] Alerts for application errors exceeding thresholds
- [ ] Alert fatigue managed (tuned thresholds, prioritized alerts)
- [ ] On-call rotation defined for security alerts

## Incident Response

- [ ] Incident response plan exists and is documented
- [ ] Incident response tested (tabletop exercises, simulations)
- [ ] Incident communication plan defined
- [ ] Post-incident review process established
- [ ] Evidence preservation procedures documented

## Audit Trail

- [ ] Complete audit trail for compliance-critical operations
- [ ] Audit logs immutable and retained per compliance requirements
- [ ] Audit trail available for forensic investigation
- [ ] Regular audit trail reviews conducted
