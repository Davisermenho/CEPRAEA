---
tipo: AUDITORIA
nome: "Análise Adversarial de plan.md — 2026-05-06"
papel: "Lista gaps, erros factuais e bloqueios estruturais identificados em plan.md contra o estado real do repositório na data de geração."
autoridade: "Advisory — não é documento normativo; achados tornam-se obsoletos conforme tarefas são executadas; sempre re-verificar antes de agir."
lido_por: "Claude, Codex, Copilot"
quando_ler: "antes de atualizar plan.md; ao identificar por que uma tarefa não pode ser concluída; antes de corrigir scripts de validação"
atualizado_por: "Agente executor"
quando_atualizar: "nova rodada de auditoria com comandos re-executados contra o repositório atual"
validade: "2026-05-06"
status: PARCIAL
status_nota: "Achados estruturais permanecem válidos; achados sobre arquivos específicos devem ser re-verificados contra código atual"
conflito: "Se achado contradiz código atual → verificar código antes de agir; esta auditoria não prevalece sobre código."
proibido:
  - "Agentes NÃO devem deletar código, corrigir scripts ou alterar plan.md baseados APENAS neste documento sem re-verificar contra o repositório"
nao_cobre: "O que fazer (→ plan.md), o que é o produto (→ CEPRAEA.md), como executar cada tarefa, decisões de produto"
---

# Auditoria Adversarial — plan.md
**Data:** 2026-05-06  
**Método:** Leitura cruzada entre plan.md, CEPRAEA.md, AGENT.md e estado real do repositório.  
**Veredicto geral:** O plano contém erros de estado factuais, lacunas estruturais que criam bloqueios permanentes, testes que validam comportamento legado em vez do comportamento novo, e uma definição de gate final que não inclui os próprios testes E2E que o plano exige.

---

## 1. Erros Factuais — O Plano Diz que Algo Não Existe, Mas Existe

### 1.1 Tabela de status (seção 6.2.2) está completamente desatualizada

O plano declara, como resultado de auditoria em 2026-05-06:

| Afirmação do plano | Realidade atual |
|---|---|
| `scripts/validate-mvp-v1.sh` → missing | **EXISTE** (`scripts/validate-mvp-v1.sh`) |
| `scripts/check-runtime-legacy.sh` → missing | **EXISTE** (`scripts/check-runtime-legacy.sh`) |
| `package.json` não tem `typecheck` | **TEM** (`"typecheck": "tsc --noEmit"`) |
| `package.json` não tem `test:e2e` | **TEM** (`"test:e2e": "playwright test --reporter=line"`) |
| `package.json` não tem `deps:check` | **TEM** (`"deps:check": "npm ls --all"`) |
| `package.json` não tem `check:runtime-legacy` | **TEM** |
| `package.json` não tem `validate:mvp:v1` | **TEM** |
| `package.json` não tem `@playwright/test` | **TEM** (`"@playwright/test": "^1.59.1"`) |
| `package.json` ainda usa `xlsx` | **NÃO** — usa `@e965/xlsx` |
| `vite-plugin-pwa@1.3.0` não registrado | **REGISTRADO** (`"vite-plugin-pwa": "^1.3.0"`) |
| `0007_attendance_write_rpcs.sql` → missing | **EXISTE** |
| `rpc_attendance_write.test.sql` → missing | **EXISTE** |

**Consequência direta:** A tabela de status afirma T00, T01, T02 como `PENDENTE` quando na realidade esses artefatos já existem. Qualquer agente que leia o plano como verdade começará o trabalho partindo de premissas falsas. Se o mesmo agente executar os comandos de validação dessas tarefas, pode marcar T00, T01 e T02 como `DONE` sem implementar nada de novo — porque já está implementado. Isso é falso positivo estrutural embutido na tabela de status.

### 1.2 Seção 6.2.1 lista comandos "executados" com resultados que contradizem o repositório atual

A auditoria registra `npm run test:athlete-auth → exit code 127 (psql não instalado)`. Isso pode ser verdade no ambiente local, mas o script `run-supabase-tests.sh` já inclui `rpc_attendance_write.test.sql`. O estado do banco de dados local é irrelevante para a existência dos arquivos. A confusão entre "script não pode ser executado localmente sem psql" e "script não existe" contamina a tabela de status.

---

## 2. Bloqueios Permanentes — O Plano Não Pode ser Concluído Como Escrito

### 2.1 `scoutStore.ts` e `export.ts` usam `getDB()` — T09 nunca pode passar

O `check-runtime-legacy.sh` verifica `getDB(` em todo `src/`:

```bash
check "getDB( em stores/features" "getDB("
```

Arquivos que atualmente usam `getDB()` e **não têm tarefa de migração no plano**:
- `src/stores/scoutStore.ts` — 8 chamadas a `getDB()`
- `src/lib/export.ts` — 2 chamadas a `getDB()`

O plano tem tarefas para migrar `athleteStore` (T03), `trainingStore` (T04), `attendanceStore` (T05). Não existe nenhuma tarefa para `scoutStore` ou `export.ts`.

O CEPRAEA.md (seção 8.1.7) inclui Scout Tático **no escopo do MVP**. O CEPRAEA.md (seção 8.1.6) inclui exportação XLSX/CSV também **no escopo do MVP**.

**Conclusão:** T09 exige `bash scripts/check-runtime-legacy.sh` retornando exit code 0. T10 também exige isso. Com `scoutStore.ts` e `export.ts` não migrados e sem tarefa que os cubra, o gate final nunca retornará 0. O MVP é impossível de completar como o plano está escrito.

**O plano precisa de:**
- Uma tarefa T03.5 ou T06.5 para migrar `scoutStore` para Supabase-first
- Ou uma decisão explícita de excluir `scoutStore.ts` e `export.ts` do check de legado
- A escolha de exclusão precisa ser documentada como decisão de produto, não ignorada

### 2.2 `validate-mvp-v1.sh` não inclui `test:e2e` — gate final tem lacuna crítica

O plano define, na seção 7 do checklist final (seção 7 de plan.md, item 4 da linha de comandos de T10):

```bash
npx playwright test --reporter=line
```

O plano também declara que `npm run validate:mvp:v1` é o **gate obrigatório único** (seção 4).

O script real `validate-mvp-v1.sh`:
```bash
run "typecheck"              npm run typecheck
run "unit tests"             npm test
run "build"                  npm run build
run "deps:check"             npm run deps:check
run "audit"                  npm audit --audit-level=high
run "check:runtime-legacy"   bash scripts/check-runtime-legacy.sh
run "test:supabase"          npm run test:supabase
```

**`test:e2e` está ausente do script.** O gate final pode retornar exit code 0 mesmo que todos os testes E2E falhem ou não existam. O principal mecanismo de validação comportamental do MVP não está no gate.

---

## 3. Testes que Validam Comportamento Legado — Evidência Inválida para o MVP

### 3.1 `e2e/athlete/login.spec.ts` testa telefone + PIN (sistema legado)

O arquivo testa:
```ts
test('exibe campos de telefone e PIN', async ({ page }) => {
  await expect(page.locator('input[type="tel"], input[placeholder*="telefone"]').first()).toBeVisible()
  await expect(page.locator('input[type="password"]').first()).toBeVisible()
})
```

O MVP usa **email + senha Supabase**. A atleta não usa mais telefone nem PIN. Este teste:
- Não valida o fluxo real do MVP
- Valida o fluxo legado que o MVP está substituindo
- Pode passar mesmo que o login Supabase da atleta esteja completamente quebrado
- Se passar no contexto atual, é uma **evidência falsa** — prova que o campo de telefone existe, não que o login funciona

### 3.2 `e2e/coach/login.spec.ts` testa PIN de treinador (sistema legado)

O arquivo testa PIN de treinador com `input[type="password"]` e lógica de "first-time vs returning user". O treinador no MVP usa email + senha Supabase. Este teste:
- Não verifica se o login Supabase do treinador funciona
- Verifica se o campo de PIN está visível e se PINs divergentes exibem erro
- Pode passar enquanto o `LoginPage` do treinador estiver completamente quebrado para Supabase

### 3.3 `e2e/settings.spec.ts` usa helper `loginAsCoach` baseado em PIN

```ts
async function loginAsCoach(page: any) {
  const coachPin = process.env.CEPRAEA_COACH_PIN ?? '9999'
  await page.goto('/login')
  const pinInput = page.locator('input[type="password"]').first()
  await pinInput.fill(coachPin)
```

Qualquer teste que use `loginAsCoach` para acessar configurações protegidas está testando o **fluxo legado de autenticação**, não o fluxo Supabase. A suíte de settings vai passar se o PIN ainda existir e vai falhar por motivo errado (PIN removido, não Supabase quebrado) se for removido.

### 3.4 `e2e/smoke.spec.ts` testa apenas carregamento de página em produção

```ts
test('homepage carrega com status 200', async ({ page }) => { ... })
test('título da página contém CEPRAEA', async ({ page }) => { ... })
```

Isso não valida nenhum comportamento funcional do MVP. Uma página em branco com o título "CEPRAEA" passaria esses testes. Evidência fraca.

### 3.5 `e2e/guards.spec.ts` valida apenas o redirect de usuários NÃO autenticados

O teste verifica que rotas protegidas redirecionam quando não há sessão. Isso é uma validação necessária, mas incompleta:
- Não testa que usuários **autenticados** conseguem acessar
- Uma implementação que redirecione **todos** (autenticados ou não) passaria nesses testes
- Não há teste de "usuário autenticado como atleta não pode acessar rotas do treinador"

**Veredito:** Os testes E2E existentes são todos inválidos para provar que o MVP funciona. Eles provam comportamento legado ou comportamento trivial.

---

## 4. Lacunas dos Testes SQL — O Que Está Bom e O Que Está Fraco

### 4.1 Testes que estão bons

**`rpc_attendance_write.test.sql`** — Estruturalmente correto:
- Usa `set local role authenticated` e `set local request.jwt.claim.sub` para simular auth real
- Testa `get_current_athlete_id()`, `upsert_own_attendance()`, `upsert_coach_attendance()`
- Usa `begin/rollback` — não persiste dados de teste
- Verifica casos de acesso negado (team_id errado, user sem atleta vinculada)
- **É evidência válida** para T02

**`athlete_auth.test.sql`** — Estruturalmente correto:
- Testa RLS em `athletes` e `attendance_records`
- Verifica que atleta A não vê dados de atleta B
- Usa `maybeSingle` pattern e verifica null nos casos de acesso negado
- **É evidência válida** para T07 parcialmente

**`rls.test.sql`** e **`team_integrity.test.sql`** — Cobrem isolamento por time, válidos.

### 4.2 Gaps nos testes SQL

**Gap 1:** Nenhum teste SQL verifica que `upsert_own_attendance` e `upsert_coach_attendance` escrevem no **mesmo registro** quando representam o mesmo atleta+treino. O plano exige convergência (T06), mas o SQL não testa idempotência cruzada entre os dois caminhos.

**Gap 2:** `rpc_attendance_write.test.sql` não testa o caso de atleta autenticada tentando registrar presença de **outra atleta** via `upsert_own_attendance`. Deveria retornar erro — não está coberto.

**Gap 3:** Nenhum teste SQL verifica `audit_logs` — a migration promete que toda escrita registra em `audit_logs`, mas nenhum teste verifica que a tabela recebe o registro. Se `audit_logs` for removida ou renomeada, os RPCs podem falhar silenciosamente ou sem evidência.

**Gap 4:** `run-supabase-tests.sh` não inclui `grants.test.sql` como arquivo separado — o arquivo existe em `supabase/tests/grants.test.sql` mas precisaria ser verificado se está no runner. (O runner inclui `grants.test.sql` implicitamente via `psql ... -f supabase/tests/grants.test.sql`? Não — lendo o script, ele não inclui `grants.test.sql` explicitamente.)

Verificando `run-supabase-tests.sh`:
```bash
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/team_integrity.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rls.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/athlete_auth.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/grants.test.sql      ← FALTA no runner
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_generate_trainings.test.sql
bash scripts/run-generate-trainings-concurrency-test.sh
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_presence_tokens.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_confirm_presence.test.sql
psql "$DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/rpc_attendance_write.test.sql
```

`grants.test.sql` **não está no runner**. Existe no repositório, mas nunca é executado por `npm run test:supabase`. Evidência falsa de cobertura de grants.

---

## 5. Pontos Fracos do Plano — Onde Ele Não Garante as Ações Corretas

### 5.1 Seção 3.1 referencia "10 critérios de aceite" que não estão definidos

> "Nenhuma tarefa nova deve ser considerada pronta sem cumprir todos os 10 critérios de aceite definidos pelo usuário."

Os 10 critérios nunca são listados no documento. A referência é fantasma. Um agente que tente aplicar essa regra não tem como verificá-la.

### 5.2 T03 permite "remover o cache da store" como alternativa à migração

A definição de T03 diz:

> "4. Manter `IndexedDB` apenas como cache explícito ou **remover o cache desta store**."

Um agente pode deletar todo o código de `getDB()` em `athleteStore.ts` sem implementar nada no Supabase, o `check-runtime-legacy.sh` vai passar para essa store, e o teste "segundo contexto vê a atleta criada" vai **falhar** — mas a causa será interpretada como bug de implementação, não como falta de migração. A tarefa poderia ser marcada como "não concluída por bug de E2E" em vez de "não concluída por ausência de Supabase".

### 5.3 T07 não define o que "estado de vínculo" visível significa em termos de UI

A tarefa diz:

> "2. Exibir no painel do treinador o estado da conta da atleta: `não vinculada` / `vinculada`"

Não especifica:
- Em qual página exatamente (`AthleteDetailPage`? `AthletesPage`?)
- Como atualiza (tempo real? só ao recarregar?)
- Qual campo de banco determina o estado (`user_id IS NOT NULL`)
- Qual texto exato deve aparecer (risco de o teste E2E buscar texto diferente do implementado)

Um agente pode implementar um badge que sempre mostra "não vinculada" baseado em lógica errada e o E2E `onboarding.spec.ts` não vai provar que a lógica é correta se o spec não verificar o valor do campo `user_id` no banco.

### 5.4 T06 não define como verificar "convergência" além da UI

A tarefa exige que "token público, atleta logada e treinador enxergarem o mesmo status final". O E2E proposto (`presence-token.spec.ts`) vai verificar o que aparece na **tela**. Mas se a tela ler do IndexedDB (legado) em vez do Supabase e o IndexedDB for sincronizado por algum mecanismo, o teste vai passar com dados errados na fonte.

O plano não exige uma query SQL de verificação após o E2E para confirmar que o dado está no banco real.

### 5.5 T02 já está implementado mas a tabela de status diz PENDENTE

Como documentado na seção 1.1, T02 tem todos os artefatos criados. O plano não tem mecanismo de auto-atualização — a tabela vai continuar errada até que alguém a corrija manualmente. O plano diz "texto não altera status. Só prova objetiva altera status." mas a tabela foi escrita sem executar `test -f` nos arquivos corretos.

### 5.6 `validate-mvp-v1.sh` usa `npm audit --audit-level=high` mas T01 prometeu `0 vulnerabilities`

T01 diz:
> "1. `npm audit` retorna `0 vulnerabilities`."

O gate final executa:
```bash
npm audit --audit-level=high
```

`--audit-level=high` ignora vulnerabilidades de nível `low` e `moderate`. O gate vai passar mesmo com vulnerabilidades moderadas ativas, o que contradiz a promessa de T01.

### 5.7 Regra 2.4 diz que o agente deve atualizar `.codex/` — pasta errada para agente Claude e agente Copilot

O AGENT.md especifica:
> "Agente Claude MUST atualizar `.claude/claude-CHANGELOG.md`"
> "Agente Claude MUST atualizar `.claude/claude-EXECUTION_LOG.md`"
> "Agente Copilot MUST atualizar `.claude/copilot-CHANGELOG.md`"
> "Agente Copilot MUST atualizar `.claude/copilot-EXECUTION_LOG.md`"

O plan.md (seção 2.4) diz:
> "o agente deve atualizar: `.codex/codex-CHANGELOG.md` e `.codex/codex-EXECUTION_LOG.md`"

O plano usa os nomes dos logs do agente Codex, não do agente Claude e do agent Copilot. Um agente Copilot ou agente Claude que siga `plan.md` à risca vai escrever nos arquivos errados — ou vai ignorar a regra.

---

## 6. Onde o Plano Permite Resultados Falsos

### 6.1 `check-runtime-legacy.sh` não detecta `pushConfirmation`

O script verifica `pullConfirmations` e `loadSyncConfig` mas **não verifica `pushConfirmation`**.

Ocorrências reais no código:
- `src/features/trainings/pages/TrainingDetailPage.tsx` — 3 chamadas a `pushConfirmation`
- `src/features/confirm/pages/PublicConfirmPage.tsx` — 1 chamada a `pushConfirmation`

Se T09 remover `pullConfirmations` e `loadSyncConfig` mas deixar `pushConfirmation` ativo, o script vai retornar exit code 0. O legado continua no runtime e o gate diz que não tem legado.

### 6.2 `useCurrentAthlete.ts` tem fallback híbrido que pode mascarar falha de Supabase

O hook atual:
1. Tenta `athletes` do `athleteStore` (IndexedDB)
2. Se não encontrar, vai ao Supabase

Se T03 migrar `athleteStore` para Supabase mas o `useCurrentAthlete` continuar fazendo o `storeMatch` no array da store Supabase, isso funciona. Mas se a store falhar silenciosamente e retornar array vazio, o hook vai ao Supabase diretamente — e isso **vai mascarar qualquer falha da store no fluxo da atleta**.

O E2E de onboarding (T07) testaria o fluxo da atleta e passaria mesmo que a store da atleta estivesse quebrada, porque o `useCurrentAthlete` contorna a store.

### 6.3 Testes de unit para `sync.ts` provam que o legado funciona — evidência em direção errada

`src/lib/__tests__/sync.test.ts` testa `generateSecret`, `pingEndpoint`, `resolveEndpointUrl` — funções do sistema legado. O `npm test` vai rodar esses testes e retornar verde. Isso vai ser contado como "tests pass" no gate final, provando que o **sistema legado está funcionando**, o que é o oposto do que o MVP quer. A evidência de `npm test` passando inclui prova de que o legado está operacional.

### 6.4 O plano não exige query SQL de confirmação após os testes E2E

Todos os testes E2E propostos verificam **o que aparece na tela**. Nenhum dos comportamentos esperados inclui uma query direta no banco para confirmar que o dado foi escrito. Uma implementação que mostre dados corretos na tela mas salve no IndexedDB em vez do Supabase passaria em todos os E2E propostos.

---

## 7. Análise Adversarial por Tarefa

### T00
- **O que está bom:** os scripts existem, os comandos existem no package.json
- **O que está errado:** o `validate-mvp-v1.sh` não inclui `test:e2e`; o `validate-mvp-v1.sh` existe mas a tabela de status do plano diz PENDENTE
- **Risco:** T00 pode ser marcada como "já concluída" sem nenhum trabalho, porque os artefatos existem, mas o gate está incompleto (sem E2E)
- **Veredicto:** Parcialmente implementada. Precisa adicionar `test:e2e` ao script de validação.

### T01
- **O que está bom:** `@e965/xlsx`, `vite-plugin-pwa@1.3.0` estão no package.json; `src/lib/export.ts` usa `@e965/xlsx`
- **O que está errado:** a tabela de status diz PENDENTE, o que é factualmente falso
- **Risco:** nenhum técnico, mas a tabela falsa pode fazer um agente "re-implementar" T01 e criar conflito
- **Artefatos a verificar:** `tsconfig.tsbuildinfo` ainda está sendo versionado (aparece em `git status` como modificado), e o `.gitignore` não o inclui. A tarefa prometia remover isso, mas a remoção não está consolidada no `.gitignore`
- **Veredicto:** Dependências corretas. Artefato `tsconfig.tsbuildinfo` não removido do versionamento.

### T02
- **O que está bom:** `0007_attendance_write_rpcs.sql` existe, `rpc_attendance_write.test.sql` existe, o runner inclui o teste
- **O que está errado:** a tabela diz PENDENTE; `grants.test.sql` existe mas não está no runner; nenhum teste verifica convergência entre `upsert_own_attendance` e `upsert_coach_attendance` no mesmo registro
- **Veredicto:** Artefatos existem. Tabela de status errada. Gaps de cobertura nos testes SQL.

### T03
- **Estado real:** `athleteStore.ts` usa IndexedDB e `sync.ts` como fonte principal — confirmado
- **Problema de especificação:** a alternativa "ou remover o cache" permite implementação vazia
- **Teste E2E:** `e2e/coach/athletes.spec.ts` não existe — nenhuma evidência comportamental hoje
- **Risco de falso positivo:** um agente que delete o código IndexedDB sem implementar Supabase passa no `check-runtime-legacy.sh` mas quebra o sistema
- **Veredicto:** Não começou. Especificação com ambiguidade perigosa.

### T04
- **Estado real:** `trainingStore.ts` usa IndexedDB e `sync.ts` — confirmado
- **Problema:** `generateRecurringDrafts` (local) precisa ser substituído por chamada à RPC `generate_trainings` — a RPC existe (`0003_rpc_functions.sql`), mas a chamada frontend não existe
- **Teste E2E:** `e2e/coach/trainings.spec.ts` não existe
- **Veredicto:** Não começou.

### T05
- **Estado real:** `attendanceStore.ts` usa IndexedDB e `pullConfirmations` de sync — confirmado
- **Problema:** a store usa `id = \`${treinoId}::${atletaId}\`` como chave composta local; o banco usa `attendance_records` com `id uuid`. A migração requer mudança de modelo de dados do frontend, que o plano não especifica explicitamente
- **Teste E2E:** `e2e/coach/attendance.spec.ts` não existe
- **Veredicto:** Não começou. Tem problema de impedância de modelo não documentado no plano.

### T06
- **Estado real:** `PublicConfirmPage.tsx` tem dois caminhos — Supabase token (novo) e sync legado (fallback primário quando não tem token)
- **Problema:** a confirmação pública sem token (`usingSupabaseToken = false`) salva no **IndexedDB local primeiro** e só tenta sync legado depois — isso não converge com o banco Supabase nunca
- **Teste E2E:** `e2e/public/presence-token.spec.ts` não existe
- **Risco:** um agente pode criar o spec apenas para o caso com token Supabase e considerar T06 como feita, deixando o caminho sem token completamente legado e não testado
- **Veredicto:** Implementação parcial para o caminho com token. Caminho sem token é puro legado. O plano não distingue os dois caminhos.

### T07
- **Estado real:** `AtletaGuard`, `AtletaLoginPage`, `useCurrentAthlete` existem com Supabase auth
- **Problema crítico:** o `e2e/athlete/login.spec.ts` existente testa **telefone + PIN** (legado), não email + senha Supabase. Se o T10 reescrever esses specs, o histórico de evidência vai para o lixo. Se não reescrever, o spec existente é evidência inválida
- **`e2e/athlete/onboarding.spec.ts`** não existe — a prova objetiva principal de T07 não foi criada
- **Vínculo `user_id`:** o `useCurrentAthlete` tenta vincular via `user_id` mas usa o `athleteStore` (IndexedDB) para o match — se a store local não tem o atleta, vai ao Supabase; se a store local TEM o atleta mas sem `user_id`, o fallback por email funciona mas não persiste o `user_id` de volta no banco
- **Veredicto:** Implementação parcial de auth. Sem prova E2E válida. Vínculo de `user_id` pode não persistir.

### T08
- **Estado real:** scripts não existem (`import-legacy-json-to-supabase.mjs`, `reconcile-legacy-json-to-supabase.mjs`)
- **Problema de especificação:** o plano diz "consumir o mesmo formato exportado pelo app atual" mas não define o schema JSON — o `export.ts` atual exporta via `getDB()` com campos em português (`nome`, `treinoId`, `atletaId`) enquanto o banco Supabase usa campos em inglês (`name`, `training_id`, `athlete_id`). A incompatibilidade de modelo não está documentada
- **Veredicto:** Não começou. Especificação subespecificada para o mapeamento de schema.

### T09
- **Pré-condição:** T08 deve estar concluída
- **Bloqueio permanente:** `scoutStore.ts` e `export.ts` nunca poderão ser removidos do runtime sem novas tarefas não previstas no plano — o `check-runtime-legacy.sh` sempre vai FAIL
- **`pushConfirmation` não verificado pelo script:** pode sobreviver ao T09 sem ser detectado
- **Veredicto:** Não pode ser concluída como o plano está escrito. Bloqueio estrutural.

### T10
- **Estado real:** E2E existentes são todos baseados em comportamento legado
- **Gate final:** `validate-mvp-v1.sh` não inclui `test:e2e` — o gate pode passar sem nenhum E2E
- **Specs exigidos por T10 que não existem:** `e2e/athlete/onboarding.spec.ts`, `e2e/coach/athletes.spec.ts`, `e2e/coach/trainings.spec.ts`, `e2e/coach/attendance.spec.ts`, `e2e/public/presence-token.spec.ts`
- **Veredicto:** Não pode ser concluída porque depende de T09, que tem bloqueio permanente.

---

## 8. Classificação dos Testes Existentes

### Manter (com ajustes menores)
- `supabase/tests/rpc_attendance_write.test.sql` — válido, adicionar teste de idempotência cruzada e de acesso negado por atleta errada
- `supabase/tests/athlete_auth.test.sql` — válido para RLS
- `supabase/tests/rls.test.sql` — válido para isolamento por time
- `supabase/tests/team_integrity.test.sql` — válido
- `supabase/tests/rpc_generate_trainings.test.sql` — válido
- `supabase/tests/rpc_presence_tokens.test.sql` — válido
- `supabase/tests/rpc_confirm_presence.test.sql` — válido
- `e2e/guards.spec.ts` — útil para redirect, mas insuficiente; manter e expandir com teste de acesso positivo (usuário autenticado consegue acessar)

### Ajustar urgentemente
- `e2e/coach/login.spec.ts` — reescrever para testar email + senha Supabase, não PIN
- `e2e/athlete/login.spec.ts` — reescrever completamente para email + senha Supabase, remover toda referência a telefone e PIN
- `e2e/settings.spec.ts` — reescrever `loginAsCoach` para usar Supabase auth; os testes de configuração em si podem ser mantidos se o helper for corrigido
- `src/lib/__tests__/sync.test.ts` — marcar como legado; os testes de `generateSecret` e `pingEndpoint` são válidos para o sistema legado mas não devem contribuir para a evidência de MVP sem nota explícita

### Deletar
- `e2e/smoke.spec.ts` — testa carregamento trivial de página em produção, não valida comportamento funcional do MVP; se mantido, deve ser movido para suite separada de "smoke check de produção", fora do gate do MVP

---

## 9. Riscos Semânticos — Onde a Linguagem do Plano Permite Interpretação Divergente

| Trecho do plano | Interpretação A (correta) | Interpretação B (perigosa) |
|---|---|---|
| T03: "Manter IndexedDB apenas como cache explícito **ou** remover o cache desta store" | Migrar para Supabase-first; IndexedDB vira cache opcional | Deletar getDB() sem implementar Supabase |
| T07: "expor estado de vínculo" | UI + lógica real via `user_id IS NOT NULL` no banco | Badge estático de texto que não reflete banco |
| Seção 2.2: "comando com exit code 0" como prova | O comando testa o comportamento correto | Qualquer comando que retorne 0, mesmo trivial |
| T06: "fluxo público não depende mais do caminho legado para o sucesso principal" | Caminho legado não existe mais | Caminho legado existe como fallback, caminho Supabase é o "principal" |
| Seção 6.2.3: "bloco funcional já implementado" | Implementação parcial que precisa de prova objetiva | Justificativa para marcar T07 como DONE |

---

## 10. Resumo de Ações Necessárias no Plano

1. **Corrigir tabela de status** (seção 6.2.2) — T00, T01, T02 têm artefatos criados; o status deve refletir isso ou a tabela deve ser removida e substituída por comandos de verificação ao vivo
2. **Adicionar `test:e2e` ao `validate-mvp-v1.sh`** — o gate final está incompleto
3. **Criar tarefa para migrar `scoutStore`** — sem isso, T09 nunca conclui
4. **Criar tarefa ou decisão explícita para `export.ts` e `getDB()`** — excluir da checagem ou migrar
5. **Adicionar verificação de `pushConfirmation` ao `check-runtime-legacy.sh`**
6. **Adicionar `grants.test.sql` ao `run-supabase-tests.sh`**
7. **Corrigir referência ao `.codex/` na seção 2.4** — o agente correto (Claude) usa `.claude/`
8. **Especificar os "10 critérios de aceite"** ou remover a referência fantasma
9. **Remover a alternativa "ou remover o cache"** em T03 — é uma brecha para implementação vazia
10. **Adicionar `tsconfig.tsbuildinfo` ao `.gitignore`** — T01 prometeu isso, não foi feito
11. **Alinhar nível de auditoria** — `npm audit --audit-level=high` no gate vs "0 vulnerabilities" em T01
12. **Adicionar verificação SQL pós-E2E** — ao menos em T05 e T06, o teste deve confirmar que o dado está no banco, não apenas na tela
