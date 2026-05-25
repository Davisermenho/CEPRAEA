---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Temas_emergentes_no_handebol_e_no_handebol_de_praia.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Temas emergentes no handebol e no handebol de praia

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Temas_emergentes_no_handebol_e_no_handebol_de_praia.md` |
| Titulo | Temas emergentes no handebol e no handebol de praia |
| Autores | Verginelli, Carla Abrahao |
| Ano | 2025 |
| Tema principal | revisao de escopo sobre handebol de praia + analise observacional de shoot-out + analise documental de iniciacao esportiva |
| Tipo de conteudo | `desempenho` + `carga` + `analise-de-jogo` + `pedagogia` |
| Camada provavel | desempenho + normativa + tecnico-tatica |
| Bloco provavel de atualizacao | `LoadMonitoringDomain` / `PlayerPerformanceDomain` / `ShootOut` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Cap. 1 (p.25-41)`: consolidacao de estudos sobre carga interna/externa, tecnica/tatica, desempenho, lesoes, psicologia e arbitragem.
- `Cap. 2 (p.53-63)`: dinamica do `ShootOut`; 24,6% das partidas decididas no terceiro periodo; predominio do `SpinThrow` (80,3%) e conversao de gol (68,9%).
- `Cap. 3 (p.66-78)`: conteudos socioeducativos no mini-handebol e mini-handebol de praia; lacunas de acompanhamento pedagogico.

Candidatos:
1. `LoadMonitoringDomain`
2. `InternalLoad`
3. `ExternalLoad`
4. `PlayerPerformanceDomain`
5. `ShootOut`
6. `SpinThrow`
7. `GoldenGoal`
8. `GoalkeeperRole`
9. `SocioEducationalContent` (candidato de nome)
10. `MiniHandballInitiationProgram` (candidato de nome)
11. `InjuryRiskAssessment` (candidato de nome)
12. `SportPsychologyProfile` (candidato de nome)
13. `RefereePerformanceAnalysis` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `LoadMonitoringDomain` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `InternalLoad` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `ExternalLoad` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `PlayerPerformanceDomain` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `ShootOut` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `SpinThrow` | Sim | `REJEITAR_DUPLICATA` (adicionar evidencia) |
| `GoldenGoal` | Sim | `REJEITAR_DUPLICATA` (adicionar evidencia) |
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (adicionar evidencia) |
| `SocioEducationalContent` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `MiniHandballInitiationProgram` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `InjuryRiskAssessment` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `SportPsychologyProfile` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `RefereePerformanceAnalysis` | Nao como classe controlada | `REJEITAR_GENERICO` |

Conclusao: sem nova classe/subclasse e sem nova relacao obrigatoria. Atualizacao por atributo/evidencia em conceitos existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| monitoramento integrado de carga com indicadores tecnico-taticos por fase | VERGINELLI-2025 (cap.1) | atributo | `ADICIONAR_ATRIBUTO` | `LoadMonitoringDomain` | revisao mostra necessidade de integrar demanda fisica com contexto de jogo |
| variaveis usuais de carga interna (FC, SHRZ, PSE/CR10) | VERGINELLI-2025 (cap.1) | atributo | `ADICIONAR_ATRIBUTO` | `InternalLoad` | consolida pratica recorrente nos estudos de carga |
| variaveis usuais de carga externa (distancia, velocidade, aceleracao, desaceleracao, mudancas de direcao, saltos) | VERGINELLI-2025 (cap.1) | atributo | `ADICIONAR_ATRIBUTO` | `ExternalLoad` | consolida e amplia a lista operacional de monitoramento externo |
| mapa de lacunas prioritarias de pesquisa (psicologia, lesoes, pedagogia, jovens, arbitragem) | VERGINELLI-2025 (cap.1) | evidência | `ADICIONAR_EVIDENCIA` | `PlayerPerformanceDomain` | delimita fronteiras de evolucao do dominio de desempenho |
| frequencia de jogos decididos em shoot-out (24,6%) | VERGINELLI-2025 (cap.2) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` | reforca relevancia competitiva do terceiro periodo |
| predominio de `SpinThrow` no shoot-out (80,3%) | VERGINELLI-2025 (cap.2) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` / `SpinThrow` | evidencia de tendencia tecnico-tatica em competicao oficial |
| taxa de conversao no shoot-out (68,9%) | VERGINELLI-2025 (cap.2) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` | indicador observacional de eficiencia ofensiva no desempate |
| estrategia de saida defensiva frequente (67,8%) com eficiencia limitada (30,5%) | VERGINELLI-2025 (cap.2) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` / `GoalkeeperRole` | evidencia aplicada para leitura de tendencia defensiva sem criar nova classe |
| relacao temporal `GoldenGoal` -> `ShootOut` | VERGINELLI-2025 (cap.2) | relação | `ADICIONAR_EVIDENCIA` | `GoldenGoal precedes ShootOut` | relacao ja formalizada no modelo e reforcada pela fonte |
| dependencia do shoot-out em goleiro | VERGINELLI-2025 (cap.2) | relação | `ADICIONAR_EVIDENCIA` | `ShootOut requires GoalkeeperRole` | relacao existente confirmada no protocolo observacional |
| `SocioEducationalContent`, `MiniHandballInitiationProgram`, `InjuryRiskAssessment`, `SportPsychologyProfile`, `RefereePerformanceAnalysis` | VERGINELLI-2025 (cap.1 e cap.3) | classe (candidato) | `REJEITAR_GENERICO` | manter como evidencias/lacunas no dominio atual | conceitos amplos e transversais; sem fronteira ontologica estavel no modelo atual |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo da triagem: **desempenho** (`LoadMonitoringDomain`, `PlayerPerformanceDomain`) e **normativa** (`ShootOut`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: nao houve `ADICIONAR_CLASSE`, `ADICIONAR_SUBCLASSE` ou `ADICIONAR_RELACAO`; houve somente enriquecimento de atributos/evidencias e rastreabilidade de fonte.
