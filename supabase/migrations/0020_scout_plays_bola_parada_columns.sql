-- Migration: 0020_scout_plays_bola_parada_columns
-- Adiciona colunas de resultado por tipo de bola parada/contexto especial
-- (TIRO_6M, TIRO_LIVRE, REPOSICAO_LATERAL, REPOSICAO_GOLEIRA,
--  REPOSICAO_APOS_GOL, GOLDEN_GOAL) à tabela scout_plays.
-- FIM_SET não exige coluna extra — capturado em special_context.
-- Referências: LISTA_6M, LISTA_TIRO_LIVRE, LISTA_REPOSICAO_LATERAL,
--              LISTA_REPOSICAO_GOLEIRA, LISTA_REPOSICAO_APOS_GOL,
--              LISTA_GOLDEN_GOAL (migration 0018_scout_codebook_all_lists.sql)

ALTER TABLE scout_plays
  ADD COLUMN IF NOT EXISTS tiro_6m_result text,
  ADD COLUMN IF NOT EXISTS tiro_livre_result text,
  ADD COLUMN IF NOT EXISTS reposicao_lateral_result text,
  ADD COLUMN IF NOT EXISTS reposicao_goleira_result text,
  ADD COLUMN IF NOT EXISTS reposicao_apos_gol_result text,
  ADD COLUMN IF NOT EXISTS golden_goal_situation text;
