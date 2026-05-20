\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '70000000-0000-0000-0000-000000000611',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-11',
    'CEPRAEA',
    'Adversario RPC',
    'em_andamento'
  ),
  (
    '70000000-0000-0000-0000-000000000612',
    '10000000-0000-0000-0000-000000000002',
    '2026-12-12',
    'Outra Equipe',
    'Adversario RPC',
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
    '71000000-0000-0000-0000-000000000611',
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000611',
    'RPC-GRANTS-001',
    '2026-12-11',
    'JOGO',
    'Adversario RPC',
    'SET_1',
    '01:01',
    'VIDEO',
    'AT_POS',
    'ANALYZED',
    'OPPONENT',
    'GOL'
  );

do $$
begin
  if has_function_privilege('anon', 'public.scout_field_value_allowed(text, text, text, text, text)', 'EXECUTE') then
    raise exception 'anon should not execute scout_field_value_allowed';
  end if;
  if has_function_privilege('anon', 'public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb)', 'EXECUTE') then
    raise exception 'anon should not execute upsert_scout_play_bundle';
  end if;
  if has_function_privilege('anon', 'public.get_scout_play_bundle(uuid, uuid)', 'EXECUTE') then
    raise exception 'anon should not execute get_scout_play_bundle';
  end if;

  if has_function_privilege('authenticated', 'public.scout_field_value_allowed(text, text, text, text, text)', 'EXECUTE') then
    raise exception 'authenticated should not execute scout_field_value_allowed';
  end if;
  if not has_function_privilege('authenticated', 'public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb)', 'EXECUTE') then
    raise exception 'authenticated should execute upsert_scout_play_bundle';
  end if;
  if not has_function_privilege('authenticated', 'public.get_scout_play_bundle(uuid, uuid)', 'EXECUTE') then
    raise exception 'authenticated should execute get_scout_play_bundle';
  end if;
end $$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

do $$
begin
  perform public.get_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '71000000-0000-0000-0000-000000000611'
  );

  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000611',
      jsonb_build_object(
        'play_code', 'RPC-VIEWER-DENIED',
        'session_date', '2026-12-11',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '02:02',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'GOL'
      ),
      '[]'::jsonb
    );
    raise exception 'viewer executed upsert_scout_play_bundle unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';

do $$
begin
  begin
    perform public.get_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '71000000-0000-0000-0000-000000000611'
    );
    raise exception 'user without team read scout bundle unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000611',
      jsonb_build_object(
        'play_code', 'RPC-NO-TEAM-DENIED',
        'session_date', '2026-12-11',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '02:12',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'GOL'
      ),
      '[]'::jsonb
    );
    raise exception 'user without team executed upsert_scout_play_bundle unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';

do $$
begin
  begin
    perform public.get_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '71000000-0000-0000-0000-000000000611'
    );
    raise exception 'other-team owner read CEPRAEA scout bundle unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;

  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000611',
      jsonb_build_object(
        'play_code', 'RPC-OTHER-OWNER-DENIED',
        'session_date', '2026-12-11',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '02:22',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'GOL'
      ),
      '[]'::jsonb
    );
    raise exception 'other-team owner upserted CEPRAEA scout bundle unexpectedly';
  exception when others then
    if sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
begin
  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000612',
      jsonb_build_object(
        'play_code', 'RPC-COACH-WRONG-GAME',
        'session_date', '2026-12-11',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '02:32',
        'source', 'VIDEO',
        'phase_of_ball', 'AT_POS',
        'attacking_team_side', 'ANALYZED',
        'defending_team_side', 'OPPONENT',
        'factual_result', 'GOL'
      ),
      '[]'::jsonb
    );
    raise exception 'coach accepted scout_game from another team unexpectedly';
  exception when others then
    if sqlerrm not like '%scout game not found%' then raise; end if;
  end;
end $$;

rollback;
