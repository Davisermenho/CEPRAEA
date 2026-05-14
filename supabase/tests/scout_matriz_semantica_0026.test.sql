-- Tests for migration 0026 (matriz semantica: acao_basica_code + classificacao_acao_code)
-- Covers: codebook contents, RPC create with new fields, auto-bridge, cascade validation.
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000726',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-26',
  'CEPRAEA',
  'Adversario Matriz Semantica 0026',
  'em_andamento'
);

-- ── A. Codebook: LISTA_CATEGORIA_ACAO tem TROCA_TRANSICAO ─────────────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CATEGORIA_ACAO' and cv.code = 'TROCA_TRANSICAO';
  if v_count <> 1 then
    raise exception 'LISTA_CATEGORIA_ACAO should have TROCA_TRANSICAO, found %', v_count;
  end if;
end $$;

-- ── B. Codebook: LISTA_ACAO_BASICA_PASSE tem PASSE ────────────────────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_ACAO_BASICA_PASSE' and cv.code = 'PASSE';
  if v_count <> 1 then
    raise exception 'LISTA_ACAO_BASICA_PASSE should have PASSE, found %', v_count;
  end if;
end $$;

-- ── C. Codebook: LISTA_ACAO_BASICA_ACAO_DEFENSIVA tem BLOQUEIO e INTERCEPTACAO ─

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA'
     and cv.code in ('BLOQUEIO', 'INTERCEPTACAO', 'ROUBO', 'COBERTURA', 'MARCACAO_PRESSAO', 'RECOMPOSICAO');
  if v_count <> 6 then
    raise exception 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA should have 6 codes, found %', v_count;
  end if;
end $$;

-- ── D. Codebook: LISTA_ACAO_BASICA_TROCA_TRANSICAO tem ENTRADA_OFENSIVA etc ────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_ACAO_BASICA_TROCA_TRANSICAO'
     and cv.code in ('ENTRADA_OFENSIVA', 'TROCA_OFENSIVA', 'TROCA_DEFENSIVA', 'ESTABILIZACAO');
  if v_count <> 4 then
    raise exception 'LISTA_ACAO_BASICA_TROCA_TRANSICAO should have 4 codes, found %', v_count;
  end if;
end $$;

-- ── E. Codebook: LISTA_CLASSIF_ARREMESSO tem GIRO e AEREA ────────────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_CLASSIF_ARREMESSO'
     and cv.code in ('GIRO', 'AEREA', 'ARREM_SIMPLES', 'ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT', 'FINALIZ_CONTRA', 'GOL_CONTRA');
  if v_count <> 9 then
    raise exception 'LISTA_CLASSIF_ARREMESSO should have 9 codes, found %', v_count;
  end if;
end $$;

-- ── F. Codebook: scout_field_value_allowed valida acao_basica_code com selector ─

do $$
declare
  v_ok boolean;
begin
  -- PASSE é válido para categoria PASSE
  select public.scout_field_value_allowed(
    'scout_live_entries', 'acao_basica_code', 'PASSE',
    'categoria_acao_code', 'PASSE'
  ) into v_ok;
  if v_ok is not true then
    raise exception 'scout_field_value_allowed should allow acao_basica=PASSE for categoria=PASSE';
  end if;

  -- BLOQUEIO é válido para categoria ACAO_DEFENSIVA
  select public.scout_field_value_allowed(
    'scout_live_entries', 'acao_basica_code', 'BLOQUEIO',
    'categoria_acao_code', 'ACAO_DEFENSIVA'
  ) into v_ok;
  if v_ok is not true then
    raise exception 'scout_field_value_allowed should allow acao_basica=BLOQUEIO for categoria=ACAO_DEFENSIVA';
  end if;

  -- BLOQUEIO NÃO é válido para categoria PASSE
  select public.scout_field_value_allowed(
    'scout_live_entries', 'acao_basica_code', 'BLOQUEIO',
    'categoria_acao_code', 'PASSE'
  ) into v_ok;
  if v_ok is not false then
    raise exception 'scout_field_value_allowed should reject acao_basica=BLOQUEIO for categoria=PASSE';
  end if;

  -- GIRO é válido para classificacao de ARREMESSO
  select public.scout_field_value_allowed(
    'scout_live_entries', 'classificacao_acao_code', 'GIRO',
    'acao_basica_code', 'ARREMESSO'
  ) into v_ok;
  if v_ok is not true then
    raise exception 'scout_field_value_allowed should allow classificacao=GIRO for acao_basica=ARREMESSO';
  end if;
end $$;

-- ── G. RPC: acao_basica inválida para categoria → INVALID_CODEBOOK_VALUE ──────

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
begin
  perform public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',             '78000000-0000-0000-0000-000000000726',
    'id_jogada',                 'MAT-0001',
    'tempo_jogo',                '01:00',
    'fase_da_bola_code',         'AT_POS',
    'equipe_analisada_id',       '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',     'AT_3X1',
    'resultado_factual_code',    'NAO_OBSERVADO',
    'pontos_jogada',             0,
    'categoria_acao_code',       'PASSE',
    'acao_basica_code',          'BLOQUEIO'  -- inválido para PASSE!
  ));
  raise exception 'Expected INVALID_CODEBOOK_VALUE for acao_basica=BLOQUEIO+categoria=PASSE but no error was raised';
exception
  when others then
    if sqlerrm not like '%INVALID_CODEBOOK_VALUE%acao_basica_code%' then
      raise exception 'Expected INVALID_CODEBOOK_VALUE for acao_basica_code but got: %', sqlerrm;
    end if;
end $$;

-- ── H. RPC: categoria=PASSE + acao_basica=PASSE → persiste, auto-bridge acao_principal ──

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',             '78000000-0000-0000-0000-000000000726',
    'id_jogada',                 'MAT-0002',
    'tempo_jogo',                '02:00',
    'fase_da_bola_code',         'AT_POS',
    'equipe_analisada_id',       '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',     'AT_3X1',
    'resultado_factual_code',    'PERDA',
    'pontos_jogada',             0,
    'categoria_acao_code',       'PASSE',
    'acao_basica_code',          'PASSE'
  ));

  if v_entry.acao_basica_code is distinct from 'PASSE' then
    raise exception 'acao_basica_code should be PASSE, got %', v_entry.acao_basica_code;
  end if;

  -- auto-bridge: acao_principal_text deve ser preenchido pelo RPC com PASSE
  if v_entry.acao_principal_text is distinct from 'PASSE' then
    raise exception 'auto-bridge: acao_principal_text should be PASSE, got %', v_entry.acao_principal_text;
  end if;

  if v_entry.acao_principal_is_custom is not false then
    raise exception 'auto-bridge: acao_principal_is_custom should be false, got %', v_entry.acao_principal_is_custom;
  end if;
end $$;

-- ── I. RPC: categoria=ARREMESSO + acao_basica=ARREMESSO + classif=GIRO → GOL ─

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  select * into v_entry from public.create_scout_live_entry(jsonb_build_object(
    'scout_game_id',             '78000000-0000-0000-0000-000000000726',
    'id_jogada',                 'MAT-0003',
    'tempo_jogo',                '03:00',
    'fase_da_bola_code',         'AT_POS',
    'equipe_analisada_id',       '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',     'AT_3X1',
    'resultado_factual_code',    'GOL',
    'tipo_finalizacao_code',     'GIRO',
    'motivo_pontuacao_code',     'GIRO',
    'pontos_jogada',             2,
    'categoria_acao_code',       'ARREMESSO',
    'acao_basica_code',          'ARREMESSO',
    'classificacao_acao_code',   'GIRO'
  ));

  if v_entry.acao_basica_code is distinct from 'ARREMESSO' then
    raise exception 'acao_basica_code should be ARREMESSO, got %', v_entry.acao_basica_code;
  end if;

  if v_entry.classificacao_acao_code is distinct from 'GIRO' then
    raise exception 'classificacao_acao_code should be GIRO, got %', v_entry.classificacao_acao_code;
  end if;

  if v_entry.resultado_factual_code is distinct from 'GOL' then
    raise exception 'resultado_factual_code should be GOL, got %', v_entry.resultado_factual_code;
  end if;
end $$;

-- ── J. RPC: zero scout_plays criados (COLETA_AO_VIVO invariant) ──────────────

do $$
declare
  v_count int;
begin
  select count(*) into v_count from public.scout_plays
   where scout_game_id = '78000000-0000-0000-0000-000000000726';
  if v_count <> 0 then
    raise exception 'COLETA_AO_VIVO must not create scout_plays; found %', v_count;
  end if;
end $$;

-- ── K. RPC: zero scout_play_participations (por transitividade de scout_plays) ─

do $$
declare
  v_count int;
begin
  -- scout_play_participations referenciam scout_plays; como J garantiu 0 plays,
  -- também devemos ter 0 participations. Verificamos de forma independente:
  select count(*) into v_count from public.scout_play_participations
   where scout_play_id in (
     select id from public.scout_plays
      where scout_game_id = '78000000-0000-0000-0000-000000000726'
   );
  if v_count <> 0 then
    raise exception 'COLETA_AO_VIVO must not create scout_play_participations; found %', v_count;
  end if;
end $$;

rollback;
