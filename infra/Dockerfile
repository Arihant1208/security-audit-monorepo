# Steve Orchestrator — Build context: repository root
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (monorepo root + core + orchestrator workspaces)
COPY package.json package-lock.json* ./
COPY packages/core/package.json packages/core/
COPY packages/orchestrator/package.json packages/orchestrator/
RUN npm ci --ignore-scripts

# Build core types first
COPY packages/core/tsconfig.json packages/core/
COPY packages/core/src/ packages/core/src/
RUN npm run build -w packages/core

# Build the orchestrator
COPY packages/orchestrator/tsconfig.json packages/orchestrator/
COPY packages/orchestrator/src/ packages/orchestrator/src/
RUN npm run build -w packages/orchestrator

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/packages/orchestrator/dist dist/
COPY --from=builder /app/packages/core/dist node_modules/@steve/core/dist/
COPY --from=builder /app/packages/core/package.json node_modules/@steve/core/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/packages/orchestrator/package.json ./
COPY data/ data/
COPY packages/site/ site/

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
