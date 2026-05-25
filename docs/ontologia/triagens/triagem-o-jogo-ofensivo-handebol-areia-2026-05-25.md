---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/O_jogo_ofensivo_do_handebol_de_areia.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - O jogo ofensivo do handebol de areia

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/O_jogo_ofensivo_do_handebol_de_areia.md` |
| Titulo | O jogo ofensivo do handebol de areia: estrutura e aspectos tecnico-taticos do ataque posicionado |
| Autores | Silva, Karen Pereira da; Menezes, Rafael Pombo |
| Ano | 2018 |
| Tema principal | estrutura hierarquica do ataque posicionado, assimetria numerica, especialista, sistemas ofensivos e meios tecnico-taticos |
| Tipo de conteudo | `artigo` (qualitativo, entrevistas com treinadores) |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `SpecialistRole` / `OffensiveSystem` / `AttackModel` / `OffensiveCollaborationMean` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Resumo` e `DSC1`: assimetria numerica como base do jogo ofensivo.
- `DSC2`: decisao do especialista centraliza o jogo e influencia funcionamento tatico.
- `DSC3`: sistemas ofensivos 3:1, 2:2 e 4:0 (e 3:0, 2:1 em igualdade numerica).
- `DSC4`: meios taticos (engajamento, permuta, cruzamento), tecnicas (giro, aerea, arremessos) e combinacoes (`semi-giro com aerea`, `aerea com aerea`).

Candidatos:
1. `SpecialistRole`
2. `NumericalAsymmetry`
3. `OffensiveSystem`
4. `AttackModel`
5. `OffensiveCollaborationMean` / `SuccessiveEntrances` / `Crossing`
6. `ShootingAction`
7. `ReactiveDefense`/`ProactiveDefense` (mencao contextual)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `SpecialistRole` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `NumericalAsymmetry` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `OffensiveSystem` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `AttackModel` | Sim | `REJEITAR_DUPLICATA` (enriquecer relacao/evidencia) |
| `OffensiveCollaborationMean` / `SuccessiveEntrances` / `Crossing` | Sim | `REJEITAR_DUPLICATA` (evidencia e refinos de sinonimia) |
| `ShootingAction` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `ReactiveDefense`/`ProactiveDefense` | Nao como classes controladas ofensivas | `REJEITAR_GENERICO` |

Conclusao: sem nova classe. Atualizacao por atributo/evidencia e 1 relacao tecnico-tatica nova entre classes existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| especialista influencia tomada de decisao coletiva no ataque | SILVA-MENEZES-2018 | relação | `ADICIONAR_RELACAO` | `SpecialistRole` influences `AttackModel` | artigo descreve centralidade decisional do especialista na organizacao ofensiva |
| sistemas ofensivos 3:1, 2:2, 4:0 (e 3:0/2:1 em igualdade) | SILVA-MENEZES-2018 | atributo | `ADICIONAR_ATRIBUTO` | `OffensiveSystem` | detalha repertorio estrutural do ataque posicionado |
| meios taticos de cooperacao (engajamento, permuta, cruzamento) | SILVA-MENEZES-2018 | evidência | `ADICIONAR_EVIDENCIA` | `OffensiveCollaborationMean` / `SuccessiveEntrances` / `Crossing` | reforca bloco ja existente com terminologia de treinadores |
| gols de 2 pontos por giro/aerea orientam modelo ofensivo | SILVA-MENEZES-2018 | evidência | `ADICIONAR_EVIDENCIA` | `AttackModel` / `ShootingAction` | reforca prioridade de finalizacao de duplo valor |
| assimetria numerica como base estrutural | SILVA-MENEZES-2018 | evidência | `ADICIONAR_EVIDENCIA` | `NumericalAsymmetry` | confirma hierarquia ofensiva do dominio |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: **camada tecnico-tatica**, sub-bloco de ataque (`SpecialistRole` / `AttackModel`).

Atualizacao aprovada no diagrama:
- adicionar aresta `SpecialistRole` `influences` `AttackModel`.
