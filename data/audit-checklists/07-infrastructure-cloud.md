# 07 — Infrastructure & Cloud Security Checklist

## Cloud IAM

- [ ] Root/global admin account secured with MFA and break-glass procedures
- [ ] IAM policies follow least privilege (no wildcard permissions)
- [ ] Unused IAM users, roles, and keys removed
- [ ] Service accounts scoped to minimum required permissions
- [ ] IAM access reviewed quarterly
- [ ] Federated identity used (SSO) instead of local cloud accounts

## Compute Security

- [ ] OS images hardened (CIS benchmarks)
- [ ] Unnecessary services and packages removed
- [ ] Automatic security patching enabled
- [ ] Instance metadata endpoint protected (IMDSv2 on AWS)
- [ ] No public SSH/RDP access (use bastion/jump host)

## Container Security

- [ ] Base images from trusted registries and regularly updated
- [ ] Container images scanned for vulnerabilities
- [ ] Containers run as non-root
- [ ] Privileged containers not used in production
- [ ] Read-only root filesystem enabled
- [ ] Resource limits set (CPU, memory)
- [ ] Kubernetes RBAC configured with least privilege
- [ ] Pod security standards/policies enforced
- [ ] Network policies restrict pod-to-pod traffic
- [ ] Kubernetes API server access restricted

## Secrets Management

- [ ] All secrets stored in a secrets management system (Vault, cloud KMS)
- [ ] No secrets hard-coded in source code
- [ ] No secrets in environment variables of container definitions
- [ ] Secrets rotated on a defined schedule
- [ ] Secret access logged and monitored
- [ ] Unused secrets decommissioned

## Infrastructure as Code

- [ ] All infrastructure defined as code (Terraform, CloudFormation, Bicep)
- [ ] IaC templates scanned for security issues (Checkov, tfsec, KICS)
- [ ] Infrastructure changes require code review
- [ ] Drift detection enabled (planned vs. actual state)
- [ ] Sensitive values not stored in IaC files

## Storage Security

- [ ] All storage buckets/containers private by default
- [ ] Public access blocked at account level
- [ ] Storage encryption enabled
- [ ] Storage access logged
- [ ] Lifecycle policies manage data retention
