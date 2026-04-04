# Infrastructure Hardening — Remediation Guide

## Cloud IAM Hardening

### Root/Admin Account
- Enable MFA on root account
- Do not use root account for daily operations
- Create separate admin accounts with MFA
- Store root credentials in a physical safe or break-glass procedure

### IAM Policies
```
Principle: Least privilege — grant minimum permissions required

Rules:
- No wildcard (*) in actions or resources unless absolutely necessary
- Use specific service actions (s3:GetObject, not s3:*)
- Scope resources to specific ARNs/paths
- Use conditions to further restrict (IP, MFA, time)
- Review and remove unused permissions quarterly
```

### Service Accounts
- Each service gets its own identity (no shared accounts)
- Scope permissions to exact needs
- Use temporary credentials where possible (IAM roles, managed identity)
- Rotate long-lived credentials on schedule

---

## Container Hardening

### Dockerfile Best Practices
```dockerfile
# Use specific base image version (not :latest)
FROM node:20-alpine@sha256:<digest>

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy only what's needed
COPY --chown=appuser:appgroup . /app

# Don't install unnecessary packages
# Don't leave package manager caches
```

### Runtime Security
```yaml
# Kubernetes Pod Security
securityContext:
  runAsNonRoot: true
  readOnlyRootFilesystem: true
  allowPrivilegeEscalation: false
  capabilities:
    drop: ["ALL"]
resources:
  limits:
    cpu: "500m"
    memory: "256Mi"
```

### Container Scanning
- Scan images in CI/CD pipeline before deployment
- Scan deployed images on a schedule
- Alert on critical/high CVEs
- Maintain an approved base image catalog

---

## Server Hardening

### OS Configuration
- Apply CIS Benchmark for your OS
- Enable automatic security updates
- Remove unnecessary packages and services
- Disable root SSH login
- Use SSH key authentication (disable password auth)
- Configure host firewall (iptables/nftables/Windows Firewall)

### Patch Management
```
Critical patches: Apply within 48 hours
High patches: Apply within 2 weeks
Medium patches: Apply within 30 days
Schedule regular patch windows
Test patches in staging before production
```

---

## Secrets Management

### Architecture
```
Application → Secrets Manager API → Encrypted Secret Store
                    ↑
               Access Policy (IAM)
```

### Implementation
1. Store all secrets in a secrets manager (Vault, AWS Secrets Manager, Azure Key Vault)
2. Applications fetch secrets at startup or on-demand
3. Secrets injected as environment variables or config files (not in code)
4. Secrets never logged (implement redaction filters)
5. Secrets have defined rotation schedules

### If Secrets Were Exposed
1. Revoke the exposed secret immediately
2. Generate new credentials
3. Audit access logs for unauthorized use
4. Clean git history if committed to source control
5. Update all systems using the old credentials
6. Post-incident review to prevent recurrence

---

## Network Security

### Security Groups / NSGs
```
Rules:
- Default deny all inbound
- Allow only required ports from required sources
- Management ports (22, 3389): Restrict to bastion/jump host
- Application ports (80, 443): Allow from load balancer only
- Database ports (3306, 5432): Allow from application tier only
- Review rules quarterly, remove stale entries
```

### Network Segmentation
```
Internet → CDN/WAF → Load Balancer → Application Tier → Data Tier
                                           ↕
                                    Management Tier (bastion)
```

Each tier in a separate subnet/security group with enforced boundaries.
