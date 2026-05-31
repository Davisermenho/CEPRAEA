#!/usr/bin/env bash
set -euo pipefail

LOCK_DIR="${TMPDIR:-/tmp}/cepraea-e2e-suite.lock"
RUN_ID="${E2E_RUN_ID:-$(date +%s)-$$-${RANDOM:-0}}"

export E2E_RUN_ID="$RUN_ID"
export E2E_COACH_EMAIL="${E2E_COACH_EMAIL:-coach+${RUN_ID}@cepraea.test}"
DB_URL="${E2E_SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
MAX_WAIT_SECONDS="${E2E_DB_READY_TIMEOUT_SECONDS:-120}"
PW_WORKERS="${PW_WORKERS:-1}"

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup EXIT

until mkdir "$LOCK_DIR" 2>/dev/null; do
  sleep 1
done

for _ in $(seq 1 "$MAX_WAIT_SECONDS"); do
  if command -v pg_isready >/dev/null 2>&1 && ! pg_isready -d "$DB_URL" >/dev/null 2>&1; then
    sleep 1
    continue
  fi

  if ! psql "$DB_URL" -tA -c 'select 1' >/dev/null 2>&1; then
    sleep 1
    continue
  fi

  DB_RECOVERY_STATE="$(psql "$DB_URL" -tA -c 'select pg_is_in_recovery()' 2>/dev/null || echo 't')"
  if [ "$DB_RECOVERY_STATE" = "f" ]; then
    break
  fi

  sleep 1
done

if ! psql "$DB_URL" -tA -c 'select 1' >/dev/null 2>&1; then
  echo "[FAIL] banco local não ficou pronto em ${MAX_WAIT_SECONDS}s: $DB_URL" >&2
  exit 1
fi

if [ "$(psql "$DB_URL" -tA -c 'select pg_is_in_recovery()' 2>/dev/null || echo 't')" != "f" ]; then
  echo "[FAIL] banco local respondeu, mas permaneceu em recovery mode após ${MAX_WAIT_SECONDS}s: $DB_URL" >&2
  exit 1
fi

PW_WORKERS="$PW_WORKERS" playwright test --config=playwright.config.ts --reporter=line "$@"
