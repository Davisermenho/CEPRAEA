#!/usr/bin/env bash
# check-runtime-legacy.sh
# Retorna exit code 1 se encontrar referências de runtime legado ativas em src/
set -euo pipefail

FAIL=0

echo "=== Checagem de legado de runtime ==="

check() {
  local label="$1"
  local pattern="$2"
  if grep -rn --include="*.ts" --include="*.tsx" "$pattern" src/ 2>/dev/null \
      | grep -v '^\s*//' \
      | grep -q .; then
    echo "[FAIL] $label"
    grep -rn --include="*.ts" --include="*.tsx" "$pattern" src/ 2>/dev/null \
      | grep -v '^\s*//' | head -5
    FAIL=1
  else
    echo "[OK]   $label"
  fi
}

check "sync.ts importado em runtime"    "from ['\"].*lib/sync['\"]"
check "getDB( em stores/features"       "getDB("
check "db.put('athletes')"              "db\.put('athletes'"
check "db.put('trainings')"             "db\.put('trainings'"
check "db.put('attendance)"             "db\.put('attendance"
check "db.getAll('athletes')"           "db\.getAll('athletes'"
check "db.getAll('trainings')"          "db\.getAll('trainings'"
check "db.getAll('attendance)"          "db\.getAll('attendance"
check "pullConfirmations legado"        "pullConfirmations"
check "loadSyncConfig legado"           "loadSyncConfig"
check "resolveEndpointUrl legado"       "resolveEndpointUrl"
check "athleteAuth.ts importado"        "from ['\"].*athleteAuth['\"]"

echo ""
if [ "$FAIL" -ne 0 ]; then
  echo "RESULTADO: FAIL — legado de runtime ainda ativo."
  exit 1
else
  echo "RESULTADO: OK — nenhum legado de runtime detectado."
  exit 0
fi
