-- RLS authorization checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

-- Fixtures for critical-table RLS checks. Inserted by migration owner/test connection,
-- then accessed through anon/authenticated roles below.
insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values
  (
    '30000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    'extra', 'agendado', '2026-08-01', '20:00', '21:30', 'America/Sao_Paulo',
    '2026-08-01 20:00:00-03', '2026-08-01 14:00:00-03', 'rls:cepraea:training'
  ),
  (
    '30000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    'extra', 'agendado', '2026-08-02', '20:00', '21:30', 'America/Sao_Paulo',
    '2026-08-02 20:00:00-03', '2026-08-02 14:00:00-03', 'rls:other:training'
  );

insert into public.attendance_records (
  id, team_id, training_id, athlete_id, status
) values
  (
    '40000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000101',
    '20000000-0000-0000-0000-000000000001',
    'pendente'
  ),
  (
    '40000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000102',
    '20000000-0000-0000-0000-000000000003',
    'pendente'
  );

insert into public.presence_token_batches (
  id, team_id, training_id, created_by, status
) values
  (
    '50000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000101',
    '00000000-0000-0000-0000-000000000001',
    'created'
  ),
  (
    '50000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000005',
    'created'
  );

insert into public.presence_tokens (
  id, team_id, batch_id, training_id, athlete_id, token_hash, expires_at, created_by
) values
  (
    '60000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '50000000-0000-0000-0000-000000000101',
    '30000000-0000-0000-0000-000000000101',
    '20000000-0000-0000-0000-000000000001',
    'rls-token-hash-cepraea', now() + interval '7 days',
    '00000000-0000-0000-0000-000000000001'
  ),
  (
    '60000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '50000000-0000-0000-0000-000000000102',
    '30000000-0000-0000-0000-000000000102',
    '20000000-0000-0000-0000-000000000003',
    'rls-token-hash-other', now() + interval '7 days',
    '00000000-0000-0000-0000-000000000005'
  );

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '70000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '2026-08-03', 'CEPRAEA', 'Adversário', 'em_andamento'
  ),
  (
    '70000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '2026-08-04', 'Outra Equipe', 'Adversário', 'em_andamento'
  );

insert into public.scout_events (
  id, team_id, scout_game_id, payload
) values
  (
    '80000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000101',
    '{"type":"serve"}'::jsonb
  ),
  (
    '80000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000102',
    '{"type":"serve"}'::jsonb
  );

insert into public.audit_logs (
  id, team_id, actor_user_id, actor_type, entity_type, entity_id, action, metadata
) values
  (
    '90000000-0000-0000-0000-000000000101',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'coach', 'trainings', '30000000-0000-0000-0000-000000000101', 'rls_fixture', '{}'::jsonb
  ),
  (
    '90000000-0000-0000-0000-000000000102',
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    'coach', 'trainings', '30000000-0000-0000-0000-000000000102', 'rls_fixture', '{}'::jsonb
  );

-- Owner CEPRAEA reads own team across critical tables and not another team.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'owner should read CEPRAEA athletes';
  end if;
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'owner CEPRAEA must not read other team athletes';
  end if;
  if not exists (select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own trainings';
  end if;
  if exists (select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000102') then
    raise exception 'owner must not read other team trainings';
  end if;
  if not exists (select 1 from public.attendance_records where id = '40000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own attendance';
  end if;
  if exists (select 1 from public.attendance_records where id = '40000000-0000-0000-0000-000000000102') then
    raise exception 'owner must not read other team attendance';
  end if;
  if not exists (select 1 from public.presence_token_batches where id = '50000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own presence batches';
  end if;
  if not exists (select 1 from public.presence_tokens where id = '60000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own presence tokens';
  end if;
  if not exists (select 1 from public.scout_games where id = '70000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own scout games';
  end if;
  if not exists (select 1 from public.scout_events where id = '80000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own scout events';
  end if;
  if not exists (select 1 from public.audit_logs where id = '90000000-0000-0000-0000-000000000101') then
    raise exception 'owner should read own audit logs';
  end if;
end $$;

-- Coach reads own team and not other team.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'coach should read CEPRAEA athletes';
  end if;
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'coach CEPRAEA must not read other team athletes';
  end if;
  if not exists (select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000101') then
    raise exception 'coach should read own trainings';
  end if;
  if exists (select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000102') then
    raise exception 'coach must not read other team trainings';
  end if;
  if not exists (select 1 from public.audit_logs where id = '90000000-0000-0000-0000-000000000101') then
    raise exception 'coach should read own audit logs';
  end if;
end $$;

-- Viewer reads non-sensitive own-team data, but cannot write or read sensitive tokens/audit logs.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  if (select count(*) from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') < 2 then
    raise exception 'viewer should read CEPRAEA athletes';
  end if;
  if not exists (select 1 from public.trainings where id = '30000000-0000-0000-0000-000000000101') then
    raise exception 'viewer should read own trainings';
  end if;
  if not exists (select 1 from public.attendance_records where id = '40000000-0000-0000-0000-000000000101') then
    raise exception 'viewer should read own attendance';
  end if;
  if not exists (select 1 from public.presence_token_batches where id = '50000000-0000-0000-0000-000000000101') then
    raise exception 'viewer should read own presence batches metadata';
  end if;
  if exists (select 1 from public.presence_tokens) then
    raise exception 'viewer must not read presence token hashes';
  end if;
  if not exists (select 1 from public.scout_games where id = '70000000-0000-0000-0000-000000000101') then
    raise exception 'viewer should read own scout games';
  end if;
  if not exists (select 1 from public.scout_events where id = '80000000-0000-0000-0000-000000000101') then
    raise exception 'viewer should read own scout events';
  end if;
  if exists (select 1 from public.audit_logs) then
    raise exception 'viewer must not read audit logs';
  end if;

  begin
    insert into public.athletes(team_id, name) values ('10000000-0000-0000-0000-000000000001', 'Viewer Should Fail');
    raise exception 'viewer inserted athlete unexpectedly';
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null;
  end;

  begin
    update public.trainings set notes = 'viewer should fail' where id = '30000000-0000-0000-0000-000000000101';
    if found then
      raise exception 'viewer updated training unexpectedly';
    end if;
  exception when insufficient_privilege or check_violation or with_check_option_violation then
    null;
  end;
end $$;

-- User without team cannot read private team data.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
begin
  if exists (select 1 from public.athletes) then raise exception 'user without team must not read athletes'; end if;
  if exists (select 1 from public.trainings) then raise exception 'user without team must not read trainings'; end if;
  if exists (select 1 from public.attendance_records) then raise exception 'user without team must not read attendance'; end if;
  if exists (select 1 from public.presence_token_batches) then raise exception 'user without team must not read presence batches'; end if;
  if exists (select 1 from public.presence_tokens) then raise exception 'user without team must not read presence tokens'; end if;
  if exists (select 1 from public.scout_games) then raise exception 'user without team must not read scout games'; end if;
  if exists (select 1 from public.scout_events) then raise exception 'user without team must not read scout events'; end if;
  if exists (select 1 from public.audit_logs) then raise exception 'user without team must not read audit logs'; end if;
end $$;

-- Owner from another team cannot read CEPRAEA, but can read own team.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  if exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000001') then
    raise exception 'other team owner must not read CEPRAEA athletes';
  end if;
  if not exists (select 1 from public.athletes where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'other team owner should read own team athletes';
  end if;
  if exists (select 1 from public.trainings where team_id = '10000000-0000-0000-0000-000000000001') then
    raise exception 'other team owner must not read CEPRAEA trainings';
  end if;
  if not exists (select 1 from public.trainings where team_id = '10000000-0000-0000-0000-000000000002') then
    raise exception 'other team owner should read own trainings';
  end if;
end $$;

-- Anonymous cannot read private tables.
set local role anon;
set local request.jwt.claim.sub = '';
do $$
begin
  if exists (select 1 from public.athletes) then raise exception 'anon must not read athletes'; end if;
  if exists (select 1 from public.trainings) then raise exception 'anon must not read trainings'; end if;
  if exists (select 1 from public.attendance_records) then raise exception 'anon must not read attendance'; end if;
  if exists (select 1 from public.presence_token_batches) then raise exception 'anon must not read presence batches'; end if;
  if exists (select 1 from public.presence_tokens) then raise exception 'anon must not read presence tokens'; end if;
  if exists (select 1 from public.scout_games) then raise exception 'anon must not read scout games'; end if;
  if exists (select 1 from public.scout_events) then raise exception 'anon must not read scout events'; end if;
  if exists (select 1 from public.audit_logs) then raise exception 'anon must not read audit logs'; end if;
end $$;

rollback;
