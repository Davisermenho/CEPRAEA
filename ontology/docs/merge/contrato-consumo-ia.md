# contrato-consumo-ia

Status: DRAFT NORMATIVO (PR 1)
Objetivo: garantir que a IA use a ontologia final de modo deterministico, rastreavel e util ao PWA.

## 1. Principio de Consumo

A IA MUST consumir a ontologia final por:

1. conceito canonico (`canonical_id` + IRI `cepr:`),
2. regras SHACL aplicaveis ao contexto,
3. evidencias rastreaveis (fonte normativa/cientifica).

A IA MUST NOT responder apenas por label textual sem ancoragem no conceito canonico.

## 2. Contrato Minimo de Resposta da IA

Para afirmacoes de dominio Scout/handebol de praia, a IA deve retornar metadados internos:

1. `canonical_id` do conceito usado.
2. `source_id`/origem de evidencia.
3. `confidence` (baixa/media/alta) conforme cobertura ontologica.
4. `validation_profile` aplicado (ex.: runtime, SHACL core, SHACL historical).

## 3. Regras Anti-Hallucination

1. Se nao houver conceito canonico mapeado, IA MUST sinalizar `sem_conceito_canonico`.
2. Se houver conflito entre conceitos, IA MUST escolher o canonico e registrar alias usados.
3. Se a regra exigir validacao fechada, IA MUST respeitar SHACL, nao apenas inferencia OWL.
4. Se pergunta exceder cobertura da ontologia, IA MUST declarar limite explicitamente.

## 4. Integração com Runtime

1. Codigos de runtime (`ScoutPhaseCode`, `ScoutFinishTypeCode`, `ScoutFactualResultCode`) MUST ter mapping ontologico canonico.
2. Fluxos auditados MUST ter correspondencia em:
   - classe/propriedade ontologica,
   - shape SHACL,
   - exemplo valido/invalido,
   - consulta SPARQL de competencia.
3. Divergencia runtime <-> ontologia MUST bloquear release.

## 5. Perfis de Validacao

1. `profile_new_data`: validacao rigorosa para novos registros.
2. `profile_historical_data`: validacao controlada para historico, com politica especifica.
3. A IA MUST informar qual profile foi usado quando a resposta depender de qualidade de dado.

## 6. Observabilidade

A cadeia minima de observabilidade para consumo de ontologia pela IA e:

1. input funcional,
2. conceito canonico resolvido,
3. regra SHACL/SPARQL aplicada,
4. resultado de validacao,
5. output final para o usuario.

## 7. Criterios de Bloqueio

Bloquear ativacao de consumo ontologico pela IA se:

1. nao houver mapeamento canonico para codigos Scout essenciais,
2. nao houver perfil de validacao definido,
3. nao houver rastreabilidade de fonte para conceitos criticos,
4. houver conflito sem resolucao no crosswalk.

