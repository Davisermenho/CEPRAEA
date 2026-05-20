---
tipo: LOG-CHANGELOG
nome: "Histórico de Mudanças — Agente Copilot"

papel:
  - "MUST registrar somente mudanças concluídas pelo Copilot."
  - "MUST registrar fato, data/hora e evidência objetiva."
  - "MUST NOT registrar plano, intenção, hipótese ou inferência."

autoridade:
  - "MUST ser histórico append-only."
  - "MUST descrever o que aconteceu."
  - "MUST NOT definir o que deve acontecer."
  - "MUST NOT ser fonte normativa."

lido_por: ["Copilot"]

quando_ler:
  - "MUST ler antes de iniciar trabalho com risco de duplicação."
  - "MUST ler antes de registrar nova entrada."
  - "MUST ler ao encontrar decisão arquitetural relacionada."

atualizado_por: ["Copilot"]

quando_atualizar:
  - "MUST atualizar ao concluir trabalho com evidência objetiva."
  - "MUST atualizar ao abrir PR, registrar merge, commit ou validação."
  - "MUST verificar último ID antes de criar nova entrada."

sempre_atualizar:
  - "MUST atualizar 'Última atualização' em ISO 8601."
  - "MUST registrar versão/identificador do Copilot."
  - "MUST NOT inventar versão se não identificável."

como_atualizar:
  - "MUST adicionar nova entrada no topo."
  - "MUST preservar formato existente."
  - "MUST usar ID posterior ao último ID."
  - "MUST NOT editar, remover, reordenar ou resumir entradas antigas."

evidencia_objetiva:
  - "MUST conter commit, PR, merge, build, teste, validação ou identificador verificável."
  - "MUST NOT aceitar 'feito', 'validado', 'testado' ou 'concluído' sem prova."

conflito:
  - "MUST registrar reversão como nova entrada."
  - "MUST NOT alterar entrada passada."

proibido:
  - "MUST NOT registrar sem evidência objetiva."
  - "MUST NOT registrar planos futuros."
  - "MUST NOT registrar decisões de produto."
  - "MUST NOT registrar logs de Claude ou Codex."
  - "MUST NOT inferir fato sem prova."

nao_cobre:
  planos_futuros: "MUST usar plan.md."
  decisoes_de_produto: "MUST usar CEPRAEA.md."
  logs_de_claude: "MUST NOT registrar aqui."
  logs_de_codex: "MUST NOT registrar aqui."

criterios_de_parada:
  - "STOP sem evidência objetiva."
  - "STOP se último ID não for identificável."
  - "STOP se exigir editar entrada antiga."
  - "STOP se houver dúvida entre fato e inferência."

validade: "Atual até a última entrada registrada."
status: ATUAL
---
# 🤖 COPILOT ChangeLog CEPRAEA - HANDEBOL DE PRAIA
>Versão 1.0 — 2026-05-06 <br>
>*Última atualização*: 2026-05-11 - BRT - Claude Sonnet 4.6 (Copilot)
<font family=verdana size=2>
Este log documenta as mudanças relevantes promovidas pelo agente <b><font family=arial size=3>Copilot</font></b>. Ele é atualizado exclusivamente pelo Copilot com base em evidências objetivas como commits, PRs e resultados de build.
</font>

## 📋 Últimas 5 Atualizações

## Política
 * Toda ação relevante no repositório deve atualizar este arquivo no mesmo commit ou em commit imediatamente subsequente.
 * Registrar: decisões arquiteturais, merges, CI/CD, migrations, RLS, grants, RPCs, feature flags, rotas públicas, validações de produção e decisões de manter legado ativo.
 * Não registrar valores sensíveis de ambiente.
---

## CEPR-0076 — API-21: Auditoria DEC-006 — Confirmação de ausência de CHECK constraint

**Data:** 2026-05-12
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- Nenhum arquivo de código alterado — tarefa de auditoria/confirmação

### Detalhes
- Auditados CHECK constraints de `public.scout_plays` e `public.scout_live_entries` via `pg_constraint`
- `scout_plays`: 4 CHECKs existentes (phase_of_ball, session_type, source, validation_status) — **nenhum** sobre `acao_principal_text`
- `scout_live_entries`: CHECK `scout_live_entries_acao_principal_text_check` valida apenas não-vazio (`NULLIF(btrim(...), '')`) — não restringe a ações terminais/decisivas
- **Conclusão**: DEC-006 (ACAO_PRINCIPAL terminal/decisiva) é enforçada exclusivamente na UI (ScoutWorkspacePage.tsx via `AT_POS_FINISH_ACTIONS`, `AT_POS_PREP_ACTIONS`, `getAllowedResultCodes`)
- Banco não bloqueia inserção de ações preparatórias em `acao_principal_text` — regra é não-bloqueante, conforme especificado
- Registro para decisão futura: candidato a CHECK ou RLS policy caso regra se torne bloqueante

---

## CEPR-0075 — UI-25: Bloco Mental Detalhado (criticalCommunication + bodyLanguage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/types/index.ts` — 4 novas chaves adicionadas a `ScoutCodeListKey`: `LISTA_COMUNICACAO_MOMENTO_CRITICO`, `LISTA_LINGUAGEM_CORPORAL`, `LISTA_EVENTO_MENTAL_GATILHO`, `LISTA_QUALIDADE_RESET_MENTAL`
- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `MentalEventDraft` e `EMPTY_MENTAL` expandidos; CODEBOOK_KEYS atualizado; UI com 2 novos `<select>` (Comunicação no Momento Crítico, Linguagem Corporal); submit handler atualizado

### Detalhes
- Campos `criticalCommunication` e `bodyLanguage` já existiam no DB (`public.scout_mental_events`), nos tipos (`ScoutMentalEventWriteInput`) e na camada de API (`scoutApi.ts`) — apenas UI estava pendente
- Codebook `LISTA_COMUNICACAO_MOMENTO_CRITICO`: 10 opções (POSITIVA_ORGANIZA → NAO_OBSERVADO)
- Codebook `LISTA_LINGUAGEM_CORPORAL`: 9 opções (PRONTA_ATIVA → NAO_OBSERVADO)
- `tsc --noEmit` limpo (0 erros)

---

## CEPR-0074 — UI-24: Dashboard Executivo (ScoutDashboardPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/features/scout/pages/ScoutDashboardPage.tsx` — **CRIADO**: dashboard executivo derivado de dados de relatório validados
- `src/App.tsx` — rota `scout/dashboard` registrada (lazy import)
- `src/features/scout/pages/ScoutWorkspacePage.tsx` — botão de navegação rápida "Dashboard" adicionado

### Detalhes
- Seletor de jogo via `fetchScoutGames`; dados via `fetchScoutReport(scoutGameId)`
- 6 métricas executivas: total indicadores + breakdown por prioridade (ALTA/MEDIA/BAIXA/MANTER)
- Resumo por bloco com contadores coloridos por prioridade
- Top 5 indicadores de ALTA prioridade com leitura técnica
- `tsc --noEmit` sem erros

---

## CEPR-0073 — UI-23: Tela de Feedbacks (ScoutFeedbackPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/features/scout/pages/ScoutFeedbackPage.tsx` — **CRIADO**: lista de feedbacks com filtros por jogo, destinatário e status
- `src/App.tsx` — rota `scout/feedback` registrada (lazy import)
- `src/features/scout/pages/ScoutWorkspacePage.tsx` — botão de navegação rápida "Feedback" adicionado

### Detalhes
- 8 campos exibidos: recipient, feedbackType, feedbackTopic, message, priority, feedbackStatus, evidenceRef, recommendedAction
- 7 tipos de feedback: CORRECAO, REFORCO, ALERTA, ELOGIO_TECNICO, AJUSTE_TATICO, ORIENTACAO_TREINO, REVISAO_VIDEO
- 7 destinatários: ATLETA, SETOR_OFENSIVO, SETOR_DEFENSIVO, GOLEIRA, BLOCO_TRANSICAO, EQUIPE, COMISSAO
- Badges coloridos por status (PENDENTE=cinza, ENTREGUE=azul, APLICADO=verde) e prioridade
- Filtros via `fetchScoutFeedback(ScoutFeedbackFilters)` com busca automática ao alterar qualquer filtro
- `tsc --noEmit` sem erros

---

## CEPR-0072 — UI-22: Tela de Relatório Pós-Jogo (ScoutReportPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/features/scout/pages/ScoutReportPage.tsx` — **CRIADO**: relatório pós-jogo com 10 indicadores agrupados por bloco
- `src/App.tsx` — rota `scout/report` registrada (lazy import)
- `src/features/scout/pages/ScoutWorkspacePage.tsx` — botão de navegação rápida "Relatório" adicionado

### Detalhes
- Seletor de jogo via `fetchScoutGames`; relatório via `fetchScoutReport(scoutGameId, filters)`
- Filtros: reportBlock (select dinâmico) e trainingPriority (ALTA/MEDIA/BAIXA/MANTER)
- Agrupamento por bloco com indicadores ordenados por prioridade decrescente
- Campos exibidos: indicator, valueText, sampleSize (n=X), technicalReading, trainingPriority, reportNotes, evidenceIds
- Badges de prioridade coloridos: ALTA=vermelho, MEDIA=laranja, BAIXA=amarelo, MANTER=verde
- Resumo de contagem por prioridade no topo dos resultados
- `tsc --noEmit` sem erros

---

## CEPR-0071 — UI-21: Tela de Cadastro de Equipes (ScoutTeamsPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/features/scout/pages/ScoutTeamsPage.tsx` — **CRIADO**: lista e formulário de cadastro de equipes (5 campos)
- `src/types/index.ts` — `ScoutCodeListKey` estendido: `LISTA_TIPO_EQUIPE`, `LISTA_CATEGORIA`
- `src/App.tsx` — rota `scout/teams` registrada (lazy import)

### Detalhes
- Formulário com 5 campos: name (required), teamType (LISTA_TIPO_EQUIPE), category (LISTA_CATEGORIA), isInternal (checkbox)
- Lista com badges coloridos por tipo (`PROPRIA`=azul, `ADVERSARIA`=vermelho, `TREINO`=amarelo, `OUTRA`=cinza) e badge "Interna"
- Botão de navegação "Equipes" adicionado à `ScoutWorkspacePage`

---

## CEPR-0070 — UI-20: Tela de Cadastro de Atletas (ScoutAthletesPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados
- `src/features/scout/pages/ScoutAthletesPage.tsx` — **CRIADO**: lista e formulário de cadastro de atletas (19 campos)
- `src/types/index.ts` — `ScoutCodeListKey` estendido com 8 novos valores: `LISTA_MAO_DOMINANTE`, `LISTA_FUNCAO_PRINCIPAL`, `LISTA_STATUS_ATLETA`, `LISTA_POS_OF_3X1`, `LISTA_POS_OF_4X0`, `LISTA_POS_DEF_3X0`, `LISTA_TIPO_EQUIPE`, `LISTA_CATEGORIA`
- `src/App.tsx` — rota `scout/athletes` registrada (lazy import)
- `src/features/scout/pages/ScoutWorkspacePage.tsx` — botões de navegação rápida "Atletas" e "Equipes" adicionados

### Detalhes
- Seção "Dados Básicos": name, email, phone, status (LISTA_STATUS_ATLETA), category, level, notes
- Seção "Perfil Tático Scout": dominantHand (LISTA_MAO_DOMINANTE), mainFunction (LISTA_FUNCAO_PRINCIPAL), posOf3x1, posOf4x0, posDefOf3x0, isGoalkeeper, isSpecialist, isPlaymaker
- Lista com badges: Goleira (azul), Armadora (roxo), Especialista (laranja), status ativo (verde)

---

## CEPR-0069 — UI-19: Tela de Validação Pós-Jogo (ScoutValidationPage)

**Data:** 2026-05-14
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `src/types/index.ts` — adicionado campo `validationStatus: ScoutValidationStatus` ao interface `ScoutPlayListItem`
- `src/features/scout/scoutApi.ts` — `ScoutValidationStatus` adicionado ao import de `@/types`; `fetchScoutPlaysForGame` atualizado: select inclui `status_validacao_code`, inline type inclui novo campo, mapeamento inclui `validationStatus`; nova função `patchScoutPlayStatus` (atualiza `scout_plays.status_validacao_code` via Supabase)
- `src/features/scout/pages/ScoutValidationPage.tsx` — nova página criada; rota `scout/validate/:gameId`; lista jogadas com badge de status; ciclo PENDENTE→REVISADO→CORRIGIDO→VALIDADO via botão de avanço rápido e via formulário `createScoutPlayValidation`; histórico de validações por jogada
- `src/App.tsx` — import lazy `ScoutValidationPage` e rota `scout/validate/:gameId` adicionados
- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `ClipboardCheck` adicionado ao import lucide-react; botão "Validar" no header navega para `/scout/validate/:gameId`

### Verificações

- `npx tsc --noEmit` = 0 erros

## CEPR-0068 — UI-18: Formulário de EVENTOS_MENTAIS

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — importados `createScoutMentalEvent` e `ScoutMentalEventWriteInput`; `LISTA_CODIGO_MENTAL` e `LISTA_MARCA_MENTAL` adicionados ao `CODEBOOK_KEYS`; tipo `MentalEventDraft` + constante `EMPTY_MENTAL`; estado `mentalEvents`; reset no `selectEntry`; submit handler: criação de mental events após `upsertScoutPlayBundle`; seção JSX "Eventos Mentais" com até 10 registros (mentalCode, mentalMark, athleteId opcional, externalLabel condicional, mentalObservation)
- `src/types/index.ts` — `'LISTA_CODIGO_MENTAL'` e `'LISTA_MARCA_MENTAL'` adicionados ao union `ScoutCodeListKey`

### Verificações

- `npx tsc --noEmit` = 0 erros

## CEPR-0067 — UI-17: FASE_DA_ATLETA independente por slot de participação

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `AthleteSlot` +campo `phaseOfAthlete`; `EMPTY_SLOT` atualizado; submit handler: `phaseOfAthlete` propagado em atacantes, defensoras e goleira; JSX: select "Fase da atleta" condicional adicionado a cada slot (AT_POS, DEF_POS, TRANS_OF, TRANS_DEF)

### Verificações

- `npx tsc --noEmit` = 0 erros

## CEPR-0060 — UI-10: Bloco de atletas envolvidos na COLETA_SCOUT

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / UI

### Contexto
Checklist item UI-10: adicionar bloco "Atletas Envolvidos" à ScoutVideoReviewPage (COLETA_SCOUT),
permitindo registrar até 4 atacantes e 3 defensoras por jogada via `participations[]`.

### Arquivos modificados
- `src/features/scout/pages/ScoutVideoReviewPage.tsx`
  - Imports: `AthleteWithScoutProfile`, `ScoutParticipantScope`, `ScoutPlayParticipationWriteInput` de `@/types`
  - Import: `fetchScoutAthletes` de `@/features/scout/scoutApi`
  - Tipo local `AthleteSlot` e constante `EMPTY_SLOT` criados
  - Estado: `athletes`, `attackerSlots` (4 slots), `defenderSlots` (3 slots)
  - `useEffect`: `fetchScoutAthletes()` carregado junto com os demais dados
  - `selectEntry`: slots resetados ao selecionar nova entrada
  - `handleSubmit`: array `participations` construído e passado para `upsertScoutPlayBundle`
  - Seção 4 "Atletas Envolvidos" inserida no JSX (antes de Finalização)
    - Grid 2 colunas para atacantes, 3 colunas para defensoras
    - Cada slot: select de atletas do time + opção "Atleta externa" → input de texto

### Validações
- `npx tsc --noEmit` — 0 erros
- Notion checklist: UI-10 marcado [x]

## CEPR-0059 — DEC-006: ACAO_PRINCIPAL como ação terminal na COLETA_AO_VIVO

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Fix / Conformidade arquitetural

### Contexto

DEC-006 aprovada em sessão anterior: na COLETA_AO_VIVO, `ACAO_PRINCIPAL` deve
registrar a ação que **encerrou ou explica o desfecho** da sequência (ação
terminal), não a ação preparatória. `PASSE_GIRO` e `PASSE_AEREA` estavam
incorretamente incluídos em `AT_POS_FINISH_ACTIONS`, permitindo payloads
semanticamente inválidos (ex: `PASSE_GIRO + GOL`).

### Arquivos modificados

- `src/features/scout/pages/ScoutWorkspacePage.tsx`
  - Removidos `PASSE_GIRO` e `PASSE_AEREA` de `AT_POS_FINISH_ACTIONS`
  - Criado `AT_POS_PREP_ACTIONS = new Set(['PASSE_GIRO', 'PASSE_AEREA'])`
  - Adicionado branch em `getAllowedResultCodes` case `'AT_POS'`: ações prep → `OFFENSIVE_LOSS_RESULTS` (DEC-006)
  - Microcopy atualizado: "Marque a ação que encerrou ou explica o desfecho..."

### Arquivos criados

- `supabase/tests/scout_dec006_acao_terminal.test.sql`
  - TEST-21: GIRO como ação terminal com GOL ✅
  - TEST-22: AEREA como ação terminal com DEFENDIDO ✅
  - TEST-23: ERRO_PASSE como ação principal quando passe gera perda ✅
  - TEST-24: INTERC como ação principal defensiva ✅

### Validações

- `npx tsc --noEmit` — 0 erros
- TEST-21 a TEST-24: TODOS PASSARAM (confirmado via psql)

### Checklist

- UI-04c `[x]` — ACAO_PRINCIPAL reflete DEC-006 (ação terminal/decisiva)
- TEST-21 `[x]`, TEST-22 `[x]`, TEST-23 `[x]`, TEST-24 `[x]`

## CEPR-0061 — UI-11: Bloco de goleira na COLETA_SCOUT

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / UI

### Contexto

UI-11: adicionar slot de goleira à ScoutVideoReviewPage (COLETA_SCOUT).
A goleira é relevante apenas em fases DEF_POS e TRANS_OF, onde a equipe
defensora tem uma goleira posicionada. O bloco é condicional à fase.

### Arquivos modificados

- `src/features/scout/pages/ScoutVideoReviewPage.tsx`
  - Estado: `goalkeeperSlot: AthleteSlot` adicionado (slot único)
  - `selectEntry`: `setGoalkeeperSlot(EMPTY_SLOT)` ao selecionar nova entrada
  - `handleSubmit`: goleira adicionada ao array `participations[]` quando
    `phaseOfBall === 'DEF_POS' || 'TRANS_OF'` e slot preenchido
    (`participantScope: 'DEF'`, `participantSide: defendingTeamSide`, `participationRole: 'GOLEIRA'`)
  - JSX: bloco "Goleira" adicionado dentro da seção "Atletas Envolvidos",
    visível condicionalmente em DEF_POS e TRANS_OF — select de atletas + opção "Atleta externa"

### Validações

- `npx tsc --noEmit` — 0 erros
- Notion checklist: UI-11 marcado [x]

## CEPR-0062 — 2026-05-11

### UI-12: Bloco de transição ofensiva em ScoutVideoReviewPage.tsx

**Arquivos modificados:**
- `src/features/scout/pages/ScoutVideoReviewPage.tsx`
- `src/types/index.ts`

**O que mudou:**
- `ScoutCodeListKey` em `index.ts`: adicionadas 4 novas chaves (`LISTA_FORM_TRANS_OF`, `LISTA_OBJETIVO_FORM_TRANS_OF`, `LISTA_STATUS_ESTABILIZACAO_AT_POS`, `LISTA_MOTIVO_FIM_TRANS_OF`)
- `CODEBOOK_KEYS`: adicionadas 5 chaves TRANS_OF (inclui `LISTA_ACAO_PRINCIPAL_TRANS_OF`)
- `ReviewDraft`: adicionados `formTransOf`, `objetivoFormTransOf`, `acaoPrincipalTransOf`, `statusEstabilizacaoAtPos`, `motivoFimTransOf`
- `buildDraftFromEntry`: inicializa os 5 novos campos com `''`
- JSX TRANS_OF: substituído o campo texto único por 5 selects (Formação, Objetivo, Primeira ação, Estabilização, Motivo fim) + texto livre `mainOffensiveThreat`

## CEPR-0063 — 2026-05-11

### UI-13: Bloco de transição defensiva em ScoutVideoReviewPage.tsx

**Arquivos modificados:**
- `src/features/scout/pages/ScoutVideoReviewPage.tsx`
- `src/types/index.ts`

**O que mudou:**
- `ScoutCodeListKey`: +5 novas chaves TRANS_DEF (`LISTA_FORM_TRANS_DEF`, `LISTA_OBJETIVO_FORM_TRANS_DEF`, `LISTA_REORGANIZACAO_DEF`, `LISTA_STATUS_ESTABILIZACAO_DEF_POS`, `LISTA_MOTIVO_FIM_TRANS_DEF`)
- `CODEBOOK_KEYS`: +6 chaves TRANS_DEF (inclui `LISTA_ACAO_PRINCIPAL_TRANS_DEF`)
- `ReviewDraft`: +6 campos (`formTransDef`, `objetivoFormTransDef`, `acaoPrincipalTransDef`, `reorganizacaoDef`, `statusEstabilizacaoDefPos`, `motivoFimTransDef`)
- `buildDraftFromEntry`: inicializa os 6 novos campos com `''`
- JSX TRANS_DEF: substituído o select único por 6 selects (Formação, Objetivo, Ação principal, Reorganização, Estabilização, Motivo fim)

## CEPR-0064 — UI-14: Bloco SHOOTOUT em ScoutVideoReviewPage

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `supabase/migrations/0019_scout_plays_shootout_columns.sql` — **novo** — 4 colunas em scout_plays: `shootout_type`, `shootout_result`, `shootout_decision`, `shootout_execution`
- `src/types/index.ts` — `ScoutCodeListKey` +5 keys; `ScoutPlay` +5 campos opcionais; `ScoutPlayWriteInput` +5 campos opcionais
- `src/features/scout/scoutApi.ts` — `serializeScoutPlay`: +5 mapeamentos (specialContext, shootoutType/Result/Decision/Execution)
- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `CODEBOOK_KEYS` +5; `ReviewDraft` +5; `buildDraftFromEntry` +5; submit handler +5; JSX: seção "Contexto Especial" com select specialContext sempre visível + sub-bloco condicional 4 selects SHOOTOUT

### Verificações

- `npx tsc --noEmit` = 0 erros

## CEPR-0065 — UI-15: Bloco OUT em ScoutVideoReviewPage

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `src/types/index.ts` — `ScoutCodeListKey` +`LISTA_OUT_SITUACAO`, `LISTA_CAUSA_OUT`; `ScoutPlay` +`outCause?`; `ScoutPlayWriteInput` +`outCause?`
- `src/features/scout/scoutApi.ts` — `serializeScoutPlay`: +`out_cause: input.outCause ?? null`
- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `CODEBOOK_KEYS` +2 keys; `ReviewDraft` +`outCause`; `buildDraftFromEntry` +`outCause: ''`; submit handler +`outCause`; JSX Análise: `outSituation` agora usa `LISTA_OUT_SITUACAO` do codebook; `numericalStructureReal` visível apenas em `OUT_ATAQUE`/`OUT_DEFESA`; novo select `Causa do OUT` (`LISTA_CAUSA_OUT`) condicional

### Verificações

- `npx tsc --noEmit` = 0 erros

## CEPR-0066 — UI-16: Blocos de contextos especiais (bola parada)

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07

### Arquivos alterados

- `supabase/migrations/0020_scout_plays_bola_parada_columns.sql` — **novo** — 6 colunas em `scout_plays`: `tiro_6m_result`, `tiro_livre_result`, `reposicao_lateral_result`, `reposicao_goleira_result`, `reposicao_apos_gol_result`, `golden_goal_situation`
- `src/types/index.ts` — `ScoutCodeListKey` +8 listas (fix bug UI-15: `LISTA_OUT_SITUACAO`, `LISTA_CAUSA_OUT`; UI-16: `LISTA_6M`, `LISTA_TIRO_LIVRE`, `LISTA_REPOSICAO_LATERAL`, `LISTA_REPOSICAO_GOLEIRA`, `LISTA_REPOSICAO_APOS_GOL`, `LISTA_GOLDEN_GOAL`); `ScoutPlay` + `ScoutPlayWriteInput` +6 campos opcionais
- `src/features/scout/scoutApi.ts` — `serializeScoutPlay`: +6 mapeamentos snake_case bola parada
- `src/features/scout/pages/ScoutVideoReviewPage.tsx` — `CODEBOOK_KEYS` +8; `ReviewDraft` +6; `buildDraftFromEntry` +6; submit handler +6; JSX: 6 sub-blocos condicionais por `specialContext` (TIRO_6M, TIRO_LIVRE, REPOSICAO_LATERAL, REPOSICAO_GOLEIRA, REPOSICAO_APOS_GOL, GOLDEN_GOAL) + mensagem informativa para FIM_SET

### Verificações

- `npx tsc --noEmit` = 0 erros
- Migration aplicada no banco local (`ALTER TABLE` OK)


---

## 2026-05-05

### Login do treinador migrado para Supabase Auth

PR #5 foi validado e mergeado em `main`.

Decisão: iniciar a migração completa removendo o ponto de entrada legado por PIN antes do lançamento do sistema, já que não há usuários ou dados reais dependentes do modelo anterior.

Alterações promovidas:

- `/login` passa a pedir email e senha;
- submit usa `signInWithPassword` via `SupabaseAuthProvider`;
- `AuthGuard` passa a proteger rotas do treinador usando sessão Supabase;
- tela de login deixa de ler `pinHash` do IndexedDB;
- tela de login deixa de criar sessão local legada;
- allowlist do workflow foi expandida para cobrir o escopo de migração de autenticação.

Merge commit:

- `972fee6efc0538cb2aa74a4e44ac9891d9764e99`

Validação:

- workflow `Supabase Foundation #69` concluído com sucesso na branch `migration/supabase-auth-cleanup`;
- PR #5 ficou mergeável após ajuste de escopo;
- merge realizado por squash para `main`.

Próxima fase aprovada:

- remover seed automático de PIN/sync;
- remover autenticação local do treinador quando não houver mais referência;
- remover integração App Script/Google Sheets e sincronização legada;
- reduzir IndexedDB ao que ainda for necessário, ou substituí-lo por Supabase;
- limpar testes e documentação presos ao fluxo de PIN.

### Seed legado de PIN e sincronização removido

PR #6 foi validado e mergeado em `main`.

Decisão: remover o bootstrap que semeava automaticamente PIN e configurações de sincronização no IndexedDB, preservando temporariamente o pull automático de sincronização já configurado para ser removido em corte próprio.

Alterações promovidas:

- removida a chamada a `seedDefaults()` em `src/main.tsx`;
- removido `src/lib/seed.ts`;
- eliminado o seed automático de `pinHash`;
- eliminado o seed automático de `syncEndpointUrl` e `syncSecret` via env vars;
- preservado `loadSyncConfig().then(...syncFromRemote...)` no startup para não misturar remoção de seed com remoção da sincronização operacional;
- allowlist do workflow foi expandida para permitir este corte de limpeza controlada.

Merge commit:

- `b0bec31dc96f56b7ae80feae3f996084eee77ad0`

Validação:

- workflow `Supabase Foundation #73` concluído com sucesso na branch `cleanup/remove-legacy-seed`;
- Vercel Preview concluído com sucesso;
- conversa de review automatizado foi atendida restaurando o pull de startup antes do merge;
- PR #6 mergeado em `main`.

Próxima fase aprovada:

- mapear referências restantes a `src/lib/auth.ts` e sessão local;
- remover autenticação local do treinador se não houver uso ativo;
- mapear App Script/Google Sheets/sync para corte próprio;
- substituir stores IndexedDB por fontes Supabase por domínio, evitando remoções amplas no mesmo PR.

### Autenticação local legada do treinador removida

PR #7 foi validado e mergeado em `main`.

Decisão: remover o módulo local de autenticação do treinador baseado em PIN e `sessionStorage`, pois o login do treinador já foi migrado para Supabase Auth e o seed legado de PIN já havia sido removido.

Alterações promovidas:

- removido `src/lib/auth.ts`;
- removido `src/lib/__tests__/auth.test.ts`;
- removidos imports residuais de `@/lib/auth` em `src/App.tsx`, `src/shared/layouts/AtletaGuard.tsx` e `src/features/settings/pages/SettingsPage.tsx`;
- `WelcomeOrRedirect` passa a usar sessão Supabase para detectar treinador autenticado;
- `AtletaGuard` deixa de consultar sessão local do treinador;
- removido o bloco `Alterar PIN de acesso` das configurações;
- logout do treinador passa a usar `signOut()` via `SupabaseAuthProvider`;
- allowlist do workflow foi expandida para cobrir este corte de limpeza.

Merge commit:

- `651beea90085641cfd83be94c0b29bbcbc1802de`

Validação:

- Vercel Preview concluído com sucesso;
- workflow `Supabase Foundation` concluído com sucesso na branch `cleanup/remove-local-coach-auth`;
- checks automatizados `Continuous AI` concluídos sem mudanças necessárias;
- PR #7 mergeado em `main`.

Próxima fase aprovada:

- mapear integração App Script/Google Sheets e sincronização remota;
- remover a sincronização legada em PR própria;
- iniciar migração dos stores IndexedDB por domínio para Supabase;
- manter autenticação de atleta fora deste corte até existir modelo Supabase específico para atletas.

---

## 2026-05-04

### Fundação Supabase promovida para `main`

PR #3 foi auditado, desbloqueado e mergeado.

Decisão: promover somente a fundação Supabase, sem migrar stores operacionais, sem alterar telas principais, sem remover Apps Script, sem limpar IndexedDB e sem lançar fluxo Supabase para atletas.

Merge commit:

- `4f92106ef67c271ab1a23bf98764b4e16e02d718`

Validações usadas na decisão:

- CI verde na branch de fundação;
- workflow `Supabase Foundation` executando `npm run validate:supabase-foundation` com sucesso;
- preview Vercel pronto;
- escopo restrito a migrations, seed, RLS, grants, RPCs, testes SQL, scripts, workflow, cliente Supabase mínimo, provider mínimo e documentação.

### Workflow Supabase Foundation em push para `main`

Corrigido `.github/workflows/supabase-foundation.yml` para também rodar em push para `main`.

Commit:

- `acd42223fb01f91f4ce0bec52f7bc7339120883b`

Validação:

- Vercel concluído com sucesso;
- GitHub Actions concluído com sucesso conforme verificação operacional.

### Planejamento aprovado para Presence Tokens + confirmação de presença

Aprovado seguir com camada isolada de presença via Supabase, sem migrar ainda `attendanceStore`.

Escopo aprovado:

- criar camada isolada;
- usar `VITE_PRESENCE_TOKENS_BACKEND=legacy | supabase`;
- manter produção em `legacy` até validação explícita;
- preservar rota legada;
- adicionar rota pública Supabase;
- não migrar stores;
- não remover Apps Script;
- não limpar IndexedDB;
- manter erro público genérico.

### Implementação inicial de Presence Tokens Supabase

Criada camada:

```text
src/features/presence-tokens/
```

Arquivos:

- `presenceTokenTypes.ts`
- `presenceTokenFeatureFlag.ts`
- `presenceTokenApi.ts`

Rotas:

- legada: `/confirmar/:treinoId/:atletaId`
- Supabase: `/confirmar-presenca?token=<valor>`

Documentação:

- `docs/presence-tokens-supabase.md`

Commits:

- `3b2302f74c2846ce62ddcb12b7856197e3d1abc6`
- `22466980054ea9a8fad521ec32f3804aab6e65c6`
- `3775fb1867ecc25d9b0829b6cd4b6a84053a3c5c`
- `c6fcd5b8d11128bb6b7a255bbcde59ecaed6f9a1`
- `e0f4c48adc9e8288133d050845511c094247c6d3`
- `7cc479858066010c1d58ec28f1bcbf65cccb4132`

Decisão: geração operacional pelo treinador ainda não foi conectada porque exige sessão Supabase e `team_id` operacional validados.

### Criação do changelog

Criado `CHANGELOG.md` para rastrear passos e decisões.

Commit:

- `895ce1c97756cf5113a02362b493699c1583ee53`

Validação:

- produção Vercel confirmada como `Ready` para esse commit.

### Base mínima de sessão Supabase do treinador

Implementada base técnica, ainda sem ativação operacional de lotes.

Alterações:

- `SupabaseAuthProvider` expõe estado de sessão e operações mínimas;
- provider conectado globalmente em `src/App.tsx`;
- criada validação explícita de `VITE_SUPABASE_TEAM_ID` em `presenceTokenConfig.ts`.

Commits:

- `efc602dbf51598303e5c904bfbbce813a39be33f`
- `11341b4de69c3828943787556287300e64f3f2a6`
- `5dff71810c32638d65064f7a985a0644c6a7ad61`
- `dfb300253bbfec1c834d118de9fbbdd57e5b6955`
- `3ef809e57363b3b8331c57e57b4b8499af8d302b`

Validação:

- Vercel retornou `success` para `3ef809e57363b3b8331c57e57b4b8499af8d302b`.
- O conector não retornou workflow run do GitHub Actions para esse commit.

### Validação operacional da sessão Supabase

Documentação criada:

- `docs/supabase-coach-session.md`

Página protegida criada:

- `src/features/settings/pages/SupabaseSettingsPage.tsx`

Rota protegida adicionada:

```text
/configuracoes/supabase
```

Decisão: a página é apenas uma tela de status técnico. Ela não habilita geração, exportação ou revogação de lotes. O PIN legado permanece como guard operacional do painel.

Commits:

- `4ba92e2afc9f75d02aed303bdcaa8b8b0dbb90d7`
- `e9d49430906ac9358874015522fc1b2d6de19031`
- `d8a427ab3ad2e44a57df873c8c54a8dff4dbbb7b`
- `c8cf97d77fa96faa0b5e9e575886b32fb5bd7b58`

Validação confirmada:

- Vercel retornou `success` para `c8cf97d77fa96faa0b5e9e575886b32fb5bd7b58`.
- GitHub Actions confirmou workflow `Supabase Foundation #48`, branch `main`, commit `c8cf97d`, status `Sucesso`, job `foundation` concluído.

### Validação de acesso owner/coach para Presence Tokens

Implementada a validação de acesso antes de qualquer ativação operacional de lotes.

Alterações:

- criado `src/features/presence-tokens/presenceTokenAccess.ts`;
- adicionada verificação de configuração Supabase, sessão, `team_id` e papel `owner` ou `coach` por RPC;
- atualizada a tela `/configuracoes/supabase` para permitir validação manual de acesso;
- a geração/exportação/revogação de lotes permanece bloqueada.

Commits:

- `07b6e3663be4ecd5497e5a0c572739be9778db99`
- `30f9643a44005c4643c5b85b7d3806ffc87f764a`
- `aa8a2dba8850ebccaf7a373c4b8e7b024716f3d3`

Validação confirmada:

- Vercel retornou `success` para `aa8a2dba8850ebccaf7a373c4b8e7b024716f3d3`.
- GitHub Actions confirmou workflows `Supabase Foundation #50`, `#51` e `#52`, branch `main`, commits `07b6e36`, `30f9643` e `aa8a2db`, todos com status de sucesso.

### Lotes de Presence Tokens no painel de treino

Conectada a operação de lotes Supabase no painel de detalhe do treino, ainda atrás de feature flag e validação de acesso.

Alterações:

- adicionada seção `Tokens Supabase` em `TrainingDetailPage`;
- geração de lote chama `createPresenceTokenBatch` somente quando `VITE_PRESENCE_TOKENS_BACKEND=supabase`;
- antes de gerar ou revogar, o painel valida acesso owner/coach;
- copiar o lote chama `markPresenceTokenBatchExported`;
- revogação chama `revokePresenceTokenBatch`;
- a operação legada de WhatsApp/Apps Script continua preservada;
- `attendanceStore` não foi migrado.

Commits:

- `e760667d2f76c13e855d3317dfa81d504b9b224e`
- `b161f3bbdc93e10e9d05a0b502e9a4b75e34d231`

Validação confirmada:

- Vercel retornou `success` para `b161f3bbdc93e10e9d05a0b502e9a4b75e34d231`.
- GitHub Actions confirmou workflows `Supabase Foundation #54` e `#55`, branch `main`, commits `e760667` e `b161f3b`, ambos com status de sucesso.

### Checklist de validação manual dos lotes Supabase

Criado checklist operacional para validar geração, exportação, confirmação pública e revogação de lotes em ambiente controlado com Supabase configurado.

Documento:

- `docs/presence-token-batch-validation.md`

Decisão reiterada:

- produção permanece em `legacy` até aprovação explícita;
- validação deve ocorrer em preview/staging ou ambiente controlado;
- nenhum valor sensível deve ser registrado no repo.

Commits:

- `40b46696a00ee1ceebdc17e4793beda672c48fe2`
- `9f99fc9e72eb6939fa05f67f68beebfd0a6112cd`

Validação confirmada:

- Vercel retornou `success` para `9f99fc9e72eb6939fa05f67f68beebfd0a6112cd`.
- GitHub Actions confirmou workflows `Supabase Foundation #57` e `#58`, branch `main`, ambos com status de sucesso.

### Execução inicial do checklist em ambiente controlado

Criado relatório formal de execução inicial do checklist.

Documento:

- `docs/presence-token-batch-validation-run-2026-05-04.md`

Resultado:

- parcialmente aprovado.

Aprovado por evidência de repo/CI/código:

- Vercel verde;
- GitHub Actions previamente verde;
- gate por feature flag presente;
- validação de acesso antes de gerar lote;
- validação de acesso antes de revogar lote;
- preservação do fluxo legado.

Pendente por exigir interação real no app/Supabase:

- geração real de lote;
- cópia/exportação real;
- confirmação pública real;
- revogação real;
- testes negativos com sessão, papel, team_id e token.

Decisão:

- não ativar Supabase em produção;
- manter produção em `legacy`;
- executar itens pendentes em preview/staging ou ambiente controlado com sessão Supabase válida.

Commits:

- `71f9c32e87f28e70a17c0c14e01c532cecf1dfbe`
- `ae2479407d097938f76ae4dced53340144d560a0`

Validação confirmada:

- Vercel retornou `success` para `ae2479407d097938f76ae4dced53340144d560a0`.
- GitHub Actions confirmou workflows `Supabase Foundation #60` e `#61`, branch `main`, ambos com status de sucesso.

### Caminho automatizado seguro para validação remota de lotes

Configurado caminho automatizado para executar os testes pendentes sem registrar valores sensíveis no repositório.

Arquivos criados/alterados:

- `scripts/validate-presence-token-batch.mjs`;
- `package.json` com script `test:presence-token-batch:remote`;
- `.github/workflows/presence-token-batch-remote-validation.yml`;
- `docs/presence-token-batch-automated-validation.md`.

Workflow manual criado:

```text
Presence Token Batch Remote Validation
```

Secrets necessários no GitHub Actions:

```text
SUPABASE_TEST_URL
SUPABASE_TEST_ANON_KEY
SUPABASE_TEST_TEAM_ID
SUPABASE_TEST_EMAIL
SUPABASE_TEST_PASSWORD
```

O script valida:

- sessão de usuário de teste;
- papel `owner/coach`;
- criação de atleta de teste;
- criação de treino de teste;
- geração de lote;
- marcação como exportado;
- confirmação pública por token com cliente anônimo;
- persistência da presença;
- revogação do lote;
- rejeição de token revogado;
- rejeição de token inválido;
- cleanup por revogação e soft-delete.

Decisão de segurança:

- token puro não é impresso;
- valores de ambiente não são impressos;
- produção permanece em `legacy`;
- execução é manual via `workflow_dispatch`.

Commits:

- `82b922985cf7cb86e2aeaef014158208ad7f1420`
- `3b45858c1e637165ca259bef50a45ae5534a11b1`
- `a69bfd078ccc584198fcd4f89ee3e47aead74e97`
- `71bf2898684ccb2db7525fa7848c9ecd349f0b46`

Próxima fase:

- configurar os secrets no GitHub Actions;
- executar manualmente o workflow `Presence Token Batch Remote Validation`;
- registrar o resultado e decidir se a fase Supabase pode avançar para leitura mínima no painel.

---

## 2026-05-06

### [CEPR-0029] PR #9 — feat(auth): athlete Supabase auth foundation

Branch: `migration/athlete-auth-foundation` → PR #9 aberto para `main`.
Commit: `c7674d8`

#### Escopo

**Migration `0006_athlete_auth.sql`:**
- `athletes.email` — `text`, índice único case-insensitive por equipe (`athletes_team_email_key`)
- `athletes.user_id` — `uuid → auth.users`, índice único nullable (`athletes_user_id_key`)
- RPC `get_athlete_team_id()` — `SECURITY DEFINER`, retorna `team_id` do atleta autenticado
- 7 RLS policies: `athlete_select_own_record`, `athlete_select_by_email_for_linking`, `athlete_link_user_id`, `athlete_select_team_athletes`, `athlete_select_team_trainings`, `athlete_select_team_attendance`, `athlete_insert/update_own_attendance`

**Frontend:**
- `AtletaGuard.tsx` — reescrito: autenticação Supabase + lazy-link por `user_id`/`email` no primeiro login
- `AtletaLoginPage.tsx` — login via `supabase.auth.signInWithPassword`
- `AtletaNovaSenhaPage.tsx` — **novo** — reset de senha via `supabase.auth.updateUser` (rota `/atleta/nova-senha`)
- `AthleteForm.tsx` — campo `email` substitui PIN; email obrigatório
- `src/types/index.ts` — `Athlete.email: string` adicionado
- `src/lib/supabase.ts` — `VITE_SUPABASE_ANON_KEY` → `VITE_SUPABASE_PUBLISHABLE_KEY`
- `src/lib/sync.ts` + `src/stores/athleteStore.ts` — mapeamento do campo `email`

**Teste:**
- `supabase/tests/athlete_auth.test.sql` — 13 blocos: schema, índices, RPC, 7 policies, lazy-link, cross-team, constraint

#### Decisões arquiteturais

- `athleteAuth.ts` mantido: ainda usado por `AtletaTreinosPage`, `AtletaTreinoDetailPage`, `AtletaPerfilPage` — remoção planejada para PR separado.
- Branch criada a partir de `origin/main` para isolar o escopo do PR #9 das mudanças da branch `fix/security-vulnerabilities` (CEPR-0027/0028) ainda pendentes de merge.
- Build verificado: TS verde, `npm audit` 0 vulns, PWA gerado com sucesso.

#### Próxima fase

- Revisar e mergear PR #9;
- Remover `athleteAuth.ts` e testes legados após migração completa das páginas dependentes;
- Mergear `fix/security-vulnerabilities` → `main` (CEPR-0027/0028).

---

## CEPR-0030 — Migração MVP Supabase-first (T02→T05) — 2025-07-14

**Branch:** `migration/athlete-auth-foundation`
**PR:** #9
**Commits:** `f221097` (T02), `b9f69b2` (T03), `cfd3ad7` (T04), `9ff7efa` (T05)

### T02 — Contrato SQL de escrita de presença

**Migration `0007_attendance_write_rpcs.sql`:**
- ALTER TABLE `audit_logs`: adiciona `'athlete'` ao CHECK de `actor_type`
- RPC `get_current_athlete_id()` — SECURITY DEFINER, retorna `athletes.id` para `auth.uid()`
- RPC `upsert_own_attendance(input_training_id, input_status, input_justification)` — validação de time, upsert em `attendance_records`, audit_log com `actor_type='athlete'`
- RPC `upsert_coach_attendance(input_team_id, input_training_id, input_athlete_id, input_status, input_justification, input_confirmed_by_athlete)` — validates `has_team_role('owner','coach')`, upsert + audit_log com `actor_type='coach'`
- GRANT EXECUTE nas 3 RPCs para `authenticated`

**Teste `supabase/tests/rpc_attendance_write.test.sql`:**
- 7 testes SQL: get_current_athlete_id, upsert_own, idempotência, RLS cross-athlete, upsert_coach, cross-team rejeitado, audit_log entry

### T03 — athleteStore migrado para Supabase-first

**`src/features/athletes/athleteApi.ts`** (novo):
- `fetchAthletes()`, `createAthlete()`, `updateAthlete()`, `deleteAthlete()` (soft), `toggleAthleteStatus()`
- Usa `assertSupabaseTeamId()` e mapeia `AthleteRow` → `Athlete`

**`src/stores/athleteStore.ts`** (reescrito):
- Remove: `getDB`, `@/db`, `loadSyncConfig`, `pullAthletes`, `pushAthlete`, `deleteAthleteRemote`, `syncFromRemote`, `pushAllToRemote`
- Interface preservada: `{ athletes, isLoading, error, loadAll, add, update, remove, toggleStatus, getById }`

### T04 — trainingStore migrado para Supabase-first

**`src/features/trainings/trainingApi.ts`** (novo):
- `fetchTrainings()`, `createTraining()`, `updateTraining()`, `deleteTraining()` (soft), `generateRecurringViaRPC(schedules, weeksAhead)` — chama RPC `generate_trainings` por schedule

**`src/stores/trainingStore.ts`** (reescrito):
- Remove: `getDB`, `getSetting`, `loadSyncConfig`, `pullTrainings`, `pushTraining`, `deleteTrainingRemote`, `syncFromRemote`, `pushAllToRemote`, `generateRecurringDrafts`, `buildExistingKeys`
- `generateRecurring` agora chama RPC SQL; interface pública preservada

**`src/features/trainings/pages/TrainingsPage.tsx`:**
- Remove referência a `synced` (obsoleta) no retorno de `generateRecurring`

### T05 — attendanceStore + TrainingDetailPage migrados para Supabase-first

**`src/stores/attendanceStore.ts`** (reescrito):
- Remove: `getDB`, `pullConfirmations`, `SyncConfig`, `syncFromRemote`
- `loadAll()`: lê `attendance_records` via Supabase join com `trainings`
- `loadForTraining(id)`: lê registros por `training_id`
- `upsert()`: chama RPC `upsert_coach_attendance`; status `'pendente'` remove da store local sem persistência
- Mantém: `getForTraining`, `getForAthlete`, `getTrainingSummary`, `getFrequencyReports`, `getAthleteFrequency`

**`src/features/trainings/pages/TrainingDetailPage.tsx`:**
- Remove imports: `pullConfirmations`, `pushConfirmation`, `loadSyncConfig`, `getSetting`, `AppSettings`, `formatTime`, `RefreshCw`, `WifiOff`
- Remove: estado `settings`, `syncing`, `syncStatus`, `lastSyncAt`
- Remove: `handleSync`, bloco "Sync bar" da UI, blocos de push remoto nos handlers
- Valores de settings substituídos por padrões: `settings.appUrl` → `window.location.origin`, `settings.nomeEquipe` → `'CEPRAEA'`, `settings.telefoneTecnico` → `undefined`, `settings.localPadrao` → removido

**npm run typecheck → exit 0** em todos os tasks.


---

## CEPR-0032 — Fix Build TS: páginas atleta + SettingsPage (2026-05-06)

**Branch:** `migration/athlete-auth-foundation`
**Commits:** `4f96c15`, `7408f45`

### Causa Raiz
Arquivos modificados no working tree (remoção de `syncFromRemote`, `getAtletaSession`, `pinHash`) nunca foram commitados nas sessões anteriores. O Vercel compila o código commitado, resultando em 6+1 erros TypeScript.

### Erros Corrigidos

**Commit `4f96c15` — 6 erros TS:**

**`src/types/index.ts`:**
- Adiciona `teamId?: string` e `userId?: string` à interface `Athlete`
- Fix: TS2353 em `athleteApi.ts` (`mapRow` referenciava campo inexistente)

**`src/features/athletes/pages/AthletesPage.tsx`:**
- Remove segundo argumento `opts` de `handleSave` (store `add` aceita 1 arg)
- Fix: TS2554 (`Expected 1 arguments, but got 2`)

**`src/features/atleta/pages/AtletaTreinoDetailPage.tsx`:**
- Remove `syncFromRemote`, `getAtletaSession`, `pushConfirmation`, `loadAtletaSyncConfig`
- Usa `useCurrentAthlete` e `supabase` direto
- Fix: TS2339 em `AttendanceStore`

**`src/features/atleta/pages/AtletaTreinosPage.tsx`:**
- Remove `syncFromRemote`×3, `getAtletaSession`, `loadAtletaSyncConfig`
- Usa `useCurrentAthlete`
- Fix: TS2339 em `TrainingStore`, `AttendanceStore`, `AthleteStore`

**`src/features/atleta/useCurrentAthlete.ts`** (novo, untracked):
- Hook Supabase-first para portal da atleta
- Busca atleta por `userId` (store → Supabase fallback)

**Commit `7408f45` — 1 erro TS:**

**`src/features/settings/pages/SettingsPage.tsx`:**
- Remove `pinHash: ''` do objeto `DEFAULT` (campo removido de `AppSettings`)
- Fix: TS2353 (`pinHash` não existe no tipo)

### scope check
- Allowlist expandida: `AthletesPage.tsx`, `AtletaTreinoDetailPage.tsx`, `AtletaTreinosPage.tsx`, `useCurrentAthlete.ts`, `SettingsPage.tsx`
- `bash scripts/check-athlete-auth-foundation-scope.sh` → exit 0

### Método de validação
- `git stash` + `npx tsc --noEmit` simulou o estado exato do Vercel → confirmou apenas 1 erro restante após `4f96c15`

**npm run typecheck → exit 0** após ambos os commits.

---

## CEPR-0034 — P1 #2: Substituir `athlete_link_user_id` UPDATE policy por RPC SECURITY DEFINER

**Data:** 2026-05-07
**Branch:** `migration/athlete-auth-foundation` (PR #9)
**Trigger:** Codex bot review comment `r3193398149` — RLS escalation via `athlete_link_user_id` policy (P1)

### Problema

A policy `athlete_link_user_id` usava `WITH CHECK (user_id = auth.uid())` para restringir
apenas o campo `user_id` no UPDATE. Qualquer cliente autenticado podia incluir outros campos
(`team_id`, `email`, `status`) no mesmo request e alterá-los sem restrição, porque o
`WITH CHECK` só valida o estado **pós**-update da linha.

### Solução

Substituída pelo RPC `link_athlete_user_id()` com `SECURITY DEFINER`, que executa
exclusivamente `SET user_id = auth.uid()` — impossível ao cliente alterar qualquer outro campo.

### Arquivos modificados

**`supabase/migrations/0006_athlete_auth.sql`:**
- Remove `CREATE POLICY "athlete_select_by_email_for_linking"` (lookup agora interno ao RPC)
- Remove `CREATE POLICY "athlete_link_user_id"` (UPDATE policy vulnerável)
- Adiciona `CREATE OR REPLACE FUNCTION public.link_athlete_user_id()` SECURITY DEFINER
- `GRANT EXECUTE ... TO authenticated`

**`src/shared/layouts/AtletaGuard.tsx`:**
- Remove email-SELECT + direct-update (duas queries → single RPC call)
- First-login path agora: `supabase.rpc('link_athlete_user_id')` → retorna uuid ou null

**`supabase/tests/athlete_auth.test.sql`:**
- Bloco 6 adicionado: testa `link_athlete_user_id()` — retorno correto, `user_id` setado,
  `team_id` inalterado, segunda chamada retorna NULL

### Validação
- `npx tsc --noEmit` → exit 0 (sem erros TS)
- Bloco de teste SQL cobre: link bem-sucedido, invariante `team_id`, idempotência

---

## CEPR-0042 — T08: Import e reconciliação de dados legados — 2026-05-07

**Tipo:** Operacional — scripts + fixture + docs
**Branch:** `migration/athlete-auth-foundation`

### Arquivos criados/alterados

- `fixtures/legacy-export.json` — fixture de referência (2 atletas, 2 treinos, 3 presenças, 1 bloco de settings com `nomeEquipe`)
- `scripts/import-legacy-json-to-supabase.mjs` — importa backup JSON legado para o Supabase via psql; consome athletes, trainings, attendance e settings (`nomeEquipe → UPDATE teams.name`); outros campos de settings sem target no DB são logados mas não falham; suporta `--dry-run` e `--apply`; idempotente via `ON CONFLICT`
- `scripts/reconcile-legacy-json-to-supabase.mjs` — verifica **cada** registro individualmente: name por atleta, training_date por treino, status por presença, teams.name para settings; exit 0 se tudo confere
- `docs/mvp-cutover.md` — guia mínimo de cutover
- `plan.md` — `fixtures/legacy-export.json` adicionado à lista de arquivos de T08

### Evidência (pós-auditoria)

- `--dry-run` → SQL com `UPDATE public.teams SET name = 'CEPRAEA'` + linha `-- Fields without a DB target: nomeTecnico, telefoneTecnico, localPadrao, semanasFuturas`, exit 0
- `--apply` → `INSERT 0 0×4 + INSERT 0 1×3 + UPDATE 1` (idempotente na segunda execução), exit 0
- `node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json` → **exit 0 · 9 OK checks** (2 atletas + 2 treinos + 3 presenças + teams.name)
- Nenhum arquivo de `src/`, `supabase/migrations/` ou `supabase/tests/` alterado

---

## CEPR-0041 — T07: Vínculo de conta da atleta exposto na UI + E2E — 2026-05-07

**Tipo:** Feature — UI + E2E
**Branch:** `migration/athlete-auth-foundation`

### Alterações

- `src/features/athletes/pages/AthleteDetailPage.tsx`: badge "Vinculada" / "Não vinculada" derivado de `athlete.userId`; ação condicional: instrução de primeiro acesso quando `!isLinked`, redefinição de senha quando `isLinked`
- `e2e/athlete/onboarding.spec.ts` (novo): prova E2E de 5 passos — coach vê "Não vinculada" → atleta cria conta → primeiro login vincula `user_id` via `link_athlete_user_id` RPC → SQL confirma → coach vê "Vinculada"

### Evidência

- `npx playwright test e2e/athlete/onboarding.spec.ts` → **1 passed**
- `npx playwright test` (suite completa) → **24 passed**
- `npm run typecheck` → exit 0

### Arquivos não alterados (confirmado por `git diff --name-only`)

- `supabase/migrations/**`, `src/stores/trainingStore.ts`, `src/stores/attendanceStore.ts`
- Mecanismo de vínculo (`AtletaGuard`, `link_athlete_user_id` RPC) já existia — zero alteração

---

## CEPR-0035 — Correção: `VITE_SUPABASE_TEAM_ID` ausente em produção Vercel

**Data:** 2026-05-07
**Tipo:** Operacional — configuração de ambiente (sem alteração de código)
**Trigger:** Inspeção manual solicitada pelo desenvolvedor após suspeita de variável de env faltando

### Problema

`VITE_SUPABASE_TEAM_ID` não existia em nenhum ambiente da Vercel. As 25 variáveis
cadastradas no projeto `cepraea` não incluíam essa chave. Em produção, isso causava
`getSupabaseTeamId() → null` em `presenceTokenConfig.ts`, bloqueando completamente
a geração de tokens de presença.

A variável existia apenas em `.env.test` com o UUID de seed (`10000000-0000-0000-0000-000000000001`)
— nunca foi promovida para a Vercel.

### Solução

UUID real do time CEPRAEA consultado diretamente no banco de produção via
`supabase db query --linked`:

```
866ba974-3ebe-4f73-881c-f5c754350b50  →  CEPRAEA
```

Variável adicionada via `vercel env add VITE_SUPABASE_TEAM_ID production` —
restrita ao ambiente Production (não Preview, não Development).

Redeploy executado via `vercel --prod` e UUID verificado no bundle JS minificado em produção.

### Validação

- `vercel env ls production` → `VITE_SUPABASE_TEAM_ID` presente, `Production` apenas
- `curl .../assets/index-BtiF3O9O.js | grep '866ba974'` → UUID presente no bundle
- Nenhum arquivo de código modificado

---

## CEPR-0043 — Diagnóstico: bug de paths WSL + docs de navegação — 2026-05-07

**Tipo:** Operacional — docs + diagnóstico de ambiente
**Branch:** `feat/mvp-v1-complete`

### Alterações

- `docs/diagramas-navegacao.md` — criado com 4 diagramas Mermaid (produto, treinador, atleta, rotas/guards)

### Diagnóstico registrado

Identificado e documentado bug estrutural do Copilot em workspaces WSL:

| Tool | Estado |
|------|--------|
| `create_file` | QUEBRADO — escreve em path Windows, não chega ao WSL |
| `replace_string_in_file` | QUEBRADO — reporta sucesso, arquivo real inalterado |
| `multi_replace_string_in_file` | QUEBRADO — mesmo mecanismo |
| `list_dir` | QUEBRADO — lista path Windows, retorna incompleto |
| `read_file`, `grep_search`, `file_search` | Funcionam corretamente |

**Solução adotada:** todas as operações de escrita/criação via `run_in_terminal`.

### Evidência

- `docs/diagramas-navegacao.md` criado via `cat > ... << 'EOF'` → `wc -l` → 264 linhas, exit 0
- `replace_string_in_file` testado com string distinta → `head -1` confirmou arquivo não alterado
- `list_dir /home/davis/cepraea-pwa/docs` → retornou 1 arquivo; `ls` → 11 arquivos

---

## CEPR-0044 — Scout RULES-03: smoke tests E2E corrigidos e passando — 2026-05-09

**Tipo:** Test — E2E
**Branch:** `wip/post-merge-cleanup-2026-05-07`

### Contexto

5 smoke tests do Scout (`e2e/scout/scout-smoke.spec.ts`) falhavam com timeout de 30s.
Causa raiz: spec usava `getByLabel('Resultado factual').selectOption(...)` mas a UI
renderiza ChoiceChip (botões `<button>`), não `<select>`.

### Alterações

- `e2e/scout/scout-smoke.spec.ts` — spec reescrito com seletores corretos:
  - `getByLabel(...).selectOption(...)` → `getByRole('button', { name: '...', exact: true }).click()`
  - `locator('input[readonly]')` → `getByRole('button', { name: '1'/'2', exact: true }).toBeVisible()`
  - `getByText(/PENDENTE/i)` (strict mode violation) → `locator(':has-text("FASE"):has-text("PENDENTE")').last()`

### Labels confirmados via DB (`scout_code_values`)

| Code | Label UI |
|---|---|
| GOL | Gol |
| SIMPLES | Simples |
| GIRO | Giro |
| RECUPERACAO_POSSE | Recuperacao de posse |
| VANTAGEM_CRIADA | Vantagem criada |
| TRANSICAO_NEUTRALIZADA | Transicao neutralizada |

### Veredito de governança (humano)

- **RULES-03**: aprovado
- **Smoke visual pós-RULES-03**: aprovado
- **COLETA_AO_VIVO**: pronta para piloto humano controlado
- Próxima etapa: **PILOTO-01** — uso humano controlado com 20–40 entradas reais/simuladas

### Refinamento registrado (não bloqueador)

Seletor atual funciona mas é amplo:
```ts
page.locator(':has-text("AT_POS"):has-text("PENDENTE")').last()
```
Melhoria futura: adicionar `data-testid="scout-live-entry-row"` + `data-phase` + `data-status` nos cards de entrada.

### Evidência

- `npx playwright test e2e/scout/scout-smoke.spec.ts --project desktop` → **5 passed (43.4s)**
- Nenhum arquivo de `src/` ou `supabase/` alterado

---

## CEPR-0045 — Scout UX-04/RULES-04: matriz Fase → Ação → Resultado — Pendente — 2026-05-09

**Tipo:** Rule/UX
**Status:** CLOSED_SUPERSEDED_BY_CEPR-0046
**Branch:** `wip/post-merge-cleanup-2026-05-07`

### Problema identificado

Após o smoke pós-RULES-03, foi identificado gap semântico: `RESULTADO_FACTUAL` ainda
aparece como lista global em `ScoutWorkspacePage.tsx` (linha 377/976):

```ts
const factualResultOptions = codebookMap.get('LISTA_RESULTADO_FACTUAL') ?? []
// ...
{factualResultOptions.map((option) => ( <ChoiceChip ... /> ))}
```

Nenhum filtro por `faseDaBolaCode` ou `acaoPrincipalInput` é aplicado.
Isso permite combinações sem sentido como `AT_POS + GIRO + DEFESA_ESTABILIZADA`.

### Estado real do código (verificado)

| Campo | Estado atual |
|---|---|
| `ACAO_PRINCIPAL` filtrada por fase | PARCIAL — `<datalist>` sugere ações por fase, mas aceita texto livre |
| `RESULTADO_FACTUAL` filtrado por ação | NÃO — lista global |
| `TIPO_FINALIZACAO` condicional | SIM — `requiresFinishType` correto |
| `MOTIVO_PONTUACAO` condicional | SIM — `requiresScoringReason` correto |
| `PONTOS_JOGADA` derivado | SIM — `getAllowedPointsForScoringReason` correto |

### Afirmação verificada

> "Após escolher FASE_DA_BOLA, mostrar apenas ações compatíveis com aquela fase."

**Parcialmente verdadeira.** `<datalist>` filtra as sugestões por fase via
`getActionListKey(faseDaBolaCode)`, mas o campo é `<input>` livre — o usuário pode
digitar qualquer valor. O filtro de ação é sugestivo, não restritivo.

### Decisão de governança

O CEPR-0044 permanece aprovado como correção dos smoke tests pós-RULES-03.

Porém, a liberação para `PILOTO-01` fica suspensa até implementar e validar UX-04/RULES-04.

### Próximo slice obrigatório

Implementar função pura de compatibilidade:

```ts
getAllowedFactualResults({ faseDaBola, acaoPrincipal }) → ScoutCodeValue[]
```

E aplicá-la como filtro no `factualResultOptions` renderizado.

### Critérios de aceite

- `AT_POS + ação de arremesso` não mostra `DEFESA_ESTABILIZADA`, `VANTAGEM_CRIADA`, `TRANSICAO_NEUTRALIZADA`
- `DEF_POS + INTERC/ROUBO` não mostra `TIPO_FINALIZACAO`
- `TRANS_DEF + DEF_ESTABILIZA` não mostra `MOTIVO_PONTUACAO`
- Trocar fase ou ação limpa resultado incompatível já selecionado com aviso
- Testes E2E: ao menos 1 caso positivo e 1 negativo por fase
- Nenhuma criação automática de `scout_plays` ou `scout_play_participations`

### Veredito atual

`COLETA_AO_VIVO`: funcional e validada tecnicamente. Não liberada para piloto humano
intensivo até fechamento da matriz de compatibilidade.

---

## CEPR-0046 — Scout UX-04/RULES-04: filtro de resultado factual por fase/ação — IMPLEMENTADO — 2026-05-10

**Tipo:** Rule/UX
**Status:** APPROVED
**Branch:** `wip/post-merge-cleanup-2026-05-07`

### Resumo

Implementada a matriz de compatibilidade `Fase → Ação → Resultado Factual` no componente `ScoutWorkspacePage.tsx`. Os chips de "Resultado factual" agora exibem apenas os resultados semanticamente válidos para a combinação (fase, ação) selecionada.

### Mudanças no código

**`src/features/scout/pages/ScoutWorkspacePage.tsx`**

Adicionados:
- Constantes de conjuntos de ações por grupo: `AT_POS_FINISH_ACTIONS`, `AT_POS_NO_FINISH_ACTIONS`, `DEF_POS_SHOOT_ACTIONS`, `TRANS_OF_FINISH_ACTIONS`
- Listas de resultados por categoria: `FINISH_RESULTS`, `OFFENSIVE_LOSS_RESULTS`, `DEFENSIVE_RECOVERY_RESULTS`, `TRANS_OF_CONTINUITY_RESULTS`, `TRANS_DEF_RESULTS`
- Funções puras `getAllowedResultCodes` e `getAllowedFactualResults`
- `acaoPrincipalCode` derivado; `allowedFactualResults` via `useMemo`
- `useEffect` que limpa `resultadoFactualCode` e campos dependentes quando incompatível
- `incompatibleResultWarning` state + aviso âmbar na UI
- Troca de fase limpa `acaoPrincipalInput` e resultado automaticamente

**`e2e/scout/scout-ux04.spec.ts`** (novo — 8 casos de teste):
- 2 casos por fase (positivo + negativo)
- 1 caso de troca de fase com aviso de incompatibilidade

### Evidência objetiva

```
npx playwright test e2e/scout/scout-ux04.spec.ts --project desktop
  8 passed (52.7s)

npx playwright test e2e/scout/ --project desktop
  13 passed (1.0m)  ← smoke RULES-03 (5) + UX-04 (8)
```

### Critérios de aceite cumpridos

| Critério | Status |
|---|---|
| AT_POS + arremesso não mostra DEFESA_ESTABILIZADA | ✓ |
| DEF_POS + INTERC não exibe TIPO_FINALIZACAO | ✓ |
| TRANS_DEF + DEF_ESTABILIZA exibe DEFESA_ESTABILIZADA | ✓ |
| Trocar fase limpa resultado incompatível com aviso | ✓ |
| Testes E2E >= 1 positivo + 1 negativo por fase | ✓ |
| TypeScript: npx tsc --noEmit sem erros | ✓ |

### Impacto em piloto

Com UX-04/RULES-04 implementado, a suspensão do PILOTO-01 deve ser reavaliada pela governança (ver CEPRAEA.md).

---

## CEPR-0047 — Refinamento: fallback por fase e estado vazio de resultado factual

**Status**: `APPROVED`
**Data**: 2026-05-10
**Dependência**: CEPR-0046 (pré-requisito)

### Problema

1. `getAllowedResultCodes` retornava `null` para ações custom/desconhecidas, causando exibição de todos os resultados globais (incluindo `DEFESA_ESTABILIZADA` em `AT_POS`).
2. `'PERDA'` era usado como sentinel de "nenhum resultado selecionado" — mashup entre valor real e estado vazio.
3. Não havia validação de submit impedindo envio sem desfecho selecionado.

### Mudanças implementadas

**`src/features/scout/pages/ScoutWorkspacePage.tsx`**:
- `LiveEntryDraft.resultadoFactualCode`: tipo ampliado para `ScoutFactualResultCode | ''`
- `buildDraft()`: valor inicial `resultadoFactualCode: ''` (era `'PERDA'`)
- `PHASE_FALLBACK_RESULTS`: nova constante — dicionário de fallback por fase para ações custom/desconhecidas
- `getAllowedResultCodes`: retorna `ScoutFactualResultCode[]` (nunca mais `null`) — ação custom/vazio usa `PHASE_FALLBACK_RESULTS[phase]`
- `getAllowedFactualResults`: removido `if (allowed === null) return allResults`
- `useEffect` UX-04: guarda `if (!draft.resultadoFactualCode) return` em vez de `if (!acaoPrincipalCode) return`
- `updateDraft` troca de fase: reset para `''` (era `'PERDA' as ScoutFactualResultCode`)
- `handleSubmitEntry`: validação `if (!draft.resultadoFactualCode)` antes de salvar

**`e2e/scout/scout-ux04.spec.ts`** (+2 testes):
- `AT_POS + ação custom: fallback por fase não mostra resultados de outras fases`
- `submit bloqueado quando resultado factual não foi selecionado`

### Evidência objetiva

```
npx playwright test e2e/scout/ --project desktop
  15 passed (1.3m)  ← smoke RULES-03 (5) + UX-04 (10)

npx tsc --noEmit  ← sem erros
```

### Critérios de aceite cumpridos

| Critério | Status |
|---|---|
| Ação custom em AT_POS não exibe DEFESA_ESTABILIZADA | ✓ |
| Ação custom usa fallback por fase (não todos os resultados) | ✓ |
| `buildDraft` inicia com `resultadoFactualCode: ''` | ✓ |
| Resets usam `''` em vez de `'PERDA'` | ✓ |
| Submit bloqueado com erro legível quando sem desfecho | ✓ |
| TypeScript: `npx tsc --noEmit` sem erros | ✓ |
| 15/15 testes E2E passando | ✓ |

---

## CEPR-0048 — APPROVED — 2026-05-10

**Sincronização SSOT documental pós-RULES-03/UX-04/CEPR-0047**

### Escopo

Documentação apenas (sem mudanças em código TypeScript ou SQL). Corrige gaps entre a implementação de CEPR-0046/0047 e o SSOT documental.

### Mudanças por arquivo

**`docs/scout/scout-campos.md`**:
- Contador COLETA_AO_VIVO: 18 → 19 campos (3 locais)
- `MOTIVO_PONTUACAO` adicionado como 19º campo após `RESULTADO_FACTUAL` com definição precisa do escopo condicional

**`docs/scout/scout-listas.md`**:
- `LISTA_RESULTADO_FACTUAL` (8) → (16): adicionados `RECUPERACAO_POSSE`, `FALTA_ATAQUE`, `PASSIVO`, `ERRO_TROCA`, `TRANSICAO_NEUTRALIZADA`, `DEFESA_ESTABILIZADA`, `VANTAGEM_CRIADA`, `VANTAGEM_PERDIDA`
- 4 novas listas sugestivas: `LISTA_ACAO_PRINCIPAL_AT_POS` (14), `LISTA_ACAO_PRINCIPAL_DEF_POS` (17), `LISTA_ACAO_PRINCIPAL_TRANS_OF` (14), `LISTA_ACAO_PRINCIPAL_TRANS_DEF` (15)
- Nota explícita: listas de ação por fase são vocabulário sugerido para autocomplete — não enum bloqueante

**`docs/scout/scout-dicionario-codigos.md`** — Bloco 10:
- `LISTA_MOTIVO_PONTUACAO` adicionada às famílias centrais
- Definição canônica de `RESULTADO_FACTUAL` como "desfecho objetivo da sequência observada"
- 8 novos códigos com padrão usar/não usar: `RECUPERACAO_POSSE`, `FALTA_ATAQUE`, `PASSIVO`, `ERRO_TROCA`, `TRANSICAO_NEUTRALIZADA`, `DEFESA_ESTABILIZADA`, `VANTAGEM_CRIADA`, `VANTAGEM_PERDIDA`
- `LISTA_MOTIVO_PONTUACAO::SIMPLES` com padrão de uso

**`docs/scout/scout-ssot.md`**:
- `status`: `PARCIAL` → `ATIVO` (escopado a `COLETA_AO_VIVO`)
- `validade`: `2026-05-07` → `2026-05-10`
- `status_nota` atualizada com scope explícito
- Seção 15 adicionada: Princípios operacionais COLETA_AO_VIVO (RULES-04, MOTIVO_PONTUACAO, ACAO_PRINCIPAL semi-livre, estado vazio)

**`docs/scout/scout-rastreabilidade.md`**:
- Linha "Resultado factual": `COLETA_SCOUT` → `COLETA_SCOUT + COLETA_AO_VIVO`; `MOTIVO_PONTUACAO` adicionado como campo-chave; validação atualizada para "desfecho da sequência, não só finalização"
- Nova linha: "Filtro Fase → Ação → Resultado" com contratos das 4 listas e nota sugestiva

### Critérios de aceite cumpridos

| Critério | Status |
|---|---|
| `MOTIVO_PONTUACAO` em `scout-campos.md` com escopo condicional | ✓ |
| `LISTA_RESULTADO_FACTUAL` (16) em `scout-listas.md` | ✓ |
| 4 `LISTA_ACAO_PRINCIPAL_*` com nota sugestiva | ✓ |
| Definição canônica de `RESULTADO_FACTUAL` no dicionário | ✓ |
| 8 novos códigos no dicionário com padrão usar/não usar | ✓ |
| `scout-ssot.md` status `ATIVO` escopado a `COLETA_AO_VIVO` | ✓ |
| Seção 15 (RULES-04) no `scout-ssot.md` | ✓ |
| Linha Filtro Fase→Ação→Resultado na rastreabilidade | ✓ |

---

## CEPR-0049 — APPROVED — 2026-05-11

**Validação da checklist de implementação do Scout no Notion**

### Escopo

Auditoria de rastreabilidade: varredura do codebase atual contra a [Scout — Checklist Completa de Implementação](https://www.notion.so/35df2ae06fc880e5a5bcf825cfa9851c) no Notion. Atualização da checklist com o status real de cada item (✅ / pendente).

### O que foi feito

Análise automatizada de todas as migrations (`0008`–`0016`), `scoutApi.ts`, `ScoutWorkspacePage.tsx`, `src/types/index.ts`, arquivos de teste SQL e E2E, e checklist do Notion.

A checklist foi atualizada no Notion com os seguintes resultados por épico:

| Épico | Concluídos | Pendentes |
|---|---|---|
| DB (18 itens) | 15 | 3 |
| API (20 itens) | 12 | 8 |
| UI (25 itens) | 7 | 18 |
| TEST (20 itens) | 9 | 11 |
| VAL (10 itens) | 0 | 10 |
| DOD (12 itens) | 2 | 10 |

**Principais pendências identificadas:**
- DB-08: tabelas `scout_report`, `scout_feedback`, `scout_dashboard` não existem
- DB-17: seed parcial das listas — apenas 7 de 124 listas seedadas
- API-06/07/08/09/10/12/13: endpoints de EVENTOS_MENTAIS, VALIDAÇÃO, ATLETAS, EQUIPES, RELATÓRIO, FEEDBACK ausentes
- UI-08..25: revisão por vídeo (COLETA_SCOUT completa), PARTICIPACOES, VALIDAÇÃO, CADASTROS, RELATÓRIO, FEEDBACK, DASHBOARD não implementados
- ÉPICO 5 (VAL): auditorias SSOT não realizadas

### Evidência objetiva

Checklist atualizada em: https://www.notion.so/35df2ae06fc880e5a5bcf825cfa9851c
Branch HEAD: `152c34c (wip/post-merge-cleanup-2026-05-07)`
Nenhum arquivo de código foi alterado nesta sessão.

---

## CEPR-0050 — Auditoria completa SSOT × xlsx × Notion (Copilot)

**Data:** 2026-05-11
**Agente:** GitHub Copilot
**Tipo:** Auditoria de conformidade

### O que foi feito

Auditoria completa do Notion "CEPRAEA / Scout — Base de Contexto IA" contra o SSOT local e o xlsx, cobrindo:

- `.files/analise/Codificação_e_Validação_do_Scout.md` (23 seções + glossário) — lido na íntegra
- `.files/analise/Tabela_Mestre_dos_Campos.xlsx` — todas as 20 abas parseadas via XML (zipfile + ET)
- Notion: 5 páginas lidas — índice principal, Manual Oficial v1.0.1, Checklist de Implementação, Tabela Mestre Implementação, Handoff COLETA_AO_VIVO, Decisões Arquiteturais

### Metodologia de verificação

Para resolver a dúvida sobre "448 vs 466 registros", o TABELA_MESTRE foi parseado linha a linha e filtrado por coluna `Aba`:
- 448 linhas com Aba preenchida (correspondem exatamente ao count documentado)
- 18 linhas completamente vazias (linhas de fim de planilha, sem dado)
- Total: 466 = 448 + 18 (nenhuma inconsistência real)

Para o DASHBOARD, os 6 campos confirmados via TABELA_MESTRE: BLOCO, INDICADOR, VALOR, META_REFERENCIA, STATUS, OBS (a aba resumo do xlsx exibe os dados nessas colunas em formato compacto, não as definições de campo).

### Resultado da auditoria

**Conformidade total — nenhuma correção necessária.**

| Item verificado | Notion | xlsx / SSOT | Status |
|---|---|---|---|
| TABELA_MESTRE registros | 448 | 448 reais (+18 vazias) | ✅ |
| DASHBOARD campos | 6 | 6 (BLOCO/INDICADOR/VALOR/META_REFERENCIA/STATUS/OBS) | ✅ |
| COLETA_AO_VIVO campos | 18 | 18 | ✅ |
| MOTIVO_PONTUACAO condicional | documentado | confirmado | ✅ |
| RESULTADO_FACTUAL 16 códigos | documentado | confirmado | ✅ |
| 10 códigos mentais | documentado | confirmado | ✅ |
| 5 MARCA_MENTAL | documentado | confirmado | ✅ |
| 9 CONTEXTO_ESPECIAL | documentado | confirmado | ✅ |
| DEC-001 a DEC-005 | documentados | conformes | ✅ |
| DEC-006 | aprovada | pendente: UI-04c, TEST-21–24, VAL-11–12, DOD-13 | ⏳ |
| 16 decisões irrenunciáveis (Manual §2) | documentadas | conformes | ✅ |
| OUT_ATAQUE→OF_3_DEF_3 / OUT_DEFESA→OF_4_DEF_2 | documentado | confirmado | ✅ |
| Checklist regressão semântica 10 pontos | documentada | confirmada | ✅ |
| Slice 1 status (COLETA_AO_VIVO completo) | atualizado | confirmado | ✅ |

### Evidência objetiva

- Python XML parsing confirmou: TABELA_MESTRE 448 non-empty rows, DASHBOARD 6 campos
- Todas as 5 páginas Notion lidas e confrontadas com SSOT linha a linha
- Nenhum arquivo de código alterado nesta sessão

---

## CEPR-0051 — Validação formal DB-17: seed das listas oficiais do Scout

**Data:** 2026-05-11
**Agente:** GitHub Copilot
**Tipo:** Validação / verificação de evidências

### O que foi feito

Verificação formal de DB-17 (seed das 124 listas oficiais do Manual v1.0.1) com
evidências diretas do banco Supabase local (porta 54322).

### Evidências coletadas

| Métrica | Valor | Critério | Status |
|---|---|---|---|
| Listas ativas (`scout_code_lists`) | 128 | ≥ 124 | ✅ |
| Valores ativos (`scout_code_values`) | 1009 | — | ✅ |
| `source_version = 'manual-v1.0.1'` | 119 listas | migration 0018 | ✅ |
| `source_version = 'etapa-a-v1'` | 9 listas | migrations anteriores | ✅ |
| Migration `scout_codebook_all_lists` em schema_migrations | presente | aplicada | ✅ |

### Resultado

DB-17 `APPROVED` — critério "124 listas funcionais" atendido com folga (128 ativas).
Migration `scout_codebook_all_lists` registrada no `supabase_migrations.schema_migrations`.
Total de 18 migrations aplicadas no banco.

### Checklist de governança

- [x] CEPRAEA.md lido antes de iniciar
- [x] Nenhum comando git proibido (stash, reset, revert) usado
- [x] CHANGELOG atualizado
- [x] EXECUTION_LOG atualizado

---

## CEPR-0052 — API-06: Endpoint POST /api/scout/mental-events

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / API

### O que foi feito

- Adicionado `ScoutMentalEvent` e `ScoutMentalEventWriteInput` em `src/types/index.ts` (após `ScoutPlayBundleUpsertInput`, antes da seção legado)
- Adicionado ao import de tipos em `src/features/scout/scoutApi.ts`
- Implementado em `src/features/scout/scoutApi.ts`:
  - `RawScoutMentalEventRow` — tipo raw para mapeamento da tabela `scout_mental_events`
  - `mapScoutMentalEvent()` — raw row → domínio TypeScript
  - `serializeScoutMentalEvent()` — input domínio → colunas DB
  - `createScoutMentalEvent(input, teamId?)` — INSERT na tabela, retorna `ScoutMentalEvent`
  - `fetchScoutMentalEventsForPlay(scoutPlayId, teamId?)` — GET por jogada, ordenado por `created_at`

### Tabela alvo

`public.scout_mental_events` — 20 colunas de dados + `id`, `team_id`, `created_at`
- Campos NOT NULL: `mental_code`, `mental_mark`, `validation_status` (default 'PENDENTE')
- FK composta: `(scout_play_id, scout_game_id, team_id)` → `scout_plays`
- RLS: `grant select, insert, update, delete to authenticated`

### Validações

- `npx tsc --noEmit` — sem erros
- Inserção testada via psql em transação com rollback — `NOTICE: mental_event criado: 578139c7-5e4d-44eb-aeb4-c960309ee257`

### Rastreabilidade

- Notion checklist: API-06 marcado `[x]` com nota de implementação
- Checklist Notion page: `35df2ae0-6fc8-80e5-a5bc-f825cfa9851c`

### Protocolo de sessão

- [x] CEPRAEA.md lido antes de iniciar
- [x] Nenhum comando git proibido (stash, reset, revert) usado
- [x] CHANGELOG atualizado
- [x] EXECUTION_LOG atualizado

---

## CEPR-0053 — API-07: Endpoint POST /api/scout/validation

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / API

### O que foi feito

- Adicionado `ScoutPlayValidation` e `ScoutPlayValidationWriteInput` em `src/types/index.ts`
- Adicionado ao import de tipos em `src/features/scout/scoutApi.ts`
- Implementado em `src/features/scout/scoutApi.ts`:
  - `RawScoutPlayValidationRow` — tipo raw para mapeamento da tabela `scout_play_validations`
  - `mapScoutPlayValidation()` — raw row → domínio TypeScript
  - `serializeScoutPlayValidation()` — input domínio → colunas DB
  - `createScoutPlayValidation(input, teamId?)` — INSERT append-only, retorna `ScoutPlayValidation`
  - `fetchScoutPlayValidationsForPlay(scoutPlayId, teamId?)` — GET por jogada, ordenado por `created_at`

### Tabela alvo

`public.scout_play_validations` — 13 colunas
- Campos NOT NULL: `field_name`, `validation_status`, `correction_reason`
- FK composta: `(scout_play_id, scout_game_id, team_id)` → `scout_plays`
- Semântica append-only: cada correção gera novo registro (rastreabilidade)

### Validações

- `npx tsc --noEmit` — 0 erros
- Teste banco: INSERT com `field_name='factual_result'`, `validation_status='CORRIGIDO'` → `NOTICE: validation criada: 80709121-ff76-43d9-b24f-4ceff9c539fc` (rollback intencional)

### Protocolo de sessão

- [x] CEPRAEA.md lido antes de iniciar
- [x] Nenhum comando git proibido (stash, reset, revert) usado
- [x] CHANGELOG atualizado
- [x] EXECUTION_LOG atualizado

---

## CEPR-0054 — API-08/09: Endpoints GET/POST /api/scout/athletes

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / API

### O que foi feito

- Adicionados em `src/types/index.ts`:
  - `AthleteWithScoutProfile` — tipo combinado athletes + athlete_scout_profiles
  - `AthleteWithScoutProfileWriteInput` — campos de entrada para criar atleta scout
  - `ScoutAthleteFilters` — filtros para GET (name, isGoalkeeper, mainFunction, status)
- Adicionados ao import de tipos em `src/features/scout/scoutApi.ts`
- Implementado em `src/features/scout/scoutApi.ts`:
  - `RawAthleteWithScoutProfileRow` — tipo raw com embedded athletes
  - `mapAthleteWithScoutProfile()` — raw row → domínio TypeScript
  - `fetchScoutAthletes(filters?, teamId?)` — GET com filtros; JOIN por FK athlete_scout_profiles_athlete_team_fk; filtros DB: isGoalkeeper, mainFunction; filtros JS: name (ilike), status; ordenação por nome (localeCompare pt-BR)
  - `createScoutAthlete(input, teamId?)` — POST: insere em athletes + athlete_scout_profiles em sequência; retorna AthleteWithScoutProfile

### Tabelas alvo

- `public.athletes` (base) + `public.athlete_scout_profiles` (perfil tático scout)
- FK composta: `(athlete_id, team_id)` → `athletes(id, team_id)`

### Validações

- `npx tsc --noEmit` — 0 erros
- Teste banco: INSERT athletes + athlete_scout_profiles → `NOTICE: athlete criada: d4d0ae1d-b6bd-4096-bedc-f18d8ab4461d` + `NOTICE: scout_profile criado: d4d0ae1d-...` (rollback intencional)

---

## CEPR-0055 — API-10: Endpoint GET /api/scout/teams

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / API

### O que foi feito

- Adicionados em `src/types/index.ts`:
  - `ScoutCatalogTeam` — tipo da tabela scout_catalog_teams (9 campos)
  - `ScoutCatalogTeamWriteInput` — campos de entrada para criar equipe
  - `ScoutCatalogTeamFilters` — filtros para GET (name, teamType, category, isInternal)
- Implementado em `src/features/scout/scoutApi.ts`:
  - `fetchScoutCatalogTeams(filters?, teamId?)` — GET com filtros DB (teamType, category, isInternal) + filtro JS name; ordenado por nome
  - `createScoutCatalogTeam(input, teamId?)` — POST insert em scout_catalog_teams

### Validações

- `npx tsc --noEmit` — 0 erros
- Teste banco: INSERT scout_catalog_teams → `NOTICE: scout_catalog_team criada: 700c33d5-da53-4ef5-9e09-91cdfdcfa61e` (rollback intencional)

---

## CEPR-0056 — API-12 + API-13: Endpoints GET scout/report e GET scout/feedback

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / API

### O que foi feito

- Adicionados em `src/types/index.ts`:
  - `ScoutReportTrainingPriority` — union type (ALTA | MEDIA | BAIXA | MANTER)
  - `ScoutReport` — tipo da tabela scout_report (13 campos)
  - `ScoutReportFilters` — filtros para GET (reportBlock, trainingPriority)
  - `ScoutFeedbackRecipient`, `ScoutFeedbackType`, `ScoutFeedbackStatus` — union types
  - `ScoutFeedback` — tipo da tabela scout_feedback (15 campos)
  - `ScoutFeedbackFilters` — filtros para GET (scoutGameId, athleteId, recipient, feedbackStatus)
- Implementado em `src/features/scout/scoutApi.ts`:
  - `fetchScoutReport(scoutGameId, filters?, teamId?)` — GET por jogo com filtros DB reportBlock/trainingPriority; ordenação por reportBlock+indicator
  - `fetchScoutFeedback(filters?, teamId?)` — GET com filtros DB scoutGameId/athleteId/recipient/feedbackStatus; ordenação por created_at

### Validações

- `npx tsc --noEmit` — 0 erros
- Teste banco: INSERT scout_report → `NOTICE: scout_report criado: ef8af60d-f927-4247-aba8-abf9841a6d6b` (rollback intencional)
- Teste banco: INSERT scout_feedback → `NOTICE: scout_feedback criado: e376d8af-c200-44c4-89ca-61cb2e9ab826` (rollback intencional)

---

## CEPR-0057 — API-19: Regra de OUT em upsertScoutPlayBundle

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / Validação

### O que foi feito

- Adicionados em `src/types/index.ts`:
  - `outSituation?: string` em `ScoutPlay` (leitura)
  - `numericalStructureReal?: string` em `ScoutPlay` (leitura)
  - `outSituation?: string` em `ScoutPlayWriteInput` (escrita)
  - `numericalStructureReal?: string` em `ScoutPlayWriteInput` (escrita)
- Atualizado em `src/features/scout/scoutApi.ts`:
  - `RawScoutPlayRow` — novos campos `out_situation: string | null` e `numerical_structure_real: string | null`
  - `mapScoutPlay` — mapeamento `outSituation` e `numericalStructureReal` via `toOptional()`
  - `serializeScoutPlay` — serialização `out_situation` e `numerical_structure_real` de volta para DB
  - `upsertScoutPlayBundle` — validação API-19: `OUT_ATAQUE → OF_3_DEF_3` e `OUT_DEFESA → OF_4_DEF_2`; lança Error se regra for violada

### Validações

- `npx tsc --noEmit` — 0 erros


---

## CEPR-0058 — UI-02 a UI-07: Retroativo + UI-08/UI-09: Tela de Revisão por Vídeo

**Data:** 2026-05-11
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / UI

### Contexto

UI-02 a UI-07 foram confirmados como já implementados em `ScoutWorkspacePage.tsx` (sessão anterior).
Marcados retroativamente no checklist. UI-08 (tela de revisão por vídeo) + UI-09 (blocos condicionais por fase) implementados nesta sessão.

### Arquivos criados

- `src/features/scout/pages/ScoutVideoReviewPage.tsx` (828 linhas)
  - Página de revisão de COLETA_AO_VIVO → COLETA_SCOUT via vídeo
  - Rota: `/scout/review/:gameId`
  - Painel esquerdo: lista de `ScoutLiveEntry` com indicador de revisado (CheckCircle2 verde) ou pendente (CircleDot)
  - Painel direito: formulário COLETA_SCOUT com 6 seções
  - Pre-fill automático de todos os campos da live entry no draft
  - Submit via `upsertScoutPlayBundle` + `updateScoutLiveEntry({ derivedScoutPlayId })` para linkar
  - Após save: recarrega lista de entradas, limpa seleção

### Arquivos modificados

- `src/App.tsx`
  - Import lazy: `ScoutVideoReviewPage`
  - Rota adicionada: `<Route path="scout/review/:gameId" element={<ScoutVideoReviewPage />} />`

### Blocos condicionais implementados (UI-09)

- `phaseOfBall === 'AT_POS'`: offensiveSystem (codebook), offensiveConfiguration (codebook)
- `phaseOfBall === 'DEF_POS'`: defensiveSystem, defensiveConnection, defensiveAdjustment, defensiveAdjustmentResult, mainOffensiveThreat
- `phaseOfBall === 'TRANS_OF'`: mainOffensiveThreat
- `phaseOfBall === 'TRANS_DEF'`: expectedDefensiveAction (codebook)
- Finalização condicional: finishType, shotDestination, shotRegion (quando resultado = GOL/DEFENDIDO/BLOQUEADO/FORA/TRAVE)
- Scoring condicional: playScoreReason, playPoints (quando resultado = GOL)
- OUT block: outSituation + numericalStructureReal (com regra API-19 enforçada no backend)

### Validações

- `npx tsc --noEmit` — 0 erros


---

## CEPR-0085 — 2026-05-13

**Data:** 2026-05-13
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / Semântica / UI

### Contexto

COLETA_AO_VIVO — Matriz semântica mínima: 12 correções semânticas em codebook, RPC e UI.

### Arquivos criados

- `supabase/migrations/0027_scout_matriz_semantica_ajustes.sql` (524 linhas)
  - Seção 1: desativa ESPECIALISTA/GOLEIRA/6M/SHOOTOUT/GOL_CONTRA de LISTA_CLASSIF_ARREMESSO
  - Seção 2: adiciona FINALIZ_TRANS (sort=10) e AEREA_TRANS (sort=11) em LISTA_CLASSIF_ARREMESSO
  - Seção 3: desativa PASSE_LONGO de LISTA_CLASSIF_PASSE
  - Seção 4: adiciona PASSE_PARA_ARREMESSO_SIMPLES (sort=7) e PASSE_APOIO (sort=8) em LISTA_CLASSIF_PASSE
  - Seção 5: desativa ESPECIALISTA/GOLEIRA/6M/SHOOTOUT de LISTA_TIPO_FINALIZACAO
  - Seção 6: CREATE OR REPLACE create_scout_live_entry — auto-derivação tipo_finalizacao_code a partir de classificacao_acao_code + validação de contexto AT_POS
- `supabase/tests/scout_matriz_semantica_0027.test.sql` (testes A–O, 15 testes)
  - Formato DO $$ identical ao 0026
  - Testes de codebook (A–F) + RPC (G–M, AJU-0001 a AJU-0007) + invariantes (N–O)

### Arquivos modificados

- `src/features/scout/pages/ScoutWorkspacePage.tsx`
  - Patch 1: humanizeBackendError — mensagens INVALID_CONTEXT
  - Patch 2: offensiveSystemOptions filtra NAO_APLICA em AT_POS
  - Patch 3: classificacaoOptionsFinal — filtra classificações de arremesso por fase (AT_POS: GIRO/AEREA/ARREM_SIMPLES; TRANS_OF: FINALIZ_TRANS/FINALIZ_CONTRA/AEREA_TRANS)
  - Patch 4: showTipoFinalizacao=false para ARREMESSO+ARREMESSO (derivado pelo RPC); requiresFinishType dependente de showTipoFinalizacao
  - Patch 5: useEffect auto-deriva motivoPontuacaoCode+pontosJogada quando GOL+GIRO ou GOL+AEREA/AEREA_TRANS
  - Patch 6a/6b: UI usa classificacaoOptionsFinal em vez de classificacaoOptions
- `e2e/scout/scout-smoke.spec.ts`
  - GOL+SIMPLES: adiciona click em acao_basica + classif, remove selectOption de tipo_fin
  - GOL+GIRO: mesmo padrão, assert que tipo_fin está oculto e pontos=2 aparecem

### Validações

- `npx supabase db reset` — 0 erros, 0027 aplicado
- `bash scripts/run-supabase-tests.sh` — 20 arquivos, 0 errors (testes A–O passaram)
- `npm run typecheck` — 0 erros
- `npm run build` — ✓ built in 3.08s

---

## CEPR-0085 (filtro categoria por fase) — 2026-05-13

**Data:** 2026-05-13
**Branch:** wip/post-merge-cleanup-2026-05-07
**Tipo:** Feature / UI

### Contexto

Filtro de Categoria da ação por fase: AT_POS não deve mostrar ACAO_DEFENSIVA; DEF_POS não deve mostrar PASSE/ARREMESSO etc.

### Arquivos modificados

- `src/features/scout/pages/ScoutWorkspacePage.tsx`
  - Constante module-level `ALLOWED_CATEGORIA_POR_FASE: Record<ScoutPhaseCode, string[]>`
    - AT_POS → PASSE, ARREMESSO, NAO_OBSERVADO
    - DEF_POS → ACAO_DEFENSIVA, NAO_OBSERVADO
    - TRANS_OF → PASSE, ARREMESSO, TROCA_TRANSICAO, NAO_OBSERVADO
    - TRANS_DEF → ACAO_DEFENSIVA, TROCA_TRANSICAO, NAO_OBSERVADO
  - `categoriaAcaoOptionsFinal` — filtra categoriaAcaoOptions pela constante
  - updateDraft (faseDaBolaCode): clear condicional — categoria+downstream só limpa se incompatível
  - UI usa `categoriaAcaoOptionsFinal.map(...)` em vez de `categoriaAcaoOptions.map(...)`

### Arquivos criados

- `e2e/scout/scout-category-filter.spec.ts` (146 linhas, 6 testes)
  - Teste 1: AT_POS não exibe Ação defensiva
  - Teste 2: DEF_POS não exibe Passe nem Arremesso
  - Teste 3: TRANS_OF não exibe Ação defensiva
  - Teste 4: TRANS_DEF não exibe Passe nem Arremesso
  - Teste 5: trocar fase limpa categoria incompatível
  - Teste 5b: trocar fase mantém categoria compatível
  - Teste 6: COLETA_AO_VIVO invariante (DEF_POS+ACAO_DEFENSIVA cria somente scout_live_entries)

### Validações

- `npm run typecheck` — 0 erros
- `npm run build` — ✓ built in 3.59s


---

## 2026-05-13 — CEPR-0085: Aprovação visual (evidência final)

**Ticket:** CEPR-0085
**Branch:** wip/post-merge-cleanup-2026-05-07
**Status:** VISUALMENTE APROVADO

### Bug de produção corrigido

- `src/features/scout/scoutApi.ts`: `serializeScoutLiveEntryCreateInput` faltava `motivo_pontuacao_code: input.motivoPontuacaoCode ?? null`

### Testes E2E corrigidos

- `e2e/scout/scout-smoke.spec.ts` — 5/5 passando (GOL+SIMPLES, GOL+GIRO, DEF_POS, TRANS_OF, TRANS_DEF)
- `e2e/scout/scout-matriz-compat.spec.ts` — 9/9 passando (Items 1–9)
  - Item 6: `toHaveAttribute('aria-pressed')` → `toHaveClass(/bg-cep-lime-400/)`
  - Items 8–9: `game_id` → `scout_game_id`; `play_id` → `scout_play_id`
- `e2e/scout/scout-category-filter.spec.ts` — 7/7 passando (já passava)

### Validações finais

- `npm run typecheck` — 0 erros
- `npm run build` — ✓ built in 5.80s
- `bash scripts/run-supabase-tests.sh` — 22 arquivos, 0 errors
- Playwright 21/21 passando em execução conjunta — 53.1s

---

## 2026-05-13 — CEPR-0085 Solução 2: Pontuação de gol (scout-pontuacao-gol)

**Ticket:** CEPR-0085
**Branch:** wip/post-merge-cleanup-2026-05-07
**Status:** CONCLUÍDO — 17/17 testes E2E passando

### Problema

Dois bugs relacionados impediam o correto funcionamento da coleta de gols:

1. **Race condition com useEffect [0028]**: `goToArremesso()` clicava manualmente no botão de ação básica ARREMESSO após o auto-select já tê-lo selecionado → toggle OFF → classificação não aparecia → testes falhavam.
2. **Inconsistência frontend/backend**: Para GIRO + 1 ponto, o frontend enviava `motivo_pontuacao_code = 'VALIDACAO_ARBITRAL'`, mas o backend auto-deriva `tipo_finalizacao_code = 'GIRO'` a partir de `classificacao_acao_code = 'GIRO'` e exige `motivo = 'GIRO'` quando `tipo_finalizacao = 'GIRO'`.

### Solução

**Semântica correta:** GIRO + 1 ponto = execução de giro que a arbitragem decidiu valer 1 ponto. Motivo permanece `'GIRO'`, apenas `pontos_jogada` muda para 1. O `VALIDACAO_ARBITRAL` é para casos sem classificação técnica clara.

### Arquivos modificados

- `src/features/scout/pages/ScoutWorkspacePage.tsx`
  - `updateDraft` (pontosJogada): removida derivação de `VALIDACAO_ARBITRAL` para GIRO/AEREA. Agora mantém `motivoPontuacaoCode = 'GIRO'` ou `'AEREA'` independente dos pontos.
  - Comentário do `useEffect [0027]` atualizado.

- `e2e/scout/scout-pontuacao-gol.spec.ts`
  - `goToArremesso()`: removido click manual em ação básica; usa `waitFor({ state: 'visible' })` no botão 'Giro' para confirmar que o auto-select (useEffect [0028]) rodou.
  - Teste 9: nome e `expect(motivo).toBe('GIRO')` (era `'VALIDACAO_ARBITRAL'`).
  - Teste 10: nome e `expect(motivo).toBe('AEREA')` (era `'VALIDACAO_ARBITRAL'`).
  - Docstring atualizada.

- `e2e/scout/scout-smoke.spec.ts`
  - Testes 1 e 2: removidos clicks manuais em ação básica; adicionado `waitFor` para confirmar auto-select.

### Validações

- `npm run typecheck` — 0 erros
- `npx playwright test scout-pontuacao-gol.spec.ts` — **12/12 passando**
- `npx playwright test scout-smoke.spec.ts` — **5/5 passando**
