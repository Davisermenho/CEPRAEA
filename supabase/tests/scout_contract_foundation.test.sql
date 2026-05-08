-- Scout contract foundation checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '70000000-0000-0000-0000-000000000401',
    '10000000-0000-0000-0000-000000000001',
    '2026-11-01',
    'CEPRAEA',
    'Adversario Foundation',
    'em_andamento'
  ),
  (
    '70000000-0000-0000-0000-000000000402',
    '10000000-0000-0000-0000-000000000002',
    '2026-11-02',
    'Outra Equipe',
    'Adversario Foundation',
    'em_andamento'
  );

-- Foundation objects must exist and be row-level secured from birth.
do $$
begin
  if to_regclass('public.scout_plays') is null then
    raise exception 'missing relation public.scout_plays';
  end if;
  if to_regclass('public.scout_play_participations') is null then
    raise exception 'missing relation public.scout_play_participations';
  end if;
  if to_regclass('public.scout_mental_events') is null then
    raise exception 'missing relation public.scout_mental_events';
  end if;
  if to_regclass('public.scout_play_validations') is null then
    raise exception 'missing relation public.scout_play_validations';
  end if;
  if to_regclass('public.athlete_scout_profiles') is null then
    raise exception 'missing relation public.athlete_scout_profiles';
  end if;
  if to_regclass('public.scout_catalog_teams') is null then
    raise exception 'missing relation public.scout_catalog_teams';
  end if;

  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_plays'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_plays';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_play_participations'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_play_participations';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_mental_events'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_mental_events';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_play_validations'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_play_validations';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'athlete_scout_profiles'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.athlete_scout_profiles';
  end if;
  if not exists (
    select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'scout_catalog_teams'
      and c.relrowsecurity = true and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_catalog_teams';
  end if;
end $$;

-- Constraint presence: these are the structural promises of 0008.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'scout_plays_game_team_fk') then
    raise exception 'missing scout_plays_game_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_plays_temp_pivot_athlete_team_fk') then
    raise exception 'missing scout_plays_temp_pivot_athlete_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_plays_team_game_code_key') then
    raise exception 'missing scout_plays_team_game_code_key';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_play_participations_play_team_fk') then
    raise exception 'missing scout_play_participations_play_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_play_participations_slot_key') then
    raise exception 'missing scout_play_participations_slot_key';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_play_participations_identity_check') then
    raise exception 'missing scout_play_participations_identity_check';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_mental_events_play_team_fk') then
    raise exception 'missing scout_mental_events_play_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_play_validations_play_team_fk') then
    raise exception 'missing scout_play_validations_play_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'athlete_scout_profiles_athlete_team_fk') then
    raise exception 'missing athlete_scout_profiles_athlete_team_fk';
  end if;
end $$;

insert into public.scout_plays (
  id,
  team_id,
  scout_game_id,
  play_code,
  session_date,
  session_type,
  opponent_name,
  period,
  game_clock,
  source,
  phase_of_ball,
  attacking_team_side,
  defending_team_side,
  factual_result,
  validation_status
) values
  (
    '71000000-0000-0000-0000-000000000401',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000401',
    'PLAY-001',
    '2026-11-01',
    'JOGO',
    'Adversario Foundation',
    'SET_1',
    '03:21',
    'VIDEO',
    'AT_POS',
    'ANALYZED',
    'OPPONENT',
    'GOL',
    'PENDENTE'
  );

-- Duplicate play code inside the same game/team must fail.
do $$
begin
  begin
    insert into public.scout_plays (
      team_id,
      scout_game_id,
      play_code,
      session_date,
      session_type,
      period,
      game_clock,
      source,
      phase_of_ball,
      attacking_team_side,
      defending_team_side,
      factual_result
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000401',
      'PLAY-001',
      '2026-11-01',
      'JOGO',
      'SET_1',
      '03:22',
      'VIDEO',
      'AT_POS',
      'ANALYZED',
      'OPPONENT',
      'GOL'
    );
    raise exception 'duplicate play_code unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;
end $$;

-- Cross-team play insert must fail through composite FK.
do $$
begin
  begin
    insert into public.scout_plays (
      team_id,
      scout_game_id,
      play_code,
      session_date,
      session_type,
      period,
      game_clock,
      source,
      phase_of_ball,
      attacking_team_side,
      defending_team_side,
      factual_result
    ) values (
      '10000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000401',
      'PLAY-XTEAM',
      '2026-11-02',
      'JOGO',
      'SET_1',
      '00:11',
      'VIDEO',
      'DEF_POS',
      'OPPONENT',
      'ANALYZED',
      'DEFENDIDO'
    );
    raise exception 'cross-team scout_plays insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

insert into public.scout_play_participations (
  id,
  team_id,
  scout_game_id,
  scout_play_id,
  participant_scope,
  participant_side,
  slot_order,
  athlete_id,
  phase_of_athlete,
  participation_role,
  position_code,
  action_code,
  individual_result
) values (
  '72000000-0000-0000-0000-000000000401',
  '10000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000401',
  '71000000-0000-0000-0000-000000000401',
  'ATQ',
  'ANALYZED',
  1,
  '20000000-0000-0000-0000-000000000001',
  'AT_POS',
  'FINALIZADORA',
  'LE',
  'GIRO',
  'SUCESSO'
);

-- Duplicate slot in same play/side/scope must fail.
do $$
begin
  begin
    insert into public.scout_play_participations (
      team_id,
      scout_game_id,
      scout_play_id,
      participant_scope,
      participant_side,
      slot_order,
      athlete_id,
      participation_role
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000401',
      '71000000-0000-0000-0000-000000000401',
      'ATQ',
      'ANALYZED',
      1,
      '20000000-0000-0000-0000-000000000002',
      'ASSISTENTE_DIRETA'
    );
    raise exception 'duplicate participation slot unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;
end $$;

-- Identity check must reject participation without athlete or external label.
do $$
begin
  begin
    insert into public.scout_play_participations (
      team_id,
      scout_game_id,
      scout_play_id,
      participant_scope,
      participant_side,
      slot_order,
      participation_role
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000401',
      '71000000-0000-0000-0000-000000000401',
      'DEF',
      'OPPONENT',
      2,
      'SEM_PARTICIPACAO_DIRETA'
    );
    raise exception 'participation without identity unexpectedly succeeded';
  exception when check_violation then
    null;
  end;
end $$;

-- Cross-team athlete reference must fail structurally.
do $$
begin
  begin
    insert into public.scout_play_participations (
      team_id,
      scout_game_id,
      scout_play_id,
      participant_scope,
      participant_side,
      slot_order,
      athlete_id,
      participation_role
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000401',
      '71000000-0000-0000-0000-000000000401',
      'DEF',
      'ANALYZED',
      2,
      '20000000-0000-0000-0000-000000000003',
      'APOIO'
    );
    raise exception 'cross-team participation athlete unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

insert into public.scout_mental_events (
  id,
  team_id,
  scout_game_id,
  scout_play_id,
  athlete_id,
  mental_code,
  mental_mark
) values (
  '73000000-0000-0000-0000-000000000401',
  '10000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000401',
  '71000000-0000-0000-0000-000000000401',
  '20000000-0000-0000-0000-000000000001',
  'AET',
  '+'
);

insert into public.scout_play_validations (
  id,
  team_id,
  scout_game_id,
  scout_play_id,
  field_name,
  validation_status,
  correction_reason
) values (
  '74000000-0000-0000-0000-000000000401',
  '10000000-0000-0000-0000-000000000001',
  '70000000-0000-0000-0000-000000000401',
  '71000000-0000-0000-0000-000000000401',
  'factual_result',
  'CORRIGIDO',
  'Ajuste de validacao manual'
);

insert into public.athlete_scout_profiles (
  athlete_id,
  team_id,
  dominant_hand,
  main_function,
  pos_of_3x1
) values (
  '20000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  'DESTRA',
  'GOLEIRA',
  'CE'
);

-- Cross-team athlete scout profile must fail structurally.
do $$
begin
  begin
    insert into public.athlete_scout_profiles (
      athlete_id,
      team_id,
      dominant_hand
    ) values (
      '20000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      'CANHOTA'
    );
    raise exception 'cross-team athlete_scout_profiles insert unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

insert into public.scout_catalog_teams (
  id,
  team_id,
  name,
  team_type,
  category,
  is_internal
) values (
  '75000000-0000-0000-0000-000000000401',
  '10000000-0000-0000-0000-000000000001',
  'Adversario Catalogado',
  'ADVERSARIA',
  'ADULTO',
  false
);

-- The new scout tables should be fail-closed before policies/grants of 0009.
do $$
begin
  if exists (
    select 1
    from pg_policy p
    join pg_class c on c.oid = p.polrelid
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname in (
        'scout_plays',
        'scout_play_participations',
        'scout_mental_events',
        'scout_play_validations',
        'athlete_scout_profiles',
        'scout_catalog_teams'
      )
  ) then
    raise exception '0008 should not create scout policies yet';
  end if;
end $$;

rollback;
