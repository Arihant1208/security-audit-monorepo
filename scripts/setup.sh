#!/usr/bin/env bash
set -euo pipefail

# Security Audit Framework — Local Setup
# Run from repo root: bash scripts/setup.sh

echo "==> Installing npm dependencies..."
npm install

echo "==> Starting Docker services (Postgres + MCP server)..."
docker compose -f infra/docker-compose.yml up -d

echo "==> Waiting for PostgreSQL to be ready..."
until docker compose -f infra/docker-compose.yml exec -T db pg_isready -U secaudit > /dev/null 2>&1; do
  sleep 1
done

echo "==> Database ready. Migrations and seed data applied by Docker entrypoint."

echo ""
echo "==> Setup complete!"
echo ""
echo "  MCP server:  http://localhost:3000/mcp"
echo "  Health:       http://localhost:3000/health"
echo "  Test API key: sa_test_localdev1234567890abcdef"
echo ""
echo "  Try: curl http://localhost:3000/health"
