---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/The_structuring_of_the_defensive_phase_of_beach_handball.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - The structuring of the defensive phase of beach handball

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/The_structuring_of_the_defensive_phase_of_beach_handball.md` |
| Titulo | The structuring of the defensive phase of beach handball |
| Autores | Di Gilio, Joao Paulo Torres; Silva, Karen Pereira da; Menezes, Rafael Pombo |
| Ano | 2021 |
| Tema principal | elementos estruturantes da fase defensiva no handebol de praia por hierarquia (assimetria numerica, sistemas defensivos e acoes tecnico-taticas) |
| Tipo de conteudo | `tática-defensiva` + `análise-de-jogo` |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `DefensiveDomain` / `DefensiveSystem` / `DefensiveTechnicalTacticalAction` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Resumo e discussao`: a defesa se organiza hierarquicamente por `NumericalAsymmetry` -> `DefensiveSystem` -> `DefensiveTechnicalTacticalAction`.
- `Introducao/discussao`: modos de marcacao (zonal, man-to-man e combinado), com predominio de `Defense3_0` e uso de `Defense2_1`.
- `CSD3`: relevancia de acoes como bloqueio defensivo, cobertura, dissuasao, interceptacao e second defender.

Candidatos:
1. `NumericalAsymmetry`
2. `DefensiveDomain`
3. `DefensiveSystem`
4. `Defense3_0`
5. `Defense2_1`
6. `DefensiveTechnicalTacticalAction`
7. `ControlFromDistance`
8. `Siege`
9. `Dissuasion`
10. `Interception`
11. `SecondDefender`
12. `DefensiveMarkingModes` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `NumericalAsymmetry` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `DefensiveDomain` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `DefensiveSystem` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `Defense3_0` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `Defense2_1` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `DefensiveTechnicalTacticalAction` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `ControlFromDistance` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `Siege` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `Dissuasion` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `Interception` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `SecondDefender` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `DefensiveMarkingModes` | Nao como classe controlada | `REJEITAR_GENERICO` (converter em atributo de `DefensiveSystem`) |

Conclusao: sem nova classe/subclasse e sem nova relacao estrutural; atualizacao por atributo/evidencia.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| hierarquia defensiva (assimetria -> sistema -> acao tecnico-tatica) | GILIO-SILVA-MENEZES-2021 | evidência | `ADICIONAR_EVIDENCIA` | `NumericalAsymmetry` / `DefensiveDomain` / `DefensiveSystem` | reforca cadeia estrutural central do modelo defensivo |
| modos de marcacao (zonal, individual, combinado) | GILIO-SILVA-MENEZES-2021 | atributo | `ADICIONAR_ATRIBUTO` | `DefensiveSystem` | artigo explicita variacoes estruturais usadas por treinadores |
| predominio de `Defense3_0` e uso de `Defense2_1` conforme contexto | GILIO-SILVA-MENEZES-2021 | evidência | `ADICIONAR_EVIDENCIA` | `Defense3_0` / `Defense2_1` | sustenta escolhas taticas ja modeladas |
| sincronia temporal de acoes defensivas para dificultar finalizacao | GILIO-SILVA-MENEZES-2021 | atributo | `ADICIONAR_ATRIBUTO` | `DefensiveTechnicalTacticalAction` | reforca componente de timing e coordenacao coletiva |
| `ControlFromDistance`, `Siege`, `Dissuasion`, `Interception`, `SecondDefender` como meios recorrentes da acao defensiva | GILIO-SILVA-MENEZES-2021 | evidência | `ADICIONAR_EVIDENCIA` | classes existentes de acao defensiva | confirma tipologia tecnico-tatica ja consolidada no glossario/matriz |
| `DefensiveMarkingModes` | GILIO-SILVA-MENEZES-2021 | classe (candidato) | `REJEITAR_GENERICO` | atributo de `DefensiveSystem` | representa modalidade de organizacao, nao novo conceito estavel independente |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: **camada tecnico-tatica defensiva** (`DefensiveDomain`, `DefensiveSystem`, `DefensiveTechnicalTacticalAction`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: a triagem nao resultou em `ADICIONAR_CLASSE`, `ADICIONAR_SUBCLASSE` ou `ADICIONAR_RELACAO`; apenas enriquecimento por atributo/evidencia e rastreabilidade de fonte.
