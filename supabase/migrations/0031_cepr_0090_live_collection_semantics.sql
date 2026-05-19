-- CEPR-0090: Revisão Semântica da Matriz COLETA_AO_VIVO (Pós PILOTO-01)
-- Sub-slice A: desbloquear os 2 lances BLOCKER (TIRO_6M_CONCEDIDO + FINALIZACAO_6M_ADV)
-- Sub-slice B: corrigir semântica dos 9 lances HIGH (novas classificações,
--              estrutura_transicao_code, acao_preparatoria_code)

-- ── 1. Corrigir CHECK constraint de resultado_factual_code ───────────────────
-- Inclui ERRO_PASSE e PASSE_INTERCEPTADO (adicionados ao codebook em 0028 mas
-- não ao CHECK) e TIRO_6M_CONCEDIDO (novo em CEPR-0090A).

ALTER TABLE public.scout_live_entries
  DROP CONSTRAINT IF EXISTS scout_live_entries_resultado_factual_code_check;

ALTER TABLE public.scout_live_entries
  ADD CONSTRAINT scout_live_entries_resultado_factual_code_check
  CHECK (resultado_factual_code IN (
    'GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE', 'VIOLACAO', 'PERDA',
    'RECUPERACAO_POSSE', 'FALTA_ATAQUE', 'PASSIVO', 'ERRO_TROCA',
    'TRANSICAO_NEUTRALIZADA', 'DEFESA_ESTABILIZADA', 'VANTAGEM_CRIADA',
    'VANTAGEM_PERDIDA', 'ERRO_PASSE', 'PASSE_INTERCEPTADO',
    'TIRO_6M_CONCEDIDO', 'NAO_OBSERVADO'
  ));

-- ── 2. Novas colunas em scout_live_entries ───────────────────────────────────

ALTER TABLE public.scout_live_entries
  ADD COLUMN IF NOT EXISTS estrutura_transicao_code text,
  ADD COLUMN IF NOT EXISTS acao_preparatoria_code text;

-- ── 3. TIRO_6M_CONCEDIDO em LISTA_RESULTADO_FACTUAL (0090A) ─────────────────

INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active,
  description, when_to_use, when_not_to_use
)
SELECT
  l.id, v.code, v.label, v.sort_order,
  false, false, true,
  v.description, v.when_to_use, v.when_not_to_use
FROM (VALUES
  (
    'TIRO_6M_CONCEDIDO',
    '6m concedido',
    19,
    'Tiro de 6 metros concedido pela equipe defensora.',
    'Usar em DEF_POS quando a equipe comete falta que resulta em 6m adversário. '
    || 'O lance seguinte de cobrança é registrado com FINALIZACAO_6M_ADV.',
    'Não usar para a cobrança do 6m em si; ver ação básica FINALIZACAO_6M_ADV.'
  )
) AS v(code, label, sort_order, description, when_to_use, when_not_to_use)
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_RESULTADO_FACTUAL'
ON CONFLICT (list_id, code) DO UPDATE
  SET label           = excluded.label,
      sort_order      = excluded.sort_order,
      description     = excluded.description,
      when_to_use     = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use,
      active          = true;

-- ── 4. FINALIZACAO_6M_ADV em LISTA_ACAO_BASICA_ACAO_DEFENSIVA (0090A) ───────
-- Evento defensivo observado: adversária cobra 6m. Não é ação da equipe defensora.

INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active,
  description, when_to_use, when_not_to_use
)
SELECT
  l.id, v.code, v.label, v.sort_order,
  false, false, true,
  v.description, v.when_to_use, v.when_not_to_use
FROM (VALUES
  (
    'FINALIZACAO_6M_ADV',
    'Cobrança de 6m adversária',
    7,
    'Evento defensivo observado: adversária cobra tiro de 6 metros. '
    || 'Não representa ação executada pela equipe defensora.',
    'Usar em DEF_POS para registrar o lance de cobrança de 6m pelo adversário. '
    || 'Resultado: GOL, DEFENDIDO, FORA, TRAVE, VIOLACAO ou NAO_OBSERVADO.',
    'Não usar para registrar que o 6m foi concedido; ver TIRO_6M_CONCEDIDO.'
  )
) AS v(code, label, sort_order, description, when_to_use, when_not_to_use)
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_ACAO_BASICA_ACAO_DEFENSIVA'
ON CONFLICT (list_id, code) DO UPDATE
  SET label           = excluded.label,
      sort_order      = excluded.sort_order,
      description     = excluded.description,
      when_to_use     = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use,
      active          = true;

-- ── 5. BLOQ_NAO_EXECUTADO em LISTA_CLASSIF_BLOQUEIO (0090B) ─────────────────

INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, 'BLOQ_NAO_EXECUTADO', 'Bloqueio não executado', 4,
  false, false, true,
  'A defensora não saltou ou não tentou o bloqueio; '
  || 'finalização adversária acontece sem tentativa de bloqueio.'
FROM public.scout_code_lists l
WHERE l.list_key = 'LISTA_CLASSIF_BLOQUEIO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

-- ── 6. INTERCEPTACAO_MALSUCEDIDA em LISTA_CLASSIF_INTERC_ROUBO (0090B) ──────

INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, 'INTERCEPTACAO_MALSUCEDIDA', 'Interceptação malsucedida', 4,
  false, false, true,
  'Tentativa de interceptação que falha; a bola passa e adversária conclui a sequência.'
FROM public.scout_code_lists l
WHERE l.list_key = 'LISTA_CLASSIF_INTERC_ROUBO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

-- ── 7. Novas listas de classificação: COBERTURA e MARCACAO_PRESSAO (0090B) ──

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_CLASSIF_COBERTURA',        'Classificação – Cobertura',        'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_CLASSIF_MARCACAO_PRESSAO', 'Classificação – Marcação/pressão', 'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label          = excluded.label,
      contract_scope = excluded.contract_scope,
      active         = excluded.active,
      source_version = excluded.source_version;

WITH cob_seed(list_key, code, label, sort_order, description) AS (
  VALUES
    (
      'LISTA_CLASSIF_COBERTURA',
      'COBERTURA_PIVO',
      'Cobertura da pivô',
      1,
      'Cobertura específica sobre a jogadora pivô que recebeu bola aérea no corredor de 6m.'
    ),
    (
      'LISTA_CLASSIF_COBERTURA',
      'FECHAMENTO_CENTRAL',
      'Fechamento central',
      2,
      'Base e lateral fecham a entrada central impedindo acesso da especialista pelo corredor.'
    ),
    (
      'LISTA_CLASSIF_MARCACAO_PRESSAO',
      'TROCA_REFERENCIA',
      'Troca de referência',
      1,
      'Defensoras trocam de marcação sem abrir espaço; gestão de cobertura posicional em pressão.'
    )
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, false, true, s.description
FROM cob_seed s
JOIN public.scout_code_lists l ON l.list_key = s.list_key
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

-- Mapear classificacao_acao_code para COBERTURA e MARCACAO_PRESSAO
INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'COBERTURA',
   'LISTA_CLASSIF_COBERTURA', false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'MARCACAO_PRESSAO',
   'LISTA_CLASSIF_MARCACAO_PRESSAO', false, false, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 8. LISTA_ESTRUTURA_TRANSICAO (0090B) ────────────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_ESTRUTURA_TRANSICAO', 'Estrutura da transição', 'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label          = excluded.label,
      contract_scope = excluded.contract_scope,
      active         = excluded.active,
      source_version = excluded.source_version;

WITH et_seed(code, label, sort_order, description) AS (
  VALUES
    ('TRANS_DIRETA',       'Transição direta',         1,
     'Goleira ou defensora lança diretamente para atleta em posição de finalização.'),
    ('TRANS_INDIRETA_2X1', 'Transição indireta (2x1)', 2,
     'Transição com superioridade numérica de 2 atacantes contra 1 defensora.'),
    ('TRANS_INDIRETA_3X2', 'Transição indireta (3x2)', 3,
     'Transição com superioridade numérica de 3 atacantes contra 2 defensoras.'),
    ('TRANS_INDIRETA_4X3', 'Transição indireta (4x3)', 4,
     'Transição com superioridade numérica de 4 atacantes contra 3 defensoras.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, false, true, s.description
FROM et_seed s
CROSS JOIN public.scout_code_lists l
WHERE l.list_key = 'LISTA_ESTRUTURA_TRANSICAO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'estrutura_transicao_code', '*', '*',
   'LISTA_ESTRUTURA_TRANSICAO', false, false, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 9. LISTA_ACAO_PREPARATORIA (0090B) ───────────────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_ACAO_PREPARATORIA', 'Ação preparatória', 'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label          = excluded.label,
      contract_scope = excluded.contract_scope,
      active         = excluded.active,
      source_version = excluded.source_version;

WITH ap_seed(code, label, sort_order, description) AS (
  VALUES
    ('FINTA_PASSE',     'Finta de passe',     1,
     'Movimento de finta de passe executado antes do arremesso real.'),
    ('FINTA_ARREMESSO', 'Finta de arremesso', 2,
     'Movimento de finta de arremesso que desequilibra a defesa antes da finalização.'),
    ('FIXACAO',         'Fixação',            3,
     'Fixação de defensora antes de entrar para finalizar.'),
    ('ENTRADA_MEIO',    'Entrada pelo meio',  4,
     'Entrada pelo corredor central para criar vantagem de posição.'),
    ('QUEBRA_LINHA',    'Quebra de linha',    5,
     'Movimento que rompe a linha defensiva posicional.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, false, true, s.description
FROM ap_seed s
CROSS JOIN public.scout_code_lists l
WHERE l.list_key = 'LISTA_ACAO_PREPARATORIA'
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'acao_preparatoria_code', '*', '*',
   'LISTA_ACAO_PREPARATORIA', false, false, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 10. CREATE OR REPLACE create_scout_live_entry (CEPR-0090) ────────────────
-- Baseado na versão de migration 0028. Adições marcadas com [0031].

CREATE OR REPLACE FUNCTION public.create_scout_live_entry(input_entry jsonb)
RETURNS public.scout_live_entries
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_entry public.scout_live_entries%rowtype;
  v_created public.scout_live_entries%rowtype;
  v_game public.scout_games%rowtype;
  v_actor_id uuid;
  v_action_required boolean;
  v_finish_required boolean;
  v_trimmed_action text;
BEGIN
  v_actor_id := auth.uid();

  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  IF input_entry IS NULL OR jsonb_typeof(input_entry) <> 'object' THEN
    RAISE EXCEPTION 'invalid scout live entry payload';
  END IF;

  SELECT *
  INTO v_game
  FROM public.scout_games
  WHERE id = nullif(trim(coalesce(input_entry->>'scout_game_id', '')), '')::uuid;

  IF v_game.id IS NULL THEN
    RAISE EXCEPTION 'scout game not found';
  END IF;

  IF NOT public.has_team_role(v_game.team_id, array['owner', 'coach']) THEN
    RAISE EXCEPTION 'permission denied';
  END IF;

  v_entry.id := gen_random_uuid();
  v_entry.team_id := v_game.team_id;
  v_entry.scout_game_id := v_game.id;
  v_entry.id_jogada := nullif(btrim(coalesce(input_entry->>'id_jogada', '')), '');
  v_entry.tempo_jogo := nullif(btrim(coalesce(input_entry->>'tempo_jogo', '')), '');
  v_entry.fase_da_bola_code := nullif(btrim(coalesce(input_entry->>'fase_da_bola_code', '')), '');
  v_entry.equipe_analisada_id := nullif(btrim(coalesce(input_entry->>'equipe_analisada_id', '')), '')::uuid;
  v_entry.fase_equipe_analisada_code := nullif(btrim(coalesce(input_entry->>'fase_equipe_analisada_code', '')), '');
  v_entry.sistema_ofensivo_code := nullif(btrim(coalesce(input_entry->>'sistema_ofensivo_code', '')), '');
  v_entry.sistema_defensivo_code := nullif(btrim(coalesce(input_entry->>'sistema_defensivo_code', '')), '');
  v_entry.atleta_principal_id := nullif(btrim(coalesce(input_entry->>'atleta_principal_id', '')), '')::uuid;
  v_entry.acao_principal_text := nullif(btrim(coalesce(input_entry->>'acao_principal_text', '')), '');
  v_entry.acao_principal_suggestion_code := nullif(btrim(coalesce(input_entry->>'acao_principal_suggestion_code', '')), '');
  v_entry.tipo_finalizacao_code := nullif(btrim(coalesce(input_entry->>'tipo_finalizacao_code', '')), '');
  v_entry.resultado_factual_code := nullif(btrim(coalesce(input_entry->>'resultado_factual_code', '')), '');
  v_entry.motivo_pontuacao_code := nullif(btrim(coalesce(input_entry->>'motivo_pontuacao_code', '')), '');
  v_entry.pontos_jogada := nullif(btrim(coalesce(input_entry->>'pontos_jogada', '')), '')::smallint;
  v_entry.causa_provavel_code := nullif(btrim(coalesce(input_entry->>'causa_provavel_code', '')), '');
  v_entry.prioridade_treino_code := nullif(btrim(coalesce(input_entry->>'prioridade_treino_code', '')), '');
  v_entry.video_ref := nullif(btrim(coalesce(input_entry->>'video_ref', '')), '');
  v_entry.status_validacao_code := coalesce(nullif(btrim(coalesce(input_entry->>'status_validacao_code', '')), ''), 'PENDENTE');
  v_entry.obs_geral := nullif(btrim(coalesce(input_entry->>'obs_geral', '')), '');
  v_entry.created_by := v_actor_id;
  v_entry.updated_by := v_actor_id;
  -- [0025] Leitura do campo categoria_acao_code (nullable)
  v_entry.categoria_acao_code := nullif(btrim(coalesce(input_entry->>'categoria_acao_code', '')), '');
  -- [0026] Leitura dos novos campos da matriz semântica (nullable)
  v_entry.acao_basica_code := nullif(btrim(coalesce(input_entry->>'acao_basica_code', '')), '');
  v_entry.classificacao_acao_code := nullif(btrim(coalesce(input_entry->>'classificacao_acao_code', '')), '');
  -- [0031] Leitura dos novos campos de transição e ação preparatória (nullable)
  v_entry.estrutura_transicao_code := nullif(btrim(coalesce(input_entry->>'estrutura_transicao_code', '')), '');
  v_entry.acao_preparatoria_code := nullif(btrim(coalesce(input_entry->>'acao_preparatoria_code', '')), '');

  IF v_entry.id_jogada IS NULL
     OR v_entry.tempo_jogo IS NULL
     OR v_entry.fase_da_bola_code IS NULL
     OR v_entry.equipe_analisada_id IS NULL
     OR v_entry.fase_equipe_analisada_code IS NULL
     OR v_entry.resultado_factual_code IS NULL THEN
    RAISE EXCEPTION 'missing required scout live entry fields';
  END IF;

  IF v_entry.status_validacao_code <> 'PENDENTE' THEN
    RAISE EXCEPTION 'status_validacao_code must be PENDENTE on create';
  END IF;

  IF v_entry.equipe_analisada_id <> v_game.team_id THEN
    RAISE EXCEPTION 'equipe_analisada_id incompatible with scout game';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.scout_live_entries sle
    WHERE sle.team_id = v_game.team_id
      AND sle.scout_game_id = v_game.id
      AND sle.id_jogada = v_entry.id_jogada
  ) THEN
    RAISE EXCEPTION 'duplicate id_jogada for scout game';
  END IF;

  IF NOT public.scout_field_value_allowed('scout_live_entries', 'fase_da_bola_code', v_entry.fase_da_bola_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: fase_da_bola_code';
  END IF;

  IF NOT public.scout_field_value_allowed('scout_live_entries', 'fase_equipe_analisada_code', v_entry.fase_equipe_analisada_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: fase_equipe_analisada_code';
  END IF;

  IF NOT public.scout_field_value_allowed('scout_live_entries', 'resultado_factual_code', v_entry.resultado_factual_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: resultado_factual_code';
  END IF;

  IF v_entry.sistema_ofensivo_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'sistema_ofensivo_code', v_entry.sistema_ofensivo_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: sistema_ofensivo_code';
  END IF;

  IF v_entry.sistema_defensivo_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'sistema_defensivo_code', v_entry.sistema_defensivo_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: sistema_defensivo_code';
  END IF;

  IF v_entry.tipo_finalizacao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'tipo_finalizacao_code', v_entry.tipo_finalizacao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: tipo_finalizacao_code';
  END IF;

  IF v_entry.motivo_pontuacao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'motivo_pontuacao_code', v_entry.motivo_pontuacao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: motivo_pontuacao_code';
  END IF;

  IF v_entry.causa_provavel_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'causa_provavel_code', v_entry.causa_provavel_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: causa_provavel_code';
  END IF;

  IF v_entry.prioridade_treino_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'prioridade_treino_code', v_entry.prioridade_treino_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: prioridade_treino_code';
  END IF;

  IF NOT public.scout_field_value_allowed('scout_live_entries', 'status_validacao_code', v_entry.status_validacao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: status_validacao_code';
  END IF;

  -- [0025] Validação de categoria_acao_code (opcional)
  IF v_entry.categoria_acao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'categoria_acao_code', v_entry.categoria_acao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: categoria_acao_code';
  END IF;

  -- [0026] Validação de acao_basica_code (opcional, com selector categoria_acao_code)
  IF v_entry.acao_basica_code IS NOT NULL AND v_entry.categoria_acao_code IS NOT NULL THEN
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'acao_basica_code', v_entry.acao_basica_code,
      'categoria_acao_code', v_entry.categoria_acao_code
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: acao_basica_code';
    END IF;
  END IF;

  -- [0026] Validação de classificacao_acao_code (opcional, com selector acao_basica_code)
  IF v_entry.classificacao_acao_code IS NOT NULL AND v_entry.acao_basica_code IS NOT NULL THEN
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'classificacao_acao_code', v_entry.classificacao_acao_code,
      'acao_basica_code', v_entry.acao_basica_code
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: classificacao_acao_code';
    END IF;
  END IF;

  -- [0031] Validação de estrutura_transicao_code (opcional)
  IF v_entry.estrutura_transicao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'estrutura_transicao_code', v_entry.estrutura_transicao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: estrutura_transicao_code';
  END IF;

  -- [0031] Validação de acao_preparatoria_code (opcional)
  IF v_entry.acao_preparatoria_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'acao_preparatoria_code', v_entry.acao_preparatoria_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: acao_preparatoria_code';
  END IF;

  IF v_entry.fase_da_bola_code = 'AT_POS' AND v_entry.sistema_ofensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_ofensivo_code required for AT_POS';
  END IF;

  IF v_entry.fase_da_bola_code = 'DEF_POS' AND v_entry.sistema_defensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_defensivo_code required for DEF_POS';
  END IF;

  -- [0027] Auto-derivação de tipo_finalizacao_code a partir de classificacao_acao_code.
  IF v_entry.categoria_acao_code = 'ARREMESSO'
     AND v_entry.acao_basica_code = 'ARREMESSO'
     AND v_entry.classificacao_acao_code IS NOT NULL
     AND v_entry.tipo_finalizacao_code IS NULL THEN
    v_entry.tipo_finalizacao_code := CASE v_entry.classificacao_acao_code
      WHEN 'GIRO'           THEN 'GIRO'
      WHEN 'AEREA'          THEN 'AEREA'
      WHEN 'AEREA_TRANS'    THEN 'AEREA'
      WHEN 'ARREM_SIMPLES'  THEN 'SIMPLES'
      WHEN 'FINALIZ_CONTRA' THEN 'SIMPLES'
      WHEN 'FINALIZ_TRANS'  THEN 'SIMPLES'
      ELSE NULL
    END;
  END IF;

  -- [0031] Auto-derivação de tipo_finalizacao_code para FINALIZACAO_6M_ADV.
  IF v_entry.acao_basica_code = 'FINALIZACAO_6M_ADV'
     AND v_entry.tipo_finalizacao_code IS NULL THEN
    v_entry.tipo_finalizacao_code := '6M';
  END IF;

  -- [0027] Validação de contexto AT_POS/TRANS_OF para classificacao_acao_code de arremessos.
  IF v_entry.acao_basica_code = 'ARREMESSO'
     AND v_entry.classificacao_acao_code IS NOT NULL THEN
    IF v_entry.classificacao_acao_code = 'FINALIZ_CONTRA'
       AND v_entry.fase_da_bola_code = 'AT_POS' THEN
      RAISE EXCEPTION 'INVALID_CONTEXT: FINALIZ_CONTRA not allowed in AT_POS';
    END IF;
    IF v_entry.fase_da_bola_code = 'AT_POS'
       AND v_entry.classificacao_acao_code NOT IN ('GIRO', 'AEREA', 'ARREM_SIMPLES') THEN
      RAISE EXCEPTION 'INVALID_CONTEXT: classificacao_acao_code % not allowed in AT_POS for ARREMESSO', v_entry.classificacao_acao_code;
    END IF;
  END IF;

  v_finish_required := v_entry.resultado_factual_code IN ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE');
  IF v_finish_required AND v_entry.tipo_finalizacao_code IS NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code required for finalization result';
  END IF;
  IF NOT v_finish_required AND v_entry.tipo_finalizacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code not allowed without finalization result';
  END IF;

  -- [0028-c] motivo_pontuacao_code: obrigatório para GOL somente em fases ofensivas.
  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND v_entry.motivo_pontuacao_code IS NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code required for GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND v_entry.motivo_pontuacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code only allowed for GOL';
  END IF;

  -- [0028-c] pontos_jogada: obrigatório (1 ou 2) somente para GOL em fases ofensivas.
  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND (v_entry.pontos_jogada IS NULL OR v_entry.pontos_jogada NOT IN (1, 2)) THEN
    RAISE EXCEPTION 'pontos_jogada must be 1 or 2 when resultado_factual_code is GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND coalesce(v_entry.pontos_jogada, 0) <> 0 THEN
    RAISE EXCEPTION 'pontos_jogada must be 0 or null when resultado_factual_code is not GOL';
  END IF;

  -- Validações de compatibilidade motivo ↔ pontos (somente fases ofensivas com GOL).
  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND v_entry.motivo_pontuacao_code IS NOT NULL THEN
    IF v_entry.motivo_pontuacao_code = 'SIMPLES' AND v_entry.pontos_jogada <> 1 THEN
      RAISE EXCEPTION 'pontos_jogada does not match motivo_pontuacao_code';
    END IF;

    -- [0028-b] GIRO e AEREA: permitem 1 ou 2 pontos (execução não-validada para 2).
    IF v_entry.motivo_pontuacao_code IN ('6M', 'GOLEIRA', 'ESPECIALISTA')
       AND v_entry.pontos_jogada <> 2 THEN
      RAISE EXCEPTION 'pontos_jogada does not match motivo_pontuacao_code';
    END IF;

    IF v_entry.tipo_finalizacao_code = 'GIRO' AND v_entry.motivo_pontuacao_code <> 'GIRO' THEN
      RAISE EXCEPTION 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    END IF;
    IF v_entry.tipo_finalizacao_code = 'AEREA' AND v_entry.motivo_pontuacao_code <> 'AEREA' THEN
      RAISE EXCEPTION 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    END IF;
    IF v_entry.tipo_finalizacao_code = '6M' AND v_entry.motivo_pontuacao_code <> '6M' THEN
      RAISE EXCEPTION 'motivo_pontuacao_code incompatible with tipo_finalizacao_code';
    END IF;
  END IF;

  IF v_entry.atleta_principal_id IS NOT NULL AND NOT EXISTS (
    SELECT 1
    FROM public.athletes a
    WHERE a.id = v_entry.atleta_principal_id
      AND a.team_id = v_game.team_id
      AND a.deleted_at IS NULL
      AND a.status = 'ativo'
  ) THEN
    RAISE EXCEPTION 'ATHLETE_OUT_OF_SCOPE: atleta_principal_id';
  END IF;

  IF v_entry.acao_principal_suggestion_code IS NOT NULL THEN
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries',
      'acao_principal_suggestion_code',
      v_entry.acao_principal_suggestion_code,
      'fase_da_bola_code',
      v_entry.fase_da_bola_code
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: acao_principal_suggestion_code';
    END IF;

    v_entry.acao_principal_text := v_entry.acao_principal_suggestion_code;
    v_entry.acao_principal_is_custom := false;
  ELSIF v_entry.acao_principal_text IS NOT NULL THEN
    v_trimmed_action := upper(v_entry.acao_principal_text);

    IF char_length(v_trimmed_action) > 40 THEN
      RAISE EXCEPTION 'acao_principal_text too long';
    END IF;

    IF v_trimmed_action !~ '^[A-Z0-9_]+$' THEN
      RAISE EXCEPTION 'acao_principal_text has invalid format';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM public.scout_code_values v
      JOIN public.scout_code_lists l ON l.id = v.list_id
      WHERE l.list_key IN ('LISTA_RESULTADO_FACTUAL', 'LISTA_CAUSA_PRINCIPAL', 'LISTA_PRIORIDADE_TREINO', 'LISTA_MOTIVO_PONTUACAO')
        AND v.code = v_trimmed_action
        AND v.active = true
        AND l.active = true
    ) THEN
      RAISE EXCEPTION 'acao_principal_text collides with non-action codebook';
    END IF;

    IF v_trimmed_action ~ '(^|_)(GOL|DEFENDIDO|BLOQUEADO|PERDA|VIOLACAO|RECUPERACAO|PRIORIDADE|FEEDBACK|PORQUE|TREIN[A-Z0-9]*|CANSOU|CANSADA|ATRASAD[AO]|ERROU|OBS)($|_)' THEN
      RAISE EXCEPTION 'acao_principal_text mixes diagnosis or result';
    END IF;

    v_entry.acao_principal_text := v_trimmed_action;
    v_entry.acao_principal_is_custom := true;
  ELSE
    v_entry.acao_principal_is_custom := null;
  END IF;

  -- [0026] Auto-bridge: usa acao_basica_code como acao_principal_text quando nenhuma
  -- acao_principal foi enviada pela UI.
  IF v_entry.acao_principal_text IS NULL AND v_entry.acao_basica_code IS NOT NULL THEN
    v_entry.acao_principal_text := v_entry.acao_basica_code;
    v_entry.acao_principal_is_custom := false;
  END IF;

  v_action_required := (
    (v_entry.fase_da_bola_code IN ('AT_POS', 'DEF_POS', 'TRANS_OF', 'TRANS_DEF'))
    AND v_entry.resultado_factual_code <> 'NAO_OBSERVADO'
  );

  IF v_action_required AND v_entry.acao_principal_text IS NULL THEN
    RAISE EXCEPTION 'acao_principal_text required for observed sequence';
  END IF;

  INSERT INTO public.scout_live_entries (
    id,
    team_id,
    scout_game_id,
    id_jogada,
    tempo_jogo,
    fase_da_bola_code,
    equipe_analisada_id,
    fase_equipe_analisada_code,
    sistema_ofensivo_code,
    sistema_defensivo_code,
    atleta_principal_id,
    acao_principal_text,
    acao_principal_suggestion_code,
    acao_principal_is_custom,
    tipo_finalizacao_code,
    resultado_factual_code,
    motivo_pontuacao_code,
    pontos_jogada,
    causa_provavel_code,
    prioridade_treino_code,
    video_ref,
    status_validacao_code,
    obs_geral,
    categoria_acao_code,
    acao_basica_code,
    classificacao_acao_code,
    estrutura_transicao_code,
    acao_preparatoria_code,
    created_by,
    updated_by
  ) VALUES (
    v_entry.id,
    v_entry.team_id,
    v_entry.scout_game_id,
    v_entry.id_jogada,
    v_entry.tempo_jogo,
    v_entry.fase_da_bola_code,
    v_entry.equipe_analisada_id,
    v_entry.fase_equipe_analisada_code,
    v_entry.sistema_ofensivo_code,
    v_entry.sistema_defensivo_code,
    v_entry.atleta_principal_id,
    v_entry.acao_principal_text,
    v_entry.acao_principal_suggestion_code,
    v_entry.acao_principal_is_custom,
    v_entry.tipo_finalizacao_code,
    v_entry.resultado_factual_code,
    v_entry.motivo_pontuacao_code,
    v_entry.pontos_jogada,
    v_entry.causa_provavel_code,
    v_entry.prioridade_treino_code,
    v_entry.video_ref,
    'PENDENTE',
    v_entry.obs_geral,
    v_entry.categoria_acao_code,
    v_entry.acao_basica_code,
    v_entry.classificacao_acao_code,
    v_entry.estrutura_transicao_code,
    v_entry.acao_preparatoria_code,
    v_entry.created_by,
    v_entry.updated_by
  )
  RETURNING * INTO v_created;

  PERFORM public.write_audit_log(
    v_created.team_id,
    v_actor_id,
    'coach',
    'scout_live_entries',
    v_created.id,
    'create_scout_live_entry',
    jsonb_build_object(
      'scout_game_id',           v_created.scout_game_id,
      'id_jogada',               v_created.id_jogada,
      'fase_da_bola_code',       v_created.fase_da_bola_code,
      'acao_basica_code',        v_created.acao_basica_code,
      'classificacao_acao_code', v_created.classificacao_acao_code,
      'acao_principal_is_custom',v_created.acao_principal_is_custom,
      'resultado_factual_code',  v_created.resultado_factual_code,
      'estrutura_transicao_code',v_created.estrutura_transicao_code,
      'acao_preparatoria_code',  v_created.acao_preparatoria_code
    )
  );

  RETURN v_created;
END;
$$;

REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM public;
REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_scout_live_entry(jsonb) TO authenticated;
