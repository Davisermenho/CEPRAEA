-- TEST-06: SQL test: id_jogada liga corretamente COLETA_AO_VIVO, PARTICIPACOES, EVENTOS_MENTAIS, VALIDACAO
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '89000000-0000-0000-0000-000000000901',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-10',
  'CEPRAEA',
  'Adversario Rastreabilidade',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_live_entry public.scout_live_entries%rowtype;
  v_play_id uuid;
  v_id_jogada text := 'RASTR-001';
begin

  -- Passo 1: criar entrada COLETA_AO_VIVO com id_jogada = 'RASTR-001'
  v_live_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', v_id_jogada,
    'scout_game_id', '89000000-0000-0000-0000-000000000901',
    'tempo_jogo', '10:00',
    'fase_da_bola_code', 'AT_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code', 'AT_3X1',
    'atleta_principal_id', '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'GIRO',
    'categoria_acao_code', 'ARREMESSO',
    'acao_basica_code', 'ARREMESSO',
    'tipo_finalizacao_code', 'GIRO',
    'resultado_factual_code', 'GOL',
    'motivo_pontuacao_code', 'GIRO',
    'pontos_jogada', 2,
    'causa_provavel_code', 'DEC_OF',
    'prioridade_treino_code', 'FIN2'
  ));

  if v_live_entry.id is null then
    raise exception 'TEST-06: create_scout_live_entry retornou NULL';
  end if;

  if v_live_entry.id_jogada <> v_id_jogada then
    raise exception 'TEST-06: id_jogada não persistiu na COLETA_AO_VIVO';
  end if;

  raise notice 'TEST-06a OK: COLETA_AO_VIVO criada com id_jogada = %', v_id_jogada;

  -- Passo 2: criar COLETA_SCOUT (scout_play) com play_code = id_jogada
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '89000000-0000-0000-0000-000000000901',
    jsonb_build_object(
      'play_code', v_id_jogada,
      'session_date', '2026-12-10',
      'session_type', 'JOGO',
      'period', 'SET_1',
      'game_clock', '10:00',
      'source', 'VIDEO',
      'phase_of_ball', 'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'factual_result', 'GOL',
      'play_score_reason', 'GIRO',
      'play_points', '2'
    ),
    jsonb_build_array(
      jsonb_build_object(
        'participant_scope', 'ATQ',
        'participant_side', 'ANALYZED',
        'slot_order', 1,
        'athlete_id', '20000000-0000-0000-0000-000000000001',
        'phase_of_athlete', 'AT_POS',
        'participation_role', 'FINALIZADORA',
        'action_code', 'GIRO',
        'individual_result', 'SUCESSO'
      )
    )
  );

  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and play_code = v_id_jogada
      and scout_game_id = '89000000-0000-0000-0000-000000000901'
      and team_id = '10000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'TEST-06: COLETA_SCOUT não encontrada com play_code = id_jogada';
  end if;

  raise notice 'TEST-06b OK: COLETA_SCOUT vinculada por play_code = id_jogada';

  -- Passo 3: verificar que PARTICIPACOES ligam ao id da jogada
  if not exists (
    select 1 from public.scout_play_participations
    where scout_play_id = v_play_id
      and scout_game_id = '89000000-0000-0000-0000-000000000901'
      and team_id = '10000000-0000-0000-0000-000000000001'
      and athlete_id = '20000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'TEST-06: PARTICIPACAO não encontrada para o id_jogada';
  end if;

  raise notice 'TEST-06c OK: PARTICIPACOES vinculadas a scout_play_id';

  -- Passo 4: inserir EVENTO_MENTAL ligado ao scout_play_id
  insert into public.scout_mental_events (
    team_id,
    scout_game_id,
    scout_play_id,
    athlete_id,
    mental_code,
    mental_mark
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '89000000-0000-0000-0000-000000000901',
    v_play_id,
    '20000000-0000-0000-0000-000000000001',
    'AET',
    '+'
  );

  if not exists (
    select 1 from public.scout_mental_events
    where scout_play_id = v_play_id
      and mental_code = 'AET'
  ) then
    raise exception 'TEST-06: EVENTO_MENTAL não encontrado para o id_jogada';
  end if;

  raise notice 'TEST-06d OK: EVENTOS_MENTAIS vinculados a scout_play_id';

  -- Passo 5: inserir VALIDACAO ligada ao scout_play_id
  insert into public.scout_play_validations (
    team_id,
    scout_game_id,
    scout_play_id,
    field_name,
    validation_status,
    correction_reason
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '89000000-0000-0000-0000-000000000901',
    v_play_id,
    'factual_result',
    'VALIDADO',
    'Dado conferido por vídeo'
  );

  if not exists (
    select 1 from public.scout_play_validations
    where scout_play_id = v_play_id
      and validation_status = 'VALIDADO'
  ) then
    raise exception 'TEST-06: VALIDACAO não encontrada para o id_jogada';
  end if;

  raise notice 'TEST-06e OK: VALIDACAO vinculada a scout_play_id';

  -- Rastreabilidade cruzada: verificar join completo das 4 camadas pelo id_jogada
  if not exists (
    select 1
    from public.scout_live_entries le
    join public.scout_plays sp on sp.play_code = le.id_jogada
      and sp.scout_game_id = le.scout_game_id
      and sp.team_id = le.equipe_analisada_id
    join public.scout_play_participations pp on pp.scout_play_id = sp.id
    join public.scout_mental_events me on me.scout_play_id = sp.id
    join public.scout_play_validations pv on pv.scout_play_id = sp.id
    where le.id_jogada = v_id_jogada
      and le.scout_game_id = '89000000-0000-0000-0000-000000000901'
  ) then
    raise exception 'TEST-06: join das 4 camadas por id_jogada falhou';
  end if;

  raise notice 'TEST-06 PASSOU: COLETA_AO_VIVO → COLETA_SCOUT → PARTICIPACOES → EVENTOS_MENTAIS → VALIDACAO ligados por id_jogada';

end $$;

rollback;
