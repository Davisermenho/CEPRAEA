-- CEPR-0101 — COLETA_AO_VIVO: normalizar tipo_finalizacao_code em AT_POS + ARREMESSO
--
-- Objetivo:
-- - Oficializar que AT_POS + ARREMESSO + ARREMESSO usa tipo_finalizacao_code
--   como campo semântico principal para SIMPLES, GIRO e AEREA.
-- - Manter classificacao_acao_code apenas como compatibilidade/legado.
-- - Impedir que 6M seja salvo como tipo manual de arremesso corrido; 6M deve
--   usar FINALIZACAO_6M_FAV ou FINALIZACAO_6M_ADV.

DO $$
DECLARE
  v_def text;
  v_guard text := '  -- [0101] AT_POS/TRANS_OF + ARREMESSO normal usa tipo_finalizacao_code como campo semântico.
  --        6M deve ser registrado por ações específicas FINALIZACAO_6M_FAV/ADV.
  IF v_entry.categoria_acao_code = ''ARREMESSO''
     AND v_entry.acao_basica_code = ''ARREMESSO''
     AND v_entry.tipo_finalizacao_code IS NOT NULL
     AND v_entry.tipo_finalizacao_code NOT IN (''SIMPLES'', ''GIRO'', ''AEREA'') THEN
    RAISE EXCEPTION ''tipo_finalizacao_code not allowed for offensive arremesso'';
  END IF;

';
BEGIN
  SELECT pg_get_functiondef('public.create_scout_live_entry(jsonb)'::regprocedure)
  INTO v_def;

  IF position('tipo_finalizacao_code not allowed for offensive arremesso' in v_def) = 0 THEN
    v_def := replace(
      v_def,
      '  -- ── Visibilidade/obrigatoriedade de tipo_finalizacao_code ───────────────────',
      v_guard || '  -- ── Visibilidade/obrigatoriedade de tipo_finalizacao_code ───────────────────'
    );

    EXECUTE v_def;
  END IF;
END $$;
