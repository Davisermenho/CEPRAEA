-- Migration: 0030_cepr_0089_trans_of_labels.sql
-- CEPR-0089: Refinamento semântico de TRANS_OF + ARREMESSO
-- Atualiza labels e descriptions dos códigos de classificação de transição ofensiva.
-- Os CODES são mantidos intactos (sem breaking change no banco nem no código).

UPDATE public.scout_code_values cv
SET
  label = CASE cv.code
    WHEN 'FINALIZ_CONTRA' THEN 'Transição direta'
    WHEN 'FINALIZ_TRANS'  THEN 'Transição indireta'
    WHEN 'AEREA_TRANS'    THEN 'Aérea na transição'
  END,
  description = CASE cv.code
    WHEN 'FINALIZ_CONTRA' THEN 'Atacante entra livre ou com vantagem clara para finalizar, sem defesa estabilizada. Situação de 1x0 ou superioridade numérica direta.'
    WHEN 'FINALIZ_TRANS'  THEN 'Finalização em bloco parcial (2x1, 3x2 ou 4x3). Equipe em transição resolve estrutura de oposição parcial.'
    WHEN 'AEREA_TRANS'    THEN 'Passe repositor direto para finalização em aérea antes da defesa estabilizar.'
  END,
  when_to_use = CASE cv.code
    WHEN 'FINALIZ_CONTRA' THEN 'Usar em TRANS_OF quando atacante finaliza livre ou com 1x0, sem resistência organizada da defesa.'
    WHEN 'FINALIZ_TRANS'  THEN 'Usar em TRANS_OF quando há bloco defensivo parcial (2x1, 3x2, 4x3) no momento da finalização.'
    WHEN 'AEREA_TRANS'    THEN 'Usar em TRANS_OF quando a finalização é uma aérea originada de passe repositor antes de a defesa se posicionar.'
  END
FROM public.scout_code_lists cl
WHERE cv.list_id = cl.id
  AND cl.list_key = 'LISTA_CLASSIF_ARREMESSO'
  AND cv.code IN ('FINALIZ_CONTRA', 'FINALIZ_TRANS', 'AEREA_TRANS');
