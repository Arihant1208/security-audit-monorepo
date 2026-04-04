# 08 — DevOps & CI/CD Security Checklist

## Pipeline Security

- [ ] CI/CD platform access secured with MFA
- [ ] Pipeline configurations stored as code and reviewed via PR
- [ ] Build steps use pinned versions (not `latest` tags)
- [ ] Pipeline execution restricted to authorized users
- [ ] Self-hosted runners/agents hardened and regularly updated
- [ ] Build environments are ephemeral (fresh for each build)

## Secret Management in Pipelines

- [ ] Secrets injected via CI/CD secret management (not in code)
- [ ] Secrets masked in build logs
- [ ] Secrets scoped to specific pipelines/environments
- [ ] Deploy keys and tokens have minimal scope
- [ ] Secrets rotated regularly
- [ ] No secrets in pipeline configuration files

## Artifact Security

- [ ] Build artifacts signed
- [ ] Artifact signatures verified before deployment
- [ ] Artifacts stored in access-controlled registries
- [ ] Container images tagged with digest (not just version)
- [ ] Artifact provenance tracked (SLSA compliance)

## Code Quality & Scanning

- [ ] SAST (static analysis) runs on every PR/commit
- [ ] SCA (software composition analysis) runs in pipeline
- [ ] Secret scanning runs in pipeline (pre-commit and CI)
- [ ] IaC scanning enabled for infrastructure code
- [ ] DAST (dynamic testing) runs against staging environment
- [ ] Scan failures block deployment

## Deployment Security

- [ ] Production deployments require approval
- [ ] Deployment to production uses separate credentials from other environments
- [ ] Rollback capability tested and documented
- [ ] Blue-green or canary deployments used for safety
- [ ] Post-deployment health checks automated

## Environment Isolation

- [ ] Production environment separated from staging/dev
- [ ] Production credentials not accessible in lower environments
- [ ] Production data not used in non-production environments
- [ ] Different cloud accounts/subscriptions for prod and non-prod
