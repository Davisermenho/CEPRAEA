-- TEST-15 through TEST-20: Integration tests for the full Scout data flow
-- TEST-15: full flow COLETA_AO_VIVO → video review → COLETA_SCOUT (derived_scout_play_id link)
-- TEST-16: COLETA_SCOUT derives PARTICIPACOES (one row per athlete)
-- TEST-17: EVENTOS_MENTAIS derived by id_jogada with 10 official codes
-- TEST-18: STATUS_VALIDACAO cycle PENDENTE → REVISADO → CORRIGIDO → VALIDADO
-- TEST-19: RELATORIO only queries data with STATUS_VALIDACAO = VALIDADO
-- TEST-20: FEEDBACK requires evidence_ref (NOT NULL) linked to a jogada
\set ON_ERROR_STOP on

begin;

-- ─── Fixtures ────────────────────────────────────────────────────────────────

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '91000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-15',
  'CEPRAEA',
  'Adversario IntegrationFlow',
  'em_andamento'
);

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-15: Fluxo completo COLETA_AO_VIVO → revisão vídeo → COLETA_SCOUT
-- Verifies: live entry created → scout_play created via RPC →
--           derived_scout_play_id updated to link both records
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_live_entry public.scout_live_entries%rowtype;
  v_play_id    uuid;
  v_id_jogada  text := 'INT-FLOW-001';
begin

  -- Step 1: COLETA_AO_VIVO — quick live capture
  v_live_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                'INT-FLOW-001',
    'scout_game_id',            '91000000-0000-0000-0000-000000000001',
    'tempo_jogo',               '05:30',
    'fase_da_bola_code',        'AT_POS',
    'equipe_analisada_id',      '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',    'AT_3X1',
    'atleta_principal_id',      '20000000-0000-0000-0000-000000000001',
    'acao_principal_suggestion_code', 'GIRO',
    'tipo_finalizacao_code',    'GIRO',
    'resultado_factual_code',   'GOL',
    'motivo_pontuacao_code',    'GIRO',
    'pontos_jogada',            2
  ));

  if v_live_entry.id is null then
    raise exception 'TEST-15: create_scout_live_entry retornou NULL';
  end if;
  if v_live_entry.status_validacao_code <> 'PENDENTE' then
    raise exception 'TEST-15: live entry deve iniciar com status PENDENTE';
  end if;

  raise notice 'TEST-15a OK: COLETA_AO_VIVO criada (id_jogada=%, status=PENDENTE)', v_id_jogada;

  -- Step 2: COLETA_SCOUT — post-video review via upsert_scout_play_bundle
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'play_code',           v_id_jogada,
      'session_date',        '2026-12-15',
      'session_type',        'JOGO',
      'period',              'SET_1',
      'game_clock',          '05:30',
      'source',              'VIDEO',
      'phase_of_ball',       'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'offensive_system',    'AT_3X1',
      'factual_result',      'GOL',
      'play_score_reason',   'GIRO',
      'play_points',         '2',
      'finish_type',         'GIRO'
    ),
    '[]'::jsonb
  );

  if v_play_id is null then
    raise exception 'TEST-15: upsert_scout_play_bundle retornou NULL';
  end if;
  if not exists (
    select 1 from public.scout_plays
    where id = v_play_id
      and play_code = v_id_jogada
      and scout_game_id = '91000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'TEST-15: COLETA_SCOUT não encontrada com play_code = id_jogada';
  end if;

  raise notice 'TEST-15b OK: COLETA_SCOUT criada via RPC com play_code = id_jogada';

  -- Step 3: link live entry → scout_play via derived_scout_play_id
  update public.scout_live_entries
  set derived_scout_play_id = v_play_id,
      updated_at = now()
  where id = v_live_entry.id
    and team_id = '10000000-0000-0000-0000-000000000001';

  if not exists (
    select 1 from public.scout_live_entries
    where id = v_live_entry.id
      and derived_scout_play_id = v_play_id
  ) then
    raise exception 'TEST-15: derived_scout_play_id não foi gravado na live entry';
  end if;

  raise notice 'TEST-15c OK: derived_scout_play_id atualizado — live entry → scout_play ligados';

  -- Step 4: verify bidirectional join
  if not exists (
    select 1
    from public.scout_live_entries le
    join public.scout_plays sp on sp.id = le.derived_scout_play_id
      and sp.play_code = le.id_jogada
    where le.id = v_live_entry.id
  ) then
    raise exception 'TEST-15: join bidirecional COLETA_AO_VIVO ↔ COLETA_SCOUT falhou';
  end if;

  raise notice 'TEST-15 PASSOU: fluxo COLETA_AO_VIVO → COLETA_SCOUT completo e bidirecional';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-16: COLETA_SCOUT → PARTICIPACOES (uma linha por atleta)
-- Verifies: upsert_scout_play_bundle with 3 participations creates 3 rows
--           athlete scope ATQ × DEF is respected
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_play_id uuid;
  v_count   int;
begin

  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'play_code',           'INT-PART-001',
      'session_date',        '2026-12-15',
      'session_type',        'JOGO',
      'period',              'SET_1',
      'game_clock',          '08:00',
      'source',              'VIDEO',
      'phase_of_ball',       'AT_POS',
      'attacking_team_side', 'ANALYZED',
      'defending_team_side', 'OPPONENT',
      'offensive_system',    'AT_4X0',
      'factual_result',      'PERDA'
    ),
    jsonb_build_array(
      -- Atleta 1 (ATQ, slot 1)
      jsonb_build_object(
        'participant_scope',    'ATQ',
        'participant_side',     'ANALYZED',
        'slot_order',           1,
        'athlete_id',           '20000000-0000-0000-0000-000000000001',
        'phase_of_athlete',     'AT_POS',
        'participation_role',   'PORTADORA',
        'action_code',          'ERRO_PASSE',
        'individual_result',    'ERRO'
      ),
      -- Atleta 2 (ATQ, slot 2)
      jsonb_build_object(
        'participant_scope',    'ATQ',
        'participant_side',     'ANALYZED',
        'slot_order',           2,
        'athlete_id',           '20000000-0000-0000-0000-000000000002',
        'phase_of_athlete',     'AT_POS',
        'participation_role',   'RECEPTORA',
        'action_code',          'GIRO',
        'individual_result',    'BLOQUEADO'
      ),
      -- Atleta 3 (DEF)
      jsonb_build_object(
        'participant_scope',    'DEF',
        'participant_side',     'OPPONENT',
        'slot_order',           1,
        'phase_of_athlete',     'DEF_POS',
        'participation_role',   'BLOQUEADORA',
        'external_athlete_label', 'DEF-RIVAL-7'
      )
    )
  );

  select count(*) into v_count
  from public.scout_play_participations
  where scout_play_id = v_play_id
    and scout_game_id = '91000000-0000-0000-0000-000000000001';

  if v_count <> 3 then
    raise exception 'TEST-16: esperado 3 PARTICIPACOES, obtido %', v_count;
  end if;

  -- Verify one row per scope/slot
  if not exists (
    select 1 from public.scout_play_participations
    where scout_play_id = v_play_id and participant_scope = 'ATQ' and slot_order = 1
      and athlete_id = '20000000-0000-0000-0000-000000000001'
  ) then
    raise exception 'TEST-16: participação ATQ slot 1 não encontrada';
  end if;

  if not exists (
    select 1 from public.scout_play_participations
    where scout_play_id = v_play_id and participant_scope = 'DEF'
      and external_athlete_label = 'DEF-RIVAL-7'
  ) then
    raise exception 'TEST-16: participação DEF com external_athlete_label não encontrada';
  end if;

  raise notice 'TEST-16 PASSOU: COLETA_SCOUT derivou % PARTICIPACOES (ATQ×2 + DEF×1)', v_count;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-17: EVENTOS_MENTAIS derivados por id_jogada com 10 códigos oficiais
-- Verifies: 10 different mental_code values (AET, PA, MD, EAP, CF, CC, PAF, PJ, DT, LC)
--           each stored and linked by scout_play_id
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_play_id uuid;
  v_count   int;
  v_codes   text[] := ARRAY['AET','PA','MD','EAP','CF','CC','PAF','PJ','DT','LC'];
  c         text;
begin

  -- Create a fresh play for mental events
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'play_code',           'INT-MENT-001',
      'session_date',        '2026-12-15',
      'session_type',        'JOGO',
      'period',              'SET_2',
      'game_clock',          '12:00',
      'source',              'VIDEO',
      'phase_of_ball',       'DEF_POS',
      'attacking_team_side', 'OPPONENT',
      'defending_team_side', 'ANALYZED',
      'defensive_system',    'DEF_3X0',
      'factual_result',      'DEFENDIDO'
    ),
    '[]'::jsonb
  );

  -- Insert one event per each of the 10 official LISTA_CODIGO_MENTAL codes
  foreach c in array v_codes loop
    insert into public.scout_mental_events (
      team_id,
      scout_game_id,
      scout_play_id,
      athlete_id,
      mental_code,
      mental_mark,
      mental_observation
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '91000000-0000-0000-0000-000000000001',
      v_play_id,
      '20000000-0000-0000-0000-000000000001',
      c,
      case when c in ('AET','CF','PJ') then '+' when c in ('CC','DT') then '-' else '0' end,
      'Comportamento observável no lance INT-MENT-001'
    );
  end loop;

  select count(*) into v_count
  from public.scout_mental_events
  where scout_play_id = v_play_id;

  if v_count <> 10 then
    raise exception 'TEST-17: esperado 10 EVENTOS_MENTAIS, obtido %', v_count;
  end if;

  -- Verify all 10 codes are present
  foreach c in array v_codes loop
    if not exists (
      select 1 from public.scout_mental_events
      where scout_play_id = v_play_id and mental_code = c
    ) then
      raise exception 'TEST-17: código mental % não encontrado', c;
    end if;
  end loop;

  raise notice 'TEST-17 PASSOU: % EVENTOS_MENTAIS com 10 códigos oficiais ligados ao play_id', v_count;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-18: STATUS_VALIDACAO ciclo PENDENTE → REVISADO → CORRIGIDO → VALIDADO
-- Verifies: scout_live_entries starts PENDENTE; scout_play_validations records
--           track each transition; final status_validacao_code = VALIDADO
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_live_entry public.scout_live_entries%rowtype;
  v_play_id    uuid;
begin

  -- Create live entry (starts PENDENTE)
  v_live_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                'INT-VAL-001',
    'scout_game_id',            '91000000-0000-0000-0000-000000000001',
    'tempo_jogo',               '18:00',
    'fase_da_bola_code',        'DEF_POS',
    'equipe_analisada_id',      '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','DEFESA',
    'sistema_defensivo_code',   'DEF_2X1',
    'acao_principal_suggestion_code', 'BLOQ_GIRO',
    'resultado_factual_code',   'DEFENDIDO',
    'tipo_finalizacao_code',    'GIRO'
  ));

  if v_live_entry.status_validacao_code <> 'PENDENTE' then
    raise exception 'TEST-18: live entry deve iniciar PENDENTE, obtido %', v_live_entry.status_validacao_code;
  end if;
  raise notice 'TEST-18a OK: live entry INT-VAL-001 inicializada com status PENDENTE';

  -- Create scout play
  v_play_id := public.upsert_scout_play_bundle(
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    jsonb_build_object(
      'play_code',           'INT-VAL-001',
      'session_date',        '2026-12-15',
      'session_type',        'JOGO',
      'period',              'SET_2',
      'game_clock',          '18:00',
      'source',              'VIDEO',
      'phase_of_ball',       'DEF_POS',
      'attacking_team_side', 'OPPONENT',
      'defending_team_side', 'ANALYZED',
      'defensive_system',    'DEF_2X1',
      'factual_result',      'DEFENDIDO'
    ),
    '[]'::jsonb
  );

  -- Cycle: REVISADO
  insert into public.scout_play_validations (
    team_id, scout_game_id, scout_play_id, field_name,
    validation_status, correction_reason, validation_at
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    v_play_id, 'factual_result',
    'REVISADO', 'Revisão inicial — dado confere', now()
  );

  update public.scout_live_entries
  set status_validacao_code = 'REVISADO', updated_at = now()
  where id = v_live_entry.id;

  raise notice 'TEST-18b OK: transição PENDENTE → REVISADO registrada';

  -- Cycle: CORRIGIDO
  insert into public.scout_play_validations (
    team_id, scout_game_id, scout_play_id, field_name,
    original_value, corrected_value,
    validation_status, correction_reason, validation_at
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    v_play_id, 'defensive_system',
    'DEF_3X0', 'DEF_2X1',
    'CORRIGIDO', 'Sistema defensivo corrigido após revisão de vídeo', now()
  );

  update public.scout_live_entries
  set status_validacao_code = 'CORRIGIDO', updated_at = now()
  where id = v_live_entry.id;

  raise notice 'TEST-18c OK: transição REVISADO → CORRIGIDO registrada (DEF_3X0 → DEF_2X1)';

  -- Cycle: VALIDADO
  insert into public.scout_play_validations (
    team_id, scout_game_id, scout_play_id, field_name,
    validation_status, correction_reason, validation_at
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    v_play_id, 'factual_result',
    'VALIDADO', 'Ciclo completo — dado validado para relatório', now()
  );

  update public.scout_live_entries
  set status_validacao_code = 'VALIDADO', updated_at = now()
  where id = v_live_entry.id;

  -- Verify final state
  if not exists (
    select 1 from public.scout_live_entries
    where id = v_live_entry.id
      and status_validacao_code = 'VALIDADO'
  ) then
    raise exception 'TEST-18: status_validacao_code não chegou a VALIDADO';
  end if;

  if (
    select count(*) from public.scout_play_validations
    where scout_play_id = v_play_id
  ) <> 3 then
    raise exception 'TEST-18: esperado 3 registros de validação (REVISADO, CORRIGIDO, VALIDADO)';
  end if;

  raise notice 'TEST-18 PASSOU: ciclo PENDENTE→REVISADO→CORRIGIDO→VALIDADO completo com 3 registros';
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-19: RELATORIO só usa dados com STATUS_VALIDACAO = VALIDADO
-- Verifies: query pattern that filters scout_live_entries by status_validacao_code
--           only returns VALIDADO rows; PENDENTE rows are excluded
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_live_pendente public.scout_live_entries%rowtype;
  v_live_validado public.scout_live_entries%rowtype;
  v_report_count  int;
  v_validado_plays int;
begin

  -- Create PENDENTE live entry (not eligible for report)
  v_live_pendente := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                'INT-REP-PEND-001',
    'scout_game_id',            '91000000-0000-0000-0000-000000000001',
    'tempo_jogo',               '20:00',
    'fase_da_bola_code',        'TRANS_OF',
    'equipe_analisada_id',      '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','TRANS_OF',
    'acao_principal_suggestion_code', 'SAIDA_RAPIDA',
    'resultado_factual_code',   'VANTAGEM_CRIADA'
  ));
  -- Stays PENDENTE (no update)

  -- Create VALIDADO live entry (eligible for report)
  v_live_validado := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                'INT-REP-VALD-001',
    'scout_game_id',            '91000000-0000-0000-0000-000000000001',
    'tempo_jogo',               '22:00',
    'fase_da_bola_code',        'AT_POS',
    'equipe_analisada_id',      '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',    'AT_3X1',
    'acao_principal_suggestion_code', 'GIRO',
    'resultado_factual_code',   'GOL',
    'tipo_finalizacao_code',    'SIMPLES',
    'motivo_pontuacao_code',    'SIMPLES',
    'pontos_jogada',            1
  ));

  -- Mark second entry as VALIDADO
  update public.scout_live_entries
  set status_validacao_code = 'VALIDADO', updated_at = now()
  where id = v_live_validado.id;

  -- The report-eligible query: only VALIDADO entries for this game
  select count(*) into v_validado_plays
  from public.scout_live_entries
  where scout_game_id = '91000000-0000-0000-0000-000000000001'
    and status_validacao_code = 'VALIDADO';

  if v_validado_plays < 1 then
    raise exception 'TEST-19: nenhuma entrada VALIDADA encontrada no jogo';
  end if;

  -- The PENDENTE entry must NOT appear in the VALIDADO-only query
  if exists (
    select 1 from public.scout_live_entries
    where id = v_live_pendente.id
      and status_validacao_code = 'VALIDADO'
  ) then
    raise exception 'TEST-19: entrada PENDENTE apareceu erroneamente como VALIDADA';
  end if;

  -- Insert a scout_report row using only VALIDADO evidence
  insert into public.scout_report (
    team_id,
    scout_game_id,
    report_block,
    indicator,
    value_text,
    sample_size,
    technical_reading,
    training_priority,
    evidence_ids
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    'ATAQUE_POS',
    'TAXA_GOL_AT_POS',
    '100%',
    1,
    'Única sequência AT_POS resultou em gol simples.',
    'MANTER',
    ARRAY['INT-REP-VALD-001']
  );

  select count(*) into v_report_count
  from public.scout_report
  where scout_game_id = '91000000-0000-0000-0000-000000000001'
    and evidence_ids && ARRAY['INT-REP-VALD-001'];

  if v_report_count <> 1 then
    raise exception 'TEST-19: relatório com evidência validada não encontrado';
  end if;

  -- Report must not reference the PENDENTE id_jogada
  if exists (
    select 1 from public.scout_report
    where scout_game_id = '91000000-0000-0000-0000-000000000001'
      and evidence_ids && ARRAY['INT-REP-PEND-001']
  ) then
    raise exception 'TEST-19: relatório contém evidência PENDENTE';
  end if;

  raise notice 'TEST-19 PASSOU: relatório contém apenas evidências VALIDADAS; % entradas VALIDADAS no jogo', v_validado_plays;
end $$;

-- ═════════════════════════════════════════════════════════════════════════════
-- TEST-20: FEEDBACK tem evidência obrigatória (evidence_ref NOT NULL) vinculada a jogada
-- Verifies: INSERT without evidence_ref fails (NOT NULL constraint)
--           INSERT with evidence_ref succeeds and links to scout_live_entry_id
-- ═════════════════════════════════════════════════════════════════════════════
do $$
declare
  v_live_entry   public.scout_live_entries%rowtype;
  v_feedback_id  uuid;
  v_failed_correctly boolean := false;
begin

  -- Create a live entry to link feedback to
  v_live_entry := public.create_scout_live_entry(jsonb_build_object(
    'id_jogada',                'INT-FB-001',
    'scout_game_id',            '91000000-0000-0000-0000-000000000001',
    'tempo_jogo',               '25:00',
    'fase_da_bola_code',        'AT_POS',
    'equipe_analisada_id',      '10000000-0000-0000-0000-000000000001',
    'fase_equipe_analisada_code','ATAQUE',
    'sistema_ofensivo_code',    'AT_4X0',
    'acao_principal_suggestion_code', 'ERRO_PASSE',
    'resultado_factual_code',   'PERDA'
  ));

  -- Attempt 1: insert feedback WITHOUT evidence_ref → must fail
  begin
    insert into public.scout_feedback (
      team_id,
      scout_game_id,
      recipient,
      feedback_type,
      feedback_topic,
      message,
      priority
      -- evidence_ref intentionally omitted
    ) values (
      '10000000-0000-0000-0000-000000000001',
      '91000000-0000-0000-0000-000000000001',
      'ATLETA',
      'CORRECAO',
      'Posse de bola',
      'Atleta perdeu a posse no sistema 4x0.',
      'ALTA'
    );
    raise exception 'TEST-20: INSERT sem evidence_ref deveria ter falhado mas não falhou';
  exception when not_null_violation then
    v_failed_correctly := true;
    raise notice 'TEST-20a OK: INSERT sem evidence_ref rejeitado (not_null_violation)';
  end;

  if not v_failed_correctly then
    raise exception 'TEST-20: constraint NOT NULL de evidence_ref não está ativa';
  end if;

  -- Attempt 2: insert feedback WITH evidence_ref → must succeed, linked to live entry
  insert into public.scout_feedback (
    team_id,
    scout_game_id,
    scout_live_entry_id,
    recipient,
    feedback_type,
    feedback_topic,
    evidence_ref,
    message,
    priority
  ) values (
    '10000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000001',
    v_live_entry.id,
    'ATLETA',
    'CORRECAO',
    'Posse de bola no 4x0',
    'INT-FB-001 — vídeo 25:00 — perda após passe errado na lateral',
    'Revisar posicionamento de pivô temporária no AT_4X0.',
    'ALTA'
  )
  returning id into v_feedback_id;

  if v_feedback_id is null then
    raise exception 'TEST-20: INSERT com evidence_ref não retornou ID';
  end if;

  if not exists (
    select 1 from public.scout_feedback
    where id = v_feedback_id
      and scout_live_entry_id = v_live_entry.id
      and evidence_ref is not null
  ) then
    raise exception 'TEST-20: feedback não está ligado à live entry ou evidence_ref está vazia';
  end if;

  raise notice 'TEST-20b OK: feedback criado com evidence_ref e vinculado ao id_jogada INT-FB-001';
  raise notice 'TEST-20 PASSOU: evidence_ref obrigatória enforçada por NOT NULL + vínculo scout_live_entry_id validado';
end $$;

rollback;
