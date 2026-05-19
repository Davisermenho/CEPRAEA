\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '78000000-0000-0000-0000-000000000621',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-21',
    'CEPRAEA',
    'Adversario Live RPC Create',
    'em_andamento'
  ),
  (
    '78000000-0000-0000-0000-000000000622',
    '10000000-0000-0000-0000-000000000002',
    '2026-12-21',
    'Outra Equipe',
    'Adversario Outro Time',
    'em_andamento'
  );

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
  v_play_count_before int;
  v_participation_count_before int;
begin
  select count(*) into v_play_count_before from public.scout_plays;
  select count(*) into v_participation_count_before from public.scout_play_participations;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'LIVE-RPC-ATPOS-001',
    'scout_game_id', '78000000-0000-0000-0000-000000000621',
    'tempo_jogo', '00:31',
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

  if v_entry.id is null then
    raise exception 'create_scout_live_entry should return inserted row';
  end if;
  if v_entry.status_validacao_code <> 'PENDENTE' then
    raise exception 'create_scout_live_entry should force PENDENTE';
  end if;
  if v_entry.acao_principal_text <> 'GIRO' then
    raise exception 'official suggestion should normalize acao_principal_text';
  end if;
  if v_entry.acao_principal_suggestion_code <> 'GIRO' then
    raise exception 'official suggestion should persist suggestion code';
  end if;
  if coalesce(v_entry.acao_principal_is_custom, true) then
    raise exception 'official suggestion should mark is_custom=false';
  end if;
  if v_entry.motivo_pontuacao_code <> 'GIRO' then
    raise exception 'official GOL should persist motivo_pontuacao_code';
  end if;

  if (select count(*) from public.scout_plays) <> v_play_count_before then
    raise exception 'create_scout_live_entry must not create scout_plays';
  end if;
  if (select count(*) from public.scout_play_participations) <> v_participation_count_before then
    raise exception 'create_scout_live_entry must not create scout_play_participations';
  end if;
  if not exists (
    select 1 from public.audit_logs
    where team_id = '10000000-0000-0000-0000-000000000001'
      and entity_type = 'scout_live_entries'
      and entity_id = v_entry.id
      and action = 'create_scout_live_entry'
  ) then
    raise exception 'create_scout_live_entry should register audit log';
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'LIVE-RPC-DEFPOS-001',
    'scout_game_id', '78000000-0000-0000-0000-000000000621',
    'tempo_jogo', '00:42',
    'fase_da_bola_code', 'DEF_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'atleta_principal_id', '20000000-0000-0000-0000-000000000001',
    'categoria_acao_code', 'ACAO_DEFENSIVA',
    'acao_basica_code', 'BLOQUEIO',
    'classificacao_acao_code', 'GIRO',
    'execucao_bloqueio_code', 'EXECUTADO',
    'tipo_finalizacao_code', 'GIRO',
    'resultado_factual_code', 'BLOQUEADO',
    'pontos_jogada', 0
  ));

  if v_entry.fase_da_bola_code <> 'DEF_POS' then
    raise exception 'DEF_POS creation returned wrong fase_da_bola_code';
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'LIVE-RPC-TRANSOF-001',
    'scout_game_id', '78000000-0000-0000-0000-000000000621',
    'tempo_jogo', '00:53',
    'fase_da_bola_code', 'TRANS_OF',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'acao_principal_text', 'QUEBRA_DEF_RAPIDA',
    'resultado_factual_code', 'VANTAGEM_PERDIDA',
    'pontos_jogada', 0
  ));

  if not coalesce(v_entry.acao_principal_is_custom, false) then
    raise exception 'custom acao_principal_text should mark is_custom=true';
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'LIVE-RPC-TRANSDEF-001',
    'scout_game_id', '78000000-0000-0000-0000-000000000621',
    'tempo_jogo', '01:04',
    'fase_da_bola_code', 'TRANS_DEF',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_DEF',
    'acao_principal_suggestion_code', 'NEUTRALIZA_DIRETA',
    'resultado_factual_code', 'TRANSICAO_NEUTRALIZADA',
    'pontos_jogada', 0,
    'video_ref', null,
    'obs_geral', null
  ));

  if v_entry.video_ref is not null or v_entry.obs_geral is not null then
    raise exception 'null optional fields should remain null';
  end if;

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada', 'LIVE-RPC-RECPOSSE-001',
    'scout_game_id', '78000000-0000-0000-0000-000000000621',
    'tempo_jogo', '01:09',
    'fase_da_bola_code', 'DEF_POS',
    'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_principal_suggestion_code', 'INTERC',
    'resultado_factual_code', 'RECUPERACAO_POSSE',
    'pontos_jogada', 0
  ));

  if v_entry.resultado_factual_code <> 'RECUPERACAO_POSSE' or v_entry.tipo_finalizacao_code is not null then
    raise exception 'non-finalization recovery should not persist tipo_finalizacao_code';
  end if;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-BAD-PHASE-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:11',
      'fase_da_bola_code', 'ATAQUE',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'invalid fase_da_bola_code unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%INVALID_CODEBOOK_VALUE: fase_da_bola_code%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-BAD-FEASEQ-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:12',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE_CLARO',
      'sistema_ofensivo_code', 'AT_3X1',
      'resultado_factual_code', 'PERDA',
      'acao_principal_text', 'GIRO'
    ));
    raise exception 'invalid fase_equipe_analisada_code unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%INVALID_CODEBOOK_VALUE: fase_equipe_analisada_code%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-VALIDADO-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:13',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA',
      'status_validacao_code', 'VALIDADO'
    ));
    raise exception 'VALIDADO on create unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%status_validacao_code must be PENDENTE on create%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-ATPOS-ERR-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:14',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'AT_POS without sistema_ofensivo_code unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%sistema_ofensivo_code required for AT_POS%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-DEFPOS-ERR-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:15',
      'fase_da_bola_code', 'DEF_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'DEFESA',
      'acao_principal_text', 'BLOQUEIO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'DEF_POS without sistema_defensivo_code unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%sistema_defensivo_code required for DEF_POS%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-NOFINISH-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:16',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'resultado_factual_code', 'GOL',
      'motivo_pontuacao_code', 'GIRO',
      'pontos_jogada', 2
    ));
    raise exception 'missing tipo_finalizacao_code on GOL unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%tipo_finalizacao_code required for finalization result%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-NOMOTIVO-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:16A',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'tipo_finalizacao_code', 'GIRO',
      'resultado_factual_code', 'GOL',
      'pontos_jogada', 2
    ));
    raise exception 'missing motivo_pontuacao_code on GOL unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%motivo_pontuacao_code required for GOL%' then raise; end if;
  end;

  -- [0028] GIRO/AEREA now allow pontos_jogada 1 or 2 (only 6M/GOLEIRA/ESPECIALISTA force 2)
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-GIRO-1PT-OK-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:16B',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_suggestion_code', 'GIRO',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'tipo_finalizacao_code', 'GIRO',
      'resultado_factual_code', 'GOL',
      'motivo_pontuacao_code', 'GIRO',
      'pontos_jogada', 1
    ));
  exception when others then
    raise exception 'GIRO + GOL + 1pt should be accepted (0028) but got: %', sqlerrm;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-BAD-MOTIVO-FINISH-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:16C',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_suggestion_code', 'GIRO',
      'categoria_acao_code', 'ARREMESSO',
      'acao_basica_code', 'ARREMESSO',
      'tipo_finalizacao_code', 'GIRO',
      'resultado_factual_code', 'GOL',
      'motivo_pontuacao_code', 'ESPECIALISTA',
      'pontos_jogada', 2
    ));
    raise exception 'incoherent motivo_pontuacao_code and tipo_finalizacao_code unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%motivo_pontuacao_code incompatible with tipo_finalizacao_code%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-BAD-POINTS-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:17',
      'fase_da_bola_code', 'TRANS_DEF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_DEF',
      'acao_principal_text', 'NEUTRALIZA_DIRETA',
      'resultado_factual_code', 'PERDA',
      'pontos_jogada', 2
    ));
    raise exception 'invalid pontos_jogada unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%pontos_jogada must be 0 or null when resultado_factual_code is not GOL%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-OUT-ATH-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:18',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'atleta_principal_id', '20000000-0000-0000-0000-000000000003',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'cross-team athlete unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%ATHLETE_OUT_OF_SCOPE: atleta_principal_id%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-LONG-ACTION-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:19',
      'fase_da_bola_code', 'TRANS_OF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_OF',
      'acao_principal_text', 'ESSA_ACAO_E_LONGA_DEMAIS_PARA_SER_ACEITA_PELO_RPC',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'long acao_principal_text unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%acao_principal_text too long%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-CAUSE-ACTION-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:20',
      'fase_da_bola_code', 'TRANS_OF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_OF',
      'acao_principal_text', 'BLOQ',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'cause-like acao_principal_text unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%acao_principal_text collides with non-action codebook%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-RESULT-ACTION-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:21',
      'fase_da_bola_code', 'TRANS_DEF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_DEF',
      'acao_principal_text', 'GOL',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'result-like acao_principal_text unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%acao_principal_text collides with non-action codebook%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-DIAG-ACTION-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:21B',
      'fase_da_bola_code', 'TRANS_DEF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_DEF',
      'acao_principal_text', 'BLOQUEIO_ATRASADO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'diagnosis-like acao_principal_text unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%acao_principal_text mixes diagnosis or result%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-FEEDBACK-ACTION-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:21C',
      'fase_da_bola_code', 'TRANS_DEF',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'TRANS_DEF',
      'acao_principal_text', 'TREINAR_GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'feedback-like acao_principal_text unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%acao_principal_text mixes diagnosis or result%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-ATPOS-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000621',
      'tempo_jogo', '01:22',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'duplicate id_jogada unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%duplicate id_jogada for scout game%' then raise; end if;
  end;

  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada', 'LIVE-RPC-WRONG-GAME-001',
      'scout_game_id', '78000000-0000-0000-0000-000000000622',
      'tempo_jogo', '01:23',
      'fase_da_bola_code', 'AT_POS',
      'equipe_analisada_id', '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code', 'AT_3X1',
      'acao_principal_text', 'GIRO',
      'resultado_factual_code', 'PERDA'
    ));
    raise exception 'other-team scout_game unexpectedly succeeded';
  exception when others then
    if sqlerrm not like '%scout game not found%' and sqlerrm not like '%permission denied%' then raise; end if;
  end;
end $$;

rollback;
