#!/usr/bin/env bash
set -euo pipefail

scope="${AGENT_SCOPE:-code}"

run_cmd() {
  local cmd="$1"
  echo "[agent-check] running: $cmd"
  bash -lc "$cmd"
}

# Base gate for all code/documented changes.
run_cmd "npm run typecheck"
run_cmd "npm test"
run_cmd "npm run build"

if [[ "$scope" == *"ui"* ]]; then
  run_cmd "npm run test:e2e"
fi

if [[ "$scope" == *"supabase"* ]]; then
  run_cmd "supabase db reset"
  run_cmd "npm run test:supabase"
fi

if [[ "$scope" == *"preview"* ]]; then
  run_cmd "npm run test:smoke"
fi

if [[ "$scope" == *"scout"* ]]; then
  if [[ -z "${SMOKE_BASE_URL:-}" ]]; then
    echo "SMOKE_BASE_URL is required when AGENT_SCOPE includes 'scout'." >&2
    exit 1
  fi
  run_cmd "SMOKE_BASE_URL=\"$SMOKE_BASE_URL\" npm run test:smoke:scout:preview"
fi

echo "[agent-check] completed successfully for scope: $scope"
