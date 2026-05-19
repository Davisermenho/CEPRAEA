-- 0039_fix_cepr0096_and_cepr0100.sql
--
-- CEPR-0096 (Bug 5A): FINALIZACAO_6M_FAV ausente em v_finish_allowed e derivacao.
--   Migration 0036 usou replace() com strings que nao bateram - falha silenciosa.
--
-- CEPR-0100 (Bug 5C): contexto_decisao_code + contexto_arremesso_code nao sao
--   lidos do JSON nem inseridos pelo RPC create_scout_live_entry.

-- -------------------------------------------------------------------------
-- Fix 5A: FINALIZACAO_6M_FAV
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_def text;
BEGIN
  SELECT pg_get_functiondef(
    'public.create_scout_live_entry(jsonb)'::regprocedure
  ) INTO v_def;

  IF position('FINALIZACAO_6M_FAV' IN v_def) = 0 THEN
    -- 1. Bloco de derivacao
    v_def := replace(v_def,
      $t$     AND v_entry.acao_basica_code = 'FINALIZACAO_6M_ADV' THEN$t$,
      $t$     AND v_entry.acao_basica_code IN ($t$ ||
      $t$'FINALIZACAO_6M_ADV', 'FINALIZACAO_6M_FAV') THEN$t$
    );
    -- 2. Bloco v_finish_allowed
    v_def := replace(v_def,
      $t$  IF v_entry.acao_basica_code = 'FINALIZACAO_6M_ADV' THEN$t$,
      $t$  IF v_entry.acao_basica_code IN ($t$ ||
      $t$'FINALIZACAO_6M_ADV', 'FINALIZACAO_6M_FAV') THEN$t$
    );
    EXECUTE v_def;
  END IF;
END $$;

-- -------------------------------------------------------------------------
-- Fix 5C: contexto_decisao_code + contexto_arremesso_code
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_def   text;
  v_old   text;
  v_new   text;
BEGIN
  SELECT pg_get_functiondef(
    'public.create_scout_live_entry(jsonb)'::regprocedure
  ) INTO v_def;

  IF position('contexto_decisao_code' IN v_def) = 0 THEN

    -- 1. Parsear do JSON
    v_old :=
      '  v_entry.execucao_bloqueio_code := nullif(' ||
      'btrim(coalesce(input_entry->>''execucao_bloqueio_code'', '''')), '''');';
    v_new := v_old || chr(10) ||
      '  v_entry.contexto_decisao_code   := nullif(' ||
      'btrim(coalesce(input_entry->>''contexto_decisao_code'',   '''')), '''');' ||
      chr(10) ||
      '  v_entry.contexto_arremesso_code := nullif(' ||
      'btrim(coalesce(input_entry->>''contexto_arremesso_code'', '''')), '''');';
    v_def := replace(v_def, v_old, v_new);

    -- 2. Colunas do INSERT
    v_def := replace(v_def,
      $t$    acao_preparatoria_code,
    created_by,$t$,
      $t$    acao_preparatoria_code,
    contexto_decisao_code,
    contexto_arremesso_code,
    created_by,$t$
    );

    -- 3. Valores do INSERT
    v_def := replace(v_def,
      $t$    v_entry.acao_preparatoria_code,
    v_entry.created_by,$t$,
      $t$    v_entry.acao_preparatoria_code,
    v_entry.contexto_decisao_code,
    v_entry.contexto_arremesso_code,
    v_entry.created_by,$t$
    );

    -- 4. JSON de retorno
    v_def := replace(v_def,
      $t$      'acao_preparatoria_code',   v_created.acao_preparatoria_code
    )$t$,
      $t$      'acao_preparatoria_code',   v_created.acao_preparatoria_code,
      'contexto_decisao_code',    v_created.contexto_decisao_code,
      'contexto_arremesso_code',  v_created.contexto_arremesso_code
    )$t$
    );

    EXECUTE v_def;
  END IF;
END $$;
