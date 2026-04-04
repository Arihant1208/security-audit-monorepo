# Deployment Guide

## Free Tier Deployment Options

### Option 1: Render (Recommended)

**Free tier:** 750 hours/month, auto-sleep after 15 min inactivity, ~30s cold start.

1. Push the monorepo to a **private** GitHub repo.

2. Go to [render.com](https://render.com) → **New** → **Web Service** → connect your repo.

3. Configure:

   | Setting | Value |
   |---------|-------|
   | Name | `security-audit-mcp` |
   | Runtime | Docker |
   | Dockerfile Path | `infra/Dockerfile` |
   | Docker Build Context | `.` (repo root) |
   | Instance Type | Free |

4. Add environment variables:
   - `SECURITY_AUDIT_API_KEYS` = your comma-separated keys
   - `DATABASE_URL` = your Neon connection string (optional)

5. Deploy. Your endpoint: `https://security-audit-mcp.onrender.com/mcp`

**Or use the Render Blueprint** — push, then click "New Blueprint Instance" and point to `infra/render.yaml`.

---

### Option 2: Fly.io

**Free tier:** 3 shared-cpu-1x VMs, 256 MB RAM each.

```bash
fly auth login
fly launch --config infra/fly.toml --dockerfile infra/Dockerfile
fly secrets set SECURITY_AUDIT_API_KEYS="key1,key2"
fly secrets set DATABASE_URL="postgresql://..."
fly deploy --config infra/fly.toml --dockerfile infra/Dockerfile
```

Endpoint: `https://security-audit-mcp.fly.dev/mcp`

---

### Option 3: Railway

**Free trial:** $5 credit (~500 hours).

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub
2. Set Dockerfile path to `infra/Dockerfile`, context to `.`
3. Add env vars: `SECURITY_AUDIT_API_KEYS`, `DATABASE_URL`
4. Railway assigns a URL automatically

---

### Option 4: Hugging Face Spaces (Docker)

**Free tier:** Unlimited, 2 vCPU / 16 GB RAM. Must expose port 7860.

1. Create a Docker Space (private)
2. Copy monorepo files in
3. Set Space port to 7860: `CMD ["node", "dist/index.js", "--port", "7860"]`
4. Set secrets: `SECURITY_AUDIT_API_KEYS`

---

## Database Setup (Neon PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech) (free tier: 0.5 GB storage, 190 compute hours/month)
2. Create a project → copy the connection string
3. Run the migration:
   ```bash
   psql "postgresql://..." -f packages/db/migrations/001-init.sql
   ```
4. Set `DATABASE_URL` in your deployment platform's secrets

Without a database, auth falls back to the `SECURITY_AUDIT_API_KEYS` env var.

---

## Local Development with Docker

```bash
# From repo root
docker compose -f infra/docker-compose.yml up -d

# Verify
curl http://localhost:3000/health
# {"status":"ok","server":"security-audit-mcp","version":"1.0.0"}
```

This starts both the MCP server and a local PostgreSQL instance with seed data. The test API key is `sa_test_localdev1234567890abcdef`.

---

## Verification

After deployment, verify with:

```bash
# Health check
curl https://YOUR-URL/health

# Test auth (should return MCP initialization response)
curl -X POST https://YOUR-URL/mcp \
  -H "Content-Type: application/json" \
  -H "X-API-Key: YOUR_KEY" \
  -d '{"jsonrpc":"2.0","method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"test","version":"1.0"}},"id":1}'
```

---

## Security Checklist

Before going live:

- [ ] Repository is **private**
- [ ] `SECURITY_AUDIT_API_KEYS` or `DATABASE_URL` is set via platform secrets
- [ ] HTTPS enforced (all platforms above do this by default)
- [ ] `SECURITY_AUDIT_SKIP_AUTH` is **not** set
- [ ] Health check configured for uptime monitoring

---

## Platform Comparison

| Feature | Render | Fly.io | Railway | HF Spaces |
|---------|--------|--------|---------|-----------|
| Truly free | Yes (750h/mo) | Yes (3 VMs) | Trial ($5) | Yes |
| Cold start | ~30s | ~2-5s | None | ~30s |
| Custom domain | Yes | Yes | Paid | No |
| Docker support | Yes | Yes | Yes | Yes |
| Best for | Simple deploy | Low latency | No cold starts | Generous RAM |
