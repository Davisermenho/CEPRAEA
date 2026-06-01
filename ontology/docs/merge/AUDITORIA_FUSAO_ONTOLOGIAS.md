# AUDITORIA_FUSAO_ONTOLOGIAS

Status: APROVADO PARA EXECUCAO CONTROLADA (PR 1)
Escopo: governanca e desenho de fusao ontologica CEPRAEA + onthbpraia
Data: 2026-05-29

## 1. Decisao Arquitetural

A fusao deve seguir precedencia obrigatoria:

1. CEPRAEA como SSOT funcional do produto (runtime, contratos Scout, Supabase, UX).
2. onthbpraia como referencia de formalizacao executavel (RDF/OWL, SHACL, exemplos, SPARQL, CI).
3. Fontes normativas e cientificas (IHF e bibliografia validada) como base de evidencia.

Regra central: **nao substituir contratos vivos do CEPRAEA com termos importados sem crosswalk aprovado**.

## 2. Evidencias Objetivas da Auditoria

- CEPRAEA possui checagem semantica documental ativa (`check:ontology:semantics`) e workflow de qualidade ontologica.
- Gate final atual (`validate:mvp:v1`) nao executa validacao formal RDF/SHACL/SPARQL.
- onthbpraia possui nucleo formal executavel com TTL + SHACL + datasets valid/invalid + consultas de competencia + CI.
- Runtime Scout do CEPRAEA ja tem matriz e contratos executaveis que nao podem ser quebrados.

## 3. Riscos Criticos

1. Duplicacao semantica por nomenclatura divergente (ex.: `SpinThrow` vs `SpinShot`).
2. Mistura indevida entre finalizacao ofensiva e reinicio normativo (`ShootingAction` vs `ThrowType`).
3. Divergencia entre regra TypeScript do Scout e SHACL da ontologia.
4. Ontologia formal "bonita" sem efeito real no runtime/IA.
5. Endurecimento de validacao sem politica para dados historicos.

## 4. Politicas Obrigatorias Antes de Importar TTL

Bloqueio de merge para qualquer PR que importe camada formal sem:

1. Namespace/IRI canonicos definidos.
2. Politica de versionamento e deprecacao definida.
3. Politica de breaking changes definida.
4. Contrato de consumo da IA definido.
5. Crosswalk CEPRAEA <-> onthbpraia aprovado.
6. Regra explicita OWL(Open World) vs SHACL(Closed World).

## 5. Sequencia Mandatoria de Entrega

1. PR 1: governanca e crosswalk (documental).
2. PR 2: camada formal minima adaptada ao CEPRAEA.
3. PR 3: gate runtime <-> ontologia.
4. PR 4: golden dataset real de Scout.
5. PR 5: politica de dados historicos.
6. PR 6: integracao no gate final MVP.

## 6. Criterios de Aceite da PR 1

1. Nenhuma alteracao em runtime Scout, Supabase ou UI.
2. Toda divergencia terminologica registrada em crosswalk com decisao explicita.
3. Toda politica desta pasta redigida de forma normativa (MUST/MUST NOT/SHOULD).
4. Regras de bloqueio claras para impedir fusao ad-hoc.

## 7. Criterios de Bloqueio da Fase de Fusao

Bloquear imediatamente se ocorrer qualquer um:

1. Criar classe nova para conceito ja existente no CEPRAEA sem decisao de crosswalk.
2. Manter `SpinThrow` e `SpinShot` como conceitos distintos sem justificativa formal aprovada.
3. Manter `AerialThrow` e `InFlightShot` como conceitos distintos sem justificativa formal aprovada.
4. Tratar OWL como validador fechado no lugar de SHACL.
5. Introduzir validacao formal sem alinhamento com matriz TypeScript.

## 8. Resultado da Auditoria

A fusao e recomendada, mas somente em modo controlado por precedencia, com governanca formal e gates automatizados.

