---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Preparation of a national team on the way to a top event_0.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Preparation of a national team on the way to a top event

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Preparation of a national team on the way to a top event_0.md` |
| Titulo | Preparation of a National Team |
| Autores | Hinson, Michael |
| Ano | nao informado |
| Tema principal | preparacao de equipe nacional para evento-alvo: scout da propria equipe e do adversario, gameplan e pratica |
| Tipo de conteudo | `manual` / coaching aplicado |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `OffensiveSystem` / `AttackModel` / `ShootingAction` / `ShootOut` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Paginas 4-5`: analisar tendencias de finalizacao, eficiencia por formacao ofensiva e forcas/franquezas da equipe.
- `Pagina 11`: scout do adversario (formacoes ofensivas/defensivas; agressividade; bloqueio; preferencia de goleiros no shoot-out).
- `Paginas 16, 18, 19`: top 3 opcoes ofensivas do adversario (right wing spin, left wing specialist, pivot in-flight).
- `Paginas 20-22`: gameplan ofensivo orientado por shot de maior percentual (pivô) e identificacao de defensores altos/agressivos.

Candidatos:
1. `OffensiveSystem`
2. `AttackModel`
3. `ShootingAction` / `SpinThrow` / `AerialThrow`
4. `ShootOut`
5. `PivotRole` / `WingRole` / `SpecialistRole`
6. `TeamScouting` (candidato de nome)
7. `OpponentScouting` (candidato de nome)
8. `GamePlan` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `OffensiveSystem` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `AttackModel` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `ShootingAction` / `SpinThrow` / `AerialThrow` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `ShootOut` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `PivotRole` / `WingRole` / `SpecialistRole` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `TeamScouting` / `OpponentScouting` / `GamePlan` | Nao como classe controlada | `REJEITAR_GENERICO` (metodologia de preparo, nao entidade nuclear do jogo) |

Conclusao: sem nova classe e sem nova relacao obrigatoria com confianca semantica suficiente.
Atualizacao por atributos/evidencia em conceitos existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| eficiencia por formacao ofensiva para escolha de plano | HINSON-SD (p.4, p.9) | atributo | `ADICIONAR_ATRIBUTO` | `OffensiveSystem` | operacionaliza avaliacao de formacoes para tomada de decisao |
| ajuste por lado de substituicao nas formacoes | HINSON-SD (p.11, p.12) | atributo | `ADICIONAR_ATRIBUTO` | `OffensiveSystem` | influencia organizacao ofensiva dependente do lado |
| mapear tendencias do arremessador por local/tecnica | HINSON-SD (p.5, p.7, p.13) | atributo | `ADICIONAR_ATRIBUTO` | `ShootingAction` | adiciona criterio analitico de preparacao de finalizacoes |
| priorizacao das top 3 opcoes de finalizacao no plano | HINSON-SD (p.15, p.16, p.20) | atributo | `ADICIONAR_ATRIBUTO` | `AttackModel` | refina modelo ofensivo baseado em opcoes preferenciais |
| preferencia de goleiro no shoot-out (sair/manter) | HINSON-SD (p.11, p.26) | atributo | `ADICIONAR_ATRIBUTO` | `ShootOut` | criterio de leitura adversaria para decisao no desempate |
| right wing spin / pivot in-flight / left wing specialist | HINSON-SD (p.16, p.18, p.19) | evidência | `ADICIONAR_EVIDENCIA` | `WingRole` / `PivotRole` / `SpecialistRole` | reforca perfis de finalizacao e centralidade por posto |
| TeamScouting / OpponentScouting / GamePlan | HINSON-SD | classe (candidato) | `REJEITAR_GENERICO` | observacao de processo de treino | metodologia de preparacao transversal sem fronteira ontologica estabilizada no modelo atual |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo potencial: camada tecnico-tatica (`OffensiveSystem`, `AttackModel`, `ShootingAction`, `ShootOut`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: triagem aprovou enriquecimento de atributos/evidencias sem nova aresta obrigatoria.
