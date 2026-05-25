---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Goalkeeper behaviour Special Situations.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Goalkeeper behaviour Special Situations

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Goalkeeper behaviour Special Situations.md` |
| Titulo | Goalkeeper behaviour Special Situations |
| Autores | Ioannis Meimaridis; Johan Gomer; Martin Gomer |
| Ano | nao informado |
| Tema principal | situacoes especiais de arbitragem envolvendo goleiro: offensive foul, shoot-out, referee throw, provocacao e punicoes |
| Tipo de conteudo | `regra` + `tecnica` (arbitragem aplicada) |
| Camada provavel | normativa |
| Bloco provavel de atualizacao | `GoalkeeperRole` / `ShootOut` / `RefereeThrow` / `Punishment` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base legiveis:
- `Pagina 2 (Agenda)`: Offensive Foul, Shoot-out, Referee throw, Provocation, Punishments.
- `Paginas 3-30`: majoritariamente frames de video/placar com baixa legibilidade textual OCR.

Candidatos:
1. `GoalkeeperRole` em situacoes especiais
2. `ShootOut`
3. `RefereeThrow`
4. `Punishment`
5. `OffensiveFoul` (candidato de nome)
6. `Provocation` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` |
| `ShootOut` | Sim | `REJEITAR_DUPLICATA` |
| `RefereeThrow` | Sim | `REJEITAR_DUPLICATA` |
| `Punishment` | Sim | `REJEITAR_DUPLICATA` |
| `OffensiveFoul` | Nao como classe | `REJEITAR_GENERICO` (sem granularidade textual suficiente) |
| `Provocation` | Nao como classe | `REJEITAR_GENERICO` (sem granularidade textual suficiente) |

Conclusao: sem novas classes, sem novos atributos e sem novas relacoes com confianca semantica suficiente.
O material reforca conceitos normativos ja presentes, mas sem detalhamento textual confiavel para alterar o grafo.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| Special situations do goleiro | MEIMARIDIS-GOMER-GOMER-SD (p.2) | evidência | `ADICIONAR_EVIDENCIA` | `GoalkeeperRole` | reforca escopo operacional ja modelado |
| Shoot-out em casuistica arbitral | MEIMARIDIS-GOMER-GOMER-SD (p.2, p.10) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` | reforca uso normativo ja representado |
| Referee throw em casos especiais | MEIMARIDIS-GOMER-GOMER-SD (p.2, p.17) | evidência | `ADICIONAR_EVIDENCIA` | `RefereeThrow` | reforca reinicio normativo ja modelado |
| Punishments em casos especiais | MEIMARIDIS-GOMER-GOMER-SD (p.2, p.24) | evidência | `ADICIONAR_EVIDENCIA` | `Punishment` | reforca progressao disciplinar ja modelada |
| Offensive foul como classe isolada | MEIMARIDIS-GOMER-GOMER-SD (p.2) | classe (candidato) | `REJEITAR_GENERICO` | `Punishment` (evidência) | sem regra operacional textual legivel para nova classe |
| Provocation como classe isolada | MEIMARIDIS-GOMER-GOMER-SD (p.2) | classe (candidato) | `REJEITAR_GENERICO` | `Punishment` (evidência) | sem regra operacional textual legivel para nova classe |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo potencial: camada normativa (`GoalkeeperRole` / `ShootOut` / `RefereeThrow` / `Punishment`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: artigo com baixa legibilidade textual sem novas regras explicitaveis com confianca para classe/aresta/atributo.

