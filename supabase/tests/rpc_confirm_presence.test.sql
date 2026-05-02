-- confirm_presence_by_token RPC checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

select * from public.generate_trainings(
  '10000000-0000-0000-0000-000000000001',
  null,
  '2026-08-06'::date,
  '2026-08-06'::date,
  array[4],
  '20:00'::time,
  '21:30'::time,
  'America/Sao_Paulo',
  'recorrente',
  'Teste'
);

create temporary table token_result as
select *
from public.create_presence_token_batch(
  '10000000-0000-0000-0000-000000000001',
  (select id from public.trainings where team_id = '10000000-0000-0000-0000-000000000001' limit 1),
  now() + interval '7 days'
);

set local role anon;
set local request.jwt.claim.sub = '';

create temporary table confirm_result as
select * from public.confirm_presence_by_token((select token from token_result limit 1), 'presente', null);

do $$
begin
  if not exists (select 1 from confirm_result where ok = true and message = 'Presença registrada.') then
    raise exception 'valid token should confirm presence';
  end if;
  if not exists (select 1 from public.attendance_records where status = 'presente' and confirmed_by_athlete = true) then
    raise exception 'attendance record should be created';
  end if;
  if not exists (select 1 from public.presence_tokens where first_used_at is not null and last_used_at is not null and use_count = 1) then
    raise exception 'token usage fields should be updated';
  end if;
end $$;

-- Reuse before lock must update use_count.
select * from public.confirm_presence_by_token((select token from token_result limit 1), 'ausente', 'teste');

do $$
begin
  if not exists (select 1 from public.attendance_records where status = 'ausente' and justification = 'teste') then
    raise exception 'reused token should update attendance';
  end if;
  if not exists (select 1 from public.presence_tokens where use_count = 2) then
    raise exception 'token use_count should increment';
  end if;
end $$;

-- Invalid token must fail generically.
do $$
declare
  invalid_message text;
begin
  select message into invalid_message from public.confirm_presence_by_token('invalid-token', 'presente', null) limit 1;
  if invalid_message <> 'Link inválido, expirado ou indisponível.' then
    raise exception 'invalid token should fail generically';
  end if;
end $$;

-- Revoked batch must invalidate token generically.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
select public.revoke_presence_token_batch((select batch_id from token_result limit 1));

set local role anon;
set local request.jwt.claim.sub = '';
do $$
declare
  revoked_ok boolean;
  revoked_message text;
begin
  select ok, message into revoked_ok, revoked_message from public.confirm_presence_by_token((select token from token_result limit 1), 'presente', null) limit 1;
  if revoked_ok is true or revoked_message <> 'Link inválido, expirado ou indisponível.' then
    raise exception 'revoked token should fail generically';
  end if;
end $$;

rollback;
