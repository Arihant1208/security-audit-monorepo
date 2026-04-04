# Logging and Monitoring — Remediation Guide

## Security Event Logging

### What to Log

| Event Category | Events |
|---------------|--------|
| Authentication | Login success/failure, logout, MFA events, lockouts |
| Authorization | Access denied, privilege changes, role assignments |
| Account lifecycle | Creation, modification, deletion, recovery |
| Data access | Access to sensitive data, bulk queries, exports |
| Admin actions | Configuration changes, user management, deployments |
| Security events | Rate limiting triggers, WAF blocks, anomalies |
| System events | Startup/shutdown, errors, dependency failures |

### Log Entry Format

Every security log entry should contain:

```json
{
  "timestamp": "2026-03-15T10:30:00.000Z",
  "level": "WARN",
  "event": "authentication.failed",
  "actor": {
    "type": "user",
    "id": "user-123",
    "ip": "203.0.113.50",
    "userAgent": "Mozilla/5.0..."
  },
  "action": "login",
  "target": {
    "type": "account",
    "id": "user-456"
  },
  "result": "failure",
  "reason": "invalid_credentials",
  "metadata": {
    "attemptCount": 3,
    "source": "web-login"
  }
}
```

### What NOT to Log
- Passwords or credentials (even failed ones)
- Full credit card numbers
- Session tokens or API keys
- Sensitive PII unless required and approved
- Values that could contain SQL injection payloads (sanitize first)

---

## Log Architecture

### Centralized Logging
```
Applications ─┐
Servers ───────┤
Containers ────┼──► Log Aggregator ──► Log Storage ──► Search/Analysis
Network ───────┤         │
Cloud Events ──┘         ▼
                    Alert Engine ──► Notification
```

### Log Protection
- Logs stored in append-only storage
- Log access restricted (separate from application access)
- Log integrity verified (checksums, write-once storage)
- Logs transmitted over encrypted channels
- Log retention meets compliance requirements (typically 1-7 years)

---

## Alerting Configuration

### Critical Alerts (Immediate Response)

| Alert | Condition | Response |
|-------|-----------|----------|
| Admin account compromise | Successful admin login from new IP/device | Investigate immediately |
| Mass auth failures | >100 failed logins in 5 minutes | Check for brute force/credential stuffing |
| Privilege escalation | User gains admin role unexpectedly | Investigate and revert |
| Data exfiltration signal | Bulk data access above threshold | Investigate immediately |
| Security control disabled | WAF, firewall, or logging disabled | Restore and investigate |

### Warning Alerts (Business Hours Response)

| Alert | Condition | Response |
|-------|-----------|----------|
| Elevated auth failures | >20 failed logins per account/hour | Monitor pattern |
| New admin account | Admin account created | Verify authorized |
| Configuration change | Security-relevant config modified | Verify authorized |
| Certificate expiring | TLS cert expires in <30 days | Schedule renewal |

### Managing Alert Fatigue
- Tune thresholds based on normal baseline
- Group related alerts
- Prioritize alerts by severity
- Automate response for well-understood alerts
- Review alert effectiveness monthly

---

## Incident Response Plan

### Incident Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|---------|
| SEV-1 | Active compromise, data breach | Immediate | RCE exploited, data exfiltration |
| SEV-2 | Significant vulnerability discovered | 4 hours | Critical unpatched CVE, credential leak |
| SEV-3 | Security issue requiring investigation | 24 hours | Suspicious activity, failed attacks |
| SEV-4 | Security improvement needed | Next sprint | Best practice gap, minor config issue |

### Incident Response Steps

```
1. Detect     → Alert triggers / report received
2. Triage     → Assess severity, assign responders
3. Contain    → Stop the attack / limit damage
4. Investigate → Understand scope and root cause
5. Eradicate  → Remove attacker access, fix vulnerability
6. Recover    → Restore services, verify fix
7. Review     → Post-incident review, improve defenses
```

### Evidence Preservation
- Preserve logs (do not delete or modify)
- Capture memory dumps if malware suspected
- Document timeline of events
- Save network captures if available
- Take snapshots of affected systems before remediation

---

## Audit Trail Requirements

For compliance (SOC 2, GDPR, HIPAA, PCI-DSS):

| Requirement | Implementation |
|-------------|---------------|
| Who | Actor identity in every log entry |
| What | Specific action performed |
| When | UTC timestamp with millisecond precision |
| Where | Source IP, system, component |
| Result | Success/failure and reason |
| Immutability | Write-once storage, integrity verification |
| Retention | Meet regulatory minimum (varies by standard) |
| Access | Restricted, logged, and auditable |
