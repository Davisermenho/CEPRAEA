-- CEPR-0095: TRANS_OF — contexto decisional e arremesso forçado sob passivo.
--
-- Gaps identificados no PILOTO-01:
--   1. TRANS_INDIRETA_3X3 — estrutura real observada mas ausente na lista.
--   2. contexto_decisao_code — porquê a jogadora arremessou (passivo, chance clara, etc.).
--   3. contexto_arremesso_code — qualidade técnica do arremesso (giro de longe, forçado, etc.).
--
-- Ambos os campos são opcionais no banco e na UI (não bloqueiam o submit).
-- Aparecem apenas em TRANS_OF + ARREMESSO.

-- ── 1. TRANS_INDIRETA_3X3 em LISTA_ESTRUTURA_TRANSICAO ──────────────────────

WITH list AS (
  SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_ESTRUTURA_TRANSICAO'
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, 'TRANS_INDIRETA_3X3', 'Transição indireta (3x3)', 5,
  false, false, true,
  'Transição sem superioridade numérica: 3 atacantes contra 3 defensoras.'
FROM list l
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = true;

-- ── 2. Novas colunas na tabela ───────────────────────────────────────────────

ALTER TABLE public.scout_live_entries
  ADD COLUMN IF NOT EXISTS contexto_decisao_code  text,
  ADD COLUMN IF NOT EXISTS contexto_arremesso_code text;

-- ── 3. LISTA_CONTEXTO_DECISAO ────────────────────────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_CONTEXTO_DECISAO', 'Contexto decisional', 'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label          = excluded.label,
      contract_scope = excluded.contract_scope,
      active         = excluded.active,
      source_version = excluded.source_version;

WITH cd_seed(code, label, sort_order, description) AS (
  VALUES
    ('CHANCE_CLARA_RECUSADA',  'Chance clara recusada',     1,
     'Havia oportunidade de arremesso em posição favorável mas a jogadora optou por não arremessar. Relevante para análise de tomada de decisão.'),
    ('RETORNO_BOLA',           'Retorno de bola',           2,
     'A bola retornou após bloqueio ou defesa adversária e a jogadora aproveitou a segunda chance.'),
    ('PASSIVO_SINALIZADO',     'Passivo sinalizado',        3,
     'A equipe estava sob sinal de passivo e arremessou por obrigação de finalizar dentro do prazo regulamentar.'),
    ('ARREMESSO_OBRIGATORIO',  'Arremesso obrigatório',     4,
     'Arremesso tomado sem condição ideal por pressão de marcação, erros de construção ou últimos segundos de posse.'),
    ('NAO_OBSERVADO',          'Não observado',             5,
     'Contexto decisional não foi possível observar ou registrar durante a coleta.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, (s.code = 'NAO_OBSERVADO'), true, s.description
FROM cd_seed s
CROSS JOIN public.scout_code_lists l
WHERE l.list_key = 'LISTA_CONTEXTO_DECISAO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label        = excluded.label,
      sort_order   = excluded.sort_order,
      active       = true,
      description  = excluded.description;

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'contexto_decisao_code', 'categoria_acao_code', 'ARREMESSO',
   'LISTA_CONTEXTO_DECISAO', false, true, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 4. LISTA_CONTEXTO_ARREMESSO ──────────────────────────────────────────────

INSERT INTO public.scout_code_lists (
  list_key, label, contract_scope, active, source_version
)
VALUES
  ('LISTA_CONTEXTO_ARREMESSO', 'Contexto do arremesso', 'scout_live_entries', true, 'manual-v1.0.1')
ON CONFLICT (list_key) DO UPDATE
  SET label          = excluded.label,
      contract_scope = excluded.contract_scope,
      active         = excluded.active,
      source_version = excluded.source_version;

WITH ca_seed(code, label, sort_order, description) AS (
  VALUES
    ('ARREMESSO_FORCADO',  'Arremesso forçado',  1,
     'A jogadora arremessou sem condições técnicas ideais, pressionada pela marcação ou pela situação de jogo.'),
    ('GIRO_DE_LONGE',     'Giro de longe',       2,
     'Tentativa de giro executada além da distância habitual — geralmente 9m ou mais — reduzindo a eficácia técnica do movimento.'),
    ('SOB_PASSIVO',       'Sob passivo',         3,
     'Arremesso realizado com a equipe sob sinal de passivo ativo; independe de haver chance clara.'),
    ('NAO_OBSERVADO',     'Não observado',       4,
     'Contexto do arremesso não foi possível observar ou registrar durante a coleta.')
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order,
  is_nao_aplica, is_nao_observado, active, description
)
SELECT
  l.id, s.code, s.label, s.sort_order,
  false, (s.code = 'NAO_OBSERVADO'), true, s.description
FROM ca_seed s
CROSS JOIN public.scout_code_lists l
WHERE l.list_key = 'LISTA_CONTEXTO_ARREMESSO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label        = excluded.label,
      sort_order   = excluded.sort_order,
      active       = true,
      description  = excluded.description;

INSERT INTO public.scout_field_codebook_map (
  contract_name, field_name, selector_key, selector_value,
  list_key, allow_nao_aplica, allow_nao_observado, active
)
VALUES
  ('scout_live_entries', 'contexto_arremesso_code', 'categoria_acao_code', 'ARREMESSO',
   'LISTA_CONTEXTO_ARREMESSO', false, true, true)
ON CONFLICT (contract_name, field_name, selector_key, selector_value) DO UPDATE
  SET list_key            = excluded.list_key,
      allow_nao_aplica    = excluded.allow_nao_aplica,
      allow_nao_observado = excluded.allow_nao_observado,
      active              = excluded.active;

-- ── 5. Recriar create_scout_live_entry incluindo novos campos ────────────────

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
  v_finish_allowed boolean;
  v_trimmed_action text;
  v_derived_finish_type text;
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
  v_entry.categoria_acao_code := nullif(btrim(coalesce(input_entry->>'categoria_acao_code', '')), '');
  v_entry.acao_basica_code := nullif(btrim(coalesce(input_entry->>'acao_basica_code', '')), '');
  v_entry.classificacao_acao_code := nullif(btrim(coalesce(input_entry->>'classificacao_acao_code', '')), '');
  v_entry.estrutura_transicao_code := nullif(btrim(coalesce(input_entry->>'estrutura_transicao_code', '')), '');
  v_entry.acao_preparatoria_code := nullif(btrim(coalesce(input_entry->>'acao_preparatoria_code', '')), '');
  -- [0033] Execução do bloqueio (nullable; obrigatório na UI mas não no banco)
  v_entry.execucao_bloqueio_code := nullif(btrim(coalesce(input_entry->>'execucao_bloqueio_code', '')), '');
  -- [0095] Contexto decisional e contexto do arremesso (ambos opcionais)
  v_entry.contexto_decisao_code  := nullif(btrim(coalesce(input_entry->>'contexto_decisao_code', '')), '');
  v_entry.contexto_arremesso_code := nullif(btrim(coalesce(input_entry->>'contexto_arremesso_code', '')), '');

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

  IF v_entry.categoria_acao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'categoria_acao_code', v_entry.categoria_acao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: categoria_acao_code';
  END IF;

  IF v_entry.acao_basica_code IS NOT NULL AND v_entry.categoria_acao_code IS NOT NULL THEN
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'acao_basica_code', v_entry.acao_basica_code,
      'categoria_acao_code', v_entry.categoria_acao_code
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: acao_basica_code';
    END IF;
  END IF;

  IF v_entry.classificacao_acao_code IS NOT NULL AND v_entry.acao_basica_code IS NOT NULL THEN
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'classificacao_acao_code', v_entry.classificacao_acao_code,
      'acao_basica_code', v_entry.acao_basica_code
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: classificacao_acao_code';
    END IF;
  END IF;

  IF v_entry.estrutura_transicao_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'estrutura_transicao_code', v_entry.estrutura_transicao_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: estrutura_transicao_code';
  END IF;

  IF v_entry.acao_preparatoria_code IS NOT NULL
     AND NOT public.scout_field_value_allowed('scout_live_entries', 'acao_preparatoria_code', v_entry.acao_preparatoria_code) THEN
    RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: acao_preparatoria_code';
  END IF;

  -- [0033] Validar execucao_bloqueio_code apenas quando acao_basica_code = BLOQUEIO
  IF v_entry.execucao_bloqueio_code IS NOT NULL THEN
    IF v_entry.acao_basica_code <> 'BLOQUEIO' THEN
      RAISE EXCEPTION 'execucao_bloqueio_code not allowed outside BLOQUEIO action';
    END IF;
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'execucao_bloqueio_code', v_entry.execucao_bloqueio_code,
      'acao_basica_code', 'BLOQUEIO'
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: execucao_bloqueio_code';
    END IF;
  END IF;

  -- [0095] Validar contexto_decisao_code — opcional, só permitido quando categoria = ARREMESSO
  IF v_entry.contexto_decisao_code IS NOT NULL THEN
    IF v_entry.categoria_acao_code <> 'ARREMESSO' THEN
      RAISE EXCEPTION 'contexto_decisao_code not allowed outside ARREMESSO category';
    END IF;
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'contexto_decisao_code', v_entry.contexto_decisao_code,
      'categoria_acao_code', 'ARREMESSO'
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: contexto_decisao_code';
    END IF;
  END IF;

  -- [0095] Validar contexto_arremesso_code — opcional, só permitido quando categoria = ARREMESSO
  IF v_entry.contexto_arremesso_code IS NOT NULL THEN
    IF v_entry.categoria_acao_code <> 'ARREMESSO' THEN
      RAISE EXCEPTION 'contexto_arremesso_code not allowed outside ARREMESSO category';
    END IF;
    IF NOT public.scout_field_value_allowed(
      'scout_live_entries', 'contexto_arremesso_code', v_entry.contexto_arremesso_code,
      'categoria_acao_code', 'ARREMESSO'
    ) THEN
      RAISE EXCEPTION 'INVALID_CODEBOOK_VALUE: contexto_arremesso_code';
    END IF;
  END IF;

  IF v_entry.fase_da_bola_code = 'AT_POS' AND v_entry.sistema_ofensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_ofensivo_code required for AT_POS';
  END IF;

  IF v_entry.fase_da_bola_code = 'DEF_POS' AND v_entry.sistema_defensivo_code IS NULL THEN
    RAISE EXCEPTION 'sistema_defensivo_code required for DEF_POS';
  END IF;

  -- ── Derivação de tipo_finalizacao_code ──────────────────────────────────────

  v_derived_finish_type := NULL;

  IF v_entry.categoria_acao_code = 'ARREMESSO'
     AND v_entry.acao_basica_code = 'ARREMESSO'
     AND v_entry.classificacao_acao_code IS NOT NULL THEN
    v_derived_finish_type := CASE v_entry.classificacao_acao_code
      WHEN 'GIRO'           THEN 'GIRO'
      WHEN 'AEREA'          THEN 'AEREA'
      WHEN 'AEREA_TRANS'    THEN 'AEREA'
      WHEN 'ARREM_SIMPLES'  THEN 'SIMPLES'
      WHEN 'FINALIZ_CONTRA' THEN 'SIMPLES'
      WHEN 'FINALIZ_TRANS'  THEN 'SIMPLES'
      ELSE NULL
    END;
  END IF;

  -- [0033] BLOQUEIO: classificacao_acao_code agora representa o tipo da finalização adversária.
  --        NAO_OBSERVADO não deriva tipo_finalizacao_code (desconhecido — registro fica pendente de revisão).
  --        TIRO_6M_CONCEDIDO: finalização adversária não foi concluída → não deriva tipo_finalizacao_code.
  IF v_derived_finish_type IS NULL
     AND v_entry.acao_basica_code = 'BLOQUEIO'
     AND v_entry.classificacao_acao_code IS NOT NULL
     AND v_entry.resultado_factual_code <> 'TIRO_6M_CONCEDIDO' THEN
    v_derived_finish_type := CASE v_entry.classificacao_acao_code
      WHEN 'GIRO'          THEN 'GIRO'
      WHEN 'ARREM_SIMPLES' THEN 'SIMPLES'
      WHEN 'AEREA'         THEN 'AEREA'
      WHEN '6M_ADV'        THEN '6M'
      ELSE NULL  -- NAO_OBSERVADO cai aqui
    END;
  END IF;

  IF v_derived_finish_type IS NULL
     AND v_entry.acao_basica_code = 'FINALIZACAO_6M_ADV' THEN
    v_derived_finish_type := '6M';
  END IF;

  IF v_derived_finish_type IS NOT NULL THEN
    IF v_entry.tipo_finalizacao_code IS NULL THEN
      v_entry.tipo_finalizacao_code := v_derived_finish_type;
    ELSIF v_entry.tipo_finalizacao_code <> v_derived_finish_type THEN
      RAISE EXCEPTION 'tipo_finalizacao_code incompatible with derived action semantics';
    END IF;
  END IF;

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

  -- ── Visibilidade/obrigatoriedade de tipo_finalizacao_code ───────────────────

  v_finish_allowed := false;
  v_finish_required := false;

  IF v_entry.acao_basica_code = 'FINALIZACAO_6M_ADV' THEN
    v_finish_allowed := true;
    v_finish_required := true;
  ELSIF v_entry.categoria_acao_code = 'ARREMESSO'
     AND v_entry.acao_basica_code = 'ARREMESSO'
     AND v_entry.resultado_factual_code IN ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE') THEN
    v_finish_allowed := true;
    v_finish_required := true;
  ELSIF v_entry.acao_basica_code IN ('COBERTURA', 'MARCACAO_PRESSAO', 'RECOMPOSICAO')
     AND v_entry.resultado_factual_code IN ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE') THEN
    v_finish_allowed := true;
    v_finish_required := true;
  -- [0033] BLOQUEIO: permitido quando classificação define tipo de finalização adversária,
  --        mas TIRO_6M_CONCEDIDO não exige (finalização adversária não foi concluída).
  ELSIF v_entry.acao_basica_code = 'BLOQUEIO'
     AND v_entry.classificacao_acao_code IS NOT NULL
     AND v_entry.classificacao_acao_code NOT IN ('NAO_OBSERVADO')
     AND v_entry.resultado_factual_code <> 'TIRO_6M_CONCEDIDO' THEN
    v_finish_allowed := true;
    v_finish_required := true;
  END IF;

  IF v_finish_required AND v_entry.tipo_finalizacao_code IS NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code required for finalization result';
  END IF;
  IF NOT v_finish_allowed AND v_entry.tipo_finalizacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'tipo_finalizacao_code not allowed in this action/result context';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND v_entry.motivo_pontuacao_code IS NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code required for GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND v_entry.motivo_pontuacao_code IS NOT NULL THEN
    RAISE EXCEPTION 'motivo_pontuacao_code only allowed for GOL';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND (v_entry.pontos_jogada IS NULL OR v_entry.pontos_jogada NOT IN (1, 2)) THEN
    RAISE EXCEPTION 'pontos_jogada must be 1 or 2 when resultado_factual_code is GOL';
  END IF;
  IF v_entry.resultado_factual_code <> 'GOL' AND coalesce(v_entry.pontos_jogada, 0) <> 0 THEN
    RAISE EXCEPTION 'pontos_jogada must be 0 or null when resultado_factual_code is not GOL';
  END IF;

  IF v_entry.resultado_factual_code = 'GOL'
     AND v_entry.fase_da_bola_code NOT IN ('DEF_POS', 'TRANS_DEF')
     AND v_entry.motivo_pontuacao_code IS NOT NULL THEN
    IF v_entry.motivo_pontuacao_code = 'SIMPLES' AND v_entry.pontos_jogada <> 1 THEN
      RAISE EXCEPTION 'pontos_jogada does not match motivo_pontuacao_code';
    END IF;

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
    execucao_bloqueio_code,
    estrutura_transicao_code,
    contexto_decisao_code,
    contexto_arremesso_code,
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
    v_entry.execucao_bloqueio_code,
    v_entry.estrutura_transicao_code,
    v_entry.contexto_decisao_code,
    v_entry.contexto_arremesso_code,
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
      'scout_game_id',             v_created.scout_game_id,
      'id_jogada',                 v_created.id_jogada,
      'fase_da_bola_code',         v_created.fase_da_bola_code,
      'acao_basica_code',          v_created.acao_basica_code,
      'classificacao_acao_code',   v_created.classificacao_acao_code,
      'execucao_bloqueio_code',    v_created.execucao_bloqueio_code,
      'acao_principal_is_custom',  v_created.acao_principal_is_custom,
      'resultado_factual_code',    v_created.resultado_factual_code,
      'estrutura_transicao_code',  v_created.estrutura_transicao_code,
      'contexto_decisao_code',     v_created.contexto_decisao_code,
      'contexto_arremesso_code',   v_created.contexto_arremesso_code,
      'acao_preparatoria_code',    v_created.acao_preparatoria_code
    )
  );

  RETURN v_created;
END;
$$;

REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM public;
REVOKE ALL ON FUNCTION public.create_scout_live_entry(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_scout_live_entry(jsonb) TO authenticated;
