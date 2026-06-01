# PR-3 imports (onthbpraia -> CEPRAEA)

Este diretório registra os ativos importados/adaptados no PR-3.

## Itens importados

- `q14_shacl_constraints_inventory.rq` -> `ontology/queries/competency/q06_shacl_shape_inventory.rq`
- `q13_technical_throw_classification.rq` -> `ontology/queries/competency/q07_technical_shot_classification.rq`
- Regra SHACL equivalente de pontuação regular -> `cepr:RegularShotOnePointShape` em `ontology/shacl/core.shacl.ttl`

## Regras de adaptação

- Namespace de destino obrigatório: `cepr:`.
- Modelo de destino obrigatório: separar `ShootingAction` de `RestartThrowType`.
- Toda importação precisa de linha correspondente em `ontology/migration/crosswalk-cepr-bh.md`.
