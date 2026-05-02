#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/team_integrity.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/grants.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_generate_trainings.test.sql
bash scripts/run-generate-trainings-concurrency-test.sh
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_presence_tokens.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_confirm_presence.test.sql
