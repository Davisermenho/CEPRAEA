---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/lidos/2-point goals (spin and in-flight shots)-min.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - 2-point goals (spin and in-flight shots)-min (lidos)

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/lidos/2-point goals (spin and in-flight shots)-min.md` |
| Titulo | 2-point Goals, Spin and In-flight Shots |
| Autores | Agnieszka Skowronek; Sylwia Bartkowiak; Weronika Lakomy |
| Ano | 2023 |
| Tema principal | criterios de gol de 2 pontos e execucao tecnica de spin/in-flight |
| Tipo de conteudo | `regra` + `tecnica` + `tatica-ofensiva` |
| Camada provavel | normativa + tecnico-tatica |
| Bloco provavel | `TwoPointGoal` / `ShootingAction` / `ThrowType` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base do artigo:
- `Pagina 10`: 2 pontos para `spin`, `in-flight`, gol de `goalkeeper/specialist` e `6m throw`.
- `Pagina 12`: `Spin shot` correto exige giro completo (360 graus).
- `Pagina 37`: `In-flight` de 2 pontos exige controle da bola e finalizacao no ar; slap/push vale 1 ponto.
- `Pagina 45`: `6-metre throw` convertido vale 2 pontos.
- `Pagina 49`: gol de goleiro e especialista vale 2 pontos; camisa distinta.

Conceitos candidatos:
1. `TwoPointGoal`
2. `SpinThrow`
3. `AerialThrow` (in-flight)
4. `SixMetreThrow`
5. `GoalkeeperRole`
6. `SpecialistRole`
7. criterios tecnicos de completude de `SpinThrow`
8. criterios tecnicos de validacao de `AerialThrow`
9. regra operacional de valor 1 ponto para slap/push no in-flight

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `TwoPointGoal` | Sim | `REJEITAR_DUPLICATA` |
| `SpinThrow` | Sim | `REJEITAR_DUPLICATA` |
| `AerialThrow` | Sim | `REJEITAR_DUPLICATA` |
| `SixMetreThrow` | Sim | `REJEITAR_DUPLICATA` |
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` |
| `SpecialistRole` | Sim | `REJEITAR_DUPLICATA` |
| criterios tecnicos (360, controle no ar, slap/push=1) | Sim (como atributos) | `REJEITAR_DUPLICATA` |

Conclusao: sem novas classes, sem novas relacoes e sem novos atributos.
O artigo em `artigos/lidos` confirma entradas ja incorporadas previamente com fonte `SKOWRONEK-2023`.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| 2 pontos para spin shot | SKOWRONEK-2023 (p.10) | evidencia | `ADICIONAR_EVIDENCIA` | `TwoPointGoal` | regra ja modelada e rastreada |
| 2 pontos para in-flight | SKOWRONEK-2023 (p.10, p.37) | evidencia | `ADICIONAR_EVIDENCIA` | `TwoPointGoal` | regra ja modelada e rastreada |
| 2 pontos para gol de goleiro | SKOWRONEK-2023 (p.10, p.49) | evidencia | `ADICIONAR_EVIDENCIA` | `GoalkeeperRole` / `TwoPointGoal` | relacao ja presente |
| 2 pontos para gol de especialista | SKOWRONEK-2023 (p.10, p.49) | evidencia | `ADICIONAR_EVIDENCIA` | `SpecialistRole` / `TwoPointGoal` | relacao ja presente |
| Spin completo (360 graus) | SKOWRONEK-2023 (p.12) | atributo | `ADICIONAR_ATRIBUTO` | `SpinThrow` | atributo ja presente |
| In-flight exige controle e finalizacao no ar | SKOWRONEK-2023 (p.37) | atributo | `ADICIONAR_ATRIBUTO` | `AerialThrow` | atributo ja presente |
| Slap/push no in-flight vale 1 ponto | SKOWRONEK-2023 (p.37) | atributo | `ADICIONAR_ATRIBUTO` | `AerialThrow` | atributo ja presente |
| 6m convertido vale 2 pontos | SKOWRONEK-2023 (p.45) | evidencia | `ADICIONAR_EVIDENCIA` | `SixMetreThrow` | relacao ja presente |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: `ShootingAction` (tecnico-tatica) com conexoes normativas em `TwoPointGoal`.

Decisao de atualizacao:
- **sem alteracao no Draw.io**;
- justificativa: as arestas e conceitos ja estao representados no diagrama atual:
  - `TwoPointGoal -> SpinThrow`
  - `TwoPointGoal -> AerialThrow`
  - `TwoPointGoal -> GoalkeeperRole`
  - `TwoPointGoal -> SpecialistRole`
  - `SixMetreThrow -> TwoPointGoal`

