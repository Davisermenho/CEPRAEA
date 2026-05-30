#!/usr/bin/env bash
# check-headers.sh — CEPR-AUTH-02D
# Verifica os 6 headers de segurança em uma URL Vercel.
# Uso: bash scripts/check-headers.sh <URL>
# Retorna exit 1 se algum header obrigatório estiver ausente.

set -euo pipefail

URL="${1:-}"
if [[ -z "$URL" ]]; then
  echo "Uso: $0 <URL>" >&2
  exit 1
fi

echo "Verificando headers de segurança em: $URL"
echo ""

RESPONSE=$(curl -sI "$URL")
FAILED=0

check_header() {
  local name="$1"
  local pattern="$2"
  if echo "$RESPONSE" | grep -qi "$pattern"; then
    echo "  [OK]  $name"
  else
    echo "  [FAIL] $name — ausente ou inválido"
    FAILED=1
  fi
}

check_header "Strict-Transport-Security"           "strict-transport-security:"
check_header "Content-Security-Policy-Report-Only" "content-security-policy-report-only:"
check_header "X-Frame-Options"                     "x-frame-options:"
check_header "X-Content-Type-Options"              "x-content-type-options:"
check_header "Referrer-Policy"                     "referrer-policy:"
check_header "Permissions-Policy"                  "permissions-policy:"

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "Todos os 6 headers presentes. OK"
  exit 0
else
  echo "Um ou mais headers ausentes. FALHA"
  exit 1
fi
