# Plano de Implementação Técnica — Ataque sem Finalização v1.0

Status: aprovado_para_implementacao

Este plano implementa somente o módulo Ataque sem Finalização v1.0, conforme Contrato_Operacional.md e SCOUT_DESIGN_TEMPLATE.

## Escopo

Implementar os sete eventos do módulo:

- technical_error_unforced
- technical_error_forced
- offensive_foul
- goal_area_invasion_attack
- passive_play_turnover
- bad_substitution_attack
- turnover_unclassified

## Fora de escopo

Não implementar finalização, goleira, defesa, transição, shoot-out, golden goal, relatórios gerais ou dashboard completo nesta fase.

## Critérios PASS/FAIL

- Todos os eventos derivam resultado_posse_auto = lost_possession_no_shot.
- Todos os eventos têm pontos = 0.
- technical_error_unforced e technical_error_forced exigem subtipo_erro_tecnico.
- passive_play_turnover exige subtipo_jogo_passivo e sistema.
- bad_substitution_attack exige subtipo_erro_substituicao e sistema.
- substitution_violation_other aciona review_marker.
- turnover_unclassified exige review_marker.
- Nenhum evento aceita tipo_finalizacao_code, zona_gol ou pontuação diferente de zero.
- TESTE-OBS-01 valida consistência intraobservador do observador único.
