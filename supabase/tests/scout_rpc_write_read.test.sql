\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '70000000-0000-0000-0000-000000000621',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-21',
    'CEPRAEA',
    'Adversario RPC Write',
    'em_andamento'
  );

reset role;

do $$
begin
  if not public.scout_field_value_allowed('scout_play_participations', 'action_code', 'GIRO', 'participant_scope', 'ATQ') then
    raise exception 'ATQ action_code GIRO should be accepted';
  end if;
  if public.scout_field_value_allowed('scout_play_participations', 'action_code', 'GIRO', 'participant_scope', 'DEF') then
    raise exception 'DEF action_code GIRO should not be accepted';
  end if;
  if not public.scout_field_value_allowed('scout_plays', 'offensive_system', 'NAO_APLICA') then
    raise exception 'offensive_system NAO_APLICA should be accepted';
  end if;

  insert into public.scout_code_lists (
    list_key, label, contract_scope, active, source_version
  ) values (
    'LISTA_TESTE_RPC_SPECIAL',
    'Lista de teste RPC',
    'test',
    true,
    '0011-test'
  );

  insert into public.scout_code_values (
    list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
  )
  select id, 'NAO_APLICA', 'NAO_APLICA', 1, true, false, true
  from public.scout_code_lists
  where list_key = 'LISTA_TESTE_RPC_SPECIAL';

  insert into public.scout_code_values (
    list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
  )
  select id, 'NAO_OBSERVADO', 'NAO_OBSERVADO', 2, false, true, true
  from public.scout_code_lists
  where list_key = 'LISTA_TESTE_RPC_SPECIAL';

  insert into public.scout_field_codebook_map (
    contract_name,
    field_name,
    selector_key,
    selector_value,
    list_key,
    allow_nao_aplica,
    allow_nao_observado,
    active
  ) values (
    'test_contract',
    'test_field',
    '*',
    '*',
    'LISTA_TESTE_RPC_SPECIAL',
    false,
    false,
    true
  );

  if public.scout_field_value_allowed('test_contract', 'test_field', 'NAO_APLICA') then
    raise exception 'helper should reject NAO_APLICA when allow_nao_aplica=false';
  end if;
  if public.scout_field_value_allowed('test_contract', 'test_field', 'NAO_OBSERVADO') then
    raise exception 'helper should reject NAO_OBSERVADO when allow_nao_observado=false';
  end if;

  update public.scout_field_codebook_map
  set allow_nao_aplica = true,
      allow_nao_observado = true
  where contract_name = 'test_contract'
    and field_name = 'test_field';

  if not public.scout_field_value_allowed('test_contract', 'test_field', 'NAO_APLICA') then
    raise exception 'helper should accept NAO_APLICA when allow_nao_aplica=true';
  end if;
  if not public.scout_field_value_allowed('test_contract', 'test_field', 'NAO_OBSERVADO') then
    raise exception 'helper should accept NAO_OBSERVADO when allow_nao_observado=true';
  end if;
end $$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_play_id uuid;
  v_bundle jsonb;
begin
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000621',
    jsonb_build_object(
      'play_code', 'RPC-WRITE-001',
      'session_date', '2026-12-21',
      'session_type', 'JOGO',
      'opponent_name', 'Adversario RPC Write',
      'period', 'SET_1',
      'game_clock', '03:21',
      'source', 'VIDEO',
      'phase_of_ball', 'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'offensive_system', 'NAO_APLICA',
      'offensive_configuration', 'NAO_OBSERVADO',
      'defensive_system', 'NAO_OBSERVADO',
      'factual_result', 'GOL',
      'main_cause', 'OK',
      'free_notes', 'Primeira gravacao RPC'
    ),
    jsonb_build_array(
      jsonb_build_object(
        'participant_scope', 'ATQ',
        'participant_side', 'ANALYZED',
        'slot_order', 1,
        'athlete_id', '20000000-0000-0000-0000-000000000001',
        'phase_of_athlete', 'AT_POS',
        'participation_role', 'FINALIZADORA',
        'position_code', 'LE',
        'action_code', 'GIRO',
        'main_cause', 'OK',
        'training_priority', 'MANTER'
      ),
      jsonb_build_object(
        'participant_scope', 'DEF',
        'participant_side', 'OPPONENT',
        'slot_order', 1,
        'external_athlete_label', 'Adversaria 1',
        'phase_of_athlete', 'DEF_POS',
        'participation_role', 'MARCADORA',
        'position_code', 'DEF_BASE',
        'action_code', 'BLOQ_GIRO',
        'main_cause', 'BLOQ',
        'training_priority', 'DEF_GIRO'
      )
    )
  );

  if v_play_id is null then
    raise exception 'upsert_scout_play_bundle should return play id';
  end if;

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and team_id = '10000000-0000-0000-0000-000000000001'
      and play_code = 'RPC-WRITE-001'
      and offensive_system = 'NAO_APLICA'
      and factual_result = 'GOL'
  ) then
    raise exception 'scout_plays row not persisted correctly';
  end if;

  if (select count(*) from public.scout_play_participations where scout_play_id = v_play_id) <> 2 then
    raise exception 'expected 2 scout_play_participations after insert';
  end if;

  if not exists (
    select 1 from public.audit_logs
    where team_id = '10000000-0000-0000-0000-000000000001'
      and entity_type = 'scout_plays'
      and entity_id = v_play_id
      and action = 'upsert_scout_play_bundle'
  ) then
    raise exception 'write RPC should register audit_logs';
  end if;

  set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

  v_bundle := public.get_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    v_play_id
  );

  if coalesce(v_bundle->'play'->>'play_code', '') <> 'RPC-WRITE-001' then
    raise exception 'get_scout_play_bundle returned wrong play_code';
  end if;
  if jsonb_array_length(coalesce(v_bundle->'participations', '[]'::jsonb)) <> 2 then
    raise exception 'get_scout_play_bundle returned wrong participation count';
  end if;

  set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

  perform public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '70000000-0000-0000-0000-000000000621',
    jsonb_build_object(
      'id', v_play_id,
      'play_code', 'RPC-WRITE-001',
      'session_date', '2026-12-21',
      'session_type', 'JOGO',
      'opponent_name', 'Adversario RPC Write',
      'period', 'SET_1',
      'game_clock', '03:59',
      'source', 'VIDEO',
      'phase_of_ball', 'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'offensive_system', 'AT_3X1',
      'offensive_configuration', 'AT_3X1_ESP_CE',
      'defensive_system', 'DEF_3X0',
      'factual_result', 'DEFENDIDO',
      'main_cause', 'COM',
      'free_notes', 'Atualizacao RPC'
    ),
    jsonb_build_array(
      jsonb_build_object(
        'participant_scope', 'ATQ',
        'participant_side', 'ANALYZED',
        'slot_order', 1,
        'athlete_id', '20000000-0000-0000-0000-000000000001',
        'phase_of_athlete', 'AT_POS',
        'participation_role', 'FINALIZADORA',
        'position_code', 'CE',
        'action_code', 'ASSIST',
        'main_cause', 'COM',
        'training_priority', 'PASSE'
      )
    )
  );

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and factual_result = 'DEFENDIDO'
      and offensive_system = 'AT_3X1'
      and offensive_configuration = 'AT_3X1_ESP_CE'
      and main_cause = 'COM'
  ) then
    raise exception 'update path did not persist scout_plays changes';
  end if;

  if (select count(*) from public.scout_play_participations where scout_play_id = v_play_id) <> 1 then
    raise exception 'update path should replace participations';
  end if;

  begin
    perform public.upsert_scout_play_bundle(
      '10000000-0000-0000-0000-000000000001',
      '70000000-0000-0000-0000-000000000621',
      jsonb_build_object(
        'play_code', 'RPC-WRITE-INVALID',
        'session_date', '2026-12-21',
        'session_type', 'JOGO',
        'period', 'SET_1',
        'game_clock', '04:04',
        'source', 'VIDEO',
        'phase_of_ball', 'DEF_POS',
        'attacking_team_side', 'OPPONENT',
        'defending_team_side', 'ANALYZED',
        'factual_result', 'DEFENDIDO'
      ),
      jsonb_build_array(
        jsonb_build_object(
          'participant_scope', 'DEF',
          'participant_side', 'ANALYZED',
          'slot_order', 1,
          'athlete_id', '20000000-0000-0000-0000-000000000001',
          'participation_role', 'APOIO',
          'action_code', 'GIRO'
        )
      )
    );
    raise exception 'RPC accepted invalid DEF action_code unexpectedly';
  exception when others then
    if sqlerrm not like '%invalid action_code%' then raise; end if;
  end;
end $$;

rollback;
