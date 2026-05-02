-- Structural tenant-integrity checks. Run after migrations + seed.
-- These tests intentionally bypass RLS as the migration/test owner and prove the database
-- rejects cross-team relationships even if application/RPC code is wrong.
\set ON_ERROR_STOP on

begin;

insert into public.trainings (
  id, team_id, type, status, training_date, start_time, end_time, timezone,
  starts_at, presence_lock_at, generation_key
) values
  (
    '30000000-0000-0000-0000-000000000301',
    '10000000-0000-0000-0000-000000000001',
    'extra', 'agendado', '2026-10-01', '20:00', '21:30', 'America/Sao_Paulo',
    now() + interval '20 days', now() + interval '19 days', 'integrity:cepraea:training'
  ),
  (
    '30000000-0000-0000-0000-000000000302',
    '10000000-0000-0000-0000-000000000002',
    'extra', 'agendado', '2026-10-02', '20:00', '21:30', 'America/Sao_Paulo',
    now() + interval '21 days', now() + interval '20 days', 'integrity:other:training'
  );

insert into public.presence_token_batches (
  id, team_id, training_id, created_by, status
) values (
  '50000000-0000-0000-0000-000000000301',
  '10000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000301',
  '00000000-0000-0000-0000-000000000001',
  'created'
);

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '70000000-0000-0000-0000-000000000301',
  '10000000-0000-0000-0000-000000000001',
  '2026-10-03', 'CEPRAEA', 'Adversário', 'em_andamento'
);

-- Constraint existence: fail if any composite FK/unique required by foundation is missing.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'trainings_id_team_id_key') then
    raise exception 'missing trainings unique(id, team_id)';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'athletes_id_team_id_key') then
    raise exception 'missing athletes unique(id, team_id)';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presence_token_batches_id_team_id_key') then
    raise exception 'missing presence_token_batches unique(id, team_id)';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_games_id_team_id_key') then
    raise exception 'missing scout_games unique(id, team_id)';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'attendance_records_training_team_fk') then
    raise exception 'missing attendance training/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'attendance_records_athlete_team_fk') then
    raise exception 'missing attendance athlete/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presence_token_batches_training_team_fk') then
    raise exception 'missing presence batch training/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presence_tokens_batch_team_fk') then
    raise exception 'missing presence token batch/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presence_tokens_training_team_fk') then
    raise exception 'missing presence token training/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'presence_tokens_athlete_team_fk') then
    raise exception 'missing presence token athlete/team FK';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_events_game_team_fk') then
    raise exception 'missing scout event game/team FK';
  end if;
end $$;

-- Cross-team attendance: CEPRAEA row cannot reference other-team training.
do $$
begin
  begin
    insert into public.attendance_records (
      team_id, training_id, athlete_id, status
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000302',
      '20000000-0000-0000-0000-000000000001',
      'pendente'
    );
    raise exception 'cross-team attendance training insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;

  begin
    insert into public.attendance_records (
      team_id, training_id, athlete_id, status
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000301',
      '20000000-0000-0000-0000-000000000003',
      'pendente'
    );
    raise exception 'cross-team attendance athlete insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

-- Cross-team presence batch/token relationships must fail structurally.
do $$
begin
  begin
    insert into public.presence_token_batches (
      team_id, training_id, created_by, status
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '30000000-0000-0000-0000-000000000302',
      '00000000-0000-0000-0000-000000000001',
      'created'
    );
    raise exception 'cross-team presence batch insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;

  begin
    insert into public.presence_tokens (
      team_id, batch_id, training_id, athlete_id, token_hash, expires_at, created_by
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000301',
      '30000000-0000-0000-0000-000000000302',
      '20000000-0000-0000-0000-000000000001',
      'integrity-cross-training',
      now() + interval '7 days',
      '00000000-0000-0000-0000-000000000001'
    );
    raise exception 'cross-team presence token training insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;

  begin
    insert into public.presence_tokens (
      team_id, batch_id, training_id, athlete_id, token_hash, expires_at, created_by
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '50000000-0000-0000-0000-000000000301',
      '30000000-0000-0000-0000-000000000301',
      '20000000-0000-0000-0000-000000000003',
      'integrity-cross-athlete',
      now() + interval '7 days',
      '00000000-0000-0000-0000-000000000001'
    );
    raise exception 'cross-team presence token athlete insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

-- Cross-team scout event must fail structurally.
do $$
begin
  begin
    insert into public.scout_events (
      team_id, scout_game_id, payload
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000301',
      '{"type":"cross-team"}'::jsonb
    );
    raise exception 'cross-team scout event insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

rollback;
