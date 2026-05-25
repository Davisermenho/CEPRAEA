---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Coaching a winning team.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Coaching a winning team

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Coaching a winning team.md` |
| Titulo | Coaching a winning team |
| Autor | Alexander Novakovic |
| Ano | nao informado |
| Tema principal | prevencao de lesoes, planejamento atletico anual e gestao de carga entre areia e indoor |
| Tipo de conteudo | `desempenho` + `carga` + `pedagogia` |
| Camada provavel | desempenho |
| Bloco provavel de atualizacao | `LoadMonitoringDomain` / `InternalLoad` / `ExternalLoad` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base do artigo:
- `Pagina 6/15`: plano atletico de longo prazo individual, transicao entre superficies e controle individual de carga.
- `Pagina 8/9`: ciclo anual com periodos de indoor, beach, transicao, pre-competitivo e regeneracao.
- `Pagina 10`: comunicacao obrigatoria entre comissao beach e clube indoor para decisao de nominacao/pausa.
- `Pagina 12`: mais regeneracao, melhor performance, menos lesoes; referencia de sono de 9h/noite.
- `Pagina 17-19`: periodo de transicao entre superficies e progressao especifica de carga (rotacao, saltos, contato corporal).

Candidatos:
1. `LongTermAthleticPlan`
2. `SurfaceTransitionPeriod` (beach <-> indoor)
3. `DualSurfaceLoadControl`
4. `Regeneration`
5. `SleepRecoveryTarget`
6. `CrossStaffCommunication` (beach/indoor)
7. `InjuryPrevention`
8. `SurfaceSpecificLoadProgression`

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `LoadMonitoringDomain` (dominio para carga) | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos) |
| `InternalLoad` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos) |
| `ExternalLoad` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos) |
| `LongTermAthleticPlan` | Nao como classe | tratar como atributo de `LoadMonitoringDomain` |
| `SurfaceTransitionPeriod` | Nao como classe | tratar como atributo de `LoadMonitoringDomain` |
| `Regeneration` | Nao como classe | tratar como atributo operacional de carga interna |
| `InjuryPrevention` | Nao como classe | `REJEITAR_GENERICO` (tema transversal, entra como evidencia) |

Conclusao: sem novas classes e sem novas relacoes obrigatorias para o grafo.
Atualizacao por atributos e evidencia no bloco de desempenho/carga.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| plano individual de longo prazo beach/indoor | NOVAKOVIC-SD (p.6, p.8, p.9) | atributo | `ADICIONAR_ATRIBUTO` | `LoadMonitoringDomain` | refinamento operacional do dominio de carga |
| periodo de transicao entre superficies | NOVAKOVIC-SD (p.6, p.17, p.19) | atributo | `ADICIONAR_ATRIBUTO` | `LoadMonitoringDomain` | requisito de protecao e adaptacao de carga |
| foco em controle individual de carga (dupla agenda) | NOVAKOVIC-SD (p.6, p.15) | atributo | `ADICIONAR_ATRIBUTO` | `ExternalLoad` | detalha risco de sobrecarga em atletas indoor+beach |
| comunicacao beach/indoor para decisao de pausa/nominacao | NOVAKOVIC-SD (p.10) | atributo | `ADICIONAR_ATRIBUTO` | `LoadMonitoringDomain` | componente operacional para prevencao de lesao |
| sono ~9h/noite para regeneracao | NOVAKOVIC-SD (p.12) | atributo | `ADICIONAR_ATRIBUTO` | `InternalLoad` | criterio de recuperacao associado ao controle de carga |
| progressao de carga por superficie (rotacao, saltos, contato) | NOVAKOVIC-SD (p.19) | atributo | `ADICIONAR_ATRIBUTO` | `ExternalLoad` | orienta progressao de demanda mecanica entre superficies |
| prevencao de lesao como objetivo macro | NOVAKOVIC-SD (p.6, p.12) | evidencia | `ADICIONAR_EVIDENCIA` | `LoadMonitoringDomain` | reforco de finalidade do monitoramento de carga |
| regeneracao como conceito isolado | NOVAKOVIC-SD (p.11, p.12) | classe (candidato) | `REJEITAR_GENERICO` | `InternalLoad` (atributo) | evitar inflar ontologia com classe transversal |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: `DESEMPENHO` -> `PlayerPerformanceDomain` -> `LoadMonitoringDomain`.

Decisao de atualizacao no Draw.io:
- **sem alteracao estrutural no SVG**;
- justificativa: a triagem gerou apenas enriquecimento de atributos/evidencias em conceitos existentes, sem criacao de classe/aresta nova.

