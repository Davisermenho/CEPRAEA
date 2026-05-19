-- CEPR-0098 — COLETA_AO_VIVO: AT_POS + ARREMESSO com PASSIVO sem finalização
--
-- Objetivo:
-- - Permitir registrar ataque posicionado que entrou em jogo passivo após intenção/contexto de arremesso.
-- - Não derivar tipo_finalizacao_code quando resultado_factual_code = PASSIVO.
-- - Manter derivação de tipo apenas quando houve finalização factual.

DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef('public.create_scout_live_entry(jsonb)'::regprocedure)
  INTO v_def;

  v_def := replace(
    v_def,
    'IF v_entry.categoria_acao_code = ''ARREMESSO''
     AND v_entry.acao_basica_code = ''ARREMESSO''
     AND v_entry.classificacao_acao_code IS NOT NULL THEN',
    'IF v_entry.categoria_acao_code = ''ARREMESSO''
     AND v_entry.acao_basica_code = ''ARREMESSO''
     AND v_entry.classificacao_acao_code IS NOT NULL
     AND v_entry.resultado_factual_code IN (''GOL'', ''DEFENDIDO'', ''BLOQUEADO'', ''FORA'', ''TRAVE'') THEN'
  );

  EXECUTE v_def;
END $$;
