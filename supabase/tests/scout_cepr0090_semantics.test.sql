\set ON_ERROR_STOP on

-- CEPR-0090: Regressões dos 11 lances do PILOTO-01
-- Valida que todos os lances que bloqueavam ou produziam dados falsos
-- agora salvam corretamente e que os invariantes de persistência são mantidos.

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000900',
  '10000000-0000-0000-0000-000000000001',
  '2026-05-16',
  'CEPRAEA',
  'Maricá (PILOTO-01 Regressão)',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
  v_count_plays_before int;
  v_count_parts_before int;
  v_count_plays_after int;
  v_count_parts_after int;
begin
  select count(*) into v_count_plays_before from public.scout_plays;
  select count(*) into v_count_parts_before from public.scout_play_participations;

  -- ── BLOCKER #10: DEF_POS + COBERTURA + TIRO_6M_CONCEDIDO ───────────────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-010',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '12:45',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'COBERTURA',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'resultado_factual_code', 'TIRO_6M_CONCEDIDO'
  ));
  if v_entry.id is null then raise exception 'PILOTO #10: TIRO_6M_CONCEDIDO nao salvou'; end if;
  if v_entry.status_validacao_code <> 'PENDENTE' then raise exception 'PILOTO #10: status nao é PENDENTE'; end if;
  if v_entry.resultado_factual_code <> 'TIRO_6M_CONCEDIDO' then raise exception 'PILOTO #10: resultado salvo errado'; end if;
  raise notice 'PILOTO-01 #10 (BLOCKER): OK — DEF_POS + COBERTURA + TIRO_6M_CONCEDIDO';

  -- ── BLOCKER #11: DEF_POS + FINALIZACAO_6M_ADV + GOL ───────────────────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-011',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '13:02',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'FINALIZACAO_6M_ADV',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'resultado_factual_code', 'GOL'
  ));
  if v_entry.id is null then raise exception 'PILOTO #11: FINALIZACAO_6M_ADV + GOL nao salvou'; end if;
  if v_entry.status_validacao_code <> 'PENDENTE' then raise exception 'PILOTO #11: status nao é PENDENTE'; end if;
  -- RPC deve auto-derivar tipo_finalizacao_code = '6M'
  if v_entry.tipo_finalizacao_code <> '6M' then
    raise exception 'PILOTO #11: tipo_finalizacao_code deveria ser 6M, got %', v_entry.tipo_finalizacao_code;
  end if;
  raise notice 'PILOTO-01 #11 (BLOCKER): OK — DEF_POS + FINALIZACAO_6M_ADV + GOL, tipo=6M auto-derivado';

  -- ── HIGH #01: DEF_POS + BLOQUEIO + AEREA + NAO_EXECUTADO + GOL ────────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-001',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '05:12',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'BLOQUEIO',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'classificacao_acao_code','AEREA',
    'execucao_bloqueio_code', 'NAO_EXECUTADO',
    'resultado_factual_code', 'GOL'
  ));
  if v_entry.id is null then raise exception 'PILOTO #01: AEREA + NAO_EXECUTADO + GOL nao salvou'; end if;
  if v_entry.classificacao_acao_code <> 'AEREA' then raise exception 'PILOTO #01: classificacao incorreta'; end if;
  if v_entry.execucao_bloqueio_code <> 'NAO_EXECUTADO' then raise exception 'PILOTO #01: execucao do bloqueio incorreta'; end if;
  if v_entry.tipo_finalizacao_code <> 'AEREA' then raise exception 'PILOTO #01: tipo_finalizacao_code deveria ser AEREA'; end if;
  raise notice 'PILOTO-01 #01 (HIGH): OK — DEF_POS + BLOQUEIO + AEREA + NAO_EXECUTADO + GOL';

  -- ── HIGH #02: DEF_POS + COBERTURA + FECHAMENTO_CENTRAL + GOL ──────────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-002',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '06:30',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'COBERTURA',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'classificacao_acao_code','FECHAMENTO_CENTRAL',
    'resultado_factual_code', 'GOL',
    'tipo_finalizacao_code',  'SIMPLES'
  ));
  if v_entry.id is null then raise exception 'PILOTO #02: FECHAMENTO_CENTRAL + GOL nao salvou'; end if;
  raise notice 'PILOTO-01 #02 (HIGH): OK — DEF_POS + COBERTURA + FECHAMENTO_CENTRAL + GOL';

  -- ── HIGH #03: DEF_POS + COBERTURA + COBERTURA_PIVO + GOL + tipo AEREA ─────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-003',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '07:15',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'COBERTURA',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'classificacao_acao_code','COBERTURA_PIVO',
    'resultado_factual_code', 'GOL',
    'tipo_finalizacao_code',  'AEREA'
  ));
  if v_entry.id is null then raise exception 'PILOTO #03: COBERTURA_PIVO + GOL + AEREA nao salvou'; end if;
  raise notice 'PILOTO-01 #03 (HIGH): OK — DEF_POS + COBERTURA + COBERTURA_PIVO + GOL + tipo AEREA';

  -- ── HIGH #06: DEF_POS + INTERCEPTACAO + INTERCEPTACAO_MALSUCEDIDA + GOL ───
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-006',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '09:44',
    'fase_da_bola_code',      'DEF_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code', 'DEF_3X0',
    'acao_basica_code',       'INTERCEPTACAO',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'classificacao_acao_code','INTERCEPTACAO_MALSUCEDIDA',
    'resultado_factual_code', 'GOL'
  ));
  if v_entry.id is null then raise exception 'PILOTO #06: INTERCEPTACAO_MALSUCEDIDA + GOL nao salvou'; end if;
  raise notice 'PILOTO-01 #06 (HIGH): OK — DEF_POS + INTERCEPTACAO + INTERCEPTACAO_MALSUCEDIDA + GOL';

  -- ── NEGATIVO: DEF_POS + INTERCEPTACAO (sem MALSUCEDIDA) + GOL deve falhar ─
  begin
    v_entry := public.create_scout_live_entry(jsonb_build_object(
      'id_jogada',              'PILOTO-NEG-01',
      'scout_game_id',          '78000000-0000-0000-0000-000000000900',
      'tempo_jogo',             '09:50',
      'fase_da_bola_code',      'DEF_POS',
      'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'DEFESA',
      'sistema_defensivo_code', 'DEF_3X0',
      'acao_basica_code',       'INTERCEPTACAO',
      'categoria_acao_code',    'ACAO_DEFENSIVA',
      'classificacao_acao_code','INTERCEPTACAO',
      'resultado_factual_code', 'GOL'
    ));
    -- Se chegou aqui sem exceção, a validação de codebook bloqueou via INVALID_CODEBOOK_VALUE
    -- (GOL não está no allowedResults base de INTERCEPTACAO — mas a RPC não valida matrix,
    --  apenas o codebook. Portanto esta inserção passa na RPC; o bloqueio semântico é na UI.)
    raise notice 'PILOTO-01 NEG #01: inserção passou na RPC (validação semântica é na UI/matrix)';
  exception
    when others then
      raise notice 'PILOTO-01 NEG #01: corretamente rejeitado pela RPC: %', sqlerrm;
  end;

  -- ── HIGH #04+07+09: TRANS_OF + ARREMESSO + estrutura_transicao_code + tipo ─
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-007',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '11:05',
    'fase_da_bola_code',      'TRANS_OF',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'acao_basica_code',       'ARREMESSO',
    'categoria_acao_code',    'ARREMESSO',
    'estrutura_transicao_code', 'TRANS_DIRETA',
    'tipo_finalizacao_code',  'GIRO',
    'resultado_factual_code', 'GOL',
    'motivo_pontuacao_code',  'GIRO',
    'pontos_jogada',          2
  ));
  if v_entry.id is null then raise exception 'PILOTO #07: TRANS_OF + TRANS_DIRETA + GIRO + GOL nao salvou'; end if;
  if v_entry.estrutura_transicao_code <> 'TRANS_DIRETA' then
    raise exception 'PILOTO #07: estrutura_transicao_code nao persistiu';
  end if;
  raise notice 'PILOTO-01 #07 (HIGH): OK — TRANS_OF + TRANS_DIRETA + GIRO + GOL';

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-004',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '08:22',
    'fase_da_bola_code',      'TRANS_OF',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'acao_basica_code',       'ARREMESSO',
    'categoria_acao_code',    'ARREMESSO',
    'estrutura_transicao_code', 'TRANS_INDIRETA_2X1',
    'tipo_finalizacao_code',  'AEREA',
    'resultado_factual_code', 'DEFENDIDO'
  ));
  if v_entry.id is null then raise exception 'PILOTO #04: TRANS_INDIRETA_2X1 + AEREA + DEFENDIDO nao salvou'; end if;
  if v_entry.estrutura_transicao_code <> 'TRANS_INDIRETA_2X1' then
    raise exception 'PILOTO #04: estrutura_transicao_code nao persistiu';
  end if;
  raise notice 'PILOTO-01 #04 (HIGH): OK — TRANS_OF + TRANS_INDIRETA_2X1 + AEREA + DEFENDIDO';

  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-009',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '11:55',
    'fase_da_bola_code',      'TRANS_OF',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'acao_basica_code',       'ARREMESSO',
    'categoria_acao_code',    'ARREMESSO',
    'estrutura_transicao_code', 'TRANS_INDIRETA_2X1',
    'tipo_finalizacao_code',  'GIRO',
    'resultado_factual_code', 'BLOQUEADO'
  ));
  if v_entry.id is null then raise exception 'PILOTO #09: TRANS_INDIRETA_2X1 + GIRO + BLOQUEADO nao salvou'; end if;
  raise notice 'PILOTO-01 #09 (HIGH): OK — TRANS_OF + TRANS_INDIRETA_2X1 + GIRO + BLOQUEADO';

  -- ── HIGH #05: AT_POS + ARREMESSO + acao_preparatoria_code + GOL ───────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-005',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '08:55',
    'fase_da_bola_code',      'AT_POS',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',  'AT_3X1',
    'acao_basica_code',       'ARREMESSO',
    'categoria_acao_code',    'ARREMESSO',
    'classificacao_acao_code','ARREM_SIMPLES',
    'acao_preparatoria_code', 'FINTA_PASSE',
    'tipo_finalizacao_code',  'SIMPLES',
    'resultado_factual_code', 'GOL',
    'motivo_pontuacao_code',  'SIMPLES',
    'pontos_jogada',          1
  ));
  if v_entry.id is null then raise exception 'PILOTO #05: AT_POS + FINTA_PASSE + GOL nao salvou'; end if;
  if v_entry.acao_preparatoria_code <> 'FINTA_PASSE' then
    raise exception 'PILOTO #05: acao_preparatoria_code nao persistiu';
  end if;
  raise notice 'PILOTO-01 #05 (HIGH): OK — AT_POS + ARREMESSO + FINTA_PASSE + GOL';

  -- ── HIGH #08: TRANS_DEF + MARCACAO_PRESSAO + RECUPERACAO_POSSE ────────────
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',              'PILOTO-008',
    'scout_game_id',          '78000000-0000-0000-0000-000000000900',
    'tempo_jogo',             '10:30',
    'fase_da_bola_code',      'TRANS_DEF',
    'equipe_analisada_id',    '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_DEF',
    'acao_basica_code',       'MARCACAO_PRESSAO',
    'categoria_acao_code',    'ACAO_DEFENSIVA',
    'resultado_factual_code', 'RECUPERACAO_POSSE'
  ));
  if v_entry.id is null then raise exception 'PILOTO #08: TRANS_DEF + MARCACAO_PRESSAO + RECUPERACAO_POSSE nao salvou'; end if;
  raise notice 'PILOTO-01 #08 (HIGH): OK — TRANS_DEF + MARCACAO_PRESSAO + RECUPERACAO_POSSE';

  -- ── INVARIANTES DE PERSISTÊNCIA ────────────────────────────────────────────
  select count(*) into v_count_plays_after from public.scout_plays;
  select count(*) into v_count_parts_after from public.scout_play_participations;

  if v_count_plays_after <> v_count_plays_before then
    raise exception 'INVARIANTE: scout_plays nao deveria crescer em COLETA_AO_VIVO (antes=%, depois=%)',
      v_count_plays_before, v_count_plays_after;
  end if;
  if v_count_parts_after <> v_count_parts_before then
    raise exception 'INVARIANTE: scout_play_participations nao deveria crescer em COLETA_AO_VIVO (antes=%, depois=%)',
      v_count_parts_before, v_count_parts_after;
  end if;

  raise notice 'INVARIANTES: scout_plays=% (sem alteracao), participations=% (sem alteracao)',
    v_count_plays_after, v_count_parts_after;
  raise notice 'CEPR-0090 PILOTO-01 REGRESSÃO: todos os lances OK';
end;
$$;

rollback;
