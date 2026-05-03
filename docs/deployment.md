# Deployment Guide

Production deployment for Steve — from free tier hosting to enterprise multi-cloud setups.

---

## Deployment Tiers at a Glance

| Tier | Monthly Cost | Best For | Services |
|------|-------------|----------|----------|
| **Free** | $0 | Solo devs, evaluation, open source | 1 platform + Neon free DB |
| **Starter** | $5–25 | Small teams, low volume | Dedicated instances + managed DB |
| **Production** | $50–200 | Teams, CI/CD integration | Multi-service, monitoring, custom domain |
| **Enterprise** | $200+ | Multi-cloud, HA, compliance | Multi-region, private networking, SLA |

---

## Tier 1: Free ($0/month)

Perfect for evaluation, solo developers, and open-source projects. Every service has a free tier.

### Compute — Pick One

#### Option A: Render (Recommended for beginners)

**Free:** 750 hours/month, auto-sleep after 15 min, ~30s cold start.

1. Push repo to **private** GitHub
2. Render → New → Web Service → connect repo
3. Configure:
   | Setting | Value |
   |---------|-------|
   | Name | `steve-security-agent` |
   | Runtime | Docker |
   | Dockerfile Path | `infra/Dockerfile` |
   | Docker Build Context | `.` |
   | Instance Type | Free |
4. Add env vars: `SECURITY_AUDIT_API_KEYS`, `DATABASE_URL` (optional)
5. Deploy → endpoint: `https://steve-security-agent.onrender.com`

**One-click:** Use the Render Blueprint — New Blueprint Instance → point to `infra/render.yaml`.

#### Option B: Fly.io

**Free:** 3 shared-cpu-1x VMs, 256 MB RAM each.

```bash
fly auth login
fly launch --config infra/fly.toml --dockerfile infra/Dockerfile
fly secrets set SECURITY_AUDIT_API_KEYS="your-key-here"
fly secrets set DATABASE_URL="postgresql://..."
fly deploy --config infra/fly.toml --dockerfile infra/Dockerfile
```

Endpoint: `https://steve-security-agent.fly.dev`

#### Option C: Railway

**Free trial:** $5 credit (~500 hours).

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set Dockerfile path: `infra/Dockerfile`, context: `.`
3. Add env vars
4. Auto-assigned URL

#### Option D: Hugging Face Spaces

**Free:** Unlimited, 2 vCPU / 16 GB RAM. Must expose port 7860.

1. Create a Docker Space (private)
2. Copy monorepo files in
3. Override CMD: `CMD ["node", "dist/index.js", "--port", "7860"]`
4. Set secrets

### Database — Neon PostgreSQL (Free)

1. Sign up at [neon.tech](https://neon.tech) — free: 0.5 GB, 190 compute hours/month
2. Create project → copy connection string
3. Apply migrations:
   ```bash
   psql "$NEON_URL" -f packages/db/migrations/001-init.sql
   psql "$NEON_URL" -f packages/db/migrations/002-website-auth.sql
   psql "$NEON_URL" -f packages/db/seed.sql
   ```
4. Set `DATABASE_URL` in your deployment platform

**No database?** Use `SECURITY_AUDIT_API_KEYS` env var — auth works, but no website signup/dashboard.

### Free Tier Platform Comparison

| Feature | Render | Fly.io | Railway | HF Spaces |
|---------|--------|--------|---------|-----------|
| Truly free | Yes (750h) | Yes (3 VMs) | Trial ($5) | Yes |
| Cold start | ~30s | ~2-5s | None | ~30s |
| Custom domain | Yes | Yes | Paid | No |
| Docker support | Yes | Yes | Yes | Yes |
| Best for | Simple deploy | Low latency | No cold start | Generous RAM |

---

## Tier 2: Starter ($5–25/month)

For small teams that need always-on service and faster response times.

### Render Starter

```yaml
# infra/render.yaml (override plan)
services:
  - type: web
    name: steve-security-agent
    plan: starter        # $7/mo — always on, no cold start
    # ... rest unchanged
```

### Fly.io Starter

```bash
# Scale up to dedicated CPU
fly scale vm shared-cpu-2x --memory 512
# Cost: ~$7/mo
```

### Railway Starter

Railway Pro: $5/mo base + usage. No cold starts, faster builds.

### Database: Neon Launch ($19/mo)

- 10 GB storage, 300 compute hours/month
- Auto-scaling compute, point-in-time recovery
- Set `DATABASE_URL` to the Neon Launch connection string

### What You Get

- **No cold starts** — service stays warm
- **More RAM** — handles concurrent audits
- **Persistent database** — reliable auth + usage tracking
- **Custom domain** — `steve.yourcompany.com`

---

## Tier 3: Production ($50–200/month)

For teams running Steve in CI/CD pipelines, multiple projects, or with SLAs.

### Recommended Stack

| Component | Service | Cost |
|-----------|---------|------|
| Orchestrator | Fly.io Performance-2x (2 CPU, 4 GB) | $30/mo |
| AI Engine | Fly.io Performance-1x (1 CPU, 2 GB) | $15/mo |
| Database | Neon Scale ($69/mo) or Supabase Pro ($25/mo) | $25-69/mo |
| CDN | Cloudflare Free | $0 |
| Monitoring | Grafana Cloud Free | $0 |
| **Total** | | **$70–114/mo** |

### Docker Compose (Single Server)

Deploy the full stack on a single VPS (DigitalOcean, Hetzner, Linode):

```bash
# 1. Provision a $24/mo VPS (4 GB RAM, 2 vCPU)
# 2. Install Docker
# 3. Clone repo
git clone https://github.com/Arihant1208/security-audit-monorepo.git
cd security-audit-monorepo

# 4. Set production environment
cat > .env << 'EOF'
DATABASE_URL=postgresql://steve:STRONG_PASSWORD_HERE@db:5432/steve
SECURITY_AUDIT_API_KEYS=your-production-key-here
SECURITY_AUDIT_SKIP_AUTH=false
AI_ENGINE_URL=http://ai-engine:8100
PORT=3000
POSTGRES_PASSWORD=STRONG_PASSWORD_HERE
EOF

# 5. Deploy
docker compose -f infra/docker-compose.yml --env-file .env up -d

# 6. Set up reverse proxy (nginx/caddy) for HTTPS
```

### Production Checklist

- [ ] Repository is **private**
- [ ] `SKIP_AUTH` is **not** set
- [ ] Strong `POSTGRES_PASSWORD` (not default)
- [ ] HTTPS enforced (via platform or reverse proxy)
- [ ] API keys created via website (not env var)
- [ ] Health check monitoring configured
- [ ] Database backups enabled (Neon/Supabase handle this)
- [ ] Rate limiting configured (via reverse proxy or CDN)

### Fly.io Multi-Service

```bash
# Deploy orchestrator
fly launch --config infra/fly.toml --dockerfile infra/Dockerfile
fly scale vm performance-2x --memory 4096
fly secrets set DATABASE_URL="..." SECURITY_AUDIT_API_KEYS="..."

# Deploy AI engine (separate app)
fly launch --name steve-ai-engine \
  --dockerfile infra/Dockerfile.ai-engine \
  --internal-port 8100
fly secrets set -a steve-ai-engine PORT=8100

# Connect them via Fly private network
fly secrets set AI_ENGINE_URL="http://steve-ai-engine.internal:8100"
```

---

## Tier 4: Enterprise / Multi-Cloud

For organizations needing high availability, compliance, and multi-region deployment.

### AWS Deployment

| Component | AWS Service | Config |
|-----------|-------------|--------|
| Orchestrator | ECS Fargate | 2 tasks, 1 vCPU / 2 GB each |
| AI Engine | ECS Fargate | 1 task, 1 vCPU / 2 GB |
| Database | RDS PostgreSQL | db.t4g.micro ($15/mo) or Aurora Serverless v2 |
| Load Balancer | ALB | Routes to ECS services |
| CDN | CloudFront | Static site caching |
| Secrets | Secrets Manager | API keys, DB credentials |
| Monitoring | CloudWatch | Logs, metrics, alarms |

**Estimated cost:** $80–200/mo depending on usage.

```bash
# Example ECS task definition (orchestrator)
# Use infra/Dockerfile, set environment variables via Secrets Manager
# ALB health check: /health
# Target group: port 3000
```

### Azure Deployment

| Component | Azure Service | Config |
|-----------|---------------|--------|
| Orchestrator | Container Apps | 2 replicas, 1 vCPU / 2 GB |
| AI Engine | Container Apps | 1 replica, 1 vCPU / 2 GB |
| Database | Azure Database for PostgreSQL Flexible | Burstable B1ms ($12/mo) |
| CDN | Azure CDN | Static site caching |
| Secrets | Key Vault | Credentials, API keys |
| Monitoring | Application Insights | APM, logs, dashboards |

**Estimated cost:** $60–150/mo.

```bash
# Deploy via Azure CLI
az containerapp create \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --environment steve-env \
  --image ghcr.io/arihant1208/steve-orchestrator:latest \
  --target-port 3000 \
  --env-vars DATABASE_URL=secretref:db-url \
  --min-replicas 1 --max-replicas 5

az containerapp create \
  --name steve-ai-engine \
  --resource-group steve-rg \
  --environment steve-env \
  --image ghcr.io/arihant1208/steve-ai-engine:latest \
  --target-port 8100 \
  --min-replicas 1 --max-replicas 3
```

### Google Cloud Deployment

| Component | GCP Service | Config |
|-----------|-------------|--------|
| Orchestrator | Cloud Run | 2 instances, 1 vCPU / 2 GB |
| AI Engine | Cloud Run | 1 instance, 1 vCPU / 2 GB |
| Database | Cloud SQL PostgreSQL | db-f1-micro ($7/mo) or Alloy DB |
| CDN | Cloud CDN | Static caching |
| Secrets | Secret Manager | Credentials |
| Monitoring | Cloud Monitoring | Logs, traces, dashboards |

**Estimated cost:** $50–120/mo.

```bash
# Deploy to Cloud Run
gcloud run deploy steve-orchestrator \
  --source . \
  --dockerfile infra/Dockerfile \
  --port 3000 \
  --set-env-vars "DATABASE_URL=projects/xxx/secrets/db-url:latest" \
  --min-instances 1 \
  --max-instances 10 \
  --region us-central1

gcloud run deploy steve-ai-engine \
  --source . \
  --dockerfile infra/Dockerfile.ai-engine \
  --port 8100 \
  --min-instances 1 \
  --max-instances 5 \
  --region us-central1
```

### Multi-Cloud Architecture

For maximum resilience, deploy across multiple clouds with DNS-based failover:

```
                    ┌──────────────────┐
                    │  Cloudflare DNS  │
                    │  (load balance)  │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                 ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   AWS (us)   │ │  Azure (eu)  │ │  GCP (apac)  │
    │  Orchestrator│ │  Orchestrator│ │  Orchestrator│
    │  AI Engine   │ │  AI Engine   │ │  AI Engine   │
    │  RDS Postgres│ │  Azure PG    │ │  Cloud SQL   │
    └──────────────┘ └──────────────┘ └──────────────┘
```

**Considerations:**
- Each region is independent (no cross-region DB replication needed — audit data is short-lived)
- Cloudflare handles TLS termination, DDoS protection, and geographic routing
- Each cloud uses its native services for compute, database, and secrets
- Cost: $200–500/mo across three regions

---

## Infrastructure Files

The repo includes ready-to-use configs:

| File | Platform |
|------|----------|
| `infra/Dockerfile` | Orchestrator container |
| `infra/Dockerfile.ai-engine` | AI Engine container |
| `infra/Dockerfile.dashboard` | Dashboard container |
| `infra/docker-compose.yml` | Full local/VPS stack (4 services) |
| `infra/fly.toml` | Fly.io deployment |
| `infra/render.yaml` | Render Blueprint (one-click) |

---

## Verification

After any deployment, verify with:

```bash
# Health check
curl https://YOUR-URL/health
# Expected: {"status":"ok","agent":"steve-security-agent","version":"2.0.0","tools":19,"phases":9}

# MCP initialize (test auth)
curl -X POST https://YOUR-URL/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'

# Website
curl https://YOUR-URL/
# Expected: HTML landing page

# API
curl https://YOUR-URL/api/auth/me
# Expected: 401 (no session — auth works!)
```

---

## Security Checklist (All Tiers)

- [ ] Repository is **private**
- [ ] `SECURITY_AUDIT_SKIP_AUTH` is **not** set in production
- [ ] HTTPS enforced (all platforms above do this by default)
- [ ] Database credentials stored in platform secrets (not in code)
- [ ] API keys rotated periodically
- [ ] Health check / uptime monitoring configured
- [ ] Database backups enabled
- [ ] Logs retained for incident response
