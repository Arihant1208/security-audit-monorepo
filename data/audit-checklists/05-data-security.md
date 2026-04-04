# 05 — Data Security Checklist

## Encryption at Rest

- [ ] Databases encrypted at rest
- [ ] File storage encrypted at rest
- [ ] Backups encrypted
- [ ] Strong encryption algorithms used (AES-256)
- [ ] Encryption keys managed in a key management system (not application code)
- [ ] Key rotation policy implemented and enforced

## Encryption in Transit

- [ ] TLS 1.2+ enforced on all connections
- [ ] HTTPS enforced for all web traffic (HSTS configured)
- [ ] Internal service-to-service traffic encrypted
- [ ] Database connections encrypted (TLS)
- [ ] Certificate management automated (renewal, rotation)

## Data Classification

- [ ] Data classification scheme defined (public, internal, confidential, restricted)
- [ ] All data stores classified
- [ ] Handling procedures defined per classification level
- [ ] PII, PCI, and health data identified and labeled
- [ ] Data classification reviewed periodically

## Access Control

- [ ] Database access restricted to application service accounts
- [ ] Direct database access requires MFA and approval
- [ ] Data access logged (who accessed what, when)
- [ ] Principle of least privilege applied to data access
- [ ] Production data not used in non-production environments (or anonymized)

## Data Retention

- [ ] Retention policy defined for each data type
- [ ] Automated deletion of expired data
- [ ] Deletion verified (not just soft-deleted if policy requires hard delete)
- [ ] Right to deletion supported for PII (GDPR, CCPA)
- [ ] Backup retention aligned with data retention policy

## Data Integrity

- [ ] Checksums or hashes verify data integrity where required
- [ ] Database constraints enforce data integrity rules
- [ ] Audit trail maintained for critical data changes
- [ ] Immutable logs for compliance-critical events

## Data Loss Prevention

- [ ] Bulk data export monitored and restricted
- [ ] API responses paginated with size limits
- [ ] Database queries monitored for large result sets
- [ ] Outbound data transfer monitoring in place
