#!/usr/bin/env bash
set -euo pipefail

report_file="${AGENT_REPORT_FILE:-}"
allowed_regex="${ALLOWED_PATHS_REGEX:-}"
scope="${AGENT_SCOPE:-code}"

list_changed_files() {
  local files=""

  if [[ -n "${BASE_SHA:-}" && -n "${HEAD_SHA:-}" ]]; then
    files="$(git diff --name-only "$BASE_SHA" "$HEAD_SHA")"
  elif [[ -n "$(git status --porcelain)" ]]; then
    files="$(
      {
        git diff --name-only
        git diff --name-only --cached
      } | sed '/^$/d' | sort -u
    )"
  elif git rev-parse --verify HEAD~1 >/dev/null 2>&1; then
    files="$(git diff --name-only HEAD~1 HEAD)"
  else
    files="$(git status --porcelain | awk '{print $2}')"
  fi

  printf '%s\n' "$files" | sed '/^$/d'
}

changed_files="$(list_changed_files || true)"
if [[ -z "$changed_files" ]]; then
  echo "verify-agent-evidence: no changed files detected." >&2
  exit 1
fi

if [[ -n "$allowed_regex" ]]; then
  invalid_files="$(printf '%s\n' "$changed_files" | grep -Ev "$allowed_regex" || true)"
  if [[ -n "$invalid_files" ]]; then
    echo "verify-agent-evidence: files outside allowed scope:" >&2
    printf '%s\n' "$invalid_files" >&2
    exit 1
  fi
fi

if [[ -z "$report_file" ]]; then
  echo "verify-agent-evidence: AGENT_REPORT_FILE was not provided." >&2
  exit 1
fi

if [[ ! -f "$report_file" ]]; then
  echo "verify-agent-evidence: report file not found: $report_file" >&2
  exit 1
fi

required_tokens=(
  "Escopo"
  "Arquivos alterados"
  "Ferramentas usadas"
  "Comandos executados"
  "Resultado"
  "Riscos"
)

for token in "${required_tokens[@]}"; do
  if ! grep -qi "$token" "$report_file"; then
    echo "verify-agent-evidence: missing token '$token' in report." >&2
    exit 1
  fi
done

if [[ "$scope" == *"scout"* ]]; then
  if ! grep -q "test:smoke:scout:preview" "$report_file"; then
    echo "verify-agent-evidence: scout scope requires smoke evidence in report." >&2
    exit 1
  fi
fi

echo "verify-agent-evidence: OK"
