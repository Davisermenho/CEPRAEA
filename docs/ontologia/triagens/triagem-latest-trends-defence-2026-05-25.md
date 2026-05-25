---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Latest trends in defence.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Latest trends in defence

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Latest trends in defence.md` |
| Titulo | Latest Trends in Defence |
| Autores | Andersen, Gorm |
| Ano | nao informado |
| Tema principal | criterios de selecao defensiva, estilos de defesa e regras operacionais para transicao/pressao |
| Tipo de conteudo | `tecnica` + `tatico` (coaching aplicado) |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `DefensiveSystem` / `Defense2_1` / `DefensiveTechnicalTacticalAction` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Pagina 6`: selecao de jogadores para defesa (alto, rapido, lider, experiencia, teamwork), incluindo requisito de um atleta apto a atuar como goleiro no shoot-out.
- `Pagina 8`: estilos de defesa (reativa/proativa) e variacao do 2-1 (meio ou lateral).
- `Paginas 10-13`: opcoes/regras em defesa: ocupar espaco, bloquear do centro, fair play e seguranca, pressionar fora ou bloquear, e bloquear o pivô para reduzir risco de fast break.

Candidatos:
1. `DefensiveSystem` (estilo e criterios de selecao)
2. `Defense2_1` (variacao posicional no meio ou lateral)
3. `DefensiveTechnicalTacticalAction` (prioridade de controle de espaco e decisao pressao/bloqueio)
4. `ShootOut` / `GoalkeeperRole` (evidencia de preparacao funcional no elenco defensivo)
5. `ReactiveDefense` (candidato de nome)
6. `ProactiveDefense` (candidato de nome)
7. `FairPlayInDefense` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `DefensiveSystem` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `Defense2_1` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `DefensiveTechnicalTacticalAction` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `ShootOut` / `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (adicionar evidência) |
| `ReactiveDefense` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `ProactiveDefense` | Nao como classe controlada | `REJEITAR_GENERICO` |
| `FairPlayInDefense` | Nao como classe controlada | `REJEITAR_GENERICO` |

Conclusao: sem nova classe e sem nova relacao obrigatoria com confianca semantica suficiente.
Atualizacao por atributos/evidencia em classes ja existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| selecao defensiva (alto, rapido, lider, experiencia, teamwork, leitura de bola) | ANDERSEN-SD (p.6) | atributo | `ADICIONAR_ATRIBUTO` | `DefensiveSystem` | define criterio operacional de composicao do sistema |
| estilo reativo/proativo | ANDERSEN-SD (p.8) | atributo | `ADICIONAR_ATRIBUTO` | `DefensiveSystem` | caracteriza orientacao tatico-comportamental da defesa |
| variacao do 2-1 no meio ou lateral | ANDERSEN-SD (p.8) | atributo | `ADICIONAR_ATRIBUTO` | `Defense2_1` | detalha ajuste posicional do sistema 2-1 |
| ocupar espaco e bloquear do centro | ANDERSEN-SD (p.10) | atributo | `ADICIONAR_ATRIBUTO` | `DefensiveTechnicalTacticalAction` | padrao de execucao recorrente nas acoes defensivas |
| pressao fora ou bloqueio + fair play/seguranca | ANDERSEN-SD (p.11) | evidência | `ADICIONAR_EVIDENCIA` | `DefensiveTechnicalTacticalAction` | reforca criterio de decisao e limite comportamental da acao |
| um defensor apto a ser goleiro no shoot-out | ANDERSEN-SD (p.6) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` / `GoalkeeperRole` | reforca preparacao funcional para situacoes especiais |
| ReactiveDefense / ProactiveDefense / FairPlayInDefense | ANDERSEN-SD (p.8, p.11) | classe (candidato) | `REJEITAR_GENERICO` | atributos em classes existentes | termos descritivos sem fronteira conceitual estavel para nova classe |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: **camada tecnico-tatica** (`DefensiveSystem` / `Defense2_1` / `DefensiveTechnicalTacticalAction`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: triagem resultou em enriquecimento de atributos/evidencia sem relacao nova obrigatoria para aresta.
