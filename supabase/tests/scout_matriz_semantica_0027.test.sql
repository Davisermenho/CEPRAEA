-- scout_matriz_semantica_0027.test.sql
-- Testes para migration 0027: ajustes semânticos do codebook e RPC.
-- Executar após db reset (inclui 0026 e 0027).
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000727',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-27',
  'CEPRAEA',
  'Adversario Ajustes Semanticos 0027',
  'em_andamento'
);

-- ── A. LISTA_CLASSIF_ARREMESSO: ESPECIALISTA/GOLEIRA/6M/SHOOTOUT/GOL_CONTRA inativos ─

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_ARREMESSO'
     and cv.code in ('ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT', 'GOL_CONTRA')
     and cv.active = true;
  if v_count <> 0 then
    raise exception 'A: ESPECIALISTA/GOLEIRA/6M/SHOOTOUT/GOL_CONTRA devem estar inativos em LISTA_CLASSIF_ARREMESSO, encontrados % ativos', v_count;
  end if;
end $$;

-- ── B. LISTA_CLASSIF_ARREMESSO: GIRO/AEREA/ARREM_SIMPLES/FINALIZ_CONTRA ativos ─

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_ARREMESSO'
     and cv.code in ('GIRO', 'AEREA', 'ARREM_SIMPLES', 'FINALIZ_CONTRA')
     and cv.active = true;
  if v_count <> 4 then
    raise exception 'B: esperado 4 códigos AT_POS/TRANS_OF ativos em LISTA_CLASSIF_ARREMESSO, encontrados %', v_count;
  end if;
end $$;

-- ── C. LISTA_CLASSIF_ARREMESSO: FINALIZ_TRANS e AEREA_TRANS adicionados e ativos ─

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_ARREMESSO'
     and cv.code in ('FINALIZ_TRANS', 'AEREA_TRANS')
     and cv.active = true;
  if v_count <> 2 then
    raise exception 'C: FINALIZ_TRANS e AEREA_TRANS devem existir e estar ativos em LISTA_CLASSIF_ARREMESSO, encontrados %', v_count;
  end if;
end $$;

-- ── D. LISTA_CLASSIF_PASSE: PASSE_LONGO inativo ──────────────────────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_PASSE'
     and cv.code = 'PASSE_LONGO'
     and cv.active = true;
  if v_count <> 0 then
    raise exception 'D: PASSE_LONGO deve estar inativo em LISTA_CLASSIF_PASSE';
  end if;
end $$;

-- ── E. LISTA_CLASSIF_PASSE: novos códigos adicionados e ativos ───────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_PASSE'
     and cv.code in ('PASSE_PARA_ARREMESSO_SIMPLES', 'PASSE_APOIO')
     and cv.active = true;
  if v_count <> 2 then
    raise exception 'E: PASSE_PARA_ARREMESSO_SIMPLES e PASSE_APOIO devem estar ativos em LISTA_CLASSIF_PASSE, encontrados %', v_count;
  end if;
end $$;

-- ── F. LISTA_TIPO_FINALIZACAO: ESPECIALISTA/GOLEIRA/6M/SHOOTOUT inativos ──────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_TIPO_FINALIZACAO'
     and cv.code in ('ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT')
     and cv.active = true;
  if v_count <> 0 then
    raise exception 'F: ESPECIALISTA/GOLEIRA/6M/SHOOTOUT devem estar inativos em LISTA_TIPO_FINALIZACAO, encontrados % ativos', v_count;
  end if;
end $$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

-- ── G. RPC: AT_POS + ARREMESSO + ARREM_SIMPLES → tipo_fin derivado = SIMPLES ─

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0001',
    'tempo_jogo',                 '01:00',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'SIMPLES',
    'pontos_jogada',              1,
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'ARREM_SIMPLES'
    -- tipo_finalizacao_code omitido → deve ser derivado pelo RPC
  ));

  if v_entry.tipo_finalizacao_code is distinct from 'SIMPLES' then
    raise exception 'G: tipo_finalizacao_code deveria ser SIMPLES (derivado de ARREM_SIMPLES), got %',
      v_entry.tipo_finalizacao_code;
  end if;
end $$;

-- ── H. RPC: AT_POS + ARREMESSO + GIRO → tipo_fin derivado = GIRO ────────────

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0002',
    'tempo_jogo',                 '02:00',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'GIRO',
    'pontos_jogada',              2,
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'GIRO'
    -- tipo_finalizacao_code omitido → deve ser derivado como GIRO
  ));

  if v_entry.tipo_finalizacao_code is distinct from 'GIRO' then
    raise exception 'H: tipo_finalizacao_code deveria ser GIRO (derivado de classif GIRO), got %',
      v_entry.tipo_finalizacao_code;
  end if;
end $$;

-- ── I. RPC: TRANS_OF + ARREMESSO + FINALIZ_CONTRA → tipo_fin derivado = SIMPLES ─

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0003',
    'tempo_jogo',                 '03:00',
    'fase_da_bola_code',          'TRANS_OF',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'resultado_factual_code',     'DEFENDIDO',
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'FINALIZ_CONTRA'
    -- tipo_finalizacao_code omitido → derivado como SIMPLES
  ));

  if v_entry.tipo_finalizacao_code is distinct from 'SIMPLES' then
    raise exception 'I: tipo_finalizacao_code deveria ser SIMPLES (derivado de FINALIZ_CONTRA), got %',
      v_entry.tipo_finalizacao_code;
  end if;
end $$;

-- ── J. RPC: AT_POS + ARREMESSO + FINALIZ_CONTRA → INVALID_CONTEXT ────────────

do $$
begin
  perform public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0004',
    'tempo_jogo',                 '04:00',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'SIMPLES',
    'pontos_jogada',              1,
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'FINALIZ_CONTRA'
  ));
  raise exception 'J: Esperado INVALID_CONTEXT para FINALIZ_CONTRA em AT_POS, mas nenhum erro foi lançado';
exception
  when others then
    if sqlerrm not like '%INVALID_CONTEXT%' then
      raise exception 'J: Esperado INVALID_CONTEXT mas obteve: %', sqlerrm;
    end if;
end $$;

-- ── K. RPC: AT_POS + ARREMESSO + FINALIZ_TRANS → INVALID_CONTEXT ─────────────

do $$
begin
  perform public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0005',
    'tempo_jogo',                 '05:00',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'SIMPLES',
    'pontos_jogada',              1,
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'FINALIZ_TRANS'
  ));
  raise exception 'K: Esperado INVALID_CONTEXT para FINALIZ_TRANS em AT_POS, mas nenhum erro foi lançado';
exception
  when others then
    if sqlerrm not like '%INVALID_CONTEXT%' then
      raise exception 'K: Esperado INVALID_CONTEXT mas obteve: %', sqlerrm;
    end if;
end $$;

-- ── L. RPC: GOL + motivo=ESPECIALISTA + pontos=2 → válido ────────────────────
-- ESPECIALISTA foi removido de LISTA_CLASSIF_ARREMESSO mas permanece
-- ativo em LISTA_MOTIVO_PONTUACAO.

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0006',
    'tempo_jogo',                 '06:00',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'resultado_factual_code',     'GOL',
    'tipo_finalizacao_code',      'SIMPLES',
    'motivo_pontuacao_code',      'ESPECIALISTA',
    'pontos_jogada',              2,
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'ARREM_SIMPLES'
  ));

  if v_entry.motivo_pontuacao_code is distinct from 'ESPECIALISTA' then
    raise exception 'L: motivo_pontuacao_code deveria ser ESPECIALISTA, got %',
      v_entry.motivo_pontuacao_code;
  end if;
  if v_entry.pontos_jogada is distinct from 2 then
    raise exception 'L: pontos_jogada deveria ser 2 para ESPECIALISTA, got %',
      v_entry.pontos_jogada;
  end if;
end $$;

-- ── M. RPC: TRANS_OF + ARREMESSO + AEREA_TRANS → tipo_fin derivado = AEREA ───

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',              '78000000-0000-0000-0000-000000000727',
    'id_jogada',                  'AJU-0007',
    'tempo_jogo',                 '07:00',
    'fase_da_bola_code',          'TRANS_OF',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'TRANS_OF',
    'resultado_factual_code',     'FORA',
    'categoria_acao_code',        'ARREMESSO',
    'acao_basica_code',           'ARREMESSO',
    'classificacao_acao_code',    'AEREA_TRANS'
    -- tipo_finalizacao_code omitido → derivado como AEREA
  ));

  if v_entry.tipo_finalizacao_code is distinct from 'AEREA' then
    raise exception 'M: tipo_finalizacao_code deveria ser AEREA (derivado de AEREA_TRANS), got %',
      v_entry.tipo_finalizacao_code;
  end if;
end $$;

-- ── N. Invariante: zero scout_plays criados ───────────────────────────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.scout_plays
   where scout_game_id = '78000000-0000-0000-0000-000000000727';
  if v_count <> 0 then
    raise exception 'N: COLETA_AO_VIVO não deve criar scout_plays; encontrados %', v_count;
  end if;
end $$;

-- ── O. Verificar que foram criadas exatamente 5 entradas ─────────────────────
-- (G, H, I, L, M → 5 bem-sucedidas; J e K falharam = não persistidas)

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.scout_live_entries
   where scout_game_id = '78000000-0000-0000-0000-000000000727';
  if v_count <> 5 then
    raise exception 'O: esperado 5 scout_live_entries, encontrados %', v_count;
  end if;
end $$;

rollback;
