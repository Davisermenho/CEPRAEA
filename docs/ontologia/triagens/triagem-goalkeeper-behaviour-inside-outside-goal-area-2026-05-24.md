---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/Goalkeeper behaviour inside and outside the goal area-1.md
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontologica - Goalkeeper behaviour inside and outside the goal area

## Passo 1 - Identificacao da fonte

| Campo | Valor |
|---|---|
| Arquivo | `docs/ontologia/artigos/Goalkeeper behaviour inside and outside the goal area-1.md` |
| Titulo | Goalkeeper behaviour inside and outside the Goal Area |
| Autores | Jerome Rolland; Cedric Dare; Mathieu Fanack |
| Ano | nao informado |
| Tema principal | comportamento do goleiro dentro/fora da area de gol, shoot-out e punicoes associadas |
| Tipo de conteudo | `regra` + `tecnica` (arbitragem aplicada) |
| Camada provavel | normativa |
| Bloco provavel de atualizacao | `GoalkeeperRole` / `ShootOut` / `GoalkeeperThrow` / `SubstitutionArea` |

## Passo 2 - Conceitos candidatos extraidos

Trechos-base:
- `Pagina 5`: goleiro pode tocar a bola com qualquer parte do corpo na area de gol; fora da area valem regras de jogador de linha.
- `Pagina 6`: substituicao irregular/entrada ilegal gera suspensao; faltas graves de goleiro em situacoes de shoot-out podem gerar desqualificacao.
- `Paginas 17-22`: comportamento do goleiro fora da area no shoot-out (evitar contato = play on; colisao = 6m + desqualificacao).
- `Pagina 24`: especialista entrando sem camisa de goleiro correta pode configurar substituicao irregular.
- `Pagina 25`: goleiro nao pode sair da area com bola sob controle (gera tiro livre).
- `Pagina 26`: goleiro com mais de 3 segundos para executar passe/arremesso do goleiro configura execucao irregular.

Candidatos:
1. `GoalkeeperRole` (regras operacionais dentro/fora da area)
2. `ShootOut` (casuistica de contato/interceptacao)
3. `GoalkeeperThrow` (tempo maximo e restricoes de execucao)
4. `SubstitutionArea` (substituicao irregular e consequencia disciplinar)
5. `AthleteUniform` (camisa de goleiro/especialista)
6. `Punishment` / `PlayerSuspension` / `PlayerDisqualification` (criterios de aplicacao)

## Passo 3 - Verificacao de duplicidade com ontologia atual

| Conceito candidato | Existe no modelo atual? | Resultado |
|---|---|---|
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `ShootOut` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `GoalkeeperThrow` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |
| `SubstitutionArea` | Sim | `REJEITAR_DUPLICATA` (enriquecer e explicitar relacao disciplinar) |
| `AthleteUniform` | Sim | `REJEITAR_DUPLICATA` (evidencia adicional) |
| `Punishment` / `PlayerSuspension` / `PlayerDisqualification` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidencia) |

Conclusao: sem novas classes. Atualizacao por atributos/evidencia e 1 relacao normativa nova.

## Passo 4 - Classificacao e decisao

| Conceito extraido | Fonte | Classificacao | Decisao | Onde entra | Justificativa |
|---|---|---|---|---|---|
| goleiro pode tocar com qualquer parte do corpo na area | ROLLAND-DARE-FANACK-SD (p.5) | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | regra operacional central do papel |
| fora da area valem regras de jogador de linha | ROLLAND-DARE-FANACK-SD (p.5) | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` | delimita comportamento fora da area |
| goleiro nao pode sair com bola sob controle | ROLLAND-DARE-FANACK-SD (p.25) | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperRole` / `GoalkeeperThrow` | criterio de infracao operacional |
| tempo maximo de 3s no passe/arremesso do goleiro | ROLLAND-DARE-FANACK-SD (p.26) | atributo | `ADICIONAR_ATRIBUTO` | `GoalkeeperThrow` | regra de execucao objetiva |
| no shoot-out, evitar contato ao sair da area = play on | ROLLAND-DARE-FANACK-SD (p.17, p.20) | atributo | `ADICIONAR_ATRIBUTO` | `ShootOut` | casuistica normativa de arbitragem |
| no shoot-out, colisao fora da area = 6m + desqualificacao | ROLLAND-DARE-FANACK-SD (p.22) | evidência | `ADICIONAR_EVIDENCIA` | `ShootOut` / `Punishment` / `SixMetreThrow` | reforca relacao de punicao ja prevista |
| substituicao irregular/entrada ilegal = suspensao | ROLLAND-DARE-FANACK-SD (p.6, p.24) | relação | `ADICIONAR_RELACAO` | `SubstitutionArea` -> `PlayerSuspension` | consequencia disciplinar direta no contexto da area de substituicao |
| camisa de goleiro/especialista incorreta como gatilho de substituicao irregular | ROLLAND-DARE-FANACK-SD (p.24) | evidência | `ADICIONAR_EVIDENCIA` | `AthleteUniform` / `SubstitutionArea` | reforca vinculo uniforme x legalidade da entrada |

## Passo 5 - Atualizacao do Draw.io no bloco correto

Bloco alvo: **camada normativa**, sub-bloco `SubstitutionArea`/`Punishment`.

Atualizacao aprovada no diagrama:
- adicionar aresta `SubstitutionArea` `causes` `PlayerSuspension`.

