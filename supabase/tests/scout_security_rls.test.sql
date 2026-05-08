-- Scout security RLS checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '70000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-01',
    'CEPRAEA',
    'Adversario RLS',
    'em_andamento'
  ),
  (
    '70000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    '2026-12-02',
    'Outra Equipe',
    'Adversario RLS',
    'em_andamento'
  );

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
  factual_result
) values
  (
    '71000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000501',
    'RLS-PLAY-001',
    '2026-12-01',
    'JOGO',
    'Adversario RLS',
    'SET_1',
    '01:11',
    'VIDEO',
    'AT_POS',
    'ANALYZED',
    'OPPONENT',
    'GOL'
  ),
  (
    '71000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000502',
    'RLS-PLAY-002',
    '2026-12-02',
    'JOGO',
    'Adversario RLS',
    'SET_1',
    '02:22',
    'VIDEO',
    'DEF_POS',
    'OPPONENT',
    'ANALYZED',
    'DEFENDIDO'
  );

insert into public.scout_play_participations (
  id, team_id, scout_game_id, scout_play_id, participant_scope, participant_side,
  slot_order, athlete_id, phase_of_athlete, participation_role, position_code, action_code
) values
  (
    '72000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000501',
    '71000000-0000-0000-0000-000000000501',
    'ATQ', 'ANALYZED', 1,
    '20000000-0000-0000-0000-000000000001',
    'AT_POS', 'FINALIZADORA', 'LE', 'GIRO'
  ),
  (
    '72000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000502',
    '71000000-0000-0000-0000-000000000502',
    'DEF', 'ANALYZED', 1,
    '20000000-0000-0000-0000-000000000003',
    'DEF_POS', 'APOIO', 'DEF_BASE', 'BLOQ_GIRO'
  );

insert into public.scout_mental_events (
  id, team_id, scout_game_id, scout_play_id, athlete_id, mental_code, mental_mark
) values
  (
    '73000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000501',
    '71000000-0000-0000-0000-000000000501',
    '20000000-0000-0000-0000-000000000001',
    'AET',
    '+'
  ),
  (
    '73000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000502',
    '71000000-0000-0000-0000-000000000502',
    '20000000-0000-0000-0000-000000000003',
    'CF',
    '-'
  );

insert into public.scout_play_validations (
  id, team_id, scout_game_id, scout_play_id, field_name, validation_status, correction_reason
) values
  (
    '74000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000501',
    '71000000-0000-0000-0000-000000000501',
    'factual_result',
    'CORRIGIDO',
    'Ajuste CEPRAEA'
  ),
  (
    '74000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    '70000000-0000-0000-0000-000000000502',
    '71000000-0000-0000-0000-000000000502',
    'factual_result',
    'REVISADO',
    'Ajuste outra equipe'
  );

insert into public.athlete_scout_profiles (
  athlete_id, team_id, dominant_hand, main_function
) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    'DESTRA',
    'GOLEIRA'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000002',
    'CANHOTA',
    'PIVO'
  );

insert into public.scout_catalog_teams (
  id, team_id, name, team_type, category
) values
  (
    '75000000-0000-0000-0000-000000000501',
    '10000000-0000-0000-0000-000000000001',
    'Adversario CEPRAEA',
    'ADVERSARIA',
    'ADULTO'
  ),
  (
    '75000000-0000-0000-0000-000000000502',
    '10000000-0000-0000-0000-000000000002',
    'Adversario Outra',
    'ADVERSARIA',
    'ADULTO'
  );

-- Owner CEPRAEA reads own team only and can write own team.
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if not exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000501') then
    raise exception 'owner should read own scout_plays';
  end if;
  if exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000502') then
    raise exception 'owner must not read other team scout_plays';
  end if;
  if not exists (select 1 from public.scout_play_participations where id = '72000000-0000-0000-0000-000000000501') then
    raise exception 'owner should read own scout_play_participations';
  end if;
  if not exists (select 1 from public.scout_mental_events where id = '73000000-0000-0000-0000-000000000501') then
    raise exception 'owner should read own scout_mental_events';
  end if;
  if not exists (select 1 from public.scout_play_validations where id = '74000000-0000-0000-0000-000000000501') then
    raise exception 'owner should read own scout_play_validations';
  end if;
  if not exists (select 1 from public.athlete_scout_profiles where athlete_id = '20000000-0000-0000-0000-000000000001') then
    raise exception 'owner should read own athlete_scout_profiles';
  end if;
  if not exists (select 1 from public.scout_catalog_teams where id = '75000000-0000-0000-0000-000000000501') then
    raise exception 'owner should read own scout_catalog_teams';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_FASES') then
    raise exception 'owner should read scout codebook';
  end if;

  insert into public.scout_plays (
    id, team_id, scout_game_id, play_code, session_date, session_type, period,
    game_clock, source, phase_of_ball, attacking_team_side, defending_team_side, factual_result
  ) values (
    '71000000-0000-0000-0000-000000000511',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000501',
    'RLS-PLAY-INSERT-OWNER',
    '2026-12-01',
    'JOGO',
    'SET_1',
    '03:33',
    'VIDEO',
    'AT_POS',
    'ANALYZED',
    'OPPONENT',
    'GOL'
  );
end $$;

-- Coach CEPRAEA can write own team and not another team.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$
begin
  insert into public.scout_catalog_teams (
    id, team_id, name, team_type, category
  ) values (
    '75000000-0000-0000-0000-000000000512',
    '10000000-0000-0000-0000-000000000001',
    'Adversario Coach',
    'ADVERSARIA',
    'ADULTO'
  );

  begin
    insert into public.scout_plays (
      id, team_id, scout_game_id, play_code, session_date, session_type, period,
      game_clock, source, phase_of_ball, attacking_team_side, defending_team_side, factual_result
    ) values (
      '71000000-0000-0000-0000-000000000521',
      '10000000-0000-0000-0000-000000000002',
      '70000000-0000-0000-0000-000000000502',
      'RLS-PLAY-OTHER',
      '2026-12-02',
      'JOGO',
      'SET_1',
      '04:44',
      'VIDEO',
      'DEF_POS',
      'OPPONENT',
      'ANALYZED',
      'DEFENDIDO'
    );
    raise exception 'coach inserted scout_plays on other team unexpectedly';
  exception when others then
    if sqlerrm not like '%row-level security%' then raise; end if;
  end;
end $$;

-- Viewer reads own team and codebook, but cannot write.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';
do $$
begin
  if not exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000501') then
    raise exception 'viewer should read own scout_plays';
  end if;
  if exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000502') then
    raise exception 'viewer must not read other team scout_plays';
  end if;
  if not exists (select 1 from public.scout_code_values) then
    raise exception 'viewer should read scout_code_values';
  end if;

  begin
    insert into public.scout_catalog_teams (
      id, team_id, name, team_type, category
    ) values (
      '75000000-0000-0000-0000-000000000531',
      '10000000-0000-0000-0000-000000000001',
      'Viewer Should Fail',
      'ADVERSARIA',
      'ADULTO'
    );
    raise exception 'viewer inserted scout_catalog_teams unexpectedly';
  exception when others then
    if sqlerrm not like '%row-level security%' then raise; end if;
  end;
end $$;

-- Authenticated user without team reads only the global codebook.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
begin
  if exists (select 1 from public.scout_plays) then
    raise exception 'user without team must not read scout_plays';
  end if;
  if exists (select 1 from public.scout_catalog_teams) then
    raise exception 'user without team must not read scout_catalog_teams';
  end if;
  if not exists (select 1 from public.scout_field_codebook_map where contract_name = 'scout_play_participations') then
    raise exception 'user without team should read global codebook map';
  end if;
end $$;

-- Other-team owner reads only own tenant and may still read the global codebook.
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
begin
  if not exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000502') then
    raise exception 'other-team owner should read own scout_plays';
  end if;
  if exists (select 1 from public.scout_plays where id = '71000000-0000-0000-0000-000000000501') then
    raise exception 'other-team owner must not read CEPRAEA scout_plays';
  end if;
  if not exists (select 1 from public.scout_code_lists where list_key = 'LISTA_CAUSA_PRINCIPAL') then
    raise exception 'other-team owner should read global codebook';
  end if;
end $$;

rollback;
