#!/usr/bin/env bash
set -euo pipefail

LOCK_DIR="${TMPDIR:-/tmp}/cepraea-e2e-suite.lock"
RUN_ID="${E2E_RUN_ID:-$(date +%s)-$$-${RANDOM:-0}}"

export E2E_RUN_ID="$RUN_ID"
export E2E_COACH_EMAIL="${E2E_COACH_EMAIL:-coach+${RUN_ID}@cepraea.test}"

cleanup() {
  rmdir "$LOCK_DIR" 2>/dev/null || true
}

trap cleanup EXIT

until mkdir "$LOCK_DIR" 2>/dev/null; do
  sleep 1
done

playwright test --config=playwright.config.ts --reporter=line "$@"
