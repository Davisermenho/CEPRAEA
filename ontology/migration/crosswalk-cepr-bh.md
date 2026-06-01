# crosswalk-cepr-bh

Status: APPROVED
Approved-By: CEPRAEA ontology maintainers
Approved-At: 2026-06-01
Scope: PR-3 (import controlado de CQs e regras do legado `onthbpraia`)

## Regras canônicas

1. Toda linha deve usar decisão estritamente em `ADOPT | ALIAS | SPLIT | DEPRECATE`.
2. Nenhum novo ativo TTL/SHACL/RQ de ontologia entra no merge sem linha no crosswalk com `approval=APPROVED`.
3. O namespace canônico de destino é sempre `cepr:` (`https://cepraea.app/ontology#`).
4. Quando a origem usar conceito agregado (`Throw`), a migração deve explicitar `SPLIT` no modelo CEPRAEA.

## Matriz linha a linha

| id | origem_onthbpraia | destino_cepr | decisao | justificativa | impacto_runtime | approval |
|---|---|---|---|---|---|---|
| CW-PR3-001 | `onthbpraia/queries/competency/q14_shacl_constraints_inventory.rq` | `ontology/queries/competency/q06_shacl_shape_inventory.rq` | ADOPT | CQ útil para inventariar cobertura SHACL ativa no core canônico. | incrementa rastreabilidade formal sem alterar contrato de domínio. | APPROVED |
| CW-PR3-002 | `onthbpraia/queries/competency/q13_technical_throw_classification.rq` | `ontology/queries/competency/q07_technical_shot_classification.rq` | SPLIT | Origem classifica `Throw`; destino separa `ShootingAction` e mantém taxonomia técnica compatível com runtime CEPR. | adiciona CQ técnica sem quebrar CQs existentes. | APPROVED |
| CW-PR3-003 | `onthbpraia/shacl/core.shacl.ttl#RegularThrowOnePoint` (regra implícita em CQs) | `ontology/shacl/core.shacl.ttl#RegularShotOnePointShape` | SPLIT | Regra de pontuação regular precisa adaptar de `Throw` para `RegularShot` no modelo CEPR. | adiciona validação formal de 1 ponto para arremesso regular. | APPROVED |
| CW-PR3-004 | `onthbpraia/ontology/core.ttl#SpinShot` | `cepr:SpinThrow` | ALIAS | Mesmo conceito funcional no runtime CEPR. | nenhuma alteração de código, apenas governança semântica. | APPROVED |
| CW-PR3-005 | `onthbpraia/ontology/core.ttl#InFlightShot` | `cepr:AerialThrow` | ALIAS | Mesmo conceito funcional no runtime CEPR. | nenhuma alteração de código, apenas governança semântica. | APPROVED |
| CW-PR3-006 | `onthbpraia/ontology/core.ttl#Throw` | `cepr:ShootingAction` + `cepr:RestartThrowType` | SPLIT | Conceito agregado no legado foi separado em dois domínios no CEPR para evitar ambiguidade. | mantém alinhamento com runtime scout e regras de reinício. | APPROVED |
| CW-PR3-007 | `onthbpraia/queries/competency/q01_team_active_players_count.rq` | sem destino no PR-3 | DEPRECATE | Depende de entidades de roster/time não presentes no core canônico atual. | importação adiada para fase de expansão de domínio. | APPROVED |
| CW-PR3-008 | `onthbpraia/queries/competency/q15_axiom_provenance_inventory.rq` | sem destino no PR-3 | DEPRECATE | Exige classe `Axiom` e proveniência específica não modeladas no core CEPR atual. | importação adiada até modelagem explícita de axiomas de proveniência. | APPROVED |

## Cobertura retroativa de ativos canônicos já incorporados (bootstrap)

| id | origem_onthbpraia | destino_cepr | decisao | justificativa | impacto_runtime | approval |
|---|---|---|---|---|---|---|
| CW-BOOT-001 | `onthbpraia/shacl/core.shacl.ttl` | `ontology/shacl/core.shacl.ttl` | ADOPT | Base formal do shape-set já consolidado no core CEPR. | preserva validação SHACL canônica. | APPROVED |
| CW-BOOT-002 | `onthbpraia/examples/minimal-data.ttl` | `ontology/examples/minimal-data.ttl` | ADOPT | Dataset mínimo de validação formal reaproveitado e adaptado ao namespace CEPR. | mantém CQs/gates formais operacionais. | APPROVED |
| CW-BOOT-003 | `onthbpraia/examples/invalid-data.ttl` | `ontology/examples/invalid-data.ttl` | ADOPT | Dataset inválido de regressão formal reaproveitado no fluxo CEPR. | garante falha esperada de constraints críticas. | APPROVED |
| CW-BOOT-004 | `onthbpraia/examples/*scout-live-real-valid*` | `ontology/examples/golden/scout-live-real-valid.ttl` | ADOPT | Cenário golden de live collection adaptado ao modelo CEPR. | cobertura positiva de fluxo live. | APPROVED |
| CW-BOOT-005 | `onthbpraia/examples/*scout-live-real-invalid*` | `ontology/examples/golden/scout-live-real-invalid.ttl` | ADOPT | Cenário golden inválido adaptado ao modelo CEPR. | cobertura negativa de fluxo live. | APPROVED |
| CW-BOOT-006 | `onthbpraia/examples/*scout-audited-flows-valid*` | `ontology/examples/golden/scout-audited-flows-valid.ttl` | ADOPT | Fluxos auditados válidos consolidados para gate runtime-alignment. | valida contratos auditados. | APPROVED |
| CW-BOOT-007 | `onthbpraia/examples/*scout-audited-flows-invalid*` | `ontology/examples/golden/scout-audited-flows-invalid.ttl` | ADOPT | Fluxos auditados inválidos consolidados para regressão negativa. | bloqueia regressão de constraints auditadas. | APPROVED |
| CW-BOOT-008 | `onthbpraia/queries/competency/q09_goal_points_by_condition.rq` | `ontology/queries/competency/q03_goal_points_by_action.rq` | SPLIT | Query original em `Throw` foi adaptada para `ShootingAction` no CEPR. | mantém semântica de pontuação por tipo técnico. | APPROVED |
| CW-BOOT-009 | `onthbpraia/queries/competency/q12_goal_zone_outcome_scout.rq` | `ontology/queries/competency/q04_golden_scout_live_flow.rq` | SPLIT | Parte de leitura por zona/resultado foi consolidada em CQ de fluxo vivo CEPR. | amplia auditoria do live flow com runtime codes. | APPROVED |
| CW-BOOT-010 | `onthbpraia/queries/competency/q13_technical_throw_classification.rq` | `ontology/queries/competency/q01_canonical_shot_mapping.rq` | ALIAS | Taxonomia técnica do legado foi normalizada por aliases canônicos CEPR. | padroniza linguagem de arremessos. | APPROVED |
| CW-BOOT-011 | `onthbpraia/queries/competency/q14_shacl_constraints_inventory.rq` | `ontology/queries/competency/q02_scout_phase_codes.rq` | SPLIT | Inventário formal do legado foi repartido no CEPR entre códigos runtime e alinhamento formal. | reforça vínculo entre ontologia e runtime. | APPROVED |
| CW-BOOT-012 | `onthbpraia/queries/competency/tests.json` | `ontology/queries/competency/q05_audited_scout_flow_shacl_slice.rq` | SPLIT | Manifesto legado foi reduzido ao recorte auditado bloqueante do CEPR. | gate focado em contratos vivos do produto. | APPROVED |
