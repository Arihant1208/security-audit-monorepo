#!/usr/bin/env bash
set -euo pipefail

# Build the Steve orchestrator (MCP server + pipeline engine)
# Run from repo root: bash scripts/build.sh

echo "==> Building all packages..."
npm run build
echo "==> Build complete."
