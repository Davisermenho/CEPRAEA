-- CEPR-0085 — Ajustes semânticos da matriz de ação (patch sobre 0026)
-- Corrige codebooks LISTA_CLASSIF_ARREMESSO e LISTA_CLASSIF_PASSE,
-- desativa tipos de finalização que pertencem somente a motivo_pontuacao,
-- e atualiza create_scout_live_entry com derivação de tipo_finalizacao
-- a partir de classificacao_acao_code + validação de contexto AT_POS/TRANS_OF.

-- ── 1. LISTA_CLASSIF_ARREMESSO: desativar códigos semanticamente errados ─────

UPDATE public.scout_code_values
SET active = false
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_CLASSIF_ARREMESSO')
  AND code IN ('ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT', 'GOL_CONTRA');

-- ── 2. LISTA_CLASSIF_ARREMESSO: adicionar classificações para TRANS_OF ────────

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
    'FINALIZ_TRANS',
    'Finalização em transição',
    10,
    'Arremesso simples executado em transição ofensiva (contra-ataque ou saída rápida).',
    'Usar em TRANS_OF quando a finalização é um arremesso simples de transição.',
    'Não usar em ataque posicionado (AT_POS).'
  ),
  (
    'AEREA_TRANS',
    'Aérea em transição',
    11,
    'Arremesso aéreo (in-flight) executado em transição ofensiva.',
    'Usar em TRANS_OF quando a finalização é uma aérea de transição.',
    'Não usar em ataque posicionado (AT_POS).'
  )
) AS v(code, label, sort_order, description, when_to_use, when_not_to_use)
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_CLASSIF_ARREMESSO'
ON CONFLICT (list_id, code) DO UPDATE
  SET active        = true,
      label         = excluded.label,
      sort_order    = excluded.sort_order,
      description   = excluded.description,
      when_to_use   = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use;

-- ── 3. LISTA_CLASSIF_PASSE: desativar PASSE_LONGO ─────────────────────────────

UPDATE public.scout_code_values
SET active = false
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_CLASSIF_PASSE')
  AND code = 'PASSE_LONGO';

-- ── 4. LISTA_CLASSIF_PASSE: adicionar novas classificações ────────────────────

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
    'PASSE_PARA_ARREMESSO_SIMPLES',
    'Passe para arremesso simples',
    7,
    'Passe que prepara diretamente um arremesso simples.',
    'Usar quando o passe antecede um arremesso simples (não giro, não aérea).',
    'Não usar para passe para giro ou passe para aérea.'
  ),
  (
    'PASSE_APOIO',
    'Passe de apoio',
    8,
    'Passe de manutenção de posse sem preparar finalização direta.',
    'Usar quando o passe mantém a posse sem anteceder finalização imediata.',
    'Não usar quando o passe antecede diretamente uma finalização.'
  )
) AS v(code, label, sort_order, description, when_to_use, when_not_to_use)
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_CLASSIF_PASSE'
ON CONFLICT (list_id, code) DO UPDATE
  SET active        = true,
      label         = excluded.label,
      sort_order    = excluded.sort_order,
      description   = excluded.description,
      when_to_use   = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use;

-- ── 5. LISTA_TIPO_FINALIZACAO: desativar códigos que são motivo, não técnica ──
-- ESPECIALISTA, GOLEIRA, 6M e SHOOTOUT pertencem a LISTA_MOTIVO_PONTUACAO.
-- Aqui só ficam as técnicas de execução: SIMPLES, GIRO, AEREA, NAO_OBSERVADO.

UPDATE public.scout_code_values
SET active = false
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_TIPO_FINALIZACAO')
  AND code IN ('ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT');

-- ── 6. CREATE OR REPLACE create_scout_live_entry ──────────────────────────────
-- Corpo baseado na versão de migration 0026.
-- Adições sinalizadas com "[0027]"; nenhuma validação existente foi removida.

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

  -- [0027] Auto-derivação de tipo_finalizacao_code a partir de classificacao_acao_code.
  -- A UI omite o campo tipo_finalizacao quando categoria=ARREMESSO + acao_basica=ARREMESSO;
  -- o RPC deriva o valor a partir da classificação para satisfazer a regra de finalização
  -- obrigatória. A derivação ocorre antes do check v_finish_required para não bloquear GOL.
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

  -- [0027] Validação de contexto AT_POS/TRANS_OF para classificacao_acao_code de arremessos.
  -- FINALIZ_CONTRA e FINALIZ_TRANS são exclusivos de TRANS_OF.
  -- Em AT_POS apenas GIRO, AEREA e ARREM_SIMPLES são aceitos como classificação.
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
