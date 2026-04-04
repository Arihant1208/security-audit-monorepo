#!/usr/bin/env bash
set -euo pipefail

# Build the MCP server
# Run from repo root: bash scripts/build.sh

echo "==> Building MCP server..."
npm run build -w packages/mcp-server
echo "==> Build complete. Output: packages/mcp-server/dist/"
