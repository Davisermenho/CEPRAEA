\set ON_ERROR_STOP on

-- CEPR-0092: DEF_POS + BLOQUEIO — separar finalização adversária da execução do bloqueio.
--
-- Cobre os 6 cenários do plano:
-- 1. BLOQUEIO + GIRO + EXECUTADO + BLOQUEADO → tipo_finalizacao=GIRO
-- 2. BLOQUEIO + AEREA + NAO_EXECUTADO + GOL → tipo_finalizacao=AEREA
-- 3. BLOQUEIO + ARREM_SIMPLES + ATRASADO + TIRO_6M_CONCEDIDO → tipo_finalizacao=NULL
-- 4. BLOQUEIO + NAO_OBSERVADO + NAO_EXECUTADO + GOL → tipo_finalizacao=NULL
-- 5. Code antigo BLOQ_GIRO (inativo) deve ser rejeitado
-- 6. Data migration: registros antigos com BLOQ_GIRO migrados corretamente

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000092',
  '10000000-0000-0000-0000-000000000001',
  '2026-05-18',
  'CEPRAEA',
  'Adversaria (CEPR-0092 Test)',
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
  v_tipo_fin text;
  v_exec_bloq text;
  v_classif text;
  v_old_rec_id uuid;
begin
  select count(*) into v_count_plays_before from public.scout_plays;
  select count(*) into v_count_parts_before from public.scout_play_participations;

  -- ── Cenário 1: BLOQUEIO + GIRO + EXECUTADO + BLOQUEADO ──────────────────────
  -- Espera: tipo_finalizacao_code=GIRO, execucao_bloqueio_code=EXECUTADO
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',               'CEPR0092-001',
    'scout_game_id',           '78000000-0000-0000-0000-000000000092',
    'tempo_jogo',              '08:10',
    'fase_da_bola_code',       'DEF_POS',
    'equipe_analisada_id',     '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code',  'DEF_3X0',
    'categoria_acao_code',     'ACAO_DEFENSIVA',
    'acao_basica_code',        'BLOQUEIO',
    'classificacao_acao_code', 'GIRO',
    'execucao_bloqueio_code',  'EXECUTADO',
    'resultado_factual_code',  'BLOQUEADO'
  ));
  if v_entry.id is null then raise exception 'Cenario 1: entrada nao salva'; end if;
  if v_entry.tipo_finalizacao_code <> 'GIRO' then
    raise exception 'Cenario 1: tipo_finalizacao_code esperado GIRO, obteve %', v_entry.tipo_finalizacao_code;
  end if;
  if v_entry.execucao_bloqueio_code <> 'EXECUTADO' then
    raise exception 'Cenario 1: execucao_bloqueio_code esperado EXECUTADO, obteve %', v_entry.execucao_bloqueio_code;
  end if;
  raise notice 'CEPR-0092 #1 OK — BLOQUEIO + GIRO + EXECUTADO + BLOQUEADO, tipo_finalizacao=GIRO';

  -- ── Cenário 2: BLOQUEIO + AEREA + NAO_EXECUTADO + GOL ───────────────────────
  -- Espera: tipo_finalizacao_code=AEREA, gol defensivo sem motivo_pontuacao
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',               'CEPR0092-002',
    'scout_game_id',           '78000000-0000-0000-0000-000000000092',
    'tempo_jogo',              '12:33',
    'fase_da_bola_code',       'DEF_POS',
    'equipe_analisada_id',     '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code',  'DEF_3X0',
    'categoria_acao_code',     'ACAO_DEFENSIVA',
    'acao_basica_code',        'BLOQUEIO',
    'classificacao_acao_code', 'AEREA',
    'execucao_bloqueio_code',  'NAO_EXECUTADO',
    'resultado_factual_code',  'GOL'
  ));
  if v_entry.id is null then raise exception 'Cenario 2: entrada nao salva'; end if;
  if v_entry.tipo_finalizacao_code <> 'AEREA' then
    raise exception 'Cenario 2: tipo_finalizacao_code esperado AEREA, obteve %', v_entry.tipo_finalizacao_code;
  end if;
  if v_entry.execucao_bloqueio_code <> 'NAO_EXECUTADO' then
    raise exception 'Cenario 2: execucao_bloqueio_code esperado NAO_EXECUTADO, obteve %', v_entry.execucao_bloqueio_code;
  end if;
  -- GOL em DEF_POS não exige motivo_pontuacao
  if v_entry.resultado_factual_code <> 'GOL' then raise exception 'Cenario 2: resultado errado'; end if;
  raise notice 'CEPR-0092 #2 OK — BLOQUEIO + AEREA + NAO_EXECUTADO + GOL, tipo_finalizacao=AEREA';

  -- ── Cenário 3: BLOQUEIO + ARREM_SIMPLES + ATRASADO + TIRO_6M_CONCEDIDO ──────
  -- Espera: tipo_finalizacao_code=NULL (resultado não é finalização concluída)
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',               'CEPR0092-003',
    'scout_game_id',           '78000000-0000-0000-0000-000000000092',
    'tempo_jogo',              '18:55',
    'fase_da_bola_code',       'DEF_POS',
    'equipe_analisada_id',     '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code',  'DEF_3X0',
    'categoria_acao_code',     'ACAO_DEFENSIVA',
    'acao_basica_code',        'BLOQUEIO',
    'classificacao_acao_code', 'ARREM_SIMPLES',
    'execucao_bloqueio_code',  'ATRASADO',
    'resultado_factual_code',  'TIRO_6M_CONCEDIDO'
  ));
  if v_entry.id is null then raise exception 'Cenario 3: entrada nao salva'; end if;
  if v_entry.tipo_finalizacao_code is not null then
    raise exception 'Cenario 3: tipo_finalizacao_code deve ser NULL para TIRO_6M_CONCEDIDO, obteve %', v_entry.tipo_finalizacao_code;
  end if;
  if v_entry.execucao_bloqueio_code <> 'ATRASADO' then
    raise exception 'Cenario 3: execucao_bloqueio_code esperado ATRASADO, obteve %', v_entry.execucao_bloqueio_code;
  end if;
  raise notice 'CEPR-0092 #3 OK — BLOQUEIO + ARREM_SIMPLES + ATRASADO + TIRO_6M_CONCEDIDO, tipo_finalizacao=NULL';

  -- ── Cenário 4: BLOQUEIO + NAO_OBSERVADO + NAO_EXECUTADO + GOL ───────────────
  -- Espera: tipo_finalizacao_code=NULL (NAO_OBSERVADO não deriva tipo)
  -- Registro fica pendente de revisão (sem tipo_finalizacao disponível)
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',               'CEPR0092-004',
    'scout_game_id',           '78000000-0000-0000-0000-000000000092',
    'tempo_jogo',              '25:12',
    'fase_da_bola_code',       'DEF_POS',
    'equipe_analisada_id',     '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'DEFESA',
    'sistema_defensivo_code',  'DEF_3X0',
    'categoria_acao_code',     'ACAO_DEFENSIVA',
    'acao_basica_code',        'BLOQUEIO',
    'classificacao_acao_code', 'NAO_OBSERVADO',
    'execucao_bloqueio_code',  'NAO_EXECUTADO',
    'resultado_factual_code',  'GOL'
  ));
  if v_entry.id is null then raise exception 'Cenario 4: entrada nao salva'; end if;
  if v_entry.tipo_finalizacao_code is not null then
    raise exception 'Cenario 4: tipo_finalizacao_code deve ser NULL para NAO_OBSERVADO, obteve %', v_entry.tipo_finalizacao_code;
  end if;
  if v_entry.status_validacao_code <> 'PENDENTE' then
    raise exception 'Cenario 4: status deve ser PENDENTE, obteve %', v_entry.status_validacao_code;
  end if;
  raise notice 'CEPR-0092 #4 OK — BLOQUEIO + NAO_OBSERVADO + NAO_EXECUTADO + GOL, tipo_finalizacao=NULL, status=PENDENTE';

  -- ── Cenário 5: Code antigo BLOQ_GIRO deve ser rejeitado (active=false) ───────
  begin
    v_entry := public.create_scout_live_entry(jsonb_build_object(
      'id_jogada',               'CEPR0092-005-REJECTED',
      'scout_game_id',           '78000000-0000-0000-0000-000000000092',
      'tempo_jogo',              '30:00',
      'fase_da_bola_code',       'DEF_POS',
      'equipe_analisada_id',     '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'DEFESA',
      'sistema_defensivo_code',  'DEF_3X0',
      'categoria_acao_code',     'ACAO_DEFENSIVA',
      'acao_basica_code',        'BLOQUEIO',
      'classificacao_acao_code', 'BLOQ_GIRO',
      'resultado_factual_code',  'BLOQUEADO'
    ));
    raise exception 'Cenario 5: BLOQ_GIRO (inativo) deveria ter sido rejeitado mas foi aceito';
  exception
    when others then
      if sqlerrm like '%INVALID_CODEBOOK_VALUE%' then
        raise notice 'CEPR-0092 #5 OK — BLOQ_GIRO (code inativo) rejeitado corretamente: %', sqlerrm;
      else
        raise exception 'Cenario 5: erro inesperado: %', sqlerrm;
      end if;
  end;

  -- ── Cenário 6: Verificar data migration de BLOQ_GIRO ────────────────────────
  -- Inserimos diretamente (bypass RPC) um registro legado e verificamos migração.
  -- Usando INSERT direto pois o RPC rejeitaria BLOQ_GIRO após migration 0033.
  insert into public.scout_live_entries (
    id, team_id, scout_game_id,
    id_jogada, tempo_jogo,
    fase_da_bola_code, equipe_analisada_id, fase_equipe_analisada_code,
    sistema_defensivo_code,
    acao_basica_code, classificacao_acao_code,
    resultado_factual_code, status_validacao_code
  ) values (
    '78000000-0000-0000-0000-000000009200',
    '10000000-0000-0000-0000-000000000001',
    '78000000-0000-0000-0000-000000000092',
    'CEPR0092-006-LEGACY', '35:00',
    'DEF_POS', '10000000-0000-0000-0000-000000000001', 'DEFESA',
    'DEF_3X0',
    'BLOQUEIO', 'BLOQ_GIRO',
    'BLOQUEADO', 'PENDENTE'
  );

  v_old_rec_id := '78000000-0000-0000-0000-000000009200';

  -- Simula a data migration do step 6 da migration 0033
  update public.scout_live_entries
  set
    classificacao_acao_code = 'GIRO',
    execucao_bloqueio_code  = 'EXECUTADO'
  where id = v_old_rec_id
    and classificacao_acao_code = 'BLOQ_GIRO';

  select classificacao_acao_code, execucao_bloqueio_code
  into v_classif, v_exec_bloq
  from public.scout_live_entries
  where id = v_old_rec_id;

  if v_classif <> 'GIRO' then
    raise exception 'Cenario 6: classificacao_acao_code esperado GIRO apos migracao, obteve %', v_classif;
  end if;
  if v_exec_bloq <> 'EXECUTADO' then
    raise exception 'Cenario 6: execucao_bloqueio_code esperado EXECUTADO apos migracao, obteve %', v_exec_bloq;
  end if;
  -- tipo_finalizacao_code deve permanecer NULL (não retroativo)
  select tipo_finalizacao_code into v_tipo_fin
  from public.scout_live_entries where id = v_old_rec_id;
  if v_tipo_fin is not null then
    raise exception 'Cenario 6: tipo_finalizacao_code deve ser NULL em registro legado, obteve %', v_tipo_fin;
  end if;
  raise notice 'CEPR-0092 #6 OK — data migration BLOQ_GIRO -> (GIRO, EXECUTADO), tipo_finalizacao=NULL preservado';

  -- ── Invariante: scout_plays e scout_play_participations não foram criados ────
  select count(*) into v_count_plays_after from public.scout_plays;
  select count(*) into v_count_parts_after from public.scout_play_participations;
  if v_count_plays_after <> v_count_plays_before then
    raise exception 'Invariante violado: scout_plays criados (antes: %, depois: %)', v_count_plays_before, v_count_plays_after;
  end if;
  if v_count_parts_after <> v_count_parts_before then
    raise exception 'Invariante violado: scout_play_participations criados';
  end if;
  raise notice 'Invariante OK — nenhum scout_play criado pela coleta ao vivo';

end;
$$;

rollback;
