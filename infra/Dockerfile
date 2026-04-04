# Build context: repository root (run with `docker build -f infra/Dockerfile .`)
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies (monorepo root + mcp-server workspace)
COPY package.json package-lock.json* ./
COPY packages/mcp-server/package.json packages/mcp-server/
RUN npm ci --ignore-scripts --workspace=packages/mcp-server

# Build the MCP server
COPY packages/mcp-server/tsconfig.json packages/mcp-server/
COPY packages/mcp-server/src/ packages/mcp-server/src/
RUN npm run build --workspace=packages/mcp-server

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/packages/mcp-server/dist dist/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/packages/mcp-server/package.json ./
COPY data/ data/

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
