# Cloud Misconfiguration

## Description

Cloud misconfiguration occurs when cloud resources are deployed with overly permissive settings, default configurations, or missing security controls. This is the leading cause of cloud data breaches.

## Affected Layer

Infrastructure & Cloud

## Attack Mechanism

1. Attacker scans for publicly accessible cloud resources
2. Attacker finds misconfigured IAM policies, open storage, or exposed management interfaces
3. Attacker exploits overly permissive access to retrieve data, escalate privileges, or pivot

**Common misconfigurations:**
- S3 buckets / Azure Blob / GCS buckets with public read/write
- IAM policies with wildcard (`*`) permissions
- Security groups allowing unrestricted inbound access (0.0.0.0/0)
- Unencrypted storage volumes and databases
- Cloud metadata endpoint accessible from application
- Disabled audit logging
- Missing MFA on root/admin cloud accounts
- Unused access keys still active

## Detection Checks

- [ ] Are storage resources (S3, Blob, GCS) configured with private access by default?
- [ ] Are IAM policies following least privilege (no wildcards)?
- [ ] Are security groups/NSGs restrictive (no 0.0.0.0/0 for management ports)?
- [ ] Is encryption enabled for all storage and databases?
- [ ] Is cloud audit logging enabled (CloudTrail, Activity Log, Audit Log)?
- [ ] Is MFA enforced on admin/root accounts?
- [ ] Are unused resources, keys, and roles cleaned up?
- [ ] Is there IaC scanning (Checkov, tfsec) in the pipeline?

## Impact

| Impact Area | Severity |
|-------------|----------|
| Data breach via exposed storage | Critical |
| Full cloud account compromise | Critical |
| Resource abuse (cryptomining, DDoS) | High |
| Regulatory non-compliance | High |
| Financial impact (unexpected charges) | High |

## Mitigation

| Control | Priority |
|---------|----------|
| Enable cloud security posture management (CSPM) | Critical |
| Enforce private access defaults for all storage | Critical |
| Apply IAM least privilege with regular access reviews | Critical |
| Enable encryption at rest and in transit for all resources | High |
| Enable comprehensive audit logging | High |
| Enforce MFA on all privileged accounts | High |
| Implement IaC scanning in CI/CD pipelines | High |
| Schedule regular unused resource cleanup | Medium |
| Use cloud-native security benchmarks (CIS) | Medium |

## References

- OWASP: A05:2021 Security Misconfiguration
- CIS Cloud Benchmarks (AWS, Azure, GCP)
- CWE-16: Configuration
