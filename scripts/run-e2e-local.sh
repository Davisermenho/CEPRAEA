#!/usr/bin/env bash
set -euo pipefail

LOCK_DIR="${TMPDIR:-/tmp}/cepraea-e2e-suite.lock"
RUN_ID="${E2E_RUN_ID:-$(date +%s)-$$-${RANDOM:-0}}"

export E2E_RUN_ID="$RUN_ID"
export E2E_COACH_EMAIL="${E2E_COACH_EMAIL:-coach+${RUN_ID}@cepraea.test}"
DB_URL="${E2E_SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup EXIT

until mkdir "$LOCK_DIR" 2>/dev/null; do
  sleep 1
done

for _ in $(seq 1 60); do
  if psql "$DB_URL" -tA -c 'select 1' >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if ! psql "$DB_URL" -tA -c 'select 1' >/dev/null 2>&1; then
  echo "[FAIL] banco local não ficou pronto em 60s: $DB_URL" >&2
  exit 1
fi

playwright test --config=playwright.config.ts --reporter=line "$@"
