# crosswalk-cepraea-onthbpraia

Status: DRAFT NORMATIVO (PR 1)
Objetivo: registrar equivalencia semantica e decisao de precedencia entre CEPRAEA e onthbpraia.

## 1. Regras do Crosswalk

1. Toda linha deve ter decisao: `ADOPT`, `ALIAS`, `DEPRECATE`, `SPLIT` ou `KEEP_SEPARATE`.
2. Nenhum termo entra na ontologia final sem linha no crosswalk.
3. `canonical_id` e estavel e independe de label/sinonimo.
4. CEPRAEA prevalece em nome/codigo de runtime; onthbpraia prevalece em tecnica formal de validacao.

## 2. Matriz de Equivalencia Inicial

| canonical_id | CEPRAEA term | onthbpraia term | decisao | acao obrigatoria |
|---|---|---|---|---|
| CEPR-ONT-SHOT-SPIN | SpinThrow | SpinShot | ALIAS | manter `SpinThrow` como canonico; mapear `SpinShot` como alias sem classe duplicada |
| CEPR-ONT-SHOT-AERIAL | AerialThrow | InFlightShot | ALIAS | manter `AerialThrow` como canonico; mapear `InFlightShot` como alias sem classe duplicada |
| CEPR-ONT-GAME-PERIOD | GamePeriod | Period | ALIAS | manter `GamePeriod`; mapear `Period` no namespace legado |
| CEPR-ONT-SHOOTING-ACTION | ShootingAction | Throw | SPLIT | separar finalizacao tecnica de reinicio normativo |
| CEPR-ONT-RESTART-THROW-TYPE | ThrowType | Throw | SPLIT | criar classe de reinicio normativo separada de finalizacao |
| CEPR-ONT-TRANS-DEF-EVENT | AttackPhase/DefensePhase/TRANS_DEF runtime | DefensiveTransitionEvent | KEEP_SEPARATE | preservar fase de runtime e mapear evento defensivo sem colapsar conceitos |
| CEPR-ONT-PHASE-AT_POS | AT_POS | (sem equivalente direto) | ADOPT | manter codigo canonico do runtime e criar representacao ontologica direta |
| CEPR-ONT-PHASE-DEF_POS | DEF_POS | (sem equivalente direto) | ADOPT | manter codigo canonico do runtime e criar representacao ontologica direta |
| CEPR-ONT-PHASE-TRANS_OF | TRANS_OF | (parcial) | ADOPT | manter codigo canonico e mapear eventos parciais do legado |
| CEPR-ONT-PHASE-TRANS_DEF | TRANS_DEF | (parcial) | ADOPT | manter codigo canonico e mapear eventos parciais do legado |

## 3. Conflitos Semanticos de Alto Risco

1. `Throw` em onthbpraia agrega tipos que no CEPRAEA pertencem a dominios diferentes.
2. `Period` (legado) nao pode substituir o ciclo semantico de `GamePeriod` no CEPRAEA.
3. Codigos Scout (`AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF`) nao podem ser abstratizados sem mapping formal bidirecional.

## 4. Regras de Implementacao (Fase PR 2+)

1. Todo alias deve ser representado por mapping formal (`owl:equivalentClass`, `skos:altLabel` ou regra definida em politica).
2. Toda decisao `SPLIT` deve gerar classes e shapes distintos.
3. Toda decisao `DEPRECATE` deve incluir data, motivo e alternativa canonicamente apontada.

## 5. Gate de Aprovacao

Este crosswalk so muda para `APPROVED` quando:

1. Todos os termos conflitantes tiverem decisao formal.
2. Nao houver entradas com status em aberto.
3. O board de ontologia aprovar namespace/versionamento/breaking policy.

