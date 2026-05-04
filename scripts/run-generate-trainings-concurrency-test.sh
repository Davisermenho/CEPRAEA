#!/usr/bin/env bash
set -euo pipefail

DB_URL="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
OWNER_ID="00000000-0000-0000-0000-000000000001"
TEAM_ID="10000000-0000-0000-0000-000000000001"

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

SQL_CALL="$TMP_DIR/generate.sql"
cat > "$SQL_CALL" <<SQL
\\set ON_ERROR_STOP on
set role authenticated;
set request.jwt.claim.sub = '$OWNER_ID';
select * from public.generate_trainings(
  '$TEAM_ID',
  null,
  '2026-07-01'::date,
  '2026-07-31'::date,
  array[0,4],
  '20:00'::time,
  '21:30'::time,
  'America/Sao_Paulo',
  'recorrente',
  'Concorrência'
);
SQL

# Quatro conexões/processos independentes para aproximar colisão real.
for idx in 1 2 3 4; do
  psql "$DB_URL" -v ON_ERROR_STOP=1 -f "$SQL_CALL" >"$TMP_DIR/out-$idx.log" 2>"$TMP_DIR/err-$idx.log" &
  pids[$idx]=$!
done

failed=0
for idx in 1 2 3 4; do
  if ! wait "${pids[$idx]}"; then
    echo "[concurrency] chamada paralela $idx falhou" >&2
    cat "$TMP_DIR/err-$idx.log" >&2 || true
    failed=1
  fi
done

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi

psql "$DB_URL" -v ON_ERROR_STOP=1 <<SQL
\\set ON_ERROR_STOP on
set role authenticated;
set request.jwt.claim.sub = '$OWNER_ID';
do \$\$
declare
  total int;
  distinct_keys int;
  duplicate_keys int;
  expected int;
  audit_count int;
begin
  select count(*), count(distinct generation_key)
  into total, distinct_keys
  from public.trainings
  where team_id = '$TEAM_ID'
    and location = 'Concorrência'
    and training_date between '2026-07-01'::date and '2026-07-31'::date;

  select count(*)
  into duplicate_keys
  from (
    select generation_key
    from public.trainings
    where team_id = '$TEAM_ID'
      and location = 'Concorrência'
      and training_date between '2026-07-01'::date and '2026-07-31'::date
    group by generation_key
    having count(*) > 1
  ) d;

  select count(*)
  into expected
  from generate_series('2026-07-01'::date, '2026-07-31'::date, interval '1 day') gs
  where extract(dow from gs)::int in (0,4);

  select count(*)
  into audit_count
  from public.audit_logs
  where team_id = '$TEAM_ID'
    and action = 'generate_trainings'
    and metadata->>'attempted' is not null;

  if total <> expected then
    raise exception 'concurrent generate_trainings expected % final trainings, got %', expected, total;
  end if;

  if total <> distinct_keys or duplicate_keys <> 0 then
    raise exception 'concurrent generate_trainings created duplicate generation_key values';
  end if;

  if exists (
    select 1
    from public.trainings
    where team_id = '$TEAM_ID'
      and location = 'Concorrência'
      and (generation_key is null or starts_at is null or presence_lock_at is null)
  ) then
    raise exception 'concurrent generate_trainings left incomplete training rows';
  end if;

  if audit_count = 0 then
    raise exception 'concurrent generate_trainings did not write audit logs';
  end if;
end \$\$;
SQL

echo "[concurrency] generate_trainings concorrente aprovado."
