-- Scout codebook: humanização de labels de sistemas táticos + expansão de tipo_finalizacao
-- Objetivo: corrigir labels snake_case em LISTA_SISTEMA_OFENSIVO e LISTA_SISTEMA_DEFENSIVO
-- e adicionar CONTRA e GOL_CONTRA a LISTA_TIPO_FINALIZACAO conforme scout-listas.md:118.

-- ── 1a. Labels humanos: LISTA_SISTEMA_OFENSIVO
UPDATE public.scout_code_values cv SET label = 'Ataque 3:1'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_OFENSIVO' AND cv.code = 'AT_3X1';

UPDATE public.scout_code_values cv SET label = 'Ataque 4:0'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_OFENSIVO' AND cv.code = 'AT_4X0';

UPDATE public.scout_code_values cv SET label = 'Não se aplica'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_OFENSIVO' AND cv.code = 'NAO_APLICA';

UPDATE public.scout_code_values cv SET label = 'Não observado'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_OFENSIVO' AND cv.code = 'NAO_OBSERVADO';

-- ── 1b. Labels humanos: LISTA_SISTEMA_DEFENSIVO
UPDATE public.scout_code_values cv SET label = 'Defesa 3×0'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_3X0';

UPDATE public.scout_code_values cv SET label = 'Defesa 2×1'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_2X1';

UPDATE public.scout_code_values cv SET label = 'Defesa 1×2'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_1X2';

UPDATE public.scout_code_values cv SET label = 'Defesa misto'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_MISTO';

UPDATE public.scout_code_values cv SET label = 'Defesa individual'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_INDIVIDUAL';

UPDATE public.scout_code_values cv SET label = 'Defesa 2×0 (OUT)'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'DEF_2X0_OUT';

UPDATE public.scout_code_values cv SET label = 'Não observado'
  FROM public.scout_code_lists cl
  WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_SISTEMA_DEFENSIVO' AND cv.code = 'NAO_OBSERVADO';

-- ── 1c. Expandir CHECK de tipo_finalizacao_code para incluir CONTRA e GOL_CONTRA
ALTER TABLE public.scout_live_entries
  DROP CONSTRAINT IF EXISTS scout_live_entries_tipo_finalizacao_code_check;

ALTER TABLE public.scout_live_entries
  ADD CONSTRAINT scout_live_entries_tipo_finalizacao_code_check
    CHECK (
      tipo_finalizacao_code IS NULL
      OR tipo_finalizacao_code IN (
        'SIMPLES', 'GIRO', 'AEREA', 'ESPECIALISTA', 'GOLEIRA',
        '6M', 'SHOOTOUT', 'CONTRA', 'GOL_CONTRA', 'NAO_OBSERVADO'
      )
    );

-- ── 1d. Inserir CONTRA e GOL_CONTRA no codebook LISTA_TIPO_FINALIZACAO
WITH fin_seed(code, label, sort_order) AS (
  VALUES
    ('CONTRA',     'Finalização em contra-ataque',  9),
    ('GOL_CONTRA', 'Gol contra',                   10)
)
INSERT INTO public.scout_code_values (
  list_id, code, label, sort_order, is_nao_aplica, is_nao_observado, active
)
SELECT l.id, s.code, s.label, s.sort_order, false, false, true
FROM fin_seed s
JOIN public.scout_code_lists l ON l.list_key = 'LISTA_TIPO_FINALIZACAO'
ON CONFLICT (list_id, code) DO UPDATE
  SET label      = excluded.label,
      sort_order = excluded.sort_order,
      active     = excluded.active;
