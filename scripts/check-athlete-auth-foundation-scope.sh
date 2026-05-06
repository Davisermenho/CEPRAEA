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
    # Supabase migration e testes de athlete auth
    supabase/migrations/0006_athlete_auth.sql) return 0 ;;
    supabase/tests/athlete_auth.test.sql) return 0 ;;

    # Código frontend de athlete auth
    src/App.tsx) return 0 ;;
    src/features/athletes/components/AthleteForm.tsx) return 0 ;;
    src/features/athletes/athleteApi.ts) return 0 ;;
    src/features/athletes/pages/AthletesPage.tsx) return 0 ;;
    src/features/atleta/pages/AtletaLoginPage.tsx) return 0 ;;
    src/features/atleta/pages/AtletaTreinoDetailPage.tsx) return 0 ;;
    src/features/atleta/pages/AtletaTreinosPage.tsx) return 0 ;;
    src/features/atleta/useCurrentAthlete.ts) return 0 ;;
    src/features/atleta/pages/AtletaNovaSenhaPage.tsx) return 0 ;;
    src/lib/export.ts) return 0 ;;
    src/lib/supabase.ts) return 0 ;;
    src/lib/sync.ts) return 0 ;;
    src/shared/layouts/AtletaGuard.tsx) return 0 ;;
    src/stores/athleteStore.ts) return 0 ;;
    src/types/index.ts) return 0 ;;

    # T04 — trainingStore Supabase-first
    src/features/trainings/trainingApi.ts) return 0 ;;
    src/features/trainings/pages/TrainingsPage.tsx) return 0 ;;
    src/stores/trainingStore.ts) return 0 ;;

    # T05 — attendanceStore Supabase-first
    src/features/trainings/pages/TrainingDetailPage.tsx) return 0 ;;
    src/stores/attendanceStore.ts) return 0 ;;

    # T02 — RPCs de attendance
    supabase/migrations/0007_attendance_write_rpcs.sql) return 0 ;;
    supabase/tests/rpc_attendance_write.test.sql) return 0 ;;

    # Infraestrutura do PR (package, workflow, scripts)
    .gitignore) return 0 ;;
    package.json) return 0 ;;
    package-lock.json) return 0 ;;
    .github/workflows/athlete-auth-foundation.yml) return 0 ;;
    .github/workflows/supabase-foundation.yml) return 0 ;;
    scripts/check-athlete-auth-foundation-scope.sh) return 0 ;;
    scripts/check-supabase-foundation-scope.sh) return 0 ;;
    scripts/check-runtime-legacy.sh) return 0 ;;
    scripts/run-athlete-auth-tests.sh) return 0 ;;
    scripts/run-supabase-tests.sh) return 0 ;;
    scripts/validate-mvp-v1.sh) return 0 ;;

    # Documentação
    CEPRAEA.md) return 0 ;;
    CHANGELOG.md) return 0 ;;
    .copilot/*) return 0 ;;

    *) return 1 ;;
  esac
}

blocked=0

while IFS= read -r file; do
  [ -z "$file" ] && continue
  if ! is_allowed "$file"; then
    echo "[scope] BLOQUEADO fora da allowlist de athlete-auth-foundation: $file"
    blocked=1
  fi
done <<< "$CHANGED_FILES"

if [ "$blocked" -ne 0 ]; then
  echo "[scope] Auditoria de escopo athlete-auth-foundation falhou."
  exit 1
fi

echo "[scope] Auditoria de escopo athlete-auth-foundation aprovada."
