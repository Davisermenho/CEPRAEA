#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BASE_REF="${1:-origin/main}"
HEAD_REF="${2:-HEAD}"
CROSSWALK_FILE="ontology/migration/crosswalk-cepr-bh.md"

if ! git rev-parse --verify "$BASE_REF" >/dev/null 2>&1; then
  echo "[ERROR] Base ref não encontrado: $BASE_REF"
  exit 1
fi

if ! git rev-parse --verify "$HEAD_REF" >/dev/null 2>&1; then
  echo "[ERROR] Head ref não encontrado: $HEAD_REF"
  exit 1
fi

if [ ! -f "$CROSSWALK_FILE" ]; then
  echo "[ERROR] Crosswalk obrigatório ausente: $CROSSWALK_FILE"
  exit 1
fi

if ! grep -Eq '^Status:\s*APPROVED\s*$' "$CROSSWALK_FILE"; then
  echo "[ERROR] Crosswalk não está aprovado (Status: APPROVED): $CROSSWALK_FILE"
  exit 1
fi

if grep -Eq '\|\s*KEEP_SEPARATE\s*\|' "$CROSSWALK_FILE"; then
  echo "[ERROR] Decisão não permitida encontrada no crosswalk: KEEP_SEPARATE"
  exit 1
fi

invalid_rows="$(grep -En '^\| CW-[^|]*\|' "$CROSSWALK_FILE" | grep -Ev '\| (ADOPT|ALIAS|SPLIT|DEPRECATE) \|' || true)"
if [ -n "$invalid_rows" ]; then
  echo "[ERROR] Linhas de crosswalk com decisão inválida (permitido: ADOPT|ALIAS|SPLIT|DEPRECATE):"
  echo "$invalid_rows"
  exit 1
fi

RANGE="$(git merge-base "$BASE_REF" "$HEAD_REF")..$HEAD_REF"
new_ontology_assets="$({
  git diff --name-only --diff-filter=A "$RANGE" -- 'ontology/**/*.ttl' 'ontology/**/*.shacl' 'ontology/**/*.rq' 2>/dev/null || true
  git diff --name-only --diff-filter=A "$RANGE" -- 'ontology/**/*.shacl.ttl' 2>/dev/null || true
} | sort -u)"

if [ -z "$new_ontology_assets" ]; then
  echo "[OK] Nenhum novo ativo TTL/SHACL/RQ no range $RANGE"
  exit 0
fi

missing=0
while IFS= read -r asset; do
  [ -z "$asset" ] && continue

  if ! grep -Fq "$asset" "$CROSSWALK_FILE"; then
    echo "[ERROR] Ativo novo sem linha de crosswalk: $asset"
    missing=1
    continue
  fi

  matching_rows="$(grep -F "$asset" "$CROSSWALK_FILE" || true)"
  if [ -z "$matching_rows" ]; then
    echo "[ERROR] Ativo novo sem linha de crosswalk: $asset"
    missing=1
    continue
  fi

  if ! printf '%s\n' "$matching_rows" | grep -Eq '\| (ADOPT|ALIAS|SPLIT|DEPRECATE) \|' ; then
    echo "[ERROR] Ativo novo sem decisão permitida no crosswalk: $asset"
    missing=1
    continue
  fi

  if ! printf '%s\n' "$matching_rows" | grep -Eq '\| APPROVED \|' ; then
    echo "[ERROR] Ativo novo sem decisão/aprovação válida no crosswalk: $asset"
    missing=1
  fi
done <<< "$new_ontology_assets"

if [ "$missing" -ne 0 ]; then
  exit 1
fi

echo "[OK] Crosswalk aprovado cobre todos os novos ativos TTL/SHACL/RQ no range $RANGE"
