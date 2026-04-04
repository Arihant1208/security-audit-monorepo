# Backup Exposure

## Description

Backup exposure occurs when database backups, file system snapshots, or configuration backups are stored in accessible locations without proper access controls or encryption, allowing attackers to access historical data.

## Affected Layer

Data Security, Infrastructure

## Attack Mechanism

1. Attacker discovers backup files through:
   - Publicly accessible storage buckets
   - Web server directory listing (.bak, .sql, .dump files)
   - Predictable backup file naming conventions
   - Misconfigured backup systems
2. Attacker downloads backup files
3. Attacker extracts sensitive data from backups (credentials, PII, business data)

## Detection Checks

- [ ] Are backups encrypted at rest?
- [ ] Are backup storage locations access-controlled?
- [ ] Are backups stored separately from the application (not in web root)?
- [ ] Is there a backup retention policy with automated deletion?
- [ ] Are backup access events logged and monitored?
- [ ] Are database backup files excluded from web-accessible directories?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Complete data exposure from backup dump | Critical |
| Credential recovery from old backups | High |
| Regulatory violation (unencrypted PII) | High |
| Historical data exposure | Medium |

## Mitigation

| Control | Priority |
|---------|----------|
| Encrypt all backups at rest | Critical |
| Restrict backup storage access to authorized personnel only | Critical |
| Store backups in separate, secured locations | High |
| Implement and enforce backup retention policies | High |
| Monitor backup access and transfer events | Medium |
| Never store backups in web-accessible directories | Critical |

## References

- CWE-530: Exposure of Backup File to an Unauthorized Control Sphere
- OWASP: A05:2021 Security Misconfiguration
