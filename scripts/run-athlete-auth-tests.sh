#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

echo "[test] Rodando testes de athlete auth..."
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/athlete_auth.test.sql

echo "[test] Testes de athlete auth concluídos."
