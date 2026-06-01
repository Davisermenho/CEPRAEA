#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE_REF="${1:-origin/main}"
HEAD_REF="${2:-HEAD}"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "[ERROR] Base ref não encontrado: $BASE_REF"
  exit 1
fi

if ! git rev-parse --verify "$HEAD_REF" >/dev/null 2>&1; then
  echo "[ERROR] Head ref não encontrado: $HEAD_REF"
  exit 1
fi

RANGE="$(git merge-base "$BASE_REF" "$HEAD_REF")..$HEAD_REF"

changed_files="$(git diff --name-only --diff-filter=ACMR "$RANGE" || true)"
if [ -z "$changed_files" ]; then
  echo "[OK] Nenhuma mudança no range $RANGE"
  exit 0
fi

is_ontology_file() {
  local file="$1"
  case "$file" in
    *.ttl|*.rq|*.shacl|*.owl|*.nt|*.nq|*.md|*.json) return 0 ;;
    *) return 1 ;;
  esac
}

is_ontology_scoped_path() {
  local file="$1"

  case "$file" in
    ontology/*|shacl/*|examples/*|queries/competency/*)
      return 0
      ;;
    docs/ontologia/manuais/*|docs/ontologia/merge/*|docs/design/navegacao.drawio.svg)
      return 0
      ;;
    scripts/check-ontology-*|scripts/validate-ontology-formal.sh)
      return 0
      ;;
    .github/workflows/ontology-quality-gate.yml|package.json)
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

violations=()
while IFS= read -r file; do
  [ -z "$file" ] && continue

  if ! is_ontology_file "$file"; then
    continue
  fi

  if is_ontology_scoped_path "$file"; then
    continue
  fi

  if [[ "$file" == docs/ontologia/artigos/* ]] || [[ "$file" == onthbpraia/* ]]; then
    violations+=("$file")
  fi
done <<< "$changed_files"

if [ "${#violations[@]}" -gt 0 ]; then
  echo "[ERROR] Regressão de paths ontológicos: arquivos alterados fora do escopo canônico/transicional permitido."
  printf ' - %s\n' "${violations[@]}"
  echo "Ação: migrar para roots aprovadas (ontology/shacl/examples/queries/competency + docs/ontologia/manuais/merge) antes do merge."
  exit 1
fi

echo "[OK] Guard de path ontológico sem regressão no range $RANGE"
