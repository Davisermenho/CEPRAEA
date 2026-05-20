# Matriz de Compatibilidade — COLETA_AO_VIVO

## Objetivo

Este arquivo e o espelho versionado no repositório da matriz canonica de compatibilidade da `COLETA_AO_VIVO`.

Papel deste documento:

- espelhar a pagina editorial do Notion;
- registrar a regra semantica em formato revisavel por Git;
- apontar qual contrato executavel deve ser atualizado junto com a documentacao;
- servir de ponte entre Notion, codebook, UI, RPC e testes.

Arquivos correlatos:

- `src/features/scout/domain/liveCollectionCompatibility.matrix.ts`
- `src/features/scout/domain/liveCollectionCompatibility.matrix.test.ts`
- `src/features/scout/domain/liveCollectionFlow.contract.ts`
- `src/features/scout/domain/liveCollectionFlow.contract.test.ts`
- `e2e/scout/scout-matriz-compat.spec.ts`
- `e2e/scout/scout-category-filter.spec.ts`
- `e2e/scout/scout-cepr0090-piloto-regressions.spec.ts`
- `supabase/tests/scout_ssot_audit.test.sql`
- `supabase/tests/scout_cepr0090_semantics.test.sql`

## Fontes de autoridade

Ordem de leitura para este contrato:

1. Manual Oficial do Scout v1.0.1
2. `Tabela_Mestre_dos_Campos.xlsx`
3. `Scout — SSOT Semantica`
4. `Scout — Matriz de Rastreabilidade`
5. `Matriz Canonica de Compatibilidade — COLETA_AO_VIVO` no Notion
6. implementacao validada em UI, migrations, RPC e testes

Regra:

- Notion e a fonte editorial canonica.
- Repo e a fonte executavel canonica.
- Divergencia entre os dois e `BLOCKER`.

## Escopo

Esta matriz governa apenas a `COLETA_AO_VIVO`.

Ela cobre:

- `FASE_DA_BOLA`
- `CATEGORIA_ACAO`
- `ACAO_BASICA`
- `CLASSIFICACAO_ACAO`
- `RESULTADO_FACTUAL`
- campos condicionais de finalizacao e pontuacao
- campos de estrutura de transicao e acao preparatoria
- invariantes de persistencia

Contrato operacional complementar:

- `liveCollectionCompatibility.matrix.ts` continua sendo o contrato executavel semantico.
- `liveCollectionFlow.contract.ts` e o contrato operacional executavel da tela para fluxos explicitamente cobertos.
- Em 2026-05-20, o contrato operacional cobre somente:
  - `AT_POS.ARREMESSO.ARREMESSO`
  - `AT_POS.ARREMESSO.FINALIZACAO_6M_FAV`
  - `TRANS_OF.ARREMESSO.ARREMESSO`
- A UI da `COLETA_AO_VIVO` ja consome `mainFields`, `optionalFields`, `advancedFields` e `uiOrder` desses 3 fluxos.
- Nao expandir para `DEF_POS.BLOQUEIO` antes de estabilizar e testar `requiredFields`.

Ela nao cobre:

- `COLETA_SCOUT` completa
- `PARTICIPACOES`
- eventos mentais
- relatorio e feedback completos
- analise relacional completa das quatro atletas

## Regras globais

1. A UI nao deve mostrar lista global de `RESULTADO_FACTUAL`.
2. O filtro principal e `FASE_DA_BOLA -> CATEGORIA_ACAO -> ACAO_BASICA -> CLASSIFICACAO_ACAO -> RESULTADO_FACTUAL`.
3. Ao trocar fase, categoria ou acao basica, qualquer valor incompatavel deve ser limpo.
4. `TIPO_FINALIZACAO`, `MOTIVO_PONTUACAO` e `PONTOS_JOGADA` sao campos condicionais, nunca globais.
5. Em defesa, `GOL` deve ser apresentado como "Gol sofrido" na UX.
6. `COLETA_AO_VIVO` cria somente `scout_live_entries`.
7. `COLETA_AO_VIVO` nao cria `scout_plays`.
8. `COLETA_AO_VIVO` nao cria `scout_play_participations`.
9. Resultados permitidos podem variar por classificacao — ver `allowedResultsByClassification` na implementacao.

## Categorias permitidas por fase

| Fase | Categorias permitidas | Categorias proibidas |
|---|---|---|
| `AT_POS` | `PASSE`, `ARREMESSO`, `NAO_OBSERVADO` | `ACAO_DEFENSIVA`, `TROCA_TRANSICAO` |
| `DEF_POS` | `ACAO_DEFENSIVA`, `NAO_OBSERVADO` | `PASSE`, `ARREMESSO`, `TROCA_TRANSICAO` |
| `TRANS_OF` | `PASSE`, `ARREMESSO`, `TROCA_TRANSICAO`, `NAO_OBSERVADO` | `ACAO_DEFENSIVA` |
| `TRANS_DEF` | `ACAO_DEFENSIVA`, `TROCA_TRANSICAO`, `NAO_OBSERVADO` | `PASSE`, `ARREMESSO` |

## Sistema tatico por fase

| Fase | Campo | Regra |
|---|---|---|
| `AT_POS` | `sistemaOfensivoCode` | obrigatorio; nao mostrar `NAO_APLICA` |
| `DEF_POS` | `sistemaDefensivoCode` | obrigatorio |
| `TRANS_OF` | n/a | nao exigir sistema estabilizado |
| `TRANS_DEF` | n/a | nao exigir sistema estabilizado |

## Matriz principal

### `AT_POS` + `PASSE`

- Categoria: `PASSE`
- Acao basica: `PASSE`
- Classificacoes permitidas:
  - `PASSE_APOIADO`
  - `PASSE_SUSPENSO`
  - `PASSE_PARA_GIRO`
  - `PASSE_PARA_AEREA`
  - `PASSE_PARA_ARREMESSO_SIMPLES`
  - `PASSE_SEGURANCA`
  - `PASSE_APOIO`
- Classificacoes proibidas neste slice:
  - `PASSE_LONGO`
- Resultados permitidos:
  - `ERRO_PASSE`
  - `PASSE_INTERCEPTADO`
  - `PERDA`
  - `VIOLACAO`
  - `PASSIVO`
  - `FALTA_ATAQUE`
  - `NAO_OBSERVADO`
- Resultados proibidos:
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
  - `RECUPERACAO_POSSE`
- Campos proibidos:
  - `tipoFinalizacaoCode`
  - `motivoPontuacaoCode`
  - `pontosJogada`

### `AT_POS` + `ARREMESSO`

- Categoria: `ARREMESSO`
- Acoes basicas:
  - `ARREMESSO`
  - `FINALIZACAO_6M_FAV` — cobrança de 6m favorável
- Classificacoes permitidas:
  - `GIRO`
  - `AEREA`
  - `ARREM_SIMPLES`
- Classificacoes proibidas em `AT_POS`:
  - `FINALIZ_CONTRA` (label: Transição direta — válido apenas em TRANS_OF) — **[LEGADO]**
  - `FINALIZ_TRANS` (label: Transição indireta — válido apenas em TRANS_OF) — **[LEGADO]**
  - `AEREA_TRANS` (label: Aérea na transição — válido apenas em TRANS_OF) — **[LEGADO]**
  - `ESPECIALISTA`
  - `GOLEIRA`
  - `6M`
  - `SHOOTOUT`
  - `GOL_CONTRA`
- Resultados permitidos:
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
  - `VIOLACAO`
  - `PASSIVO`
  - `NAO_OBSERVADO`
- Resultados proibidos:
  - `ERRO_PASSE`
  - `PASSE_INTERCEPTADO`
  - `RECUPERACAO_POSSE`
- Regras de finalizacao:
  - `TIPO_FINALIZACAO` nao deve duplicar a classificacao quando houver derivacao segura.
  - `GIRO -> GIRO`
  - `AEREA -> AEREA`
  - `ARREM_SIMPLES -> SIMPLES`
  - `FINALIZACAO_6M_FAV -> 6M`
- Regras de pontuacao:
  - `SIMPLES -> 1`
  - `GOL_CONTRA -> 1`
  - `6M -> 2` (somente na ação específica `FINALIZACAO_6M_FAV`)
  - `GOLEIRA -> 2`
  - `ESPECIALISTA -> 2`
  - `GIRO -> 1 ou 2`
  - `AEREA -> 1 ou 2`
- Restrição de consistência:
  - se a classificação for `ARREM_SIMPLES`, não exibir motivo `GIRO`, `AEREA` ou `6M`;
  - se o ataque entrou em jogo passivo e a posse foi interrompida pela regra, usar `resultado_factual_code = PASSIVO`;
  - se ainda houve arremesso, passivo é contexto do lance, não resultado factual.

UX esperada na `COLETA_AO_VIVO` (CEPR-0099/CEPR-0100):
- `AT_POS + ARREMESSO` e `TRANS_OF + ARREMESSO` compartilham o bloco visual `Finalização`;
- o bloco `Finalização` contém tipo técnico da finalização, resultado factual, motivo de pontuação e pontos quando aplicável, sempre nessa ordem;
- em `AT_POS` e `TRANS_OF`, a UI exibe `Simples`, `Giro` e `Aérea` como chips no bloco `Finalização`, persistindo a escolha em `tipo_finalizacao_code`;
- `classificacao_acao_code` fica como compatibilidade legada para leituras antigas e outros fluxos que ainda dependem de classificação;
- o preset `Arremesso forçado por passivo` aparece nos dois fluxos e grava `PASSIVO_SINALIZADO + SOB_PASSIVO`;
- os contextos da fase permanecem fora do bloco `Finalização`.

Contrato operacional executavel (2026-05-20):
- A ordem e a visibilidade principal/opcional/avancada dos fluxos de arremesso acima ficam declaradas em `liveCollectionFlow.contract.ts`.
- A matriz nao deve duplicar todos os campos de UX desses fluxos; ela fixa a semantica permitida e aponta para o contrato operacional quando a duvida for ordem, agrupamento ou nivel de detalhe na tela.
- Evidencia historica: a suite `npx playwright test e2e/scout --project=desktop --reporter=line` teve execucao verde com `102/102` apos a UI passar a consumir o contrato.
- Evidencia intermediaria em 2026-05-20: uma reexecucao focada retornou `101 passed / 1 failed`, com falha em `e2e/scout/scout-cepr0088a-roster.spec.ts` ao localizar `Coletar ao vivo`.
- Evidencia atual em 2026-05-20: o teste `scout-cepr0088a-roster.spec.ts` passou isolado com trace; depois a spec `scout-cepr0089-trans-of.spec.ts` foi endurecida para filtrar consultas SQL por `scout_game_id`; a suite `npx playwright test e2e/scout --project=desktop --reporter=line` passou `102/102`.
- O E2E global segue com falhas fora do Scout conhecidas; nao usar essas falhas para bloquear a decisao do contrato operacional, mas registrar separadamente quando executar `npm run test:e2e`.

#### `FINALIZACAO_6M_FAV` — evento ofensivo observado (CEPR-0096)

- Situacao real: CEPRAEA cobra tiro de 6m.
- Fase da bola: `AT_POS`
- Categoria: `ARREMESSO`
- Acao basica: `FINALIZACAO_6M_FAV`
- Classificacao: nao se aplica; o tipo e auto-derivado.
- Tipo de finalizacao: `6M`
- Resultados permitidos:
  - `GOL`
  - `DEFENDIDO`
  - `FORA`
  - `TRAVE`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Resultado proibido:
  - `BLOQUEADO`
- Regra de pontuacao:
  - se `GOL`, `motivo_pontuacao_code = 6M` e `pontos_jogada = 2`
  - se diferente de `GOL`, nao informar motivo nem pontos

#### `ARREMESSO` — campo preparatorio opcional (CEPR-0090B)

- Campo opcional: `acaoPreparatoriaCode`
  - Visivel somente em `AT_POS + ARREMESSO + ARREMESSO`
  - Nao bloqueia submit — campo opcional
  - Valores (`LISTA_ACAO_PREPARATORIA`):
    - `FINTA_PASSE` — Finta de passe
    - `FINTA_ARREMESSO` — Finta de arremesso
    - `FIXACAO` — Fixação
    - `ENTRADA_MEIO` — Entrada pelo meio
    - `QUEBRA_LINHA` — Quebra de linha

### `DEF_POS` + `ACAO_DEFENSIVA`

#### `BLOQUEIO`

- Regra CEPR-0092:
  - `classificacao_acao_code` representa a finalizacao adversaria enfrentada;
  - `execucao_bloqueio_code` representa a execucao do bloqueio;
  - nao misturar tipo da finalizacao adversaria com qualidade/execucao do bloqueio.
- Finalizacoes adversarias permitidas em `classificacao_acao_code`:
  - `GIRO`
  - `AEREA`
  - `ARREM_SIMPLES`
  - `6M_ADV`
  - `NAO_OBSERVADO`
- Execucoes permitidas em `execucao_bloqueio_code`:
  - `EXECUTADO`
  - `NAO_EXECUTADO`
  - `ATRASADO`
  - `MAL_SINCRONIZADO`
  - `NAO_OBSERVADO`
- Codes legados inativos:
  - `BLOQ_GIRO`
  - `BLOQ_ARREM_SIMPLES`
  - `BLOQ_AEREA`
  - `BLOQ_NAO_EXECUTADO`
- Regra de migracao historica:
  - `BLOQ_GIRO -> classificacao_acao_code = GIRO + execucao_bloqueio_code = EXECUTADO`
  - `BLOQ_ARREM_SIMPLES -> classificacao_acao_code = ARREM_SIMPLES + execucao_bloqueio_code = EXECUTADO`
  - `BLOQ_AEREA -> classificacao_acao_code = AEREA + execucao_bloqueio_code = EXECUTADO`
  - `BLOQ_NAO_EXECUTADO -> classificacao_acao_code = NAO_OBSERVADO + execucao_bloqueio_code = NAO_EXECUTADO`
  - registros historicos migrados de `BLOQ_NAO_EXECUTADO` nao recebem `tipo_finalizacao_code` retroativo.
- Resultados permitidos (default):
  - `BLOQUEADO`
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `GOL`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Resultado especial:
  - `TIRO_6M_CONCEDIDO` pode ocorrer em bloqueio atrasado/mal sincronizado e nao e finalizacao concluida; nesse caso nao derivar `tipo_finalizacao_code`.
- Derivacao de `tipo_finalizacao_code`:
  - `GIRO -> GIRO`
  - `AEREA -> AEREA`
  - `ARREM_SIMPLES -> SIMPLES`
  - `6M_ADV -> 6M`
  - `NAO_OBSERVADO -> NULL`
- Campo visual:
  - exibir `Finalizacao adversaria enfrentada`;
  - exibir `Execucao do bloqueio`;
  - nao exibir campo manual de `tipo_finalizacao_code` quando a derivacao vier da classificacao do bloqueio.

#### `INTERCEPTACAO` e `ROUBO`

- Classificacoes permitidas em `INTERCEPTACAO`:
  - `INTERCEPTACAO_MALSUCEDIDA` (CEPR-0090B) — tentativa de interceptar, falhou; adversaria converteu
- Resultados permitidos (default — sem classificacao ou classificacao nao listada abaixo):
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Resultados proibidos (default):
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
- Resultados permitidos por classificacao (CEPR-0090B):
  - `INTERCEPTACAO_MALSUCEDIDA`: `GOL`, `DEFENDIDO`, `NAO_OBSERVADO` — interceptacao falhou, resultado pela goleira ou adversaria
- Campo visual de finalizacao adversaria:
  - nunca aparece

#### `COBERTURA`

- Classificacoes permitidas (CEPR-0090B):
  - `COBERTURA_PIVO` — cobertura da posicao de pivo
  - `FECHAMENTO_CENTRAL` — base + solta fecham a entrada da especialista central
- Resultados permitidos:
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `GOL`
  - `VIOLACAO`
  - `TIRO_6M_CONCEDIDO` (CEPR-0090A)
  - `NAO_OBSERVADO`
- Campo visual de finalizacao adversaria:
  - aparece somente quando o resultado envolver arremesso adversario
- Tipos permitidos de finalizacao adversaria:
  - `SIMPLES`
  - `GIRO`
  - `AEREA`
  - `NAO_OBSERVADO`

#### `MARCACAO_PRESSAO`

- Classificacoes permitidas (CEPR-0090B):
  - `TROCA_REFERENCIA` — troca de marcacao de referencia individual
- Resultados permitidos:
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `GOL`
  - `VIOLACAO`
  - `TIRO_6M_CONCEDIDO` (CEPR-0090A)
  - `NAO_OBSERVADO`
- Campo visual de finalizacao adversaria:
  - aparece somente quando o resultado envolver arremesso adversario
- Tipos permitidos de finalizacao adversaria:
  - `SIMPLES`
  - `GIRO`
  - `AEREA`
  - `NAO_OBSERVADO`

#### `RECOMPOSICAO`

- Resultados permitidos:
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `GOL`
  - `VIOLACAO`
  - `TIRO_6M_CONCEDIDO` (CEPR-0090A)
  - `NAO_OBSERVADO`
- Campo visual de finalizacao adversaria:
  - aparece somente quando o resultado envolver arremesso adversario
- Tipos permitidos de finalizacao adversaria:
  - `SIMPLES`
  - `GIRO`
  - `AEREA`
  - `NAO_OBSERVADO`

#### `FINALIZACAO_6M_ADV` — evento defensivo observado (CEPR-0090A)

> **Natureza**: evento observado, nao acao executada pela equipe defensora.
> Representa a cobranca de 6 metros pelo adversario. Nao confundir com acao defensiva.

- Categoria: `ACAO_DEFENSIVA`
- Acao basica: `FINALIZACAO_6M_ADV`
- Classificacoes: nenhuma — campo nao aparece
- Resultados permitidos:
  - `GOL`
  - `DEFENDIDO`
  - `FORA`
  - `TRAVE`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Tipo de finalizacao: fixo em `6M` — auto-derivado pela RPC; nao editavel na UI
- Pontos: auto-calculados (2 pontos quando GOL, derivado de `6M`)

### `TRANS_OF`

#### `PASSE`

- Categoria: `PASSE`
- Acao basica: `PASSE`
- Classificacoes operacionais compartilhadas com `LISTA_CLASSIF_PASSE`
- Resultados operacionais atualmente usados no app:
  - `ERRO_PASSE`
  - `PASSE_INTERCEPTADO`
  - `PERDA`
  - `VIOLACAO`
  - `PASSIVO`
  - `FALTA_ATAQUE`
  - `NAO_OBSERVADO`

#### `ARREMESSO`

- Categoria: `ARREMESSO`
- Acao basica: `ARREMESSO`

##### Fluxo atual (CEPR-0090B) — novos registros

Dois campos separados, obrigatorio + opcional:

1. **`estruturaTransicaoCode`** (`LISTA_ESTRUTURA_TRANSICAO`) — estrutura numerica da transicao:
   - `TRANS_DIRETA` — atacante entra livre, sem bloqueio numerico
   - `TRANS_INDIRETA_2X1` — transicao em superioridade 2x1
   - `TRANS_INDIRETA_3X2` — transicao em superioridade 3x2
   - `TRANS_INDIRETA_4X3` — transicao em superioridade 4x3
   - `TRANS_INDIRETA_3X3` — transicao sem superioridade numerica, 3x3

2. **`contextoDecisaoCode`** (`LISTA_CONTEXTO_DECISAO`) — contexto opcional da decisao:
   - `CHANCE_CLARA_RECUSADA` — havia chance clara e a atleta recusou o arremesso
   - `RETORNO_BOLA` — bola voltou e gerou nova decisao
   - `PASSIVO_SINALIZADO` — equipe sob passivo
   - `ARREMESSO_OBRIGATORIO` — arremesso tomado por obrigacao do contexto
   - `NAO_OBSERVADO`

3. **`contextoArremessoCode`** (`LISTA_CONTEXTO_ARREMESSO`) — contexto opcional do arremesso:
   - `ARREMESSO_FORCADO` — arremesso sem condicao tecnica ideal
   - `GIRO_DE_LONGE` — giro de longa distancia, tipicamente 9m ou mais
   - `SOB_PASSIVO` — arremesso realizado sob passivo
   - `NAO_OBSERVADO`

4. **`tipoFinalizacaoCode`** — tipo tecnico da finalizacao (ativa quando estrutura preenchida):
   - `SIMPLES`
   - `GIRO`
   - `AEREA`
   - `NAO_OBSERVADO`

Combinacoes validas (exemplos):
- `TRANS_DIRETA + GIRO + GOL` — giro livre na transicao direta
- `TRANS_INDIRETA_2X1 + AEREA + DEFENDIDO` — aerea em 2x1 defendida
- `TRANS_INDIRETA_2X1 + GIRO + BLOQUEADO` — giro em 2x1 bloqueado
- `TRANS_INDIRETA_3X3 + PASSIVO_SINALIZADO + GIRO_DE_LONGE + GIRO + BLOQUEADO` — lance do `PILOTO-01 #14`, giro forçado de longe sob passivo

UX esperada na `COLETA_AO_VIVO`:
- `Estrutura da transição` deve explicar que registra a forma da transição antes do arremesso;
- a coleta rápida deve mostrar estrutura da transição, bloco visual `Finalização` e o preset opcional `Arremesso forçado por passivo`;
- `Contexto decisional` e `Contexto do arremesso` detalhados devem ficar no bloco `Detalhes avançados da transição / revisar depois`;
- motivo de pontuação e pontos pertencem ao bloco comum `Finalização`;
- o passivo pode ocorrer em `AT_POS` ou `TRANS_OF`; nos dois fluxos, `PASSIVO` como resultado significa interrupção da posse pela regra, enquanto o preset significa arremesso executado sob passivo.

##### Classificacoes legadas (dados anteriores ao CEPR-0090B)

As classificacoes abaixo existem em dados historicos e continuam legiveis, mas **nao aparecem no select de novos registros**:

| Codigo legado | Label | Status |
|---|---|---|
| `FINALIZ_TRANS` | Transição indireta | **[LEGADO — leitura apenas]** |
| `FINALIZ_CONTRA` | Transição direta | **[LEGADO — leitura apenas]** |
| `AEREA_TRANS` | Aérea na transição | **[LEGADO — leitura apenas]** |

Derivacao de finalizacao legada (dados historicos):
- `FINALIZ_TRANS -> SIMPLES`
- `FINALIZ_CONTRA -> SIMPLES`
- `AEREA_TRANS -> AEREA`

- Resultados permitidos:
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
  - `VIOLACAO`
  - `NAO_OBSERVADO`

#### `TROCA_TRANSICAO`

- Acoes basicas permitidas:
  - `ENTRADA_OFENSIVA`
  - `TROCA_OFENSIVA`
  - `TROCA_DEFENSIVA`
  - `ESTABILIZACAO`
- Resultados permitidos:
  - `TRANSICAO_NEUTRALIZADA`
  - `DEFESA_ESTABILIZADA`
  - `VANTAGEM_CRIADA`
  - `VANTAGEM_PERDIDA`
  - `ERRO_TROCA`
  - `PERDA`
  - `NAO_OBSERVADO`

### `TRANS_DEF`

#### `ACAO_DEFENSIVA`

- Acoes basicas permitidas:
  - `BLOQUEIO`
  - `INTERCEPTACAO`
  - `ROUBO`
  - `COBERTURA`
  - `MARCACAO_PRESSAO`
  - `RECOMPOSICAO`
- Resultados operacionais atualmente usados no app:
  - `TRANSICAO_NEUTRALIZADA`
  - `DEFESA_ESTABILIZADA`
  - `RECUPERACAO_POSSE`
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `PERDA`
  - `ERRO_TROCA`
  - `VIOLACAO`
  - `NAO_OBSERVADO`

#### `TROCA_TRANSICAO`

- Acoes basicas permitidas:
  - `ENTRADA_OFENSIVA`
  - `TROCA_OFENSIVA`
  - `TROCA_DEFENSIVA`
  - `ESTABILIZACAO`
- Resultados operacionais atualmente usados no app:
  - `TRANSICAO_NEUTRALIZADA`
  - `DEFESA_ESTABILIZADA`
  - `VANTAGEM_CRIADA`
  - `VANTAGEM_PERDIDA`
  - `ERRO_TROCA`
  - `PERDA`
  - `NAO_OBSERVADO`

## Notas de legado (CEPR-0090B)

Classificacoes removidas do select de novos registros. Dados historicos continuam legiveis e mapeados.

| Codigo | Contexto | Substituto em novos registros |
|---|---|---|
| `AEREA_TRANS` | `TRANS_OF + ARREMESSO` | `estruturaTransicaoCode + tipoFinalizacaoCode = AEREA` |
| `FINALIZ_TRANS` | `TRANS_OF + ARREMESSO` | `TRANS_INDIRETA_2X1/3X2/4X3 + tipoFinalizacaoCode = SIMPLES` |
| `FINALIZ_CONTRA` | `TRANS_OF + ARREMESSO` | `TRANS_DIRETA + tipoFinalizacaoCode = SIMPLES` |

## Invariantes de persistencia

- `COLETA_AO_VIVO` persiste em `scout_live_entries`
- `status_validacao_code` nasce como `PENDENTE`
- `derived_scout_play_id` so pode ser preenchido na passagem para revisao por video
- a coleta ao vivo nao cria automaticamente:
  - `scout_plays`
  - `scout_play_participations`

## Gate obrigatorio para agentes

Antes de alterar `COLETA_AO_VIVO`, o agente deve apontar:

1. a secao desta matriz no Notion;
2. a secao correspondente neste arquivo;
3. a chave correspondente em `liveCollectionCompatibility.matrix.ts`;
4. se o fluxo tiver contrato operacional, a chave correspondente em `liveCollectionFlow.contract.ts`;
5. o teste positivo afetado;
6. o teste negativo afetado;
7. o comando de validacao executado.

Sem isso, a mudanca nao deve prosseguir.
