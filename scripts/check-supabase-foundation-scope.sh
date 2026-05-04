#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${SUPABASE_FOUNDATION_BASE_REF:-origin/main}"
HEAD_REF="${SUPABASE_FOUNDATION_HEAD_REF:-HEAD}"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  git fetch origin main:refs/remotes/origin/main >/dev/null 2>&1 || true
fi

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  if git rev-parse --verify main >/dev/null 2>&1; then
    BASE_REF="main"
  else
    echo "[scope] Não foi possível localizar origin/main ou main para auditoria de escopo." >&2
    exit 1
  fi
fi

changed_files="$(git diff --name-only "$BASE_REF"..."$HEAD_REF")"

if [[ -z "$changed_files" ]]; then
  echo "[scope] Nenhum arquivo alterado em relação a $BASE_REF."
  exit 0
fi

is_allowed() {
  local path="$1"
  case "$path" in
    supabase/*) return 0 ;;
    scripts/run-supabase-tests.sh) return 0 ;;
    scripts/check-supabase-foundation-scope.sh) return 0 ;;
    scripts/run-generate-trainings-concurrency-test.sh) return 0 ;;
    .github/workflows/supabase-foundation.yml) return 0 ;;
    src/lib/supabase.ts) return 0 ;;
    src/features/auth/SupabaseAuthProvider.tsx) return 0 ;;
    docs/supabase-foundation.md) return 0 ;;
    docs/pwa-cache-legado.md) return 0 ;;
    package.json) return 0 ;;
    package-lock.json) return 0 ;;
    *) return 1 ;;
  esac
}

blocked=0
while IFS= read -r file; do
  [[ -z "$file" ]] && continue
  if ! is_allowed "$file"; then
    echo "[scope] BLOQUEADO fora da allowlist: $file" >&2
    blocked=1
  fi
done <<< "$changed_files"

# Regras semânticas mínimas para arquivos permitidos perigosos.
if [[ -f src/lib/supabase.ts ]]; then
  if grep -RInE "service[_-]?role|SERVICE_ROLE|SUPABASE_SERVICE|from '@/stores|from '../stores|src/stores|from '@/db|from '../db|src/db|syncEndpoint|Apps Script" src/lib/supabase.ts >/tmp/cepraea_scope_supabase_lib.txt 2>/dev/null; then
    echo "[scope] BLOQUEADO: src/lib/supabase.ts contém acoplamento/segredo proibido:" >&2
    cat /tmp/cepraea_scope_supabase_lib.txt >&2
    blocked=1
  fi
fi

if [[ -f src/features/auth/SupabaseAuthProvider.tsx ]]; then
  if grep -RInE "LoginPage|Router|Routes|Navigate|useNavigate|src/stores|from '@/stores|from '../stores|src/db|from '@/db|from '../db|syncEndpoint|Apps Script|localStorage|sessionStorage" src/features/auth/SupabaseAuthProvider.tsx >/tmp/cepraea_scope_auth_provider.txt 2>/dev/null; then
    echo "[scope] BLOQUEADO: SupabaseAuthProvider contém acoplamento operacional proibido:" >&2
    cat /tmp/cepraea_scope_auth_provider.txt >&2
    blocked=1
  fi
fi

if [[ -f .github/workflows/supabase-foundation.yml ]]; then
  if grep -RInE "continue-on-error:\s*true|\|\|\s*true|if:\s*\$\{\{\s*false|SUPABASE_SERVICE|SERVICE_ROLE|secrets\.SUPABASE_SERVICE" .github/workflows/supabase-foundation.yml >/tmp/cepraea_scope_workflow.txt 2>/dev/null; then
    echo "[scope] BLOQUEADO: workflow contém fallback permissivo/segredo proibido:" >&2
    cat /tmp/cepraea_scope_workflow.txt >&2
    blocked=1
  fi
fi

if [[ -f package.json ]]; then
  if grep -nE "noUnusedLocals false|--noUnusedLocals false|\|\| true|continue-on-error|service[_-]?role|SUPABASE_SERVICE" package.json >/tmp/cepraea_scope_package.txt 2>/dev/null; then
    echo "[scope] BLOQUEADO: package.json contém relaxamento/fallback proibido:" >&2
    cat /tmp/cepraea_scope_package.txt >&2
    blocked=1
  fi
fi

if [[ "$blocked" -ne 0 ]]; then
  echo "[scope] Auditoria de escopo da fundação Supabase falhou." >&2
  exit 1
fi

echo "[scope] Auditoria de escopo da fundação Supabase aprovada."
