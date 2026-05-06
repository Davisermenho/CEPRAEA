# Changelog — CEPRAEA

Registro das decisões técnicas e passos operacionais do projeto.

## Política

Toda ação relevante no repositório deve atualizar este arquivo no mesmo commit ou em commit imediatamente subsequente.

Registrar: decisões arquiteturais, merges, CI/CD, migrations, RLS, grants, RPCs, feature flags, rotas públicas, validações de produção e decisões de manter legado ativo.

Não registrar valores sensíveis de ambiente.

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
