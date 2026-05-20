-- CEPR-0096
-- COLETA_AO_VIVO: cobrança de 6m favorável ao CEPRAEA em AT_POS.
--
-- Cria caminho explícito:
--   AT_POS -> ARREMESSO -> FINALIZACAO_6M_FAV
--
-- O evento representa a cobrança em si, não o lance que gerou o tiro de 6m.

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
    'FINALIZACAO_6M_FAV',
    'Cobrança de 6m favorável',
    2,
    'Evento ofensivo observado: CEPRAEA cobra tiro de 6 metros.',
    'Usar em AT_POS para registrar o lance de cobrança de 6m favorável ao CEPRAEA. '
    || 'Resultado: GOL, DEFENDIDO, FORA, TRAVE, VIOLACAO ou NAO_OBSERVADO.',
    'Não usar para arremesso corrido, giro, aérea ou para registrar 6m concedido à adversária.'
  )
) AS v(code, label, sort_order, description, when_to_use, when_not_to_use)
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_ACAO_BASICA_ARREMESSO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label           = excluded.label,
      sort_order      = excluded.sort_order,
      description     = excluded.description,
      when_to_use     = excluded.when_to_use,
      when_not_to_use = excluded.when_not_to_use,
      active          = true;

-- Atualiza a RPC vigente sem duplicar todo o corpo da função nesta migration.
-- A função é definida integralmente pelas migrations anteriores; aqui aplicamos
-- apenas as substituições necessárias ao novo código de ação básica.
DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef('public.create_scout_live_entry(jsonb)'::regprocedure)
  INTO v_def;

  v_def := replace(
    v_def,
    'AND v_entry.acao_basica_code = ''FINALIZACAO_6M_ADV'' THEN',
    'AND v_entry.acao_basica_code IN (''FINALIZACAO_6M_ADV'', ''FINALIZACAO_6M_FAV'') THEN'
  );

  v_def := replace(
    v_def,
    'IF v_entry.acao_basica_code = ''FINALIZACAO_6M_ADV'' THEN',
    'IF v_entry.acao_basica_code IN (''FINALIZACAO_6M_ADV'', ''FINALIZACAO_6M_FAV'') THEN'
  );

  v_def := replace(
    v_def,
    '  -- ── Derivação de tipo_finalizacao_code ──────────────────────────────────────',
    '  IF v_entry.acao_basica_code IN (''FINALIZACAO_6M_ADV'', ''FINALIZACAO_6M_FAV'')
     AND v_entry.resultado_factual_code NOT IN (''GOL'', ''DEFENDIDO'', ''FORA'', ''TRAVE'', ''VIOLACAO'', ''NAO_OBSERVADO'') THEN
    RAISE EXCEPTION ''INVALID_CONTEXT: resultado_factual_code not allowed for 6m finish action'';
  END IF;

  -- ── Derivação de tipo_finalizacao_code ──────────────────────────────────────'
  );

  EXECUTE v_def;
END $$;
