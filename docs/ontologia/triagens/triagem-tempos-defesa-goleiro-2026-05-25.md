---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Tempos_de_defesa_do_goleiro_de_handebol_de_praia.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Tempos de defesa do goleiro de handebol de praia

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Tempos_de_defesa_do_goleiro_de_handebol_de_praia.md` |
| Titulo | Tempos de defesa do goleiro de handebol de praia |
| Autores | Torres, Jaime Souza; Caporal, Guilherme Cortoni; Nicolini, Daniela Cardoso; Uezu, Rudney |
| Ano | 2022 |
| Tema principal | diretriz de treinamento do goleiro no handebol de praia baseada em estagios de defesa (T1-T4) e estimulos sensorio-motores |
| Tipo de conteudo | `tática-defensiva` + `técnica` + `desempenho` |
| Camada provavel | tecnico-tatica |
| Bloco provavel de atualizacao | `GoalkeeperRole` / `CounterAttack` / `DefensiveTechnicalTacticalAction` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `p.4-6`: proposta de quatro tempos da acao do goleiro (T1 observacao pre-arremesso; T2 posicionamento; T3 reacao; T4 organizacao ofensiva apos defesa/gol).
- `p.3`: goleiro como ultimo defensor e primeiro atacante, com iniciacao de contra-ataques.
- `p.5-6`: decisoes no T4 (lancamento direto ao gol, lancamento de contra-ataque, saida sustentada, passe de reposicao).

Candidatos:
1. `GoalkeeperRole`
2. `CounterAttack`
3. `DefensiveTechnicalTacticalAction`
4. `GoalkeeperDefenseStagesModel` (candidato de nome para T1-T4)
5. `PreShotObservation` (candidato de nome para T1)
6. `GoalkeeperPositioningWindow` (candidato de nome para T2)
7. `GoalkeeperReactionWindow` (candidato de nome para T3)
8. `PostDefenseOffensiveOrganization` (candidato de nome para T4)
9. `SensoryMotorStimulusTraining` (candidato de nome)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `CounterAttack` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributo/evidencia) |
| `DefensiveTechnicalTacticalAction` | Sim | `REJEITAR_DUPLICATA` (enriquecer evidencia) |
| `GoalkeeperDefenseStagesModel` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo em `GoalkeeperRole`) |
| `PreShotObservation` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo em `GoalkeeperRole`) |
| `GoalkeeperPositioningWindow` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo em `GoalkeeperRole`) |
| `GoalkeeperReactionWindow` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo em `GoalkeeperRole`) |
| `PostDefenseOffensiveOrganization` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo em `CounterAttack`) |
| `SensoryMotorStimulusTraining` | Nao como classe controlada | `REJEITAR_GENERICO` (usar atributo/evidencia em `GoalkeeperRole`) |

Conclusao: sem nova classe/subclasse. Enriquecimento por atributo/evidencia em conceitos existentes.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| modelo de estagios de defesa do goleiro (T1-T4) | TORRES-2022 | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | proposta central do artigo e reutilizavel como referencia de treino/analise |
| foco de observacao pre-arremesso (trajetoria do atacante, leitura de contexto) | TORRES-2022 | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | detalha variaveis perceptivas do T1 |
| janela de posicionamento no instante de soltura da bola | TORRES-2022 | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | detalha demandas do T2 com baixa latencia de decisao |
| janela de reacao apos arremesso com leitura de trajetoria e bloqueio | TORRES-2022 | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | detalha T3 e o acoplamento percepcao-acao |
| decisoes ofensivas apos defesa/gol (lancamento direto, contra-ataque, saida sustentada, passe simples) | TORRES-2022 | atributo | `ADICIONAR_ATRIBUTO` | `CounterAttack` | detalha repertorio funcional do T4 na transicao |
| necessidade de estimulos sensorio-motores e visuais especificos | TORRES-2022 | evidência | `ADICIONAR_EVIDENCIA` | `GoalkeeperRole` / `DefensiveTechnicalTacticalAction` | reforca diretriz de treinamento orientada por tomada de decisao em contexto real |
| goleiro como ultimo defensor e primeiro atacante | TORRES-2022 | evidência | `ADICIONAR_EVIDENCIA` | `GoalkeeperRole` / `CounterAttack` | confirma papel duplo do goleiro ja modelado no glossario |
| `GoalkeeperDefenseStagesModel`, `PreShotObservation`, `GoalkeeperPositioningWindow`, `GoalkeeperReactionWindow`, `PostDefenseOffensiveOrganization`, `SensoryMotorStimulusTraining` | TORRES-2022 | classe (candidato) | `REJEITAR_GENERICO` | atributos em classes existentes | conceitos descritivos/metodologicos; nao exigem nova classe controlada no modelo atual |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo da triagem: **tecnico-tatica** (`GoalkeeperRole` e `CounterAttack`).

Decisao de atualizacao:
- **sem alteracao estrutural no Draw.io**.
- Justificativa: triagem nao gerou `ADICIONAR_CLASSE`, `ADICIONAR_SUBCLASSE` ou `ADICIONAR_RELACAO`; apenas enriquecimento de atributos/evidencias.
