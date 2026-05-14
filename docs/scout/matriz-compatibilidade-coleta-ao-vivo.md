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
- `e2e/scout/scout-matriz-compat.spec.ts`
- `e2e/scout/scout-category-filter.spec.ts`
- `supabase/tests/scout_ssot_audit.test.sql`

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
- invariantes de persistencia

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
- Acao basica: `ARREMESSO`
- Classificacoes permitidas:
  - `GIRO`
  - `AEREA`
  - `ARREM_SIMPLES`
- Classificacoes proibidas em `AT_POS`:
  - `FINALIZ_CONTRA`
  - `FINALIZ_TRANS`
  - `AEREA_TRANS`
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
- Regras de pontuacao:
  - `SIMPLES -> 1`
  - `GOL_CONTRA -> 1`
  - `6M -> 2`
  - `GOLEIRA -> 2`
  - `ESPECIALISTA -> 2`
  - `GIRO -> 1 ou 2`
  - `AEREA -> 1 ou 2`

### `DEF_POS` + `ACAO_DEFENSIVA`

#### `BLOQUEIO`

- Classificacoes permitidas:
  - `BLOQ_GIRO`
  - `BLOQ_ARREM_SIMPLES`
  - `BLOQ_AEREA`
- Resultados permitidos:
  - `BLOQUEADO`
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `GOL`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Derivacao de finalizacao adversaria:
  - `BLOQ_GIRO -> GIRO`
  - `BLOQ_ARREM_SIMPLES -> SIMPLES`
  - `BLOQ_AEREA -> AEREA`
- Campo visual de finalizacao adversaria:
  - oculto quando a derivacao existir

#### `INTERCEPTACAO` e `ROUBO`

- Resultados permitidos:
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Resultados proibidos:
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
- Campo visual de finalizacao adversaria:
  - nunca aparece

#### `COBERTURA`, `MARCACAO_PRESSAO`, `RECOMPOSICAO`

- Resultados permitidos:
  - `RECUPERACAO_POSSE`
  - `FALTA_ATAQUE`
  - `DEFESA_ESTABILIZADA`
  - `GOL`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Campo visual de finalizacao adversaria:
  - aparece somente quando o resultado envolver arremesso adversario
- Tipos permitidos de finalizacao adversaria:
  - `SIMPLES`
  - `GIRO`
  - `AEREA`
  - `NAO_OBSERVADO`

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
- Classificacoes permitidas:
  - `FINALIZ_TRANS`
  - `FINALIZ_CONTRA`
  - `AEREA_TRANS`
- Resultados permitidos:
  - `GOL`
  - `DEFENDIDO`
  - `BLOQUEADO`
  - `FORA`
  - `TRAVE`
  - `VIOLACAO`
  - `NAO_OBSERVADO`
- Derivacao de finalizacao:
  - `FINALIZ_TRANS -> SIMPLES`
  - `FINALIZ_CONTRA -> SIMPLES`
  - `AEREA_TRANS -> AEREA`

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
4. o teste positivo afetado;
5. o teste negativo afetado;
6. o comando de validacao executado.

Sem isso, a mudanca nao deve prosseguir.
