-- 0029_scout_motivo_pontuacao_refactor.sql
-- CEPR-0085: Solucao 2 — Remove SHOOTOUT de LISTA_MOTIVO_PONTUACAO na COLETA_AO_VIVO.
-- SHOOTOUT nao existe como modalidade no registro de entrada ao vivo standard;
-- pontuacao de GIRO e AEREA com 1 ponto usa VALIDACAO_ARBITRAL automaticamente.

-- Desativar SHOOTOUT na lista de motivos de pontuacao
UPDATE public.scout_code_values
SET active = false
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_MOTIVO_PONTUACAO')
  AND code = 'SHOOTOUT';

-- Verificacao: garantir que os demais motivos relevantes estao ativos
-- SIMPLES, GIRO, AEREA, 6M, GOLEIRA, ESPECIALISTA, GOL_CONTRA, VALIDACAO_ARBITRAL
UPDATE public.scout_code_values
SET active = true
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_MOTIVO_PONTUACAO')
  AND code IN ('SIMPLES', 'GIRO', 'AEREA', '6M', 'GOLEIRA', 'ESPECIALISTA', 'GOL_CONTRA', 'VALIDACAO_ARBITRAL');

-- NAO_OBSERVADO tambem inativo (nao deve aparecer para o usuario no contexto de GOL)
UPDATE public.scout_code_values
SET active = false
WHERE list_id = (SELECT id FROM public.scout_code_lists WHERE list_key = 'LISTA_MOTIVO_PONTUACAO')
  AND code = 'NAO_OBSERVADO';
