-- Tests for migration 0024 (codebook labels + CONTRA/GOL_CONTRA)
-- and migration 0025 (categoria_acao_code column + RPC support).
\set ON_ERROR_STOP on

begin;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '78000000-0000-0000-0000-000000000701',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-01',
  'CEPRAEA',
  'Adversario Labels Test',
  'em_andamento'
);

-- ── A. Labels dos sistemas táticos ───────────────────────────────────────────

do $$
declare
  v_label text;
begin
  -- LISTA_SISTEMA_OFENSIVO
  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_OFENSIVO' and cv.code = 'AT_3X1';
  if v_label is distinct from 'Ataque 3:1' then
    raise exception 'AT_3X1 label expected "Ataque 3:1", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_OFENSIVO' and cv.code = 'AT_4X0';
  if v_label is distinct from 'Ataque 4:0' then
    raise exception 'AT_4X0 label expected "Ataque 4:0", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_OFENSIVO' and cv.code = 'NAO_APLICA';
  if v_label is distinct from 'Não se aplica' then
    raise exception 'LISTA_SISTEMA_OFENSIVO NAO_APLICA label expected "Não se aplica", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_OFENSIVO' and cv.code = 'NAO_OBSERVADO';
  if v_label is distinct from 'Não observado' then
    raise exception 'LISTA_SISTEMA_OFENSIVO NAO_OBSERVADO label expected "Não observado", got "%"', v_label;
  end if;

  -- LISTA_SISTEMA_DEFENSIVO
  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_3X0';
  if v_label is distinct from 'Defesa 3×0' then
    raise exception 'DEF_3X0 label expected "Defesa 3×0", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_2X1';
  if v_label is distinct from 'Defesa 2×1' then
    raise exception 'DEF_2X1 label expected "Defesa 2×1", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_1X2';
  if v_label is distinct from 'Defesa 1×2' then
    raise exception 'DEF_1X2 label expected "Defesa 1×2", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_MISTO';
  if v_label is distinct from 'Defesa misto' then
    raise exception 'DEF_MISTO label expected "Defesa misto", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_INDIVIDUAL';
  if v_label is distinct from 'Defesa individual' then
    raise exception 'DEF_INDIVIDUAL label expected "Defesa individual", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'DEF_2X0_OUT';
  if v_label is distinct from 'Defesa 2×0 (OUT)' then
    raise exception 'DEF_2X0_OUT label expected "Defesa 2×0 (OUT)", got "%"', v_label;
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' and cv.code = 'NAO_OBSERVADO';
  if v_label is distinct from 'Não observado' then
    raise exception 'LISTA_SISTEMA_DEFENSIVO NAO_OBSERVADO label expected "Não observado", got "%"', v_label;
  end if;

  raise notice 'A. labels dos sistemas táticos — OK';
end $$;

-- ── B. CONTRA e GOL_CONTRA no codebook e aceitos pelo CHECK ──────────────────

do $$
declare
  v_label text;
begin
  if not exists (
    select 1 from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
    where cl.list_key = 'LISTA_TIPO_FINALIZACAO' and cv.code = 'CONTRA'
  ) then
    raise exception 'CONTRA ausente em LISTA_TIPO_FINALIZACAO';
  end if;

  if not exists (
    select 1 from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
    where cl.list_key = 'LISTA_TIPO_FINALIZACAO' and cv.code = 'GOL_CONTRA'
  ) then
    raise exception 'GOL_CONTRA ausente em LISTA_TIPO_FINALIZACAO';
  end if;

  select cv.label into v_label
    from public.scout_code_values cv
    join public.scout_code_lists cl on cv.list_id = cl.id
   where cl.list_key = 'LISTA_TIPO_FINALIZACAO' and cv.code = 'CONTRA';
  if v_label is distinct from 'Finalização em contra-ataque' then
    raise exception 'CONTRA label expected "Finalização em contra-ataque", got "%"', v_label;
  end if;

  raise notice 'B. CONTRA/GOL_CONTRA no codebook — OK';
end $$;

-- ── C. RPC persiste categoria_acao_code = ARREMESSO ──────────────────────────

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'LIVE-CAT-001',
    'scout_game_id',              '78000000-0000-0000-0000-000000000701',
    'tempo_jogo',                 '00:10',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'GIRO',
    'acao_basica_code',           'ARREMESSO',
    'tipo_finalizacao_code',      'GIRO',
    'resultado_factual_code',     'GOL',
    'motivo_pontuacao_code',      'GIRO',
    'pontos_jogada',              2,
    'categoria_acao_code',        'ARREMESSO'
  ));

  if v_entry.categoria_acao_code is distinct from 'ARREMESSO' then
    raise exception 'categoria_acao_code expected "ARREMESSO", got "%"', v_entry.categoria_acao_code;
  end if;

  raise notice 'C. RPC persiste categoria_acao_code — OK';
end $$;

-- ── D. RPC rejeita categoria_acao_code inválido ───────────────────────────────

do $$
begin
  begin
    perform public.create_scout_live_entry(jsonb_build_object(
      'id_jogada',                  'LIVE-CAT-002',
      'scout_game_id',              '78000000-0000-0000-0000-000000000701',
      'tempo_jogo',                 '00:20',
      'fase_da_bola_code',          'AT_POS',
      'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
      'fase_equipe_analisada_code', 'ATAQUE',
      'sistema_ofensivo_code',      'AT_3X1',
      'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
      'acao_principal_suggestion_code', 'GIRO',
      'acao_basica_code',           'ARREMESSO',
      'tipo_finalizacao_code',      'GIRO',
      'resultado_factual_code',     'GOL',
      'motivo_pontuacao_code',      'GIRO',
      'pontos_jogada',              2,
      'categoria_acao_code',        'INVALIDO'
    ));
    raise exception 'Deveria ter falhado com INVALID_CODEBOOK_VALUE';
  exception when others then
    if sqlerrm not like '%INVALID_CODEBOOK_VALUE: categoria_acao_code%' then
      raise exception 'Erro inesperado: %', sqlerrm;
    end if;
  end;

  raise notice 'D. RPC rejeita categoria_acao_code inválido — OK';
end $$;

-- ── E. categoria_acao_code NULL aceito (campo opcional) ───────────────────────

do $$
declare
  v_entry public.scout_live_entries%rowtype;
begin
  v_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                  'LIVE-CAT-003',
    'scout_game_id',              '78000000-0000-0000-0000-000000000701',
    'tempo_jogo',                 '00:30',
    'fase_da_bola_code',          'AT_POS',
    'equipe_analisada_id',        '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code', 'ATAQUE',
    'sistema_ofensivo_code',      'AT_3X1',
    'atleta_principal_id',        '20000000-0000-0000-0000-000000000001',
    'resultado_factual_code',     'NAO_OBSERVADO'
  ));

  if v_entry.categoria_acao_code is not null then
    raise exception 'categoria_acao_code deveria ser NULL quando não informado, got "%"', v_entry.categoria_acao_code;
  end if;

  raise notice 'E. categoria_acao_code NULL aceito — OK';
end $$;

rollback;
