#!/usr/bin/env bash
set -euo pipefail

report_file="${1:-${AGENT_REPORT_FILE:-}}"

if [[ -z "$report_file" ]]; then
  echo "Usage: scripts/agent-final-report-check.sh <report-file>" >&2
  exit 1
fi

if [[ ! -f "$report_file" ]]; then
  echo "agent-final-report-check: file not found: $report_file" >&2
  exit 1
fi

required_sections=(
  "Resumo"
  "Arquivos alterados"
  "Ferramentas usadas"
  "Validação executada"
  "Preview Vercel"
  "Riscos / Pendências"
)

for section in "${required_sections[@]}"; do
  if ! grep -qi "$section" "$report_file"; then
    echo "agent-final-report-check: missing section '$section'" >&2
    exit 1
  fi
done

required_status_lines=(
  "npm run typecheck"
  "npm test"
  "npm run build"
  "npm run test:e2e"
  "npm run test:smoke"
  "npm run test:smoke:scout:preview"
  "npm run validate:mvp:v1"
)

for line in "${required_status_lines[@]}"; do
  if ! grep -q "$line" "$report_file"; then
    echo "agent-final-report-check: missing validation status line '$line'" >&2
    exit 1
  fi
done

echo "agent-final-report-check: OK"
