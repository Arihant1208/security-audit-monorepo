---
description: "Docker and infrastructure standards. Multi-stage builds, layer caching, security, compose patterns, deployment configuration."
applyTo: "**/Dockerfile*,**/docker-compose*"
---

# Docker & Infrastructure Standards

## Dockerfile

### Multi-Stage Build Pattern
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine AS runtime
WORKDIR /app
RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

### Rules
- Pin base image versions: `node:20.11-alpine`, not `node:latest`
- Non-root user in runtime containers (security)
- `.dockerignore` excluding: `node_modules`, `.git`, `*.md`, test files
- COPY package files first, then install, then COPY source (layer caching)
- Use `npm ci` (not `npm install`) for reproducible builds
- HEALTHCHECK in every Dockerfile
- One process per container

## Docker Compose

### Structure
```yaml
services:
  app:
    build: .
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 10s
      timeout: 5s
      retries: 3

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

volumes:
  pgdata:
```

### Rules
- Health checks on all services
- Named volumes for persistent data
- `depends_on` with `condition: service_healthy`
- Environment variables from `.env` file (not inline)
- Expose only necessary ports to host

## Environment Variables
- Document all vars in `.env.example` with dummy values
- Group by concern: DB, auth, API, feature flags
- Validate env vars at application startup (fail fast)
- Use defaults for non-sensitive optional vars
- Never commit `.env` files (only `.env.example`)

## CI/CD Pipeline Order
1. **Lint** — fast, catches obvious issues
2. **Type check** — catches type errors
3. **Unit tests** — fast feedback
4. **Build** — compile/bundle
5. **Integration tests** — against real services
6. **Security scan** — dependency and image vulnerabilities
7. **Deploy** — to staging, then production

## Deployment Rules
- Same image for all environments (config via env vars)
- Database migrations run before application deployment
- Health check must pass before routing traffic
- Automated rollback on health check failure
- Zero-downtime deployments (rolling or blue-green)
