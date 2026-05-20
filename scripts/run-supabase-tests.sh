#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/team_integrity.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/athlete_auth.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/grants.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_generate_trainings.test.sql
bash scripts/run-generate-trainings-concurrency-test.sh
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_presence_tokens.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_confirm_presence.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_attendance_write.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_codebook_labels.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_live_entries_rpc_create.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_dec006_acao_terminal.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_out_rule.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_rastreabilidade.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_rpc_write_read.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_security_rls.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_security_grants.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_rpc_grants.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_integration_flow.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_ssot_audit.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_dod_verification.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_game_athletes.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/scout_rpc_finish_type_alignment_0032.test.sql
