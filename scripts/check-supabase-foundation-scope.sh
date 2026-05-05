#!/usr/bin/env bash
set -euo pipefail

BASE_REF="${GITHUB_BASE_REF:-main}"

if git rev-parse --verify "origin/${BASE_REF}" >/dev/null 2>&1; then
  BASE="origin/${BASE_REF}"
else
  git fetch origin "${BASE_REF}" --depth=1 >/dev/null 2>&1 || true
  BASE="origin/${BASE_REF}"
fi

if git rev-parse --verify "${BASE}" >/dev/null 2>&1; then
  CHANGED_FILES=$(git diff --name-only "${BASE}"...HEAD)
else
  CHANGED_FILES=$(git diff --name-only HEAD~1...HEAD)
fi

is_allowed() {
  local file="$1"
  case "$file" in
    supabase/*) return 0 ;;
    docs/*) return 0 ;;
    CHANGELOG.md) return 0 ;;
    package.json) return 0 ;;
    package-lock.json) return 0 ;;
    .github/workflows/supabase-foundation.yml) return 0 ;;
    .github/workflows/presence-token-batch-remote-validation.yml) return 0 ;;
    scripts/check-supabase-foundation-scope.sh) return 0 ;;
    scripts/validate-presence-token-batch.mjs) return 0 ;;
    src/App.tsx) return 0 ;;
    src/lib/supabase.ts) return 0 ;;
    src/features/auth/SupabaseAuthProvider.tsx) return 0 ;;
    src/features/auth/pages/LoginPage.tsx) return 0 ;;
    src/shared/layouts/AuthGuard.tsx) return 0 ;;
    src/features/settings/pages/SupabaseSettingsPage.tsx) return 0 ;;
    src/features/confirm/pages/PublicConfirmPage.tsx) return 0 ;;
    src/features/trainings/pages/TrainingDetailPage.tsx) return 0 ;;
    src/features/presence-tokens/*) return 0 ;;
    *) return 1 ;;
  esac
}

blocked=0

while IFS= read -r file; do
  [ -z "$file" ] && continue
  if ! is_allowed "$file"; then
    echo "[scope] BLOQUEADO fora da allowlist: $file"
    blocked=1
  fi
done <<< "$CHANGED_FILES"

if [ "$blocked" -ne 0 ]; then
  echo "[scope] Auditoria de escopo da fundação Supabase falhou."
  exit 1
fi

echo "[scope] Auditoria de escopo Supabase aprovada."
