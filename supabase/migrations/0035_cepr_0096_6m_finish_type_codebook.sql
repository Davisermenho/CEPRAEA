-- CEPR-0096
-- Reativa 6M em LISTA_TIPO_FINALIZACAO.
--
-- Contexto:
-- - A migration 0027 desativou 6M em tipo_finalizacao por tratá-lo apenas
--   como motivo de pontuação.
-- - A partir do CEPR-0090, FINALIZACAO_6M_ADV auto-deriva
--   tipo_finalizacao_code = '6M'.
-- - Sem 6M ativo no codebook de tipo_finalizacao, a UI exibe o caminho
--   correto, mas o save falha com INVALID_CODEBOOK_VALUE.

UPDATE public.scout_code_values
SET active = true,
    label = '6 metros'
WHERE list_id = (
    SELECT id
    FROM public.scout_code_lists
    WHERE list_key = 'LISTA_TIPO_FINALIZACAO'
)
  AND code = '6M';
