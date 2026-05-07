#!/usr/bin/env bash
# check-runtime-legacy.sh
# Retorna exit code 1 se encontrar referências de runtime legado ativas em src/
set -euo pipefail

FAIL=0
SEARCH_ROOT="src"

# Sanity check: garantir que grep funciona e que a detecção não é um falso negativo silencioso
if ! echo "from '@/lib/sync'" | grep -qE "from ['\"].*lib/sync['\"]" 2>/dev/null; then
  echo "ERROR: self-test do grep falhou — ferramenta de detecção quebrada" >&2
  exit 2
fi

echo "=== Checagem de legado de runtime ==="

GREP_EXCL=(
  --exclude-dir='__tests__'
  --exclude='*.test.ts'
  --exclude='*.test.tsx'
  --exclude='*.spec.ts'
  --exclude='*.spec.tsx'
)

# Padrão regex: retorna FAIL se encontrar matches
check_regex() {
  local label="$1"
  local pattern="$2"
  local matches
  matches="$(grep -rn --include='*.ts' --include='*.tsx' "${GREP_EXCL[@]}" -E "$pattern" "$SEARCH_ROOT" 2>/dev/null)" || true
  if [ -n "$matches" ]; then
    echo "[FAIL] $label"
    printf '%s\n' "$matches" | head -5
    FAIL=1
  else
    echo "[OK]   $label"
  fi
}

# Padrão fixo (literal): retorna FAIL se encontrar matches
# $3 opcional: diretório adicional a excluir (ex: "db")
check_fixed() {
  local label="$1"
  local pattern="$2"
  local extra_excl="${3:-}"
  local matches
  local excl_args=("${GREP_EXCL[@]}")
  if [ -n "$extra_excl" ]; then
    excl_args+=("--exclude-dir=$extra_excl")
  fi
  matches="$(grep -rn --include='*.ts' --include='*.tsx' "${excl_args[@]}" -F "$pattern" "$SEARCH_ROOT" 2>/dev/null)" || true
  if [ -n "$matches" ]; then
    echo "[FAIL] $label"
    printf '%s\n' "$matches" | head -5
    FAIL=1
  else
    echo "[OK]   $label"
  fi
}

check_regex "sync.ts importado em runtime" "from ['\"].*lib/sync['\"]"
check_fixed "getDB( em runtime"            "getDB("          "db"
check_fixed "db.put('athletes')"           "db.put('athletes'" "db"
check_fixed "db.put('trainings')"          "db.put('trainings'" "db"
check_fixed "db.put('attendance)"          "db.put('attendance" "db"
check_fixed "db.getAll('athletes')"        "db.getAll('athletes'" "db"
check_fixed "db.getAll('trainings')"       "db.getAll('trainings'" "db"
check_fixed "db.getAll('attendance)"       "db.getAll('attendance" "db"
check_fixed "pullConfirmations legado"     "pullConfirmations"
check_fixed "pushConfirmation legado"      "pushConfirmation"
check_fixed "loadSyncConfig legado"        "loadSyncConfig"
check_fixed "resolveEndpointUrl legado"    "resolveEndpointUrl"
check_regex "athleteAuth.ts importado"     "from ['\"].*athleteAuth['\"]"

echo ""
if [ "$FAIL" -ne 0 ]; then
  echo "RESULTADO: FAIL — legado de runtime ainda ativo."
  exit 1
else
  echo "RESULTADO: OK — nenhum legado de runtime detectado."
  exit 0
fi
