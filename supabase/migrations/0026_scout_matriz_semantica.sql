-- CEPR-0085: Matriz semântica mínima da ação
-- Adiciona acao_basica_code e classificacao_acao_code em scout_live_entries,
-- inclui TROCA_TRANSICAO em LISTA_CATEGORIA_ACAO,
-- cria codebooks LISTA_ACAO_BASICA_* e LISTA_CLASSIF_*,
-- atualiza create_scout_live_entry com auto-bridge e validação dos novos campos.

-- ── 1. Atualizar CHECK de categoria_acao_code para incluir TROCA_TRANSICAO ───

ALTER TABLE public.scout_live_entries
  DROP CONSTRAINT IF EXISTS scout_live_entries_categoria_acao_code_check;

ALTER TABLE public.scout_live_entries
  ADD CONSTRAINT scout_live_entries_categoria_acao_code_check
  CHECK (
    categoria_acao_code IS NULL
    OR categoria_acao_code IN ('PASSE', 'ARREMESSO', 'ACAO_DEFENSIVA', 'NAO_OBSERVADO', 'TROCA_TRANSICAO')
  );

-- ── 2. Adicionar colunas novas (nullable) ────────────────────────────────────

ALTER TABLE public.scout_live_entries
  ADD COLUMN IF NOT EXISTS acao_basica_code TEXT,
  ADD COLUMN IF NOT EXISTS classificacao_acao_code TEXT;

-- ── 3. Adicionar TROCA_TRANSICAO em LISTA_CATEGORIA_ACAO ─────────────────────

INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id,
  'TROCA_TRANSICAO',
  'Troca/Transição',
  5,
  false,
  false,
  true,
  'Sequência encerrada por ação de troca ou transição (mudança de posse, saída rápida, estabilização).'
FROM public.scout_code_lists l
WHERE l.list_key = 'LISTA_CATEGORIA_ACAO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label           = excluded.label,
      sort_order      = excluded.sort_order,
      is_nao_observado = excluded.is_nao_observado,
      description     = excluded.description,
      active          = excluded.active;

-- ── 4. Codebooks de ação básica por categoria ─────────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_ACAO_BASICA_PASSE',             'Ação básica – Passe',              'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_ACAO_BASICA_ARREMESSO',         'Ação básica – Arremesso',          'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',    'Ação básica – Ação defensiva',     'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_ACAO_BASICA_TROCA_TRANSICAO',   'Ação básica – Troca/Transição',    'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label           = excluded.label,
      contract_scope  = excluded.contract_scope,
      active          = excluded.active,
      source_version  = excluded.source_version;

WITH ab_seed(list_key, code, label, sort_order, description) AS (
  VALUES
    -- PASSE
    ('LISTA_ACAO_BASICA_PASSE',           'PASSE',              'Passe',               1, 'Sequência encerrada por passe (não gerou arremesso ao gol).'),
    -- ARREMESSO
    ('LISTA_ACAO_BASICA_ARREMESSO',       'ARREMESSO',          'Arremesso',           1, 'Sequência encerrada por arremesso ao gol (qualquer resultado).'),
    -- ACAO_DEFENSIVA
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'BLOQUEIO',           'Bloqueio',            1, 'Ação de bloqueio sobre o arremesso adversário.'),
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'INTERCEPTACAO',      'Interceptação',       2, 'Interceptação de passe adversário.'),
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'ROUBO',              'Roubo de bola',       3, 'Recuperação ativa da posse por disputa direta.'),
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'COBERTURA',          'Cobertura',           4, 'Ação de cobertura/contenção ao adversário com bola.'),
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'MARCACAO_PRESSAO',   'Marcação/pressão',    5, 'Marcação intensa ou pressão sobre o portador da bola.'),
    ('LISTA_ACAO_BASICA_ACAO_DEFENSIVA',  'RECOMPOSICAO',       'Recomposição',        6, 'Retorno defensivo e reorganização posicional.'),
    -- TROCA_TRANSICAO
    ('LISTA_ACAO_BASICA_TROCA_TRANSICAO', 'ENTRADA_OFENSIVA',   'Entrada ofensiva',    1, 'Entrada no ataque posicionado após recuperação ou transição.'),
    ('LISTA_ACAO_BASICA_TROCA_TRANSICAO', 'TROCA_OFENSIVA',     'Troca ofensiva',      2, 'Substituição funcional com vantagem ofensiva.'),
    ('LISTA_ACAO_BASICA_TROCA_TRANSICAO', 'TROCA_DEFENSIVA',    'Troca defensiva',     3, 'Substituição funcional com vantagem defensiva.'),
    ('LISTA_ACAO_BASICA_TROCA_TRANSICAO', 'ESTABILIZACAO',      'Estabilização',       4, 'Estabilização da fase após transição.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, false, true, s.description
FROM ab_seed s
JOIN public.scout_code_lists l ON l.list_key = s.list_key
ON CONFLICT (list_id, code) DO UPDATE
  SET label       = excluded.label,
      sort_order  = excluded.sort_order,
      description = excluded.description,
      active      = excluded.active;

-- ── 5. Mapear acao_basica_code no field_codebook_map ─────────────────────────

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'acao_basica_code', 'categoria_acao_code', 'PASSE',           'LISTA_ACAO_BASICA_PASSE',           false, false, true),
  ('scout_live_entries', 'acao_basica_code', 'categoria_acao_code', 'ARREMESSO',        'LISTA_ACAO_BASICA_ARREMESSO',        false, false, true),
  ('scout_live_entries', 'acao_basica_code', 'categoria_acao_code', 'ACAO_DEFENSIVA',   'LISTA_ACAO_BASICA_ACAO_DEFENSIVA',   false, false, true),
  ('scout_live_entries', 'acao_basica_code', 'categoria_acao_code', 'TROCA_TRANSICAO',  'LISTA_ACAO_BASICA_TROCA_TRANSICAO',  false, false, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 6. Codebooks de classificação por ação básica ─────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_CLASSIF_PASSE',           'Classificação – Passe',                'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_CLASSIF_ARREMESSO',       'Classificação – Arremesso',            'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_CLASSIF_BLOQUEIO',        'Classificação – Bloqueio',             'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_CLASSIF_INTERC_ROUBO',    'Classificação – Interceptação/Roubo',  'scout_live_entries', true, 'manual-v1.0.1'),
  ('LISTA_CLASSIF_TROCA_TRANSICAO', 'Classificação – Troca/Transição',      'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label           = excluded.label,
      contract_scope  = excluded.contract_scope,
      active          = excluded.active,
      source_version  = excluded.source_version;

WITH cl_seed(list_key, code, label, sort_order, description) AS (
  VALUES
    -- PASSE
    ('LISTA_CLASSIF_PASSE', 'PASSE_APOIADO',     'Passe apoiado',           1, 'Passe em contato com o solo, sem suspensão.'),
    ('LISTA_CLASSIF_PASSE', 'PASSE_SUSPENSO',    'Passe em suspensão',      2, 'Passe executado com a jogadora no ar.'),
    ('LISTA_CLASSIF_PASSE', 'PASSE_PARA_GIRO',   'Passe para giro',         3, 'Passe que viabiliza finalização em giro.'),
    ('LISTA_CLASSIF_PASSE', 'PASSE_PARA_AEREA',  'Passe para aérea',        4, 'Passe que viabiliza finalização aérea.'),
    ('LISTA_CLASSIF_PASSE', 'PASSE_LONGO',       'Passe longo',             5, 'Passe de longa distância, normalmente de transição.'),
    ('LISTA_CLASSIF_PASSE', 'PASSE_SEGURANCA',   'Passe de segurança',      6, 'Passe de recuo ou de manutenção de posse.'),
    -- ARREMESSO
    ('LISTA_CLASSIF_ARREMESSO', 'GIRO',              'Giro',                        1, 'Finalização em giro (2 pontos).'),
    ('LISTA_CLASSIF_ARREMESSO', 'AEREA',             'Aérea',                       2, 'Finalização no ar / in-flight.'),
    ('LISTA_CLASSIF_ARREMESSO', 'ARREM_SIMPLES',     'Arremesso simples',            3, 'Finalização comum de 1 ponto.'),
    ('LISTA_CLASSIF_ARREMESSO', 'ESPECIALISTA',      'Especialista',                4, 'Finalização por especialista de entrada.'),
    ('LISTA_CLASSIF_ARREMESSO', 'GOLEIRA',           'Goleira',                     5, 'Finalização executada pela goleira.'),
    ('LISTA_CLASSIF_ARREMESSO', '6M',                '6 metros',                    6, 'Finalização de 6 metros.'),
    ('LISTA_CLASSIF_ARREMESSO', 'SHOOTOUT',          'Shootout',                    7, 'Arremesso em situação de shootout.'),
    ('LISTA_CLASSIF_ARREMESSO', 'FINALIZ_CONTRA',    'Finalização em contra-ataque', 8, 'Finalização após contra-ataque ou transição ofensiva rápida.'),
    ('LISTA_CLASSIF_ARREMESSO', 'GOL_CONTRA',        'Gol contra',                  9, 'Gol marcado contra a própria equipe defensora.'),
    -- BLOQUEIO
    ('LISTA_CLASSIF_BLOQUEIO', 'BLOQ_GIRO',         'Bloqueio de giro',            1, 'Bloqueio sobre arremesso em giro.'),
    ('LISTA_CLASSIF_BLOQUEIO', 'BLOQ_ARREM_SIMPLES','Bloqueio de arremesso simples',2, 'Bloqueio sobre arremesso simples.'),
    ('LISTA_CLASSIF_BLOQUEIO', 'BLOQ_AEREA',        'Bloqueio de aérea',           3, 'Bloqueio sobre finalização aérea.'),
    -- INTERCEPTACAO / ROUBO (lista compartilhada)
    ('LISTA_CLASSIF_INTERC_ROUBO', 'INTERCEPTACAO',       'Interceptação',           1, 'Interceptação direta de passe adversário.'),
    ('LISTA_CLASSIF_INTERC_ROUBO', 'ROUBO_BOLA',          'Roubo de bola',           2, 'Recuperação ativa por disputa corpo a corpo.'),
    ('LISTA_CLASSIF_INTERC_ROUBO', 'CORTE_LINHA_PASSE',   'Corte de linha de passe', 3, 'Corte posicional da linha de passe adversária.'),
    -- TROCA_TRANSICAO
    ('LISTA_CLASSIF_TROCA_TRANSICAO', 'ENTRADA_AT_POS',       'Entrada no ataque posicionado', 1, 'Transição bem-sucedida que resulta em ataque posicionado.'),
    ('LISTA_CLASSIF_TROCA_TRANSICAO', 'TRANS_NEUTRALIZADA',   'Transição neutralizada',        2, 'Transição ofensiva adversária contida com sucesso.'),
    ('LISTA_CLASSIF_TROCA_TRANSICAO', 'DEF_ESTABILIZADA_TR',  'Defesa estabilizada',           3, 'Defesa reorganizada e estabilizada após transição.'),
    ('LISTA_CLASSIF_TROCA_TRANSICAO', 'ERRO_TROCA_TRANS',     'Erro de troca',                 4, 'Falha na execução da troca ou substituição funcional.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, false, true, s.description
FROM cl_seed s
JOIN public.scout_code_lists l ON l.list_key = s.list_key
ON CONFLICT (list_id, code) DO UPDATE
  SET label       = excluded.label,
      sort_order  = excluded.sort_order,
      description = excluded.description,
      active      = excluded.active;

-- ── 7. Mapear classificacao_acao_code no field_codebook_map ──────────────────

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'PASSE',         'LISTA_CLASSIF_PASSE',           false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'ARREMESSO',     'LISTA_CLASSIF_ARREMESSO',       false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'BLOQUEIO',      'LISTA_CLASSIF_BLOQUEIO',        false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'INTERCEPTACAO', 'LISTA_CLASSIF_INTERC_ROUBO',    false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'ROUBO',         'LISTA_CLASSIF_INTERC_ROUBO',    false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'ENTRADA_OFENSIVA',  'LISTA_CLASSIF_TROCA_TRANSICAO', false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'TROCA_OFENSIVA',    'LISTA_CLASSIF_TROCA_TRANSICAO', false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'TROCA_DEFENSIVA',   'LISTA_CLASSIF_TROCA_TRANSICAO', false, false, true),
  ('scout_live_entries', 'classificacao_acao_code', 'acao_basica_code', 'ESTABILIZACAO',     'LISTA_CLASSIF_TROCA_TRANSICAO', false, false, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 8. CREATE OR REPLACE create_scout_live_entry com suporte à matriz ────────
-- Corpo baseado na versão de migration 0025, com adições sinalizadas com "[0026]".
-- Nenhuma validação existente foi alterada ou removida.

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

  IF v_entry.fase_da_bola_code = 'AT_POS' AND v_entry.sistema_ofensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_ofensivo_code required for AT_POS';
  END IF;

  IF v_entry.fase_da_bola_code = 'DEF_POS' AND v_entry.sistema_defensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_defensivo_code required for DEF_POS';
  END IF;

  v_finish_required := v_entry.resultado_factual_code IN ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE');
  IF v_finish_required AND v_entry.tipo_finalizacao_code IS NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code required for finalization result';
  END IF;
  IF NOT v_finish_required AND v_entry.tipo_finalizacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code not allowed without finalization result';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL' AND v_entry.motivo_pontuacao_code IS NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code required for GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND v_entry.motivo_pontuacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code only allowed for GOL';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL' AND (v_entry.pontos_jogada IS NULL OR v_entry.pontos_jogada NOT IN (1, 2)) THEN
    RAISE EXCEPTION 'pontos_jogada must be 1 or 2 when resultado_factual_code is GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND coalesce(v_entry.pontos_jogada, 0) <> 0 THEN
    RAISE EXCEPTION 'pontos_jogada must be 0 or null when resultado_factual_code is not GOL';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL' THEN
    IF v_entry.motivo_pontuacao_code = 'SIMPLES' AND v_entry.pontos_jogada <> 1 THEN
      RAISE EXCEPTION 'pontos_jogada does not match motivo_pontuacao_code';
    END IF;

    IF v_entry.motivo_pontuacao_code IN ('GIRO', 'AEREA', '6M', 'GOLEIRA', 'ESPECIALISTA')
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

  -- [0026] Auto-bridge: se acao_basica_code foi enviado mas acao_principal_text
  -- ainda está NULL (nenhuma acao_principal enviada pela UI), usa o código da
  -- ação básica como acao_principal_text para satisfazer o check de campo required
  -- abaixo. Semanticamente correto: acao_basica é oriunda de codebook (is_custom=false).
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

  -- [0026] INSERT atualizado para incluir acao_basica_code e classificacao_acao_code
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
      'scout_game_id', v_created.scout_game_id,
      'id_jogada', v_created.id_jogada,
      'fase_da_bola_code', v_created.fase_da_bola_code,
      'acao_principal_is_custom', v_created.acao_principal_is_custom,
      'motivo_pontuacao_code', v_created.motivo_pontuacao_code,
      'categoria_acao_code', v_created.categoria_acao_code,
      'acao_basica_code', v_created.acao_basica_code,
      'classificacao_acao_code', v_created.classificacao_acao_code
    )
  );

  RETURN v_created;
END;
$$;

REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM public;
REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_scout_live_entry(jsonb) TO authenticated;
