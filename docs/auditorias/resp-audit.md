# Relatório de Verificação e Validação da Auditoria do Plano

**Arquivo auditado:** `auditplan.md`  
**Plano de referência auditado:** `plan.md`  
**Data da validação:** 2026-05-06  
**Critério:** cada afirmação do `auditplan.md` foi revalidada contra o repositório atual, scripts reais, testes existentes, `CEPRAEA.md` e `AGENT.md`.

## Legenda

- `Verdadeira`: a afirmação está correta no estado atual do repositório.
- `Parcialmente válida`: a afirmação aponta um problema real, mas contém exagero, imprecisão ou mistura causas.
- `Falsa`: a afirmação contradiz o estado atual do repositório.
- `Obsoleta`: a afirmação podia descrever um estado anterior, mas não é mais verdadeira no código atual.

## Resumo executivo

- A auditoria acertou os **bloqueios estruturais** mais importantes:
  - o gate `validate:mvp:v1` não executava E2E;
  - o runtime legado ainda bloqueava o fechamento do MVP;
  - os E2E de login/guard/settings estavam defasados para o MVP Supabase.
- A auditoria errou várias **afirmações factuais**:
  - scripts, dependências e arquivos marcados como ausentes já existiam;
  - `grants.test.sql` já estava no runner;
  - `rpc_attendance_write.test.sql` já verificava `audit_logs`;
  - `psql` existe neste ambiente;
  - parte da leitura de stores já estava obsoleta, porque `athleteStore.ts`, `trainingStore.ts` e `attendanceStore.ts` já estavam Supabase-first.
- A auditoria também contém achados **mistos**:
  - a conclusão geral costuma estar certa;
  - a explicação e a evidência, em vários pontos, estavam desatualizadas.

## 1. Erros factuais

### 1.1 Tabela de status da seção 6.2.2

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `scripts/validate-mvp-v1.sh` existe | Verdadeira | `scripts/validate-mvp-v1.sh` presente | Devia corrigir o plano |
| `scripts/check-runtime-legacy.sh` existe | Verdadeira | `scripts/check-runtime-legacy.sh` presente | Devia corrigir o plano |
| `package.json` tem `typecheck` | Verdadeira | `"typecheck": "tsc --noEmit"` | Devia corrigir o plano |
| `package.json` tem `test:e2e` | Verdadeira | `"test:e2e": "playwright test --reporter=line"` | Devia corrigir o plano |
| `package.json` tem `deps:check` | Verdadeira | `"deps:check": "npm ls --all"` | Devia corrigir o plano |
| `package.json` tem `check:runtime-legacy` | Verdadeira | `"check:runtime-legacy": "bash scripts/check-runtime-legacy.sh"` | Devia corrigir o plano |
| `package.json` tem `validate:mvp:v1` | Verdadeira | `"validate:mvp:v1": "bash scripts/validate-mvp-v1.sh"` | Devia corrigir o plano |
| `package.json` tem `@playwright/test` | Verdadeira | dependência presente | Devia corrigir o plano |
| `package.json` não usa mais `xlsx` direto | Verdadeira | usa `@e965/xlsx`; `xlsx` no lock é transitivo/binário | Devia corrigir o plano |
| `vite-plugin-pwa@^1.3.0` está registrado | Verdadeira | dependência presente | Devia corrigir o plano |
| `supabase/migrations/0007_attendance_write_rpcs.sql` existe | Verdadeira | arquivo presente | Devia corrigir o plano |
| `supabase/tests/rpc_attendance_write.test.sql` existe | Verdadeira | arquivo presente | Devia corrigir o plano |
| A tabela de status de `plan.md` estava desatualizada | Verdadeira no plano auditado | a versão auditada do plano contradizia o repositório | A mudança devia ser feita |
| T00, T01 e T02 estavam realmente `PENDENTE` | Falsa | os artefatos já existiam; no máximo estavam parciais | Não devia permanecer no plano |

### 1.2 Seção 6.2.1 e `psql`

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| havia confusão entre “script não existe” e “script não executa” | Verdadeira | o plano misturava ausência de arquivo com falha de execução | Devia corrigir o plano |
| `psql` não está instalado no ambiente atual | Falsa | `command -v psql` retorna `/usr/bin/psql` | Não devia constar como fato atual |
| a falha de `test:supabase` invalidava a existência dos artefatos | Falsa | arquivos e scripts existem independentemente da execução local | Não devia ser usado como evidência de ausência |

## 2. Bloqueios permanentes

### 2.1 `scoutStore.ts` e `export.ts`

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `check-runtime-legacy.sh` verifica `getDB(` em `src/` | Verdadeira | script contém `check "getDB( em stores/features" "getDB("` | Mantém validade |
| `src/stores/scoutStore.ts` usa `getDB()` | Verdadeira | 8 ocorrências | Mudança necessária em plano/código |
| `src/lib/export.ts` usa `getDB()` | Verdadeira | `exportFullBackup` e `importFullBackup` usam `getDB()` | Mudança necessária em plano/código |
| o plano auditado não tinha tarefa cobrindo `scoutStore.ts` e `export.ts` | Verdadeira no plano auditado | escopo antigo não cobria esses arquivos | Devia corrigir o plano |
| Scout e exportação estão no escopo do MVP em `CEPRAEA.md` | Verdadeira | `8.1.6` e `8.1.7` incluem exportação e scout | Mantém validade |
| T09/T10 nunca poderiam passar como o plano estava escrito | Verdadeira no plano auditado | gate exigia script que falhava em arquivos sem tarefa correspondente | Devia corrigir o plano |
| a única saída seria criar T03.5/T06.5 | Parcialmente válida | era preciso ou ampliar tarefa existente ou mudar gate; numeração sugerida não era obrigatória | A correção era necessária, a forma era aberta |

### 2.2 Gate final sem E2E

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `validate-mvp-v1.sh` não incluía `test:e2e` | Verdadeira | script rodava typecheck/test/build/deps/audit/runtime/supabase, sem E2E | Devia corrigir o plano/script |
| o gate final podia passar sem validar o comportamento E2E | Verdadeira | `npm run validate:mvp:v1` não chamava Playwright | Mudança necessária |

## 3. E2E que validavam comportamento legado

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `e2e/athlete/login.spec.ts` testa telefone + PIN | Verdadeira | o spec procura `input[type="tel"]` e senha | Devia ser reescrito |
| esse spec não valida login Supabase da atleta | Verdadeira | a UI atual usa email + senha | Devia ser reescrito |
| `e2e/coach/login.spec.ts` testa PIN do treinador | Parcialmente válida | a parte `WelcomePage` é útil; a parte `LoginPage` ainda testa PIN | Reescrever só a parte de login |
| `e2e/settings.spec.ts` usa helper de login por PIN | Verdadeira | `loginAsCoach` preenche `input[type="password"]` com PIN | Devia ser reescrito |
| `e2e/smoke.spec.ts` testa apenas carregamento de página | Falsa | também testa manifest, SW, bundle e welcome page | Não deve ser descrito assim |
| `e2e/smoke.spec.ts` é fraco para provar o MVP | Verdadeira | não prova fluxos críticos de produto | Deve sair do gate MVP ou virar suíte separada |
| `e2e/guards.spec.ts` só prova redirecionamento de não autenticados | Verdadeira | não há cenário de acesso positivo nem segregação de papéis | Deve ser expandido |
| “todos os E2E existentes são inválidos para provar que o MVP funciona” | Parcialmente válida | `guards.spec.ts` e partes de `smoke.spec.ts` ainda têm valor limitado; não são suficientes para o MVP | A conclusão prática é correta: a suíte final precisava ser refeita |

## 4. Testes SQL

### 4.1 Parte correta da auditoria

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `rpc_attendance_write.test.sql` é estruturalmente válido para T02 | Verdadeira | usa `authenticated`, `request.jwt.claim.sub`, `begin/rollback` e casos de negação | Mantém validade |
| `athlete_auth.test.sql` é evidência parcial válida para T07/RLS | Verdadeira | cobre leitura por atleta e isolamento | Mantém validade |
| `rls.test.sql` e `team_integrity.test.sql` são válidos | Verdadeira | cobrem isolamento e integridade | Mantém validade |

### 4.2 Gaps apontados

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| falta teste de convergência entre `upsert_own_attendance` e `upsert_coach_attendance` no mesmo registro | Verdadeira | não há assert cruzado no mesmo `training_id + athlete_id` entre os dois caminhos | Mudança recomendada |
| falta teste de atleta tentando registrar presença de outra atleta via `upsert_own_attendance` | Parcialmente válida | a RPC não recebe `athlete_id`; o risco descrito é impreciso, mas falta provar a impossibilidade de atuação sobre outra atleta por caminho equivalente | Mudança opcional de endurecimento |
| nenhum teste verifica `audit_logs` | Falsa | `rpc_attendance_write.test.sql` já verifica `audit_logs` | Não deve constar |
| `grants.test.sql` não está no runner | Falsa | `scripts/run-supabase-tests.sh` já executa `supabase/tests/grants.test.sql` | Não deve constar |

## 5. Pontos fracos do plano

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| a referência a “10 critérios de aceite” era fantasma | Verdadeira no plano auditado | não havia lista desses 10 critérios | Devia corrigir o plano |
| T03 permitia “remover o cache” como brecha para implementação vazia | Verdadeira no plano auditado | o texto permitia leitura ambígua | Devia corrigir o plano |
| T07 não definia bem o “estado de vínculo” | Verdadeira no plano auditado | faltava página-alvo, campo-base e atualização | Devia corrigir o plano |
| T06 não definia prova de convergência além da UI | Verdadeira no plano auditado | só a leitura de tela era insuficiente | Devia corrigir o plano |
| T02 já estava implementado e o status seguia `PENDENTE` | Verdadeira | migration, teste e runner existiam | Devia corrigir o plano |
| `validate-mvp-v1.sh` com `--audit-level=high` contradizia “0 vulnerabilities” | Verdadeira | o gate aceitava passar com vulnerabilidades moderadas/low | Devia corrigir o plano/script |
| a regra 2.4 apontava logs errados para Claude e Copilot | Verdadeira | `plan.md` mandava sempre para `.codex/`; `AGENT.md` separa `.claude/`, `.codex/`, `.copilot/` | Devia corrigir o plano |
| a citação da auditoria sobre Copilot em `AGENT.md` estava correta | Falsa | `AGENT.md` usa `.copilot/...`, não `.claude/copilot-...` | A conclusão estava certa, a citação estava errada |

## 6. Onde o plano permitia falsos positivos

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `check-runtime-legacy.sh` não detecta `pushConfirmation` | Verdadeira | o script não procura `pushConfirmation`; o código ainda importa essa função | Mudança recomendada |
| `useCurrentAthlete.ts` tem fallback híbrido que pode mascarar falha da store | Verdadeira | tenta store primeiro e consulta Supabase diretamente se não achar | Mudança arquitetural opcional, risco real |
| a explicação da auditoria dependia de `athleteStore` legado em IndexedDB | Obsoleta | `athleteStore.ts` hoje já é Supabase-first | O risco de mascaramento continua, a justificativa original não |
| `npm test` inclui prova de que o legado `sync.ts` funciona | Verdadeira | `src/lib/__tests__/sync.test.ts` cobre `generateSecret`, `pingEndpoint`, `resolveEndpointUrl` | Deve ser classificado como teste legado, não evidência de MVP |
| o plano não exigia confirmação SQL pós-E2E | Parcialmente válida | não havia query correlacionada ao E2E; havia SQL separado em tarefas diferentes | Recomendação boa, mas não era ausência total de teste SQL |

## 7. Análise adversarial por tarefa

### T00

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| scripts e comandos existem | Verdadeira | presentes em `package.json` e `scripts/` | Mantém validade |
| `validate-mvp-v1.sh` estava incompleto sem E2E | Verdadeira | confirmado | Devia corrigir |
| T00 podia ser marcado “já concluído” de forma enganosa | Parcialmente válida | artefatos existiam, mas o gate era incompleto | A preocupação era correta |

### T01

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| dependências `@e965/xlsx` e `vite-plugin-pwa@1.3.0` estão corretas | Verdadeira | confirmado | Mantém validade |
| a tabela do plano dizer `PENDENTE` era falso | Verdadeira no plano auditado | confirmado | Devia corrigir |
| `tsconfig.tsbuildinfo` está sendo versionado | Falsa no estado atual | `git ls-files tsconfig.tsbuildinfo` não retorna arquivo | Não deve constar como fato atual |
| `.gitignore` não inclui `tsconfig.tsbuildinfo` | Verdadeira | arquivo não está ignorado | Mudança recomendada |

### T02

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| migration, teste e runner existem | Verdadeira | confirmado | Mantém validade |
| `grants.test.sql` não está no runner | Falsa | já está no runner | Não deve constar |
| falta teste de convergência entre os dois RPCs | Verdadeira | confirmado | Mudança recomendada |

### T03

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `athleteStore.ts` usa IndexedDB e `sync.ts` | Obsoleta | `athleteStore.ts` está Supabase-first | Não deve constar como estado atual |
| a especificação permitia implementação vazia | Verdadeira no plano auditado | texto ambíguo | Devia corrigir o plano |
| `e2e/coach/athletes.spec.ts` não existe | Verdadeira | não há arquivo em `e2e/` | Mudança recomendada |

### T04

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `trainingStore.ts` usa IndexedDB e `sync.ts` | Obsoleta | `trainingStore.ts` está Supabase-first | Não deve constar como estado atual |
| faltava E2E `e2e/coach/trainings.spec.ts` | Verdadeira | arquivo não existe | Mudança recomendada |

### T05

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `attendanceStore.ts` usa IndexedDB e `pullConfirmations` | Obsoleta | `attendanceStore.ts` está Supabase-first | Não deve constar como estado atual |
| há diferença de modelo entre chave local `treinoId::atletaId` e `uuid` do banco | Parcialmente válida | a store mapeia o banco para id composto local | É uma decisão de adaptação, não necessariamente um problema de bloqueio |
| falta `e2e/coach/attendance.spec.ts` | Verdadeira | arquivo não existe | Mudança recomendada |

### T06

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| `PublicConfirmPage.tsx` tem dois caminhos: token Supabase e fallback legado | Verdadeira | `usingSupabaseToken` escolhe entre fluxo novo e fluxo com `loadSyncConfig/pushConfirmation` | Mudança recomendada |
| o caminho sem token salva primeiro em IndexedDB local | Falsa/obsoleta | hoje chama `useAttendanceStore().upsert`, não mais IDB | Não deve constar |
| o caminho sem token continua convivendo com legado | Verdadeira | ainda usa `loadSyncConfig` e `pushConfirmation` | Mudança recomendada |
| `e2e/public/presence-token.spec.ts` não existe | Verdadeira | arquivo não existe | Mudança recomendada |

### T07

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| auth da atleta existe parcialmente | Verdadeira | `AtletaGuard`, `AtletaLoginPage`, `useCurrentAthlete` existem | Mantém validade |
| `e2e/athlete/login.spec.ts` atual é evidência inválida para o MVP | Verdadeira | spec ainda testa telefone/PIN | Mudança recomendada |
| `e2e/athlete/onboarding.spec.ts` não existe | Verdadeira | arquivo não existe | Mudança recomendada |
| `useCurrentAthlete` não persiste `user_id` de volta no banco | Falsa | `AtletaGuard.tsx` faz `update({ user_id: user.id })` no primeiro login | Não deve constar |

### T08

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| scripts de importação/reconciliação não existem | Verdadeira | arquivos ausentes | Mudança recomendada |
| o plano não definia schema de entrada com precisão | Verdadeira | só dizia “mesmo formato exportado pelo app atual” | Devia endurecer a especificação |
| havia incompatibilidade provável entre schema exportado e schema Supabase | Parcialmente válida | `export.ts` usa campos do app (`nome`, `treinoId`, `atletaId`), mas não havia contrato formal de transformação | Risco real, mas dependia do script ainda não escrito |

### T09

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| havia bloqueio estrutural por `scoutStore.ts` e `export.ts` | Verdadeira no plano auditado | confirmado | Devia corrigir o plano |
| `pushConfirmation` podia sobreviver sem ser detectado | Verdadeira | script não checa esse padrão | Mudança recomendada |

### T10

| Afirmação auditada | Veredito | Evidência | Decisão |
|---|---|---|---|
| os E2E existentes são majoritariamente legados | Verdadeira | confirmado | Mudança recomendada |
| o gate final podia passar sem E2E | Verdadeira | confirmado | Devia corrigir |
| os novos specs exigidos por T10 não existem | Verdadeira | só existem 5 specs em `e2e/` | Mudança recomendada |
| T10 não podia concluir porque dependia de T09 bloqueada | Verdadeira no plano auditado | consequência estrutural correta | Devia corrigir o plano |

## 8. Classificação dos testes existentes

| Recomendação da auditoria | Veredito | Decisão |
|---|---|---|
| manter `rpc_attendance_write.test.sql`, `athlete_auth.test.sql`, `rls.test.sql`, `team_integrity.test.sql`, `rpc_generate_trainings.test.sql`, `rpc_presence_tokens.test.sql`, `rpc_confirm_presence.test.sql` | Verdadeira | Concordar |
| manter `e2e/guards.spec.ts`, mas expandir | Verdadeira | Concordar |
| reescrever `e2e/coach/login.spec.ts` | Verdadeira | Concordar |
| reescrever `e2e/athlete/login.spec.ts` | Verdadeira | Concordar |
| reescrever `e2e/settings.spec.ts` | Verdadeira | Concordar |
| marcar `src/lib/__tests__/sync.test.ts` como legado | Verdadeira | Concordar |
| deletar `e2e/smoke.spec.ts` | Parcialmente válida | Não precisa deletar; o correto é tirar do gate do MVP ou movê-lo para uma suíte de smoke separada |

## 9. Riscos semânticos

| Afirmação auditada | Veredito | Decisão |
|---|---|---|
| T03 permitia interpretação perigosa de “remover cache” | Verdadeira no plano auditado | Concordar |
| T07 permitia badge estático sem refletir banco | Verdadeira no plano auditado | Concordar |
| “comando com exit code 0” podia virar prova trivial | Verdadeira | Concordar |
| T06 permitia manter legado como fallback sob pretexto de “principal” | Verdadeira | Concordar |
| “bloco funcional já implementado” podia ser lido como autorização para `DONE` | Parcialmente válida | Risco real de interpretação, mas dependia do agente ignorar o restante do plano |

## 10. Resumo das ações propostas pela auditoria

| Ação proposta em `auditplan.md` | Veredito | Decisão |
|---|---|---|
| corrigir tabela de status | Verdadeira | Devia ser feita |
| adicionar `test:e2e` ao `validate-mvp-v1.sh` | Verdadeira | Devia ser feita |
| criar tarefa para migrar `scoutStore` | Parcialmente válida | Era necessário cobrir `scoutStore`; isso podia ser nova tarefa ou ampliação de T09 |
| criar tarefa ou decisão explícita para `export.ts` | Verdadeira | Devia ser feita |
| adicionar `pushConfirmation` ao `check-runtime-legacy.sh` | Verdadeira | Recomendado |
| adicionar `grants.test.sql` ao runner | Falsa | Já estava no runner |
| corrigir referência a `.codex/` na seção 2.4 | Verdadeira | Devia ser feita |
| especificar os “10 critérios” ou remover a referência | Verdadeira | Devia ser feita |
| remover a alternativa “ou remover o cache” em T03 | Verdadeira | Devia ser feita |
| adicionar `tsconfig.tsbuildinfo` ao `.gitignore` | Verdadeira | Recomendado |
| alinhar `npm audit --audit-level=high` com “0 vulnerabilities” | Verdadeira | Devia ser feita |
| adicionar verificação SQL pós-E2E em T05/T06 | Parcialmente válida | Boa recomendação de endurecimento; não era a única forma de fechar a prova |

## Conclusão final

O `auditplan.md` foi **útil e correto nos problemas estruturais centrais**, mas **não é confiável como inventário factual sem revalidação**. Ele acertou:

- a lacuna do gate final sem E2E;
- a permanência de legado no runtime;
- a defasagem dos E2E ligados a PIN/telefone;
- a ambiguidade de critérios e definições em partes do plano.

Ele errou ou ficou obsoleto em pontos importantes:

- ausência de scripts e dependências que já existiam;
- ausência de `grants.test.sql` no runner;
- ausência de teste de `audit_logs` em `rpc_attendance_write.test.sql`;
- diagnóstico de stores que já estavam migradas para Supabase-first;
- ausência de `psql` neste ambiente;
- citação incorreta do caminho de logs do Copilot em `AGENT.md`.

### Veredito global

- **Como documento advisory estrutural:** válido com ressalvas.
- **Como fotografia factual do repositório atual:** parcialmente inválido.
- **Como base única para alterar `plan.md` sem revalidação:** inválido.

### Resultado prático da validação

As mudanças em `plan.md` **deviam ser feitas apenas nos pontos confirmados**. Os itens factualmente falsos do `auditplan.md` **não deviam ser promovidos para o plano**.
