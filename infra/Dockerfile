# Build context: repository root (run with `docker build -f infra/Dockerfile .`)
FROM node:20-alpine AS builder
WORKDIR /app
COPY packages/mcp-server/package.json packages/mcp-server/package-lock.json* ./
RUN npm ci --ignore-scripts
COPY packages/mcp-server/tsconfig.json ./
COPY packages/mcp-server/src/ src/
RUN npm run build

FROM node:20-alpine
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=builder /app/dist dist/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/package.json ./
COPY data/ data/

USER appuser
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s \
  CMD wget -q --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
