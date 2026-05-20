-- Migration 0022: session_type em scout_games + labels humanos de LISTA_FASES

-- 1a. Adicionar session_type a scout_games (nullable para compatibilidade com legado)
ALTER TABLE public.scout_games
  ADD COLUMN IF NOT EXISTS session_type text
    CONSTRAINT scout_games_session_type_check
    CHECK (session_type IS NULL OR session_type IN ('JOGO','TREINO','AMISTOSO','SIMULADO'));

-- 1b. Corrigir labels de LISTA_FASES no codebook
--     Verificado: LISTA_FASES tem label = código ('AT_POS') desde migration 0009
--     ScoutWorkspacePage usa phaseLabelMap do DB — esta migration corrige a origem
UPDATE public.scout_code_values cv
SET label = 'Ataque posicionado'
FROM public.scout_code_lists cl
WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_FASES' AND cv.code = 'AT_POS';

UPDATE public.scout_code_values cv
SET label = 'Defesa posicionada'
FROM public.scout_code_lists cl
WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_FASES' AND cv.code = 'DEF_POS';

UPDATE public.scout_code_values cv
SET label = 'Transição ofensiva'
FROM public.scout_code_lists cl
WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_FASES' AND cv.code = 'TRANS_OF';

UPDATE public.scout_code_values cv
SET label = 'Transição defensiva'
FROM public.scout_code_lists cl
WHERE cv.list_id = cl.id AND cl.list_key = 'LISTA_FASES' AND cv.code = 'TRANS_DEF';
