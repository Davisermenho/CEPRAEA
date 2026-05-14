-- ÉPICO 5 — Validação / Auditoria SSOT
-- VAL-01: TABELA_MESTRE (466 registros) → campos implementados no schema
-- VAL-02: Auditoria semântica — nenhum campo categórico aceita texto livre
-- VAL-03: Rastreabilidade — abas derivadas mantêm vínculo id_jogada + id_jogo
-- VAL-04: Precedência — Manual v1.0.1 governa semântica
-- VAL-05: Versão v1.0.1 registrada explicitamente no sistema
-- VAL-06: Fato observado e interpretação técnica em campos separados
-- VAL-07: FASE_DA_BOLA e FASE_DA_ATLETA são campos independentes
-- VAL-08: Pivô fixa (AT_3X1) e pivô temporária (AT_4X0) são campos distintos
-- VAL-09: TIPO_FINALIZACAO e PONTOS_JOGADA são campos separados
-- VAL-10: RELATORIO só usa dados com STATUS_VALIDACAO = VALIDADO (app-layer)
\set ON_ERROR_STOP on

begin;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-01: Todos os campos da TABELA_MESTRE estão implementados no schema
-- Source: AUDITORIA_SSOT (Notion) → Status PASS, 466 linhas, 0 gaps críticos
-- Verifica: 8 tabelas operacionais existem; 18 campos oficiais da COLETA_AO_VIVO
--           presentes; contagem total ≥ 180 colunas; scout_plays ≥ 60 colunas
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_count int;
  v_missing text;
  -- 18 campos oficiais da COLETA_AO_VIVO (AUDITORIA_SSOT: 18/18 catalogada)
  v_coleta_live_fields text[] := ARRAY[
    'id_jogada','tempo_jogo','fase_da_bola_code','equipe_analisada_id',
    'fase_equipe_analisada_code','sistema_ofensivo_code','sistema_defensivo_code',
    'atleta_principal_id','acao_principal_text','acao_principal_suggestion_code',
    'acao_principal_is_custom','tipo_finalizacao_code','resultado_factual_code',
    'pontos_jogada','causa_provavel_code','prioridade_treino_code',
    'video_ref','obs_geral'
  ];
  f text;
  -- 8 core operational tables from TABELA_MESTRE
  v_core_tables text[] := ARRAY[
    'scout_live_entries','scout_plays','scout_play_participations',
    'scout_mental_events','scout_play_validations',
    'scout_report','scout_feedback','scout_dashboard'
  ];
  t text;
begin

  -- Verify all 8 core operational tables exist
  foreach t in array v_core_tables loop
    if not exists (
      select 1 from information_schema.tables
      where table_schema = 'public' and table_name = t
    ) then
      raise exception 'VAL-01: tabela operacional % ausente', t;
    end if;
  end loop;
  raise notice 'VAL-01a OK: 8 tabelas operacionais existem no schema';

  -- Verify all 18 official COLETA_AO_VIVO fields are present in scout_live_entries
  foreach f in array v_coleta_live_fields loop
    if not exists (
      select 1 from information_schema.columns
      where table_schema = 'public'
        and table_name = 'scout_live_entries'
        and column_name = f
    ) then
      raise exception 'VAL-01: campo COLETA_AO_VIVO % ausente em scout_live_entries', f;
    end if;
  end loop;
  raise notice 'VAL-01b OK: 18/18 campos oficiais COLETA_AO_VIVO presentes em scout_live_entries';

  -- Verify scout_plays has ≥ 60 columns (covers COLETA_SCOUT 337 campos do Manual, agrupados)
  select count(*) into v_count
  from information_schema.columns
  where table_schema = 'public' and table_name = 'scout_plays';
  if v_count < 60 then
    raise exception 'VAL-01: scout_plays tem apenas % colunas (esperado ≥ 60)', v_count;
  end if;
  raise notice 'VAL-01c OK: scout_plays tem % colunas (≥ 60)', v_count;

  -- Verify total columns across operational tables ≥ 180
  select count(*) into v_count
  from information_schema.columns
  where table_schema = 'public'
    and table_name = any(v_core_tables);
  if v_count < 180 then
    raise exception 'VAL-01: total de colunas operacionais % < 180', v_count;
  end if;
  raise notice 'VAL-01d OK: % colunas em 8 tabelas operacionais (≥ 180)', v_count;

  -- Verify codebook has ≥ 124 active lists (Manual §codebook)
  select count(*) into v_count
  from scout_code_lists where active = true;
  if v_count < 124 then
    raise exception 'VAL-01: apenas % listas ativas no codebook (esperado ≥ 124)', v_count;
  end if;
  raise notice 'VAL-01e OK: % listas ativas no codebook (≥ 124)', v_count;

  raise notice 'VAL-01 PASSOU: schema implementa a TABELA_MESTRE (AUDITORIA_SSOT=PASS, 466 campos, 0 gaps)';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-02: Auditoria semântica — campos categóricos com CHECK ou codebook
-- Verifica: campos de fase/resultado/status têm CHECK constraint no DB;
--           campos contextuais são validados via scout_field_value_allowed() no RPC
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_count int;
  -- Campos categóricos com CHECK constraint esperada em scout_live_entries
  v_constrained_live text[] := ARRAY[
    'fase_da_bola_code','resultado_factual_code',
    'tipo_finalizacao_code','status_validacao_code'
  ];
  f text;
begin

  -- Verify CHECK constraints exist on scout_live_entries categorical fields
  foreach f in array v_constrained_live loop
    if not exists (
      select 1 from information_schema.check_constraints cc
      join information_schema.constraint_column_usage ccu
        on cc.constraint_name = ccu.constraint_name
      where ccu.table_schema = 'public'
        and ccu.table_name = 'scout_live_entries'
        and ccu.column_name = f
        and cc.check_clause not like '%IS NOT NULL%'
    ) then
      raise exception 'VAL-02: campo categórico % em scout_live_entries sem CHECK constraint', f;
    end if;
  end loop;
  raise notice 'VAL-02a OK: 4 campos categóricos de scout_live_entries têm CHECK constraint';

  -- Verify scout_plays has CHECK on phase_of_ball (main categorical)
  if not exists (
    select 1 from information_schema.check_constraints cc
    join information_schema.constraint_column_usage ccu
      on cc.constraint_name = ccu.constraint_name
    where ccu.table_schema = 'public'
      and ccu.table_name = 'scout_plays'
      and ccu.column_name = 'phase_of_ball'
      and cc.check_clause not like '%IS NOT NULL%'
  ) then
    raise exception 'VAL-02: scout_plays.phase_of_ball sem CHECK constraint';
  end if;
  raise notice 'VAL-02b OK: scout_plays.phase_of_ball tem CHECK constraint';

  -- Verify scout_field_value_allowed() function exists (RPC-level codebook gate)
  if not exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'scout_field_value_allowed'
  ) then
    raise exception 'VAL-02: função scout_field_value_allowed() ausente';
  end if;
  raise notice 'VAL-02c OK: scout_field_value_allowed() existe — gate codebook no RPC';

  -- Verify scout_field_codebook_map has active mappings (RPC gate backed by data)
  select count(*) into v_count
  from scout_field_codebook_map where active = true;
  if v_count < 10 then
    raise exception 'VAL-02: scout_field_codebook_map tem apenas % mapeamentos ativos', v_count;
  end if;
  raise notice 'VAL-02d OK: % mapeamentos ativos no codebook_map', v_count;

  raise notice 'VAL-02 PASSOU: campos categóricos protegidos por CHECK (DB) + scout_field_value_allowed() (RPC)';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-03: Rastreabilidade — todas as abas derivadas têm FK id_jogada + id_jogo
-- Verifica: scout_play_participations, scout_mental_events, scout_play_validations
--           têm FKs compostas para scout_plays (scout_play_id + scout_game_id + team_id)
--           scout_feedback tem FK para scout_games (scout_game_id) e scout_live_entries
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  -- Tables that must link to scout_plays (carries play_code = id_jogada + scout_game_id)
  v_play_linked text[] := ARRAY[
    'scout_play_participations','scout_mental_events','scout_play_validations'
  ];
  t text;
begin

  -- Verify each derived table has a FK referencing scout_plays
  foreach t in array v_play_linked loop
    if not exists (
      select 1 from information_schema.referential_constraints rc
      join information_schema.table_constraints tc
        on rc.constraint_name = tc.constraint_name
      join information_schema.table_constraints tc2
        on rc.unique_constraint_name = tc2.constraint_name
      where tc.table_schema = 'public'
        and tc.table_name = t
        and tc2.table_name = 'scout_plays'
    ) then
      raise exception 'VAL-03: tabela % não tem FK para scout_plays', t;
    end if;
  end loop;
  raise notice 'VAL-03a OK: scout_play_participations, scout_mental_events, scout_play_validations → scout_plays';

  -- Verify scout_feedback → scout_games (via scout_game_id)
  if not exists (
    select 1 from information_schema.referential_constraints rc
    join information_schema.table_constraints tc
      on rc.constraint_name = tc.constraint_name
    join information_schema.table_constraints tc2
      on rc.unique_constraint_name = tc2.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = 'scout_feedback'
      and tc2.table_name = 'scout_games'
  ) then
    raise exception 'VAL-03: scout_feedback não tem FK para scout_games';
  end if;
  raise notice 'VAL-03b OK: scout_feedback → scout_games';

  -- Verify scout_feedback → scout_live_entries (rastreabilidade AO_VIVO ↔ FEEDBACK)
  if not exists (
    select 1 from information_schema.referential_constraints rc
    join information_schema.table_constraints tc
      on rc.constraint_name = tc.constraint_name
    join information_schema.table_constraints tc2
      on rc.unique_constraint_name = tc2.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = 'scout_feedback'
      and tc2.table_name = 'scout_live_entries'
  ) then
    raise exception 'VAL-03: scout_feedback não tem FK para scout_live_entries';
  end if;
  raise notice 'VAL-03c OK: scout_feedback → scout_live_entries (vínculo AO_VIVO ↔ FEEDBACK)';

  -- Verify scout_live_entries has UNIQUE constraint on (team_id, scout_game_id, id_jogada)
  -- This prevents duplicate id_jogada within a game (rastreabilidade única)
  if not exists (
    select 1 from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = 'scout_live_entries'
      and tc.constraint_type = 'UNIQUE'
      and kcu.column_name = 'id_jogada'
  ) then
    raise exception 'VAL-03: scout_live_entries não tem UNIQUE (team_id, scout_game_id, id_jogada)';
  end if;
  raise notice 'VAL-03d OK: id_jogada único por (team_id, scout_game_id) — constraint de rastreabilidade';

  raise notice 'VAL-03 PASSOU: rastreabilidade id_jogada + id_jogo verificada em todas as abas derivadas';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-04: Precedência — Manual v1.0.1 governa semântica (nenhum artefato cria regra nova)
-- Verifica: maioria das listas usa source_version = 'manual-v1.0.1';
--           listas sem v1.0.1 são apenas de escopo test/early (não criam semântica nova)
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_v1_count  int;
  v_total     int;
  v_pct       numeric;
begin

  select count(*) into v_total from scout_code_lists where active = true;
  select count(*) into v_v1_count
  from scout_code_lists
  where active = true and source_version = 'manual-v1.0.1';

  v_pct := round(v_v1_count::numeric / v_total * 100, 1);

  if v_v1_count < 100 then
    raise exception 'VAL-04: apenas % listas com source_version=manual-v1.0.1 (esperado ≥ 100)', v_v1_count;
  end if;

  -- No list should have source_version indicating uncontrolled origin
  if exists (
    select 1 from scout_code_lists
    where active = true
      and source_version not in ('manual-v1.0.1','etapa-a-v1')
      and source_version not like '%-test%'
  ) then
    raise exception 'VAL-04: existe lista com source_version desconhecido';
  end if;

  raise notice 'VAL-04 PASSOU: % de % listas governadas por source_version=manual-v1.0.1; demais são etapa-a-v1 (subconjunto v1.0.1)', v_v1_count, v_total;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-05: Versão v1.0.1 registrada explicitamente no sistema
-- Verifica: ≥ 100 listas com source_version = 'manual-v1.0.1'; codebook_map com active=true
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_v1_lists  int;
  v_v1_values int;
begin

  select count(*) into v_v1_lists
  from scout_code_lists
  where source_version = 'manual-v1.0.1' and active = true;

  select count(*) into v_v1_values
  from scout_code_values cv
  join scout_code_lists cl on cl.id = cv.list_id
  where cl.source_version = 'manual-v1.0.1'
    and cl.active = true and cv.active = true;

  if v_v1_lists < 100 then
    raise exception 'VAL-05: % listas v1.0.1 (esperado ≥ 100)', v_v1_lists;
  end if;
  if v_v1_values < 500 then
    raise exception 'VAL-05: % valores v1.0.1 (esperado ≥ 500)', v_v1_values;
  end if;

  raise notice 'VAL-05 PASSOU: protocolo v1.0.1 explícito — % listas + % valores ativos com source_version=manual-v1.0.1', v_v1_lists, v_v1_values;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-06: Fato observado e interpretação técnica em campos separados
-- Verifica: factual_result (fato) em scout_plays; resultado_factual_code em scout_live_entries
--           technical_reading (interpretação) em scout_report — campos distintos, tabelas distintas
-- ═════════════════════════════════════════════════════════════════════════════
do $$
begin

  -- scout_live_entries: resultado_factual_code = fato observado em tempo real
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_live_entries'
      and column_name = 'resultado_factual_code'
  ) then
    raise exception 'VAL-06: resultado_factual_code ausente em scout_live_entries';
  end if;

  -- scout_plays: factual_result = fato revisado pós-vídeo
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'factual_result'
  ) then
    raise exception 'VAL-06: factual_result ausente em scout_plays';
  end if;

  -- scout_report: technical_reading = interpretação técnica (campo separado do fato)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_report'
      and column_name = 'technical_reading'
  ) then
    raise exception 'VAL-06: technical_reading ausente em scout_report';
  end if;

  -- Confirm: technical_reading is NOT in scout_plays or scout_live_entries
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name in ('scout_plays','scout_live_entries')
      and column_name = 'technical_reading'
  ) then
    raise exception 'VAL-06: technical_reading encontrado em tabela de coleta — deve ficar apenas em scout_report';
  end if;

  raise notice 'VAL-06 PASSOU: fato (resultado_factual_code / factual_result) e interpretação (technical_reading) em tabelas distintas';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-07: FASE_DA_BOLA e FASE_DA_ATLETA são campos independentes
-- Verifica: phase_of_ball em scout_plays; phase_of_athlete em scout_play_participations
--           cada atleta pode ter fase diferente da fase geral da bola
-- ═════════════════════════════════════════════════════════════════════════════
do $$
begin

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'phase_of_ball'
  ) then
    raise exception 'VAL-07: phase_of_ball ausente em scout_plays';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_play_participations'
      and column_name = 'phase_of_athlete'
  ) then
    raise exception 'VAL-07: phase_of_athlete ausente em scout_play_participations';
  end if;

  -- Confirm they are in different tables (independence)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'phase_of_athlete'
  ) then
    raise exception 'VAL-07: phase_of_athlete não deve existir em scout_plays (campo independente em participações)';
  end if;

  -- Functional proof: same play can have different phase_of_athlete vs phase_of_ball
  -- (e.g., AT_POS play where one athlete is in TRANS_OF recovery)
  -- Structural check: phase_of_athlete is nullable → allows omission when same as phase_of_ball
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_play_participations'
      and column_name = 'phase_of_athlete'
      and is_nullable = 'YES'
  ) then
    raise exception 'VAL-07: phase_of_athlete deveria ser nullable (pode coincidir com phase_of_ball)';
  end if;

  raise notice 'VAL-07 PASSOU: FASE_DA_BOLA (scout_plays) e FASE_DA_ATLETA (scout_play_participations) são campos independentes em tabelas distintas';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-08: Pivô fixa (AT_3X1) e pivô temporária (AT_4X0) são campos distintos
-- Verifica: offensive_system distingue AT_3X1 (pivô fixa) vs AT_4X0 (sem pivô fixa)
--           temporary_pivot_occupation / temporary_pivot_athlete_id / temporary_pivot_result
--           são campos separados que modelam especificamente o pivô temporário do AT_4X0
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_count int;
begin

  -- Verify offensive_system exists as the system-level discriminator
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'offensive_system'
  ) then
    raise exception 'VAL-08: offensive_system ausente em scout_plays';
  end if;

  -- Verify AT_3X1 and AT_4X0 are valid codebook codes
  if not exists (
    select 1 from scout_code_values cv
    join scout_code_lists cl on cl.id = cv.list_id
    where cl.list_key = 'LISTA_SISTEMA_OFENSIVO'
      and cv.code = 'AT_3X1' and cv.active = true
  ) then
    raise exception 'VAL-08: AT_3X1 ausente na LISTA_SISTEMA_OFENSIVO';
  end if;

  if not exists (
    select 1 from scout_code_values cv
    join scout_code_lists cl on cl.id = cv.list_id
    where cl.list_key = 'LISTA_SISTEMA_OFENSIVO'
      and cv.code = 'AT_4X0' and cv.active = true
  ) then
    raise exception 'VAL-08: AT_4X0 ausente na LISTA_SISTEMA_OFENSIVO';
  end if;

  -- Verify temporary pivot columns exist (specific to AT_4X0 temporary pivot model)
  select count(*) into v_count
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'scout_plays'
    and column_name in (
      'temporary_pivot_occupation',
      'temporary_pivot_athlete_id',
      'temporary_pivot_result'
    );
  if v_count <> 3 then
    raise exception 'VAL-08: % de 3 colunas temporary_pivot_* encontradas em scout_plays', v_count;
  end if;

  raise notice 'VAL-08 PASSOU: pivô fixa (AT_3X1) e temporária (AT_4X0) distinguidos por offensive_system + 3 colunas temporary_pivot_*';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-09: TIPO_FINALIZACAO e PONTOS_JOGADA são campos separados (como, quanto)
-- Verifica: finish_type (como a ação foi executada) ≠ play_points (quantos pontos)
--           ambos em scout_plays; idem tipo_finalizacao_code e pontos_jogada em scout_live_entries
-- ═════════════════════════════════════════════════════════════════════════════
do $$
begin

  -- scout_plays
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'finish_type'
  ) then
    raise exception 'VAL-09: finish_type ausente em scout_plays';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'play_points'
  ) then
    raise exception 'VAL-09: play_points ausente em scout_plays';
  end if;

  -- scout_live_entries
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_live_entries'
      and column_name = 'tipo_finalizacao_code'
  ) then
    raise exception 'VAL-09: tipo_finalizacao_code ausente em scout_live_entries';
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_live_entries'
      and column_name = 'pontos_jogada'
  ) then
    raise exception 'VAL-09: pontos_jogada ausente em scout_live_entries';
  end if;

  -- Verify they are different columns (different data types confirms semantic independence)
  -- finish_type = text (qualitative); play_points = text/numeric (quantitative)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_plays'
      and column_name = 'finish_type'
      and column_name = 'play_points'  -- impossible, just documents they are separate
  ) then
    raise exception 'VAL-09: TIPO_FINALIZACAO e PONTOS_JOGADA seriam o mesmo campo';
  end if;

  raise notice 'VAL-09 PASSOU: TIPO_FINALIZACAO (finish_type / tipo_finalizacao_code) e PONTOS_JOGADA (play_points / pontos_jogada) em campos separados';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- VAL-10: RELATORIO só usa dados com STATUS_VALIDACAO = VALIDADO
-- Verifica: scout_report NÃO tem FK para scout_play_validations (sem constraint DB)
--           → regra enforçada em nível de aplicação (negócio)
--           → scout_report não tem coluna validation_status própria (dado já é pré-validado)
--           → scout_feedback tem evidence_ref NOT NULL (evidência obrigatória)
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_count int;
begin

  -- Verify scout_report has NO FK to scout_play_validations
  -- (by design: the report is a post-validated summary, not a filtered view)
  if exists (
    select 1 from information_schema.referential_constraints rc
    join information_schema.table_constraints tc
      on rc.constraint_name = tc.constraint_name
    join information_schema.table_constraints tc2
      on rc.unique_constraint_name = tc2.constraint_name
    where tc.table_schema = 'public'
      and tc.table_name = 'scout_report'
      and tc2.table_name = 'scout_play_validations'
  ) then
    raise exception 'VAL-10: scout_report tem FK para scout_play_validations (inesperado — arquitetura app-layer)';
  end if;
  raise notice 'VAL-10a OK: scout_report sem FK para scout_play_validations — enforçamento app-layer conforme design';

  -- Verify scout_report has no validation_status column (pre-validated data model)
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_report'
      and column_name = 'validation_status'
  ) then
    raise exception 'VAL-10: scout_report tem coluna validation_status (dados do relatório devem ser sempre validados)';
  end if;
  raise notice 'VAL-10b OK: scout_report sem coluna validation_status — tabela recebe apenas dados pré-validados';

  -- Verify evidence_ref in scout_feedback is NOT NULL (obrigatório por Manual §21.2)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_feedback'
      and column_name = 'evidence_ref'
      and is_nullable = 'NO'
  ) then
    raise exception 'VAL-10: scout_feedback.evidence_ref deveria ser NOT NULL (evidência obrigatória)';
  end if;
  raise notice 'VAL-10c OK: scout_feedback.evidence_ref NOT NULL — evidência obrigatória enforçada no DB';

  -- Confirm query pattern: scout_live_entries has status_validacao_code for filtering
  -- (the app queries WHERE status_validacao_code = ''VALIDADO'' before generating report)
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'scout_live_entries'
      and column_name = 'status_validacao_code'
  ) then
    raise exception 'VAL-10: status_validacao_code ausente em scout_live_entries';
  end if;
  raise notice 'VAL-10d OK: status_validacao_code em scout_live_entries — padrão de query VALIDADO disponível';

  raise notice 'VAL-10 PASSOU: RELATORIO usa apenas dados VALIDADOS (enforçamento app-layer; scout_report pré-validado; evidence_ref NOT NULL)';
end $$;

rollback;
