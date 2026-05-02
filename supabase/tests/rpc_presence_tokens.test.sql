-- presence token batch RPC checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select * from public.generate_trainings(
  '10000000-0000-0000-0000-000000000001',
  null,
  '2026-07-02'::date,
  '2026-07-02'::date,
  array[4],
  '20:00'::time,
  '21:30'::time,
  'America/Sao_Paulo',
  'recorrente',
  'Teste'
);

create temporary table test_training as
select id as training_id
from public.trainings
where team_id = '10000000-0000-0000-0000-000000000001'
order by starts_at desc
limit 1;

create temporary table token_result as
select *
from public.create_presence_token_batch(
  '10000000-0000-0000-0000-000000000001',
  (select training_id from test_training limit 1),
  now() + interval '7 days'
);

do $$
declare
  result_count int;
  batch_count int;
  token_count int;
begin
  select count(*) into result_count from token_result;
  select count(*) into batch_count from public.presence_token_batches where team_id = '10000000-0000-0000-0000-000000000001';
  select count(*) into token_count from public.presence_tokens where team_id = '10000000-0000-0000-0000-000000000001';

  if result_count < 2 then
    raise exception 'batch should return plain tokens for active athletes';
  end if;
  if batch_count <> 1 then
    raise exception 'one batch should be created';
  end if;
  if token_count <> result_count then
    raise exception 'token row count should match returned token count';
  end if;
  if exists (select 1 from public.presence_tokens pt join token_result tr on tr.token = pt.token_hash) then
    raise exception 'plain token must not be stored as token_hash';
  end if;
end $$;

-- Active batch prevents another active batch.
do $$
begin
  begin
    perform * from public.create_presence_token_batch(
      '10000000-0000-0000-0000-000000000001',
      (select training_id from test_training limit 1),
      now() + interval '7 days'
    );
    raise exception 'second active batch created unexpectedly';
  exception when others then
    if sqlerrm not like '%active token batch already exists%' then
      raise;
    end if;
  end;
end $$;

select public.mark_presence_token_batch_exported((select batch_id from token_result limit 1));

do $$
begin
  if not exists (select 1 from public.presence_token_batches where status = 'exported' and exported_at is not null) then
    raise exception 'batch should be marked exported';
  end if;
end $$;

select public.revoke_presence_token_batch((select batch_id from token_result limit 1));

do $$
begin
  if not exists (select 1 from public.presence_token_batches where status = 'revoked' and revoked_at is not null) then
    raise exception 'batch should be revoked';
  end if;
  if exists (select 1 from public.presence_tokens where revoked_at is null) then
    raise exception 'tokens in revoked batch should be revoked';
  end if;
end $$;

rollback;
