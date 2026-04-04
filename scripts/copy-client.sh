#!/usr/bin/env bash
set -euo pipefail

# Copy client files (agents, prompts, MCP config) into a target project.
# Usage: bash scripts/copy-client.sh /path/to/target-project

TARGET="${1:?Usage: bash scripts/copy-client.sh <target-directory>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLIENT_DIR="$SCRIPT_DIR/../packages/client"

if [ ! -d "$CLIENT_DIR" ]; then
  echo "Error: Client directory not found at $CLIENT_DIR"
  exit 1
fi

echo "==> Copying client files to $TARGET ..."

# Create target directories
mkdir -p "$TARGET/.github/agents"
mkdir -p "$TARGET/.github/prompts"
mkdir -p "$TARGET/.vscode"

# Copy files
cp "$CLIENT_DIR/.github/agents/"*.agent.md "$TARGET/.github/agents/"
cp "$CLIENT_DIR/.github/prompts/"*.prompt.md "$TARGET/.github/prompts/"
cp "$CLIENT_DIR/.vscode/mcp.json" "$TARGET/.vscode/"
cp "$CLIENT_DIR/.gitignore" "$TARGET/" 2>/dev/null || true

echo "==> Done. Files copied:"
echo "    .github/agents/security-scanner.agent.md"
echo "    .github/agents/security-reporter.agent.md"
echo "    .github/agents/security-fixer.agent.md"
echo "    .github/prompts/scan-codebase.prompt.md"
echo "    .github/prompts/generate-report.prompt.md"
echo "    .github/prompts/fix-vulnerabilities.prompt.md"
echo "    .github/prompts/full-audit.prompt.md"
echo "    .vscode/mcp.json"
echo ""
echo "Open VS Code in $TARGET and use /full-audit in Copilot Chat."
