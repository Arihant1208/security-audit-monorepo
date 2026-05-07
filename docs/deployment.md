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

---

## AWS Deployment

### AWS Free Tier ($0/month for 12 months)

AWS Free Tier gives you enough to run Steve at low volume for evaluation.

| Component | AWS Service | Free Tier Limit |
|-----------|-------------|-----------------|
| Orchestrator | App Runner | 1,000 requests/mo, 1 GB mem (always free) |
| Database | RDS PostgreSQL | db.t4g.micro, 20 GB — 12 months free |
| Secrets | Secrets Manager | 30-day trial then $0.40/secret/mo |
| Container Registry | ECR | 500 MB (always free) |

#### Deploy with App Runner (Free)

```bash
# 1. Push Docker image to ECR
aws ecr create-repository --repository-name steve-orchestrator
aws ecr get-login-password | docker login --username AWS --password-stdin $ACCOUNT.dkr.ecr.$REGION.amazonaws.com

docker build -f infra/Dockerfile -t steve-orchestrator .
docker tag steve-orchestrator:latest $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/steve-orchestrator:latest
docker push $ACCOUNT.dkr.ecr.$REGION.amazonaws.com/steve-orchestrator:latest

# 2. Create App Runner service
aws apprunner create-service \
  --service-name steve-orchestrator \
  --source-configuration '{
    "ImageRepository": {
      "ImageIdentifier": "'$ACCOUNT'.dkr.ecr.'$REGION'.amazonaws.com/steve-orchestrator:latest",
      "ImageRepositoryType": "ECR",
      "ImageConfiguration": {
        "Port": "3000",
        "RuntimeEnvironmentVariables": {
          "SECURITY_AUDIT_API_KEYS": "your-key-here",
          "DATABASE_URL": "postgresql://steve:password@your-rds-endpoint:5432/steve"
        }
      }
    },
    "AutoDeploymentsEnabled": true
  }' \
  --instance-configuration '{"Cpu": "0.25 vCPU", "Memory": "0.5 GB"}'

# 3. Create RDS PostgreSQL (free tier)
aws rds create-db-instance \
  --db-instance-identifier steve-db \
  --db-instance-class db.t4g.micro \
  --engine postgres \
  --engine-version 16 \
  --master-username steve \
  --master-user-password STRONG_PASSWORD_HERE \
  --allocated-storage 20 \
  --db-name steve \
  --no-multi-az \
  --publicly-accessible
```

Endpoint: `https://<service-id>.<region>.awsapprunner.com`

#### Alternative: Lambda + API Gateway (Always Free)

For very low usage (<1M requests/month), deploy as a Lambda function:

```bash
# Use a Lambda-compatible wrapper (requires minor code change)
# Free: 1M requests/mo, 400,000 GB-seconds compute
# Downside: cold starts (~3-5s), 15min timeout per request
```

### AWS Paid ($25–200/month)

| Component | Service | Config | Cost |
|-----------|---------|--------|------|
| Orchestrator | ECS Fargate | 2 tasks, 0.5 vCPU / 1 GB | $18/mo |
| AI Engine | ECS Fargate | 1 task, 1 vCPU / 2 GB | $30/mo |
| Database | RDS PostgreSQL | db.t4g.micro (Multi-AZ) | $15/mo |
| Load Balancer | ALB | Routes to ECS | $16/mo |
| Secrets | Secrets Manager | All credentials | $2/mo |
| CDN | CloudFront | Static site | $0–5/mo |
| Monitoring | CloudWatch | Logs + metrics | $0–10/mo |
| **Total** | | | **$81–106/mo** |

```bash
# ECS Task Definition — Orchestrator
cat > task-def.json << 'EOF'
{
  "family": "steve-orchestrator",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [{
    "name": "steve-orchestrator",
    "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/steve-orchestrator:latest",
    "portMappings": [{ "containerPort": 3000, "protocol": "tcp" }],
    "healthCheck": {
      "command": ["CMD-SHELL", "curl -f http://localhost:3000/health || exit 1"],
      "interval": 30,
      "retries": 3
    },
    "secrets": [
      { "name": "DATABASE_URL", "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:steve/db-url" },
      { "name": "SECURITY_AUDIT_API_KEYS", "valueFrom": "arn:aws:secretsmanager:REGION:ACCOUNT:secret:steve/api-keys" }
    ],
    "environment": [
      { "name": "AI_ENGINE_URL", "value": "http://steve-ai-engine.steve-cluster:8100" },
      { "name": "PORT", "value": "3000" }
    ],
    "logConfiguration": {
      "logDriver": "awslogs",
      "options": {
        "awslogs-group": "/ecs/steve-orchestrator",
        "awslogs-region": "us-east-1",
        "awslogs-stream-prefix": "ecs"
      }
    }
  }]
}
EOF

# Register and deploy
aws ecs register-task-definition --cli-input-json file://task-def.json
aws ecs create-service \
  --cluster steve-cluster \
  --service-name steve-orchestrator \
  --task-definition steve-orchestrator \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration '{
    "awsvpcConfiguration": {
      "subnets": ["subnet-xxx"],
      "securityGroups": ["sg-xxx"],
      "assignPublicIp": "ENABLED"
    }
  }' \
  --load-balancers '[{
    "targetGroupArn": "arn:aws:elasticloadbalancing:...:targetgroup/steve/xxx",
    "containerName": "steve-orchestrator",
    "containerPort": 3000
  }]'
```

### AWS Production Checklist

- [ ] VPC with private subnets for ECS tasks + RDS
- [ ] ALB in public subnet with HTTPS (ACM certificate)
- [ ] RDS not publicly accessible (private subnet only)
- [ ] ECS tasks pull secrets from Secrets Manager
- [ ] CloudWatch alarms on 5xx errors and high latency
- [ ] RDS automated backups enabled (7-day retention)
- [ ] ECR image scanning enabled
- [ ] WAF on ALB for rate limiting

---

## Azure Deployment

### Azure Free Tier ($0/month)

Azure offers generous always-free and 12-month free services.

| Component | Azure Service | Free Tier Limit |
|-----------|---------------|-----------------|
| Orchestrator | Container Apps | 2M requests/mo, 180,000 vCPU-s, 360,000 GiB-s (always free) |
| Database | Azure Database for PostgreSQL Flexible | Burstable B1ms — 12 months free (750 hrs/mo) |
| Secrets | Key Vault | 10,000 operations/mo (always free) |
| Container Registry | ACR Basic | — (use Docker Hub free or GitHub Container Registry) |
| Monitoring | Application Insights | 5 GB/mo ingestion (always free) |

#### Deploy with Container Apps (Free)

```bash
# 1. Create resource group and environment
az group create --name steve-rg --location eastus
az containerapp env create \
  --name steve-env \
  --resource-group steve-rg \
  --location eastus

# 2. Create PostgreSQL (12-month free: Burstable B1ms, 32 GB)
az postgres flexible-server create \
  --resource-group steve-rg \
  --name steve-db \
  --location eastus \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --storage-size 32 \
  --admin-user steve \
  --admin-password STRONG_PASSWORD_HERE \
  --version 16 \
  --yes

# Create the database
az postgres flexible-server db create \
  --resource-group steve-rg \
  --server-name steve-db \
  --database-name steve

# Allow Azure services to connect
az postgres flexible-server firewall-rule create \
  --resource-group steve-rg \
  --name steve-db \
  --rule-name AllowAzure \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

# 3. Apply migrations
PGHOST=steve-db.postgres.database.azure.com \
PGUSER=steve PGPASSWORD=STRONG_PASSWORD_HERE PGDATABASE=steve \
psql -f packages/db/migrations/001-init.sql
psql -f packages/db/migrations/002-website-auth.sql

# 4. Deploy the orchestrator (free consumption plan)
az containerapp create \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --environment steve-env \
  --image ghcr.io/arihant1208/steve-orchestrator:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 0 \
  --max-replicas 1 \
  --cpu 0.25 --memory 0.5Gi \
  --env-vars \
    "SECURITY_AUDIT_API_KEYS=your-key-here" \
    "DATABASE_URL=postgresql://steve:STRONG_PASSWORD_HERE@steve-db.postgres.database.azure.com:5432/steve?sslmode=require" \
    "PORT=3000"
```

Endpoint: `https://steve-orchestrator.<env-hash>.eastus.azurecontainerapps.io`

#### Alternative: Azure App Service (Free F1)

```bash
# Free F1: 60 min compute/day, 1 GB RAM, shared infrastructure
# Good for testing, not for production (sleeps after inactivity)
az webapp create \
  --resource-group steve-rg \
  --plan steve-plan \
  --name steve-security-agent \
  --deployment-container-image-name ghcr.io/arihant1208/steve-orchestrator:latest

az appservice plan create \
  --name steve-plan \
  --resource-group steve-rg \
  --sku F1 --is-linux

az webapp config appsettings set \
  --resource-group steve-rg \
  --name steve-security-agent \
  --settings SECURITY_AUDIT_API_KEYS="your-key" PORT=8080
```

Endpoint: `https://steve-security-agent.azurewebsites.net`

### Azure Paid ($25–150/month)

| Component | Service | Config | Cost |
|-----------|---------|--------|------|
| Orchestrator | Container Apps (Dedicated) | 2 replicas, 0.5 vCPU / 1 GB | $30/mo |
| AI Engine | Container Apps (Dedicated) | 1 replica, 1 vCPU / 2 GB | $45/mo |
| Database | PostgreSQL Flexible (Burstable B2s) | 2 vCPU, 4 GB, 64 GB storage | $25/mo |
| Secrets | Key Vault | Standard | $0.03/op |
| CDN | Azure Front Door (Free tier) | Global routing + caching | $0 |
| Monitoring | Application Insights | 5 GB/mo free | $0 |
| **Total** | | | **$100–150/mo** |

```bash
# Production Container Apps with dedicated workload profile
az containerapp env create \
  --name steve-env-prod \
  --resource-group steve-rg \
  --location eastus \
  --enable-workload-profiles

# Orchestrator — dedicated compute, always on
az containerapp create \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --environment steve-env-prod \
  --image ghcr.io/arihant1208/steve-orchestrator:latest \
  --target-port 3000 \
  --ingress external \
  --min-replicas 2 --max-replicas 10 \
  --cpu 0.5 --memory 1Gi \
  --secrets "db-url=postgresql://steve:PASSWORD@steve-db.postgres.database.azure.com:5432/steve?sslmode=require" \
  --env-vars "DATABASE_URL=secretref:db-url" "PORT=3000"

# AI Engine — internal only
az containerapp create \
  --name steve-ai-engine \
  --resource-group steve-rg \
  --environment steve-env-prod \
  --image ghcr.io/arihant1208/steve-ai-engine:latest \
  --target-port 8100 \
  --ingress internal \
  --min-replicas 1 --max-replicas 5 \
  --cpu 1 --memory 2Gi

# Connect orchestrator to AI engine (internal FQDN)
az containerapp update \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --set-env-vars "AI_ENGINE_URL=http://steve-ai-engine.internal.eastus.azurecontainerapps.io:8100"

# Custom domain + managed certificate
az containerapp hostname add \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --hostname steve.yourdomain.com

az containerapp hostname bind \
  --name steve-orchestrator \
  --resource-group steve-rg \
  --hostname steve.yourdomain.com \
  --environment steve-env-prod \
  --validation-method CNAME
```

### Azure Production Checklist

- [ ] Container Apps environment with VNet integration
- [ ] PostgreSQL in private subnet (private endpoint)
- [ ] Key Vault for all secrets (not env vars)
- [ ] Managed identity for Container Apps → Key Vault access
- [ ] Application Insights connected for APM
- [ ] Azure Front Door or custom domain with HTTPS
- [ ] Database geo-redundant backups enabled
- [ ] Diagnostic settings → Log Analytics workspace

---

## Google Cloud Deployment

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

---

## Cloud Comparison at a Glance

| | AWS | Azure | GCP |
|---|---|---|---|
| **Free tier compute** | App Runner (1K req/mo) | Container Apps (2M req/mo) | Cloud Run (2M req/mo) |
| **Free tier DB** | RDS t4g.micro (12 mo) | PostgreSQL B1ms (12 mo) | Cloud SQL f1-micro (trial) |
| **Best free option** | App Runner + RDS | Container Apps + PostgreSQL Flex | Cloud Run + AlloyDB trial |
| **Paid entry point** | ~$80/mo (ECS Fargate) | ~$100/mo (Container Apps Dedicated) | ~$50/mo (Cloud Run + Cloud SQL) |
| **Lowest cold start** | App Runner (~1-2s) | Container Apps (~2-3s) | Cloud Run (~1-2s) |
| **Easiest setup** | App Runner | Container Apps | Cloud Run |
| **Enterprise features** | ALB, WAF, VPC, IAM | Front Door, VNet, Managed Identity | Cloud Armor, VPC SC |
| **Best for** | AWS-native orgs | Microsoft/Azure shops | Cost-optimized, GCP users |

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
