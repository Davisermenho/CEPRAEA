-- RPC grant checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

-- Prepare one CEPRAEA training and one other-team training for cross-team RPC checks.
insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values
  (
    '30000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000001',
    'extra', 'agendado', '2026-09-01', '20:00', '21:30', 'America/Sao_Paulo',
    now() + interval '14 days', now() + interval '13 days', 'grants:cepraea:training'
  ),
  (
    '30000000-0000-0000-0000-000000000202',
    '10000000-0000-0000-0000-000000000002',
    'extra', 'agendado', '2026-09-02', '20:00', '21:30', 'America/Sao_Paulo',
    now() + interval '15 days', now() + interval '14 days', 'grants:other:training'
  );

insert into public.presence_token_batches (
  id, team_id, training_id, created_by, status
) values
  (
    '50000000-0000-0000-0000-000000000201',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000001',
    'created'
  ),
  (
    '50000000-0000-0000-0000-000000000202',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000202',
    '00000000-0000-0000-0000-000000000005',
    'created'
  );

-- Grant matrix for anon/authenticated.
-- This test runs as postgres, so invoking a denied RPC directly would not simulate a real
-- client permission boundary. Validate EXECUTE grants through the catalog instead.
do $$
begin
  if not has_function_privilege('anon', 'public.confirm_presence_by_token(text, text, text)', 'EXECUTE') then
    raise exception 'anon should execute confirm_presence_by_token';
  end if;

  if has_function_privilege('anon', 'public.generate_trainings(uuid, uuid, date, date, integer[], time without time zone, time without time zone, text, text, text)', 'EXECUTE') then
    raise exception 'anon should not execute generate_trainings';
  end if;

  if has_function_privilege('anon', 'public.create_presence_token_batch(uuid, uuid, timestamp with time zone)', 'EXECUTE') then
    raise exception 'anon should not execute create_presence_token_batch';
  end if;

  if has_function_privilege('anon', 'public.mark_presence_token_batch_exported(uuid)', 'EXECUTE') then
    raise exception 'anon should not execute mark_presence_token_batch_exported';
  end if;

  if has_function_privilege('anon', 'public.revoke_presence_token_batch(uuid)', 'EXECUTE') then
    raise exception 'anon should not execute revoke_presence_token_batch';
  end if;

  if not has_function_privilege('authenticated', 'public.generate_trainings(uuid, uuid, date, date, integer[], time without time zone, time without time zone, text, text, text)', 'EXECUTE') then
    raise exception 'authenticated should execute generate_trainings';
  end if;

  if not has_function_privilege('authenticated', 'public.create_presence_token_batch(uuid, uuid, timestamp with time zone)', 'EXECUTE') then
    raise exception 'authenticated should execute create_presence_token_batch';
  end if;

  if not has_function_privilege('authenticated', 'public.mark_presence_token_batch_exported(uuid)', 'EXECUTE') then
    raise exception 'authenticated should execute mark_presence_token_batch_exported';
  end if;

  if not has_function_privilege('authenticated', 'public.revoke_presence_token_batch(uuid)', 'EXECUTE') then
    raise exception 'authenticated should execute revoke_presence_token_batch';
  end if;

  if has_function_privilege('authenticated', 'public.confirm_presence_by_token(text, text, text)', 'EXECUTE') then
    raise exception 'authenticated should not execute confirm_presence_by_token';
  end if;
end $$;

-- Viewer has authenticated grant but must be denied by RPC internal role checks.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, current_date, current_date, array[extract(dow from current_date)::int], '20:00'::time, '21:30'::time, 'America/Sao_Paulo', 'recorrente', 'Teste');
    raise exception 'viewer executed generate_trainings unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.create_presence_token_batch('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000201', now() + interval '7 days');
    raise exception 'viewer executed create_presence_token_batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.mark_presence_token_batch_exported('50000000-0000-0000-0000-000000000201');
    raise exception 'viewer executed mark_presence_token_batch_exported unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.revoke_presence_token_batch('50000000-0000-0000-0000-000000000201');
    raise exception 'viewer executed revoke_presence_token_batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

-- Authenticated user without team is denied by internal checks.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
begin
  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, current_date, current_date, array[extract(dow from current_date)::int], '20:00'::time, '21:30'::time, 'America/Sao_Paulo', 'recorrente', 'Teste');
    raise exception 'user_no_team executed generate_trainings unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.create_presence_token_batch('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000201', now() + interval '7 days');
    raise exception 'user_no_team executed create_presence_token_batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

-- Owner from another team cannot act on CEPRAEA IDs.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  begin
    perform public.generate_trainings('10000000-0000-0000-0000-000000000001', null, '2026-09-10'::date, '2026-09-10'::date, array[4], '08:00'::time, '09:00'::time, 'America/Sao_Paulo', 'extra', 'Teste');
    raise exception 'other team owner generated CEPRAEA training unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.create_presence_token_batch('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000201', now() + interval '7 days');
    raise exception 'other team owner created CEPRAEA token batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.mark_presence_token_batch_exported('50000000-0000-0000-0000-000000000201');
    raise exception 'other team owner exported CEPRAEA batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.revoke_presence_token_batch('50000000-0000-0000-0000-000000000201');
    raise exception 'other team owner revoked CEPRAEA batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  -- The same user may act on its own team batch; this proves denial above is tenant-based, not broken grant.
  perform public.mark_presence_token_batch_exported('50000000-0000-0000-0000-000000000202');
end $$;

-- Coach from CEPRAEA cannot use valid IDs from another team.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$
begin
  begin
    perform public.create_presence_token_batch('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000202', now() + interval '7 days');
    raise exception 'coach created batch with other-team training unexpectedly';
  exception when others then
    if sqlerrm not like '%training not found%' then raise; end if;
  end;

  begin
    perform public.mark_presence_token_batch_exported('50000000-0000-0000-0000-000000000202');
    raise exception 'coach exported other-team batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.revoke_presence_token_batch('50000000-0000-0000-0000-000000000202');
    raise exception 'coach revoked other-team batch unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

rollback;
