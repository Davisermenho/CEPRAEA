---
tipo: CONTRATO-EXECUÇÃO
nome: "Plano Oficial MVP v1.0"
papel: "Define COMO e EM QUE ORDEM o MVP será construído — sequência de tarefas T00–T10, critérios de aceite, arquivos permitidos/proibidos e provas objetivas obrigatórias por tarefa."
autoridade: "Hierarquia 2/4 — vence decisões de agente sobre sequência e escopo de tarefa; perde para código real quando diverge sobre estado atual; CEPRAEA.md prevalece sobre intenção de produto."
lido_por: "Claude, Codex, Copilot"
quando_ler: "ao iniciar qualquer tarefa; ao atualizar status de tarefa; ao propor mudança de escopo ou sequência"
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "status de tarefa muda com prova objetiva executada naquele momento (não retroativamente)"
validade: "2026-05-06"
status: PARCIAL
status_nota: "As seções 6.2.1 e 6.2.2 são um snapshot auditado desta data; qualquer ação deve revalidar o código e os comandos objetivos no momento da execução"
conflito: "plan.md prevalece sobre interpretação livre de agente; código prevalece quando plan.md e código divergem sobre estado atual; ver auditplan.md para divergências conhecidas."
proibido:
  - "Agentes NÃO devem marcar tarefa como DONE sem executar os comandos de prova no momento"
  - "NÃO devem pular tarefas ou alterar testes para esconder falha"
nao_cobre: "Intenção de produto (→ CEPRAEA.md), estado atual implementado (→ código), histórico de execução (→ logs de agente)"
---

# Plano Oficial do Produto — Caminho Determinístico até o MVP v1.0

## 1. Objetivo obrigatório

Este plano é o caminho oficial até o MVP v1.0 do CEPRAEA.

O MVP v1.0 só existe quando todas as condições abaixo forem verdadeiras ao mesmo tempo:

1. o sistema executa sem erro;
2. o sistema aplica as regras de acesso corretas;
3. o sistema persiste os dados operacionais no Supabase como fonte principal;
4. não existem arquivos mortos relevantes no runtime;
5. não existem restos ativos de instalações antigas;
6. não existem dependências quebradas;
7. não existe comportamento simulado no lugar do comportamento real;
8. não existe tarefa marcada como concluída sem prova objetiva.

## 2. Regras globais de execução

Estas regras valem para todas as tarefas deste plano.

### 2.1 Regra de prontidão

Nenhuma tarefa nova deve ser considerada pronta sem cumprir integralmente:

- os critérios objetivos da própria tarefa;
- as restrições globais deste plano;
- os critérios explícitos do usuário registrados na solicitação vigente.

### 2.2 Regra de prova objetiva

Texto não é prova.

Cada tarefa só pode ser fechada com pelo menos estas provas:

- diff revisável;
- comando com exit code `0`;
- teste automatizado relevante;
- build ou typecheck executado;
- validação adversarial executada.

### 2.3 Regra de teste

Se um teste, fixture, contrato, snapshot ou script de validação for alterado para esconder falha da implementação, a tarefa falha.

### 2.4 Regra de logs do agente

Antes de encerrar qualquer tarefa, o agente deve atualizar os logs correspondentes ao agente em execução, conforme `AGENT.md`:

- Claude:
  - `.claude/claude-CHANGELOG.md`
  - `.claude/claude-EXECUTION_LOG.md`
- Codex:
  - `.codex/codex-CHANGELOG.md`
  - `.codex/codex-EXECUTION_LOG.md`
- Copilot:
  - `.copilot/copilot-CHANGELOG.md`
  - `.copilot/copilot-EXECUTION_LOG.md`

### 2.5 Regra de arquivos proibidos

Nenhuma tarefa pode alterar arquivos fora do escopo definido nela.

Se qualquer arquivo fora do escopo aparecer no diff, a tarefa volta para o estado `não concluída`.

### 2.6 Regra de rollback

Nenhum arquivo legado pode ser removido sem prova de que:

- não é referenciado;
- não participa do build;
- não participa dos testes;
- não é necessário para rollback da tarefa atual;
- a remoção não quebra o sistema.

## 3. Estado obrigatório de cada tarefa

Cada tarefa deve seguir esta sequência.

### 3.1 Antes de começar

Registrar no execution log:

- arquivos que serão alterados;
- arquivos que podem ser afetados;
- partes do sistema que podem quebrar;
- testes que cobrem o risco;
- comandos de validação;
- arquivos proibidos.

Sem esse bloco, a tarefa não pode começar.

### 3.2 Durante a execução

Executar primeiro a prova de falha.

Exemplo válido:

- criar teste que falha;
- rodar comando;
- implementar;
- rodar o mesmo comando até passar.

### 3.3 Depois da execução

Executar análise adversarial obrigatória:

- listar os arquivos alterados com `git diff --name-only`;
- confirmar que nenhum arquivo fora do escopo foi alterado;
- confirmar que nenhum teste foi enfraquecido;
- confirmar que nenhum contrato foi alterado sem autorização;
- confirmar que nenhum erro foi escondido;
- confirmar que o comportamento funciona além do caso feliz;
- confirmar que nenhum legado antigo ainda interfere no runtime.

Se qualquer item falhar, a tarefa volta para `não concluída`.

## 4. Validação final obrigatória

No fim do plano, o comando final obrigatório será:

```bash
npm run validate:mvp:v1
```

Este comando deve retornar exit code `0`.

Se esse comando não existir, a tarefa `T00` não está concluída.

## 5. Restrições de arquitetura do MVP v1.0

Estas decisões não podem ser quebradas por nenhuma tarefa:

1. Supabase é a fonte principal de verdade para `athletes`, `trainings`, `attendance_records` e autenticação.
2. `IndexedDB` pode existir apenas como cache local explícito. `IndexedDB` não pode ser fonte principal do MVP.
3. `Apps Script` e `Google Sheets` não podem permanecer no caminho crítico do runtime do MVP.
4. O frontend não pode usar `service_role`.
5. Alembic não será introduzido. O padrão oficial é `supabase/migrations/*.sql`.

## 6. Ordem oficial das tarefas

Nenhuma tarefa pode ser pulada.

### 6.1 Regra oficial de status do plano

Este plano deve ser atualizado sempre que uma tarefa mudar de estado.

Os únicos estados permitidos são:

- `DONE`: a tarefa cumpriu integralmente o escopo e todas as provas objetivas exigidas nela.
- `EM PROGRESSO`: existe implementação parcial, mas falta prova objetiva, falta parte do escopo ou existe bloqueio técnico.
- `PENDENTE`: a tarefa ainda não começou de forma válida ou não tem prova suficiente para qualquer fechamento.
- `BLOQUEADO`: a tarefa depende de pré-condição externa ou de tarefa anterior ainda não concluída.

Texto não altera status. Só prova objetiva altera status.

### 6.2 Auditoria oficial do plano em 2026-05-06

Esta auditoria foi feita contra o repositório real e substitui suposição.

#### 6.2.1 Provas objetivas executadas nesta auditoria

Comandos executados:

```bash
npm test
npm run build
npm audit
command -v psql
npm run test:athlete-auth
npm run test:supabase
rg -n "validate:mvp:v1|typecheck|test:e2e|deps:check|check:runtime-legacy|@playwright/test|vite-plugin-pwa|@e965/xlsx|xlsx" package.json package-lock.json
test -f scripts/validate-mvp-v1.sh && echo exists || echo missing
test -f scripts/check-runtime-legacy.sh && echo exists || echo missing
test -f supabase/migrations/0007_attendance_write_rpcs.sql && echo exists || echo missing
test -f supabase/tests/rpc_attendance_write.test.sql && echo exists || echo missing
bash scripts/check-runtime-legacy.sh
npm run validate:mvp:v1
```

Resultado auditado:

- `npm test` → exit code `0`
- `npm run build` → exit code `0`
- `npm audit` → `found 0 vulnerabilities`
- `command -v psql` → `/usr/bin/psql`
- `npm run test:athlete-auth` e `npm run test:supabase` existem e usam `psql`; a falha atual observável não é ausência de binário, mas a suíte parar em `supabase/tests/grants.test.sql` com perda de conexão do servidor
- `scripts/validate-mvp-v1.sh` → `exists`
- `scripts/check-runtime-legacy.sh` → `exists`
- `supabase/migrations/0007_attendance_write_rpcs.sql` → `exists`
- `supabase/tests/rpc_attendance_write.test.sql` → `exists`
- `package.json` contém:
  - `typecheck`
  - `test:e2e`
  - `deps:check`
  - `check:runtime-legacy`
  - `validate:mvp:v1`
- `package.json` contém `@playwright/test`
- `package.json` usa `@e965/xlsx`; o `xlsx` observado no lockfile é binário transitivo do pacote instalado, não dependência direta do app
- `package.json` registra `vite-plugin-pwa@^1.3.0`
- `scripts/run-supabase-tests.sh` já inclui `supabase/tests/grants.test.sql`
- `bash scripts/check-runtime-legacy.sh` falha por referências ativas a `sync.ts`, `loadSyncConfig`, `resolveEndpointUrl`, `getDB()` e leituras locais em:
  - `src/features/confirm/pages/PublicConfirmPage.tsx`
  - `src/stores/scoutStore.ts`
  - `src/lib/export.ts`
  - `src/lib/sync.ts`
- `scripts/check-runtime-legacy.sh` ainda não procura `pushConfirmation` explicitamente; o script precisa ser endurecido para que o gate não deixe esse caminho legado escapar por omissão semântica
- `npm run validate:mvp:v1` existe e executa, mas falha hoje porque:
  - `check:runtime-legacy` está vermelho;
  - `test:supabase` está vermelho;
  - o gate ainda não roda `npx playwright test --reporter=line`;
  - o gate usa `npm audit --audit-level=high`, que é mais fraco que a exigência textual de `0 vulnerabilities`
- `src/stores/athleteStore.ts` está Supabase-first
- `src/stores/trainingStore.ts` está Supabase-first e já usa a RPC `generate_trainings`
- `src/stores/attendanceStore.ts` está Supabase-first e já usa `upsert_coach_attendance`; o fechamento da tarefa ainda depende de E2E e prova de convergência com os fluxos de atleta e confirmação pública

#### 6.2.2 Status oficial por tarefa

> **Atualização canônica (2026-05-07):** o quadro abaixo substitui os status anteriores de `T00`–`T10` com base em revalidação executada no repositório real. Ele fica nesta seção porque `6.2.2` é a única fonte oficial de status do plano; manter esta tabela em outro bloco criaria duas verdades concorrentes e reduziria a auditabilidade.

| Tarefa | Status em 2026-05-07 | Evidência validada | Comando canônico de comprovação | Observações de auditoria |
|---|---|---|---|---|
| `T00` | `DONE` | `npm run validate:mvp:v1` → **MVP v1.0: OK** · 10/10 checks: typecheck, unit tests, build, deps:check, audit, db reset, test:supabase, e2e (27 passed), check:runtime-legacy | `npm run validate:mvp:v1` | Fechada após T09 remover o legado e T10 alinhar a suíte E2E ao produto atual, incluindo a retirada de `/exportar` de `protectedCoachRoutes` e a adição da smoke suite. |
| `T01` | `DONE` | `npm audit` → `0 vulnerabilities` · `npm ls --all` verde · `npm run build` verde · `git ls-files tests/report.html tests/api/__pycache__ tsconfig.tsbuildinfo supabase/.temp supabase/.branches playwright-report` → vazio | `npm audit && npm ls --all && npm run build && git ls-files tests/report.html tests/api/__pycache__ tsconfig.tsbuildinfo supabase/.temp supabase/.branches playwright-report` | Artefatos gerados removidos do tracking após revalidação; o risco apontado na auditoria anterior foi efetivamente corrigido. |
| `T02` | `DONE` | `supabase db reset` + `npm run test:supabase` verdes; RPCs `get_current_athlete_id`, `upsert_own_attendance` e `upsert_coach_attendance` presentes e cobrindo o contrato SQL real de presença | `supabase db reset && npm run test:supabase` | Contrato SQL íntegro e suíte verde sem enfraquecimento do teste de escrita real. |
| `T03` | `DONE` | E2E multi-contexto verde: atleta criada em `ctxA` fica visível em `ctxB` sem `IndexedDB` compartilhado; `typecheck` e `build` continuam verdes | `npx playwright test e2e/coach/athletes.spec.ts --reporter=line` | Prova objetiva suficiente para a definição de pronto da tarefa. |
| `T04` | `DONE` | E2E multi-contexto verde: treino criado em `ctxA` fica visível em `ctxB` sem `IndexedDB` compartilhado; `typecheck` e `build` verdes | `npx playwright test e2e/coach/trainings.spec.ts --reporter=line` | O bloqueio reprodutível encontrado na revisão era o seletor ambíguo `Extra`; após correção, a prova ficou estável e reproduzível. |
| `T05` | `DONE` | E2E verde validando os três pontos exigidos: presença marcada em `ctxA`, mesma presença em `ctxB` e leitura coerente em `/relatorios`; suíte E2E local completa verde (`23/23`) | `npx playwright test e2e/coach/attendance.spec.ts --reporter=line` | A prova anterior era insuficiente; a spec foi ampliada para cobrir relatório e depois revalidada. O teardown também foi corrigido para não deixar `presence_token_batches` bloqueando o coach. |
| `T06` | `DONE` | E2E verde com convergência em 4 passos: link público confirma via UI, SQL converge, treinador vê `Atleta confirmou` no detalhe do treino e atleta vê o mesmo status no app; `npm run test:supabase` verde | `VITE_PRESENCE_TOKENS_BACKEND=supabase npx playwright test e2e/public/presence-token.spec.ts --reporter=line && npm run test:supabase` | O risco operacional de reutilizar um Vite sem `--mode test` foi eliminado com `reuseExistingServer: false`, tornando explícita qualquer colisão de porta em vez de reutilização silenciosa. |
| `T07` | `DONE` | `npx playwright test e2e/athlete/onboarding.spec.ts` → 1 passed · 5 passos: (1) coach vê "Não vinculada", (2) atleta cria conta via REST, (3) primeiro login → `link_athlete_user_id` RPC vincula `user_id`, (4) SQL confirma vínculo após polling do vínculo assíncrono, (5) coach vê "Vinculada" · typecheck + `24 passed` na suíte E2E completa | `npx playwright test e2e/athlete/onboarding.spec.ts --reporter=line` | O falso negativo anterior era uma race entre `waitForURL` e a RPC de vínculo; a prova foi endurecida e reexecutada com estabilidade. |
| `T08` | `DONE` | `node scripts/import-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json --dry-run` → SQL listado com settings (`UPDATE teams.name`) · `--apply` → import idempotente · `node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json` → exit `0` · 9 OK checks (2 atletas + 2 treinos + 3 presenças + settings) | `node scripts/import-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json --dry-run && node scripts/import-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json --apply && node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json` | A reconciliação agora é individual por registro e reprova divergência real. O import consome `settings`; só `nomeEquipe` tem destino persistido em banco, os demais campos ficam reconhecidos como sem target. |
| `T09` | `DONE` | `bash scripts/check-runtime-legacy.sh` → EXIT:0 · 13 OK checks · `npm run typecheck` → exit 0 · `npm run build` → exit 0 · `npm test` → 13 passed | `bash scripts/check-runtime-legacy.sh && npm run typecheck && npm run build && npm test` | Removeu o runtime legado de `sync`, `scout` e exportação antiga. O falso vermelho residual de `/exportar` foi transferido para T10 e depois eliminado na reescrita da suíte E2E. |
| `T10` | `DONE` | `npm run validate:mvp:v1` → **MVP v1.0: OK** · 27 passed (23 fluxos existentes + 4 smoke tests) · `docs/mvp-v1.md` criado · `smoke.spec.ts` reescrito para o dev server local | `npm run validate:mvp:v1` | Fecha o gate final do MVP e consolida a evidência executável do produto sem rotas/fluxos legados. |

> **Consolidado `T00`–`T10`:** `11/11` tarefas estão `DONE`.

#### 6.2.3 Nota histórica de estado parcial

> **Nota histórica (superada em 2026-05-07):** o bloco abaixo descreve um estado intermediário da auditoria. Ele não representa mais o estado atual do repositório. A tabela em `6.2.2` prevalece.

Os itens abaixo existiam no código e tinham apenas validação parcial local naquele momento:

- login do treinador via Supabase;
- login da atleta via Supabase;
- redefinição de senha da atleta;
- `AtletaGuard` com vínculo por `user_id`;
- rota `/atleta/nova-senha`;
- build verde;
- Vitest verde.

Provas objetivas atuais:

- `npm test` → `13 passed`
- `npm run build` → exit code `0`

Conclusão oficial:

- esse bloco registrava um estágio parcial de implementação;
- esse bloco foi posteriormente superado pelas evidências completas de `T00`–`T10`;
- ele deve ser lido apenas como contexto histórico.

#### 6.2.4 Regra de PR a partir desta auditoria

> **Nota histórica (2026-05-07):** este texto foi escrito na auditoria inicial. A tabela em `6.2.2` é a fonte canônica de status atualizado e prevalece sobre este parágrafo.

- o plano não autorizava PR de “MVP pronto” enquanto T07–T10 estivessem abertas;
- o plano só autoriza PRs parciais por recorte técnico explícito;
- naquele momento existiam evidências locais razoáveis em quatro frentes parciais:
  - auth de treinador/atleta e guardas correlatos;
  - contrato SQL de escrita de presença;
  - stores de atletas, treinos e presença já migradas para Supabase-first em nível parcial de implementação;
  - malha inicial de validação (`typecheck`, `deps:check`, `validate:mvp:v1`);
- nenhum desses recortes fechava tarefa completa naquele estágio;
- esse diagnóstico foi posteriormente superado pelo fechamento completo de `T00`–`T10`.

---

## T00 — Criar a malha de validação obrigatória do MVP

### Objetivo

Criar os scripts e comandos que impedem falso positivo durante o restante do plano.

### Estado parcial já confirmado nesta data

- `typecheck`, `test:e2e`, `deps:check`, `check:runtime-legacy` e `validate:mvp:v1` já existem em `package.json`.
- `scripts/validate-mvp-v1.sh` e `scripts/check-runtime-legacy.sh` já existem.
- o fechamento da tarefa depende agora de endurecer o checker contra `pushConfirmation` e transformar `validate:mvp:v1` em gate final real com E2E e `npm audit` no mesmo nível de exigência do plano.

### O que fazer

1. Adicionar script de typecheck.
2. Adicionar script de E2E.
3. Adicionar script de checagem de dependências.
4. Adicionar script de checagem de legado em runtime.
5. Endurecer `scripts/check-runtime-legacy.sh` para detectar também `pushConfirmation` e não depender de lacunas semânticas do grep.
6. Adicionar script final `validate:mvp:v1`.
7. Instalar `@playwright/test` se ele não estiver no `package.json`.

### Onde fazer

No root do repositório.

### Arquivos a alterar

- `package.json`
- `package-lock.json`
- `scripts/validate-mvp-v1.sh`
- `scripts/check-runtime-legacy.sh`

### Arquivos que podem ser afetados

- `playwright.config.ts`

### Arquivos proibidos

- `src/**`
- `supabase/migrations/**`
- `supabase/tests/**`
- `docs/**`

### Comandos a executar

```bash
npm install -D @playwright/test
npm ls --all
npm run typecheck
npm test
npm run build
bash scripts/check-runtime-legacy.sh
npm run validate:mvp:v1
```

### Resultado esperado

1. `package.json` passa a ter exatamente estes scripts:
   - `typecheck`
   - `test:e2e`
   - `deps:check`
   - `check:runtime-legacy`
   - `validate:mvp:v1`
2. `scripts/check-runtime-legacy.sh` retorna `FAIL` enquanto existirem referências proibidas de runtime legado.
3. O script de checagem também falha se `pushConfirmation` ainda estiver ativo no runtime.
4. `npm run validate:mvp:v1` existe e retorna exit code diferente de `0` antes da conclusão completa do plano.

### Teste que confirma

```bash
npm run validate:mvp:v1; echo $?
```

O teste só é aceito se o script existir e efetivamente falhar enquanto o legado ainda estiver ativo.

### Se falhar

1. Corrigir apenas `package.json`, `package-lock.json` e os scripts listados nesta tarefa.
2. Não alterar código de aplicação para fazer esta tarefa passar.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
```

Conferir que nenhum arquivo fora do escopo foi alterado.

### Definição de pronto

`T00` só está pronta quando `npm run validate:mvp:v1` existir, executar `typecheck`, `test`, `build`, `deps:check`, `npm audit`, `test:supabase`, `test:e2e` e `check:runtime-legacy`, e funcionar como gate real.

---

## T01 — Corrigir dependências e remover artefatos gerados versionados por erro

### Objetivo

Eliminar dependências quebradas ou inseguras e remover artefatos gerados que não pertencem ao repositório.

### O que fazer

1. Substituir `xlsx` por `@e965/xlsx`.
2. Atualizar `vite-plugin-pwa` para `1.3.0`.
3. Atualizar o import de exportação para a nova dependência.
4. Remover artefatos gerados versionados por erro.

### Onde fazer

No root do repositório e na camada de exportação.

### Arquivos a alterar

- `package.json`
- `package-lock.json`
- `src/lib/export.ts`

### Arquivos a remover se estiverem versionados

- `tests/report.html`
- `tests/api/__pycache__/`
- `tsconfig.tsbuildinfo`
- `supabase/.temp/`
- `supabase/.branches/`
- `playwright-report/`

### Arquivos proibidos

- `src/stores/**`
- `src/features/**`
- `supabase/migrations/**`
- `supabase/tests/**`

### Comandos a executar

```bash
npm uninstall xlsx
npm install @e965/xlsx vite-plugin-pwa@1.3.0
npm audit
npm ls --all
npm run build
git ls-files tests/report.html tests/api/__pycache__ tsconfig.tsbuildinfo supabase/.temp supabase/.branches playwright-report
```

### Resultado esperado

1. `npm audit` retorna `0 vulnerabilities`.
2. `npm ls --all` retorna exit code `0`.
3. `npm run build` retorna exit code `0`.
4. Nenhum artefato gerado continua versionado.

### Teste que confirma

```bash
npm audit
npm ls --all
npm run build
```

### Se falhar

1. Corrigir apenas dependências e artefatos.
2. Não alterar testes ou código de negócio para esconder falha de dependência.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
```

Confirmar que apenas os arquivos listados na tarefa mudaram.

### Definição de pronto

`T01` só está pronta quando não houver vulnerabilidade aberta e nenhum artefato gerado continuar versionado.

---

## T02 — Fechar o contrato SQL do MVP para escrita real de presença

### Objetivo

Criar a API SQL obrigatória para que treinador e atleta escrevam presença real no Supabase, sem escrita local como fonte principal.

### Estado parcial já confirmado nesta data

- `supabase/migrations/0007_attendance_write_rpcs.sql` já existe.
- `supabase/tests/rpc_attendance_write.test.sql` já existe.
- `scripts/run-supabase-tests.sh` já inclui o teste no runner.
- o fechamento da tarefa depende agora de manter o contrato íntegro e fazer a suíte SQL voltar a verde sem enfraquecer os testes.

### O que fazer

1. Garantir que o teste SQL existente exponha a falha real sem ser enfraquecido.
2. Ajustar apenas o que faltar na migration SQL existente para manter as RPCs de escrita de presença como contrato oficial.
3. Manter o runner SQL conectado ao teste existente até a suíte voltar a verde.

### Onde fazer

Na camada Supabase.

### Arquivos a alterar

- `supabase/tests/rpc_attendance_write.test.sql`
- `supabase/migrations/0007_attendance_write_rpcs.sql`
- `scripts/run-supabase-tests.sh`

### Arquivos proibidos

- `src/**`
- `docs/**`
- `package.json`

### Requisitos exatos da migration

Criar estas funções:

1. `public.get_current_athlete_id() returns uuid`
2. `public.upsert_own_attendance(input_training_id uuid, input_status text, input_justification text default null) returns uuid`
3. `public.upsert_coach_attendance(input_team_id uuid, input_training_id uuid, input_athlete_id uuid, input_status text, input_justification text default null, input_confirmed_by_athlete boolean default false) returns uuid`

As três funções devem:

- usar `security definer`;
- validar `auth.uid()` internamente;
- validar `team_id` internamente;
- escrever em `attendance_records`;
- registrar `audit_logs`;
- ter grants explícitos.

### Comandos a executar

```bash
npx supabase@latest db reset
npm run test:supabase
```

### Resultado esperado

1. A suíte SQL continua falhando antes do ajuste correto.
2. A suíte SQL passa depois do ajuste correto.
3. Nenhum teste SQL antigo deixa de passar.

### Teste que confirma

```bash
npm run test:supabase
```

### Se falhar

1. Alterar apenas `0007_attendance_write_rpcs.sql`, `rpc_attendance_write.test.sql` e `scripts/run-supabase-tests.sh`.
2. Não enfraquecer nenhum teste existente.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
```

Confirmar que nenhum arquivo de frontend foi alterado.

### Definição de pronto

`T02` só está pronta quando o banco tiver uma API SQL real para escrita de presença e a suíte SQL estiver verde.

---

## T03 — Migrar `athleteStore` para Supabase-first

### Objetivo

Fazer `athleteStore` ler e gravar atletas no Supabase como fonte principal.

### Estado parcial já confirmado nesta data

- `src/stores/athleteStore.ts` já está Supabase-first.
- `src/features/athletes/athleteApi.ts` já existe.
- o fechamento da tarefa depende agora de prova E2E multi-contexto e da revisão adversarial final do fluxo.

### O que fazer

1. Criar primeiro um E2E real que falhe em contexto isolado.
2. Completar ou ajustar apenas o que faltar na API de atletas para sustentar a prova objetiva.
3. Completar ou ajustar apenas o que faltar na store para sustentar a prova objetiva.
4. Só manter `IndexedDB` como cache explícito secundário depois que o fluxo principal já estiver provado em Supabase, ou remover o cache desta store.

### Onde fazer

Na camada de atletas do frontend.

### Arquivos a alterar

- `src/features/athletes/athleteApi.ts`
- `src/stores/athleteStore.ts`
- `src/features/athletes/pages/AthletesPage.tsx`
- `src/features/athletes/pages/AthleteDetailPage.tsx`
- `src/features/athletes/components/AthleteForm.tsx`
- `src/features/atleta/useCurrentAthlete.ts`
- `e2e/coach/athletes.spec.ts` novo

### Arquivos que podem ser afetados

- `src/main.tsx`

### Arquivos proibidos

- `src/stores/trainingStore.ts`
- `src/stores/attendanceStore.ts`
- `src/features/trainings/**`
- `supabase/migrations/**`

### Comportamento que o teste deve provar

1. O treinador cria uma atleta no contexto A.
2. O treinador abre um contexto B limpo.
3. O contexto B vê a nova atleta sem depender do `IndexedDB` do contexto A.

### Comandos a executar

```bash
npx supabase@latest db reset
npx playwright test e2e/coach/athletes.spec.ts --reporter=line
npm run typecheck
npm run build
```

### Resultado esperado

1. O E2E novo falha antes da migração da store.
2. O E2E novo passa depois da migração da store.
3. `typecheck` e `build` continuam verdes.

### Teste que confirma

```bash
npx playwright test e2e/coach/athletes.spec.ts --reporter=line
```

### Se falhar

1. Corrigir apenas os arquivos listados no escopo.
2. Não alterar `e2e/coach/athletes.spec.ts` para esconder falha depois que ele estiver escrito.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
rg -n "getDB\\(|db\\.put\\('athletes'|db\\.getAll\\('athletes'" src/stores/athleteStore.ts src/features/athletes src/features/atleta
```

Confirmar que o fluxo principal da store não depende mais do banco local.

### Definição de pronto

`T03` só está pronta quando um segundo contexto do navegador enxergar os atletas criados no primeiro contexto.

---

## T04 — Migrar `trainingStore` para Supabase-first

### Objetivo

Fazer `trainingStore` ler e gravar treinos no Supabase como fonte principal e usar `generate_trainings` para recorrência.

### Estado parcial já confirmado nesta data

- `src/stores/trainingStore.ts` já está Supabase-first.
- `src/features/trainings/trainingApi.ts` já existe.
- a geração recorrente já usa a RPC `generate_trainings`.
- o fechamento da tarefa depende agora de prova E2E multi-contexto e da revisão adversarial final do fluxo.

### O que fazer

1. Criar primeiro um E2E real que falhe em contexto isolado.
2. Completar ou ajustar apenas o que faltar na API de treinos para sustentar a prova objetiva.
3. Completar ou ajustar apenas o que faltar na store para sustentar a prova objetiva.
4. Garantir que a geração recorrente permaneça usando a RPC `generate_trainings`.

### Onde fazer

Na camada de treinos do frontend.

### Arquivos a alterar

- `src/features/trainings/trainingApi.ts`
- `src/stores/trainingStore.ts`
- `src/features/trainings/pages/TrainingsPage.tsx`
- `src/features/trainings/pages/TrainingDetailPage.tsx`
- `src/features/trainings/components/TrainingForm.tsx`
- `e2e/coach/trainings.spec.ts` novo

### Arquivos proibidos

- `src/stores/athleteStore.ts`
- `src/stores/attendanceStore.ts`
- `src/features/confirm/**`
- `supabase/migrations/**`

### Comportamento que o teste deve provar

1. O treinador cria um treino no contexto A.
2. O contexto B limpo vê o mesmo treino.
3. O treino sobrevive ao reload sem depender do `IndexedDB` do contexto A.

### Comandos a executar

```bash
npx supabase@latest db reset
npx playwright test e2e/coach/trainings.spec.ts --reporter=line
npm run typecheck
npm run build
npm run test:supabase
```

### Resultado esperado

O E2E novo passa e a suíte SQL continua verde.

### Teste que confirma

```bash
npx playwright test e2e/coach/trainings.spec.ts --reporter=line
```

### Se falhar

Corrigir apenas arquivos de treinos. Não alterar `athleteStore`, `attendanceStore` ou testes SQL.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
rg -n "db\\.put\\('trainings'|db\\.getAll\\('trainings'|generateRecurringDrafts" src/stores/trainingStore.ts src/features/trainings
```

Confirmar que a fonte principal não é local.

### Definição de pronto

`T04` só está pronta quando dois contextos isolados enxergarem os mesmos treinos.

---

## T05 — Migrar `attendanceStore` para Supabase-first e usar as RPCs de escrita real

### Objetivo

Fazer `attendanceStore` ler e gravar presença no Supabase como fonte principal.

### Estado parcial já confirmado nesta data

- `src/stores/attendanceStore.ts` já está Supabase-first.
- a store já usa `upsert_coach_attendance`.
- o fechamento da tarefa depende agora de prova E2E multi-contexto, leitura coerente em relatórios/resumos e convergência final com os fluxos da atleta e de confirmação pública.

### O que fazer

1. Criar primeiro um E2E real que falhe em contexto isolado.
2. Completar ou ajustar apenas o que faltar na API de presença para sustentar a prova objetiva.
3. Garantir que treinador continue usando `upsert_coach_attendance`.
4. Garantir que atleta use `upsert_own_attendance` no fluxo próprio.
5. Garantir que relatórios e resumos leiam do mesmo dado final.

### Onde fazer

Na camada de presença do frontend.

### Arquivos a alterar

- `src/features/attendance/attendanceApi.ts` novo
- `src/stores/attendanceStore.ts`
- `src/features/trainings/pages/TrainingDetailPage.tsx`
- `src/features/reports/pages/ReportsPage.tsx`
- `src/features/dashboard/pages/DashboardPage.tsx`
- `src/features/athletes/pages/AthleteDetailPage.tsx`
- `src/features/atleta/pages/AtletaTreinosPage.tsx`
- `src/features/atleta/pages/AtletaTreinoDetailPage.tsx`
- `e2e/coach/attendance.spec.ts` novo

### Arquivos proibidos

- `supabase/migrations/0007_attendance_write_rpcs.sql`
- `src/stores/athleteStore.ts`
- `src/stores/trainingStore.ts`

### Comportamento que o teste deve provar

1. O treinador marca presença no contexto A.
2. O contexto B limpo vê a mesma presença.
3. O relatório e o resumo do treino mostram o mesmo número.

### Comandos a executar

```bash
npx supabase@latest db reset
npx playwright test e2e/coach/attendance.spec.ts --reporter=line
npm run typecheck
npm run build
npm run test:supabase
```

### Resultado esperado

Todos os lugares do sistema mostram a mesma presença sem divergência local.

### Teste que confirma

```bash
npx playwright test e2e/coach/attendance.spec.ts --reporter=line
```

### Se falhar

Alterar apenas API, store e telas listadas. Não alterar o teste para esconder divergência.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
rg -n "db\\.put\\('attendance'|pullConfirmations|pushConfirmation" src/stores/attendanceStore.ts src/features/trainings src/features/atleta src/features/reports src/features/dashboard
```

Confirmar que a presença não depende mais do caminho legado.

### Definição de pronto

`T05` só está pronta quando treinador, relatório e segundo contexto enxergarem o mesmo dado.

---

## T06 — Fazer confirmação pública por token e confirmação da atleta convergirem no mesmo registro

### Objetivo

Garantir que presença por token público, atleta logada e treinador escrevam no mesmo `attendance_records`.

### O que fazer

1. Criar primeiro um E2E real que falhe.
2. Ajustar o fluxo público para não usar fallback local como caminho principal.
3. Ajustar `TrainingDetailPage` para gerar e visualizar o mesmo status final.
4. Ajustar a tela da atleta para refletir o mesmo status final.
5. Adicionar prova SQL objetiva de convergência entre a escrita da atleta e a escrita do treinador no mesmo `attendance_records`.

### Onde fazer

Na camada de confirmação pública e tokens.

### Arquivos a alterar

- `src/features/confirm/pages/PublicConfirmPage.tsx`
- `src/features/trainings/pages/TrainingDetailPage.tsx`
- `src/features/presence-tokens/presenceTokenApi.ts`
- `src/features/atleta/pages/AtletaTreinoDetailPage.tsx`
- `supabase/tests/rpc_attendance_write.test.sql`
- `e2e/public/presence-token.spec.ts` novo

### Arquivos proibidos

- `src/stores/athleteStore.ts`
- `src/stores/trainingStore.ts`
- `supabase/migrations/**`

### Comportamento que o teste deve provar

1. O treinador gera lote de token.
2. O link público confirma presença.
3. O treinador vê a presença no detalhe do treino.
4. A atleta logada vê o mesmo status.

### Comandos a executar

```bash
VITE_PRESENCE_TOKENS_BACKEND=supabase npx playwright test e2e/public/presence-token.spec.ts --reporter=line
npm run typecheck
npm run build
npm run test:supabase
```

### Resultado esperado

Os três fluxos convergem no mesmo status final, e a prova SQL confirma que atleta e treinador gravam no mesmo registro final por `training_id + athlete_id`.

### Teste que confirma

```bash
VITE_PRESENCE_TOKENS_BACKEND=supabase npx playwright test e2e/public/presence-token.spec.ts --reporter=line
npm run test:supabase
```

### Se falhar

Corrigir apenas os arquivos listados. Não mexer em stores fora do escopo nem enfraquecer a prova SQL.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
rg -n "upsert\\(|attendanceStore\\.upsert|pushConfirmation|loadAtletaSyncConfig" src/features/confirm src/features/trainings src/features/atleta
```

Confirmar que o fluxo público não depende mais do caminho legado para o sucesso principal e que a prova SQL não foi enfraquecida para esconder divergência.

### Definição de pronto

`T06` só está pronta quando token público, atleta logada e treinador enxergarem o mesmo status final e a prova SQL confirmar a convergência do registro final.

---

## T07 — Fechar onboarding real da atleta e expor estado de vínculo

### Objetivo

Tornar explícito no produto quando a atleta ainda não vinculou a conta e quando a conta já está vinculada.

### O que fazer

1. Criar primeiro um E2E real que falhe.
2. Exibir em `src/features/athletes/pages/AthleteDetailPage.tsx` o estado da conta da atleta derivado de `athletes.user_id`:
   - `não vinculada`
   - `vinculada`
3. Exibir ação correta por estado:
   - se `não vinculada`, mostrar instrução de primeiro acesso;
   - se `vinculada`, mostrar envio de redefinição de senha.
4. Garantir que o primeiro login vincule `user_id` sem criar atleta duplicada.

### Onde fazer

Na camada de auth da atleta e no detalhe da atleta do treinador.

### Arquivos a alterar

- `src/features/athletes/pages/AthleteDetailPage.tsx`
- `src/features/atleta/pages/AtletaLoginPage.tsx`
- `src/shared/layouts/AtletaGuard.tsx`
- `src/features/atleta/useCurrentAthlete.ts`
- `e2e/athlete/onboarding.spec.ts` novo

### Arquivos proibidos

- `supabase/migrations/**`
- `src/stores/trainingStore.ts`
- `src/stores/attendanceStore.ts`

### Comportamento que o teste deve provar

1. O treinador cadastra uma atleta com email.
2. A atleta cria a conta com o mesmo email.
3. O primeiro login vincula `user_id`.
4. O painel do treinador, em `AthleteDetailPage`, passa de `não vinculada` para `vinculada` com base no dado real do banco.

### Comandos a executar

```bash
npx supabase@latest db reset
npx playwright test e2e/athlete/onboarding.spec.ts --reporter=line
npm run typecheck
npm run build
```

### Resultado esperado

O vínculo de conta da atleta é observável no produto e não depende de inferência manual.

### Teste que confirma

```bash
npx playwright test e2e/athlete/onboarding.spec.ts --reporter=line
```

### Se falhar

Corrigir apenas os arquivos listados. Não alterar SQL, stores de treinos ou stores de presença.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
rg -n "signUp\\(|resetPasswordForEmail\\(|user_id|não vinculada|vinculada" src/features/athletes src/features/atleta src/shared/layouts
```

Confirmar que o estado não é apenas texto decorativo e que o vínculo real existe.

### Definição de pronto

`T07` só está pronta quando o painel do treinador refletir o vínculo real da atleta.

---

## T08 — Importar dados legados e reconciliar antes do cutover

### Objetivo

Transferir os dados operacionais legados para o Supabase e provar que a migração está correta antes de desligar o legado.

### O que fazer

1. Criar script de importação do JSON legado para Supabase.
2. Criar script de reconciliação entre o arquivo legado e o banco final.
3. Criar documento de cutover mínimo.

### Onde fazer

Na camada de scripts e documentação operacional.

### Arquivos a alterar

- `scripts/import-legacy-json-to-supabase.mjs` novo
- `scripts/reconcile-legacy-json-to-supabase.mjs` novo
- `docs/mvp-cutover.md` novo
- `fixtures/legacy-export.json` novo

### Arquivos proibidos

- `src/**`
- `supabase/migrations/**`
- `supabase/tests/**`

### Formato obrigatório de entrada

O script deve consumir o mesmo formato exportado pelo app atual para:

- atletas;
- treinos;
- presenças;
- configurações exportáveis.

### Comandos a executar

```bash
node scripts/import-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json --dry-run
node scripts/import-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json --apply
node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json
```

### Resultado esperado

1. O dry-run lista as operações sem gravar.
2. O apply grava.
3. A reconciliação retorna exit code `0`.

### Teste que confirma

```bash
node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json
```

### Se falhar

Corrigir apenas os scripts e o documento de cutover. Não remover o legado ainda.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
node scripts/reconcile-legacy-json-to-supabase.mjs ./fixtures/legacy-export.json; echo $?
```

Confirmar que nenhum dado foi “migrado por texto” sem reconciliação objetiva.

### Definição de pronto

`T08` só está pronta quando a reconciliação retornar exit code `0`.

---

## T09 — Remover legado do runtime e limpar arquivos mortos comprovados

### Objetivo

Remover do runtime todos os caminhos legados que não são mais necessários após o cutover validado.

### Pré-condição obrigatória

`T08` concluída com reconciliação exit code `0`.

### O que fazer

1. Remover `src/lib/sync.ts` do runtime.
2. Eliminar do runtime final as referências restantes a `getDB()` nos caminhos ainda incluídos no MVP, em especial `src/stores/scoutStore.ts` e `src/lib/export.ts`.
3. Remover `apps-script/` do repositório se o rollback desta fase não depender mais dele.
4. Remover `tests/api/` e `tests/report.html`.
5. Atualizar docs que contradizem o estado atual.
6. Remover env vars legadas dos exemplos.

### Onde fazer

No runtime, nos testes legados e na documentação.

### Arquivos a alterar ou remover

- `src/lib/sync.ts`
- `src/stores/scoutStore.ts`
- `src/lib/export.ts`
- `src/features/scout/pages/ScoutGamesPage.tsx`
- `src/features/scout/pages/ScoutLivePage.tsx`
- `src/features/scout/pages/ScoutSummaryPage.tsx`
- `src/features/export/pages/ExportPage.tsx`
- `apps-script/Code.gs`
- `apps-script/SETUP.md`
- `tests/api/conftest.py`
- `tests/api/test_endpoints.py`
- `tests/api/requirements.txt`
- `tests/report.html`
- `.env.example`
- `docs/pwa-cache-legado.md`
- `docs/presence-tokens-supabase.md`
- `docs/supabase-foundation.md`

### Arquivos proibidos

- `supabase/migrations/**`
- `supabase/tests/**`

### Prova obrigatória antes de remover

Executar:

```bash
rg -n "loadSyncConfig|resolveEndpointUrl|pushConfirmation|pullAthletes|pullTrainings|VITE_SYNC_ENDPOINT_URL|syncEndpointUrl|syncSecret" src package.json
rg -n "Apps Script|Google Sheets|Code\\.gs|tests/api" src docs package.json
```

Os comandos acima devem provar que o item a ser removido não faz mais parte do runtime principal.

### Comandos a executar

```bash
rg -n "loadSyncConfig|resolveEndpointUrl|pushConfirmation|pullAthletes|pullTrainings|VITE_SYNC_ENDPOINT_URL|syncEndpointUrl|syncSecret" src package.json
rg -n "Apps Script|Google Sheets|Code\\.gs|tests/api" src docs package.json
npm run typecheck
npm test
npm run build
```

### Resultado esperado

1. Nenhuma referência de runtime legado permanece em `src/`.
2. O build continua verde.
3. Os testes continuam verdes.
4. `check-runtime-legacy.sh` retorna `0` sem exclusões ad hoc para `scoutStore.ts` ou `src/lib/export.ts`.

### Teste que confirma

```bash
bash scripts/check-runtime-legacy.sh
```

O teste só é aceito se retornar exit code `0`.

### Se falhar

Restaurar a remoção e eliminar primeiro a referência restante provada pelos comandos.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
bash scripts/check-runtime-legacy.sh
```

Confirmar que o sistema não depende de legado escondido.

### Definição de pronto

`T09` só está pronta quando o script de checagem de legado retornar exit code `0`.

---

## T10 — Reescrever E2E defasados e fechar a validação final do MVP

### Objetivo

Fazer a suíte E2E validar o comportamento real do MVP e fechar o gate final de release.

### O que fazer

1. Reescrever os testes E2E que ainda esperam PIN ou comportamento antigo.
2. Garantir que os testes E2E validem comportamento real em múltiplos contextos.
3. Atualizar a documentação mínima do MVP.
4. Atualizar `scripts/validate-mvp-v1.sh` para executar a suíte E2E final e usar `npm audit` sem afrouxar o nível exigido pelo plano.
5. Fazer o comando final `validate:mvp:v1` passar.

### Onde fazer

Na camada E2E, scripts e docs finais.

### Arquivos a alterar

- `e2e/coach/login.spec.ts`
- `e2e/athlete/login.spec.ts`
- `e2e/guards.spec.ts`
- `e2e/settings.spec.ts`
- `e2e/smoke.spec.ts`
- `docs/mvp-v1.md` novo
- `.env.example`
- `scripts/validate-mvp-v1.sh`

### Arquivos proibidos

- `supabase/migrations/**`
- `supabase/tests/**`

### Comportamentos obrigatórios da suíte final

1. login do treinador por email/senha;
2. login da atleta por email/senha;
3. recuperação de senha da atleta;
4. `AtletaGuard` bloqueando conta não vinculada;
5. criação de atleta visível em segundo contexto;
6. criação de treino visível em segundo contexto;
7. presença manual visível em segundo contexto;
8. confirmação pública por token visível no painel e na área da atleta.

### Comandos a executar

```bash
npx supabase@latest db reset
npm run typecheck
npm test
npm run test:supabase
npx playwright test --reporter=line
npm run build
npm run deps:check
npm audit
bash scripts/check-runtime-legacy.sh
npm run validate:mvp:v1
```

### Resultado esperado

Todos os comandos retornam exit code `0`.

### Teste que confirma

```bash
npm run validate:mvp:v1
```

### Se falhar

1. Corrigir apenas os arquivos listados nesta tarefa ou reabrir a tarefa anterior responsável pelo comportamento.
2. Não alterar o script final para esconder falha.

### Análise adversarial obrigatória

Executar:

```bash
git diff --name-only
npm run validate:mvp:v1
```

Confirmar que:

- não existe arquivo fora do escopo alterado;
- nenhum teste foi enfraquecido;
- nenhum legado voltou ao runtime;
- nenhum comando do gate final falhou.

### Definição de pronto

`T10` só está pronta quando `npm run validate:mvp:v1` retornar exit code `0`.

---

## 7. Checklist final de aceite do MVP v1.0

O MVP v1.0 só existe quando todos os itens abaixo forem verdadeiros:

- `T00` a `T10` concluídas;
- `npm run validate:mvp:v1` retorna exit code `0`;
- `npm audit` retorna `0 vulnerabilities`;
- `npm ls --all` retorna exit code `0`;
- `npm run build` retorna exit code `0`;
- `npm run typecheck` retorna exit code `0`;
- `npm test` retorna exit code `0`;
- `npm run test:supabase` retorna exit code `0`;
- `npx playwright test --reporter=line` retorna exit code `0`;
- `bash scripts/check-runtime-legacy.sh` retorna exit code `0`;
- o runtime não usa `IndexedDB` como fonte principal;
- o runtime não usa `Apps Script` no caminho crítico;
- a documentação mínima do MVP está atualizada;
- o próximo passo pós-MVP está explícito no changelog e no execution log.

## 8. Estado proibido

O plano falha imediatamente se qualquer um destes casos ocorrer:

- tarefa marcada como pronta sem comando objetivo;
- teste alterado para esconder falha;
- contrato alterado sem tarefa específica;
- arquivo fora do escopo alterado;
- legado removido sem prova;
- legado mantido no runtime sem necessidade;
- build verde com comportamento real ainda falso;
- pendência escondida em comentário ou TODO sem tarefa aberta neste plano.
