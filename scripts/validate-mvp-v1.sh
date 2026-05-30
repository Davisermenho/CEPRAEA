#!/usr/bin/env bash
# validate-mvp-v1.sh — gate final do MVP v1.0
# Retorna exit code 0 apenas quando o produto cumprir todas as condições do MVP
set -euo pipefail

FAIL=0

run() {
  local label="$1"
  shift
  echo ""
  echo ">>> $label"
  if "$@"; then
    echo "[OK] $label"
  else
    echo "[FAIL] $label"
    FAIL=1
  fi
}

echo "========================================"
echo "  CEPRAEA — Validação Final MVP v1.0"
echo "========================================"

run "typecheck"              npm run typecheck
run "check:ontology:semantics" npm run check:ontology:semantics
run "validate:ontology:formal" npm run validate:ontology:formal
run "check:ontology:runtime-alignment" npm run check:ontology:runtime-alignment
run "unit tests"             npm test
run "build"                  npm run build
run "deps:check"             npm run deps:check
run "audit"                  npm audit
run "db reset (deterministic)" supabase db reset
run "test:supabase"          npm run test:supabase
run "e2e tests"              npm run test:e2e
run "check:runtime-legacy"   bash scripts/check-runtime-legacy.sh

echo ""
echo "========================================"
if [ "$FAIL" -ne 0 ]; then
  echo "  MVP v1.0: FAIL — veja falhas acima."
  echo "========================================"
  exit 1
else
  echo "  MVP v1.0: OK — todas as condições satisfeitas."
  echo "========================================"
  exit 0
fi
