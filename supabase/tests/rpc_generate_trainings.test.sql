-- generate_trainings RPC checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

-- Owner can generate trainings.
select * from public.generate_trainings(
  '10000000-0000-0000-0000-000000000001',
  null,
  '2026-06-01'::date,
  '2026-06-14'::date,
  array[0,4],
  '20:00'::time,
  '21:30'::time,
  'America/Sao_Paulo',
  'recorrente',
  'Teste'
);

do $$
begin
  if (select count(*) from public.trainings where team_id = '10000000-0000-0000-0000-000000000001') = 0 then
    raise exception 'generate_trainings should create trainings';
  end if;
  if exists (select 1 from public.trainings where generation_key is null or starts_at is null or presence_lock_at is null) then
    raise exception 'generated trainings must include generation_key, starts_at and presence_lock_at';
  end if;
end $$;

-- Re-run must not duplicate.
select * from public.generate_trainings(
  '10000000-0000-0000-0000-000000000001',
  null,
  '2026-06-01'::date,
  '2026-06-14'::date,
  array[0,4],
  '20:00'::time,
  '21:30'::time,
  'America/Sao_Paulo',
  'recorrente',
  'Teste'
);

do $$
declare
  total int;
  distinct_keys int;
begin
  select count(*), count(distinct generation_key)
  into total, distinct_keys
  from public.trainings
  where team_id = '10000000-0000-0000-0000-000000000001';

  if total <> distinct_keys then
    raise exception 'generation_key uniqueness failed';
  end if;
end $$;

-- Coach can generate.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
select * from public.generate_trainings(
  '10000000-0000-0000-0000-000000000001',
  null,
  '2026-06-15'::date,
  '2026-06-15'::date,
  array[1],
  '07:30'::time,
  '09:00'::time,
  'America/Sao_Paulo',
  'extra',
  'Teste'
);

-- Other team owner cannot generate for CEPRAEA.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, '2026-06-20'::date, '2026-06-20'::date, array[6], '08:00'::time, '09:00'::time, 'America/Sao_Paulo', 'extra', 'Teste');
    raise exception 'other team owner generated CEPRAEA training unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then
      raise;
    end if;
  end;
end $$;

-- Simulated duplicate key proof: unique constraint must exist.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trainings_team_id_generation_key_key'
  ) then
    raise exception 'unique(team_id, generation_key) constraint missing';
  end if;
end $$;

rollback;
