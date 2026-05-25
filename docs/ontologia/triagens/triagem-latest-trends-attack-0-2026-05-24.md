---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Latest trends in attack_0.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Latest trends in attack_0

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Latest trends in attack_0.md` |
| Titulo | Latest trends in attack (How Croatia's men's team attacks: a coach's perspective) |
| Autores | Paradzik, Mladen |
| Ano | nao informado |
| Tema principal | tendencias de ataque, tomada de decisao e gatilhos de contra-ataque em alto rendimento |
| Tipo de conteudo | `tecnica` + `tatico` (coaching aplicado) |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `CounterAttack` / `Interception` / `AttackModel` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Pagina 15`: treino com limite de 4-5 passes; decisao sob pressao de jogo passivo; acoes predeterminadas para interromper sequencia negativa.
- `Pagina 18`: priorizar fast breaks "from any position"; goleiro atuando como assistente.
- `Pagina 19`: fast break apos offensive foul, interception e throw-in.

Candidatos:
1. `CounterAttack` (prioridade de execucao e gatilhos)
2. `Interception` (gatilho direto para contra-ataque)
3. `GoalkeeperRole` no apoio ao contra-ataque
4. `AttackModel` (planos predeterminados de contingencia)
5. `PlaymakerPosition` (candidato de nome)
6. `Versatility` (candidato de nome)
7. `Commitment`/`Communication` (candidatos genericos)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `CounterAttack` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `Interception` | Sim | `REJEITAR_DUPLICATA` (adicionar relacao tatico-operacional) |
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `AttackModel` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `PlaymakerPosition` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `Versatility` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `Commitment`/`Communication` | Nao como classe controlada | `REJEITAR_GENERICO` |

Conclusao: sem nova classe. Atualizacao por atributos/evidencia e uma relacao entre classes ja existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| fast break como prioridade ofensiva | PARADZIK-SD (p.18) | atributo | `ADICIONAR_ATRIBUTO` | `CounterAttack` | detalha intencao operacional da transicao |
| fast break apos intercepcao | PARADZIK-SD (p.19) | relação | `ADICIONAR_RELACAO` | `Interception` enables `CounterAttack` | gatilho tatico direto e reutilizavel |
| goleiro como assistente no fast break | PARADZIK-SD (p.18) | evidência | `ADICIONAR_EVIDENCIA` | `CounterAttack` / `GoalkeeperRole` | reforca participacao ofensiva do goleiro sem nova classe |
| pressao de jogo passivo no treino decisional | PARADZIK-SD (p.15) | evidência | `ADICIONAR_EVIDENCIA` | `PassivePlay` / `AttackPhase` | confirma impacto da restricao temporal na decisao ofensiva |
| acoes predeterminadas quando criatividade falha | PARADZIK-SD (p.15) | evidência | `ADICIONAR_EVIDENCIA` | `AttackModel` | reforca existencia de padroes taticos de contingencia |
| playmaker position | PARADZIK-SD (p.11) | classe (candidato) | `REJEITAR_GENERICO` | `AttackModel` (nota) | recorte funcional sem definicao ontologica estavel no material |
| versatility / commitment / communication | PARADZIK-SD (p.12, p.24) | atributo (candidato) | `REJEITAR_GENERICO` | observacao de coaching | termos amplos sem criterio operacional claro para o grafo |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: **camada tecnico-tatica**, conexao entre `DefensiveTechnicalTacticalAction` e `GamePhase`.

Atualizacao aprovada no diagrama:
- adicionar aresta `Interception` `enables` `CounterAttack`.
