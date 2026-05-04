# Changelog — CEPRAEA

Registro cronológico das decisões técnicas, mudanças de arquitetura e passos operacionais do projeto.

## Política de manutenção

A partir de 2026-05-04, toda ação relevante no repositório deve atualizar este arquivo no mesmo commit ou em commit imediatamente subsequente.

Devem ser registradas:

- decisões arquiteturais;
- merges e desbloqueios formais;
- alterações de workflow/CI/CD;
- criação de migrations, RPCs, RLS, grants e testes;
- criação ou alteração de feature flags;
- mudanças em rotas públicas;
- mudanças em fluxos de produção, preview ou staging;
- qualquer decisão de manter legado ativo ou bloquear lançamento.

Não devem ser registrados detalhes sensíveis, secrets, tokens, URLs privadas com credenciais ou valores de ambiente secretos.

---

## 2026-05-04

### Regra de processo: changelog obrigatório

Criado este `CHANGELOG.md` para acompanhar o processo do CEPRAEA.

Decisão: todas as ações futuras feitas no projeto devem registrar seus passos e decisões neste arquivo.

### Fase: Fundação Supabase promovida para `main`

PR #3, anteriormente chamado `VALIDAÇÃO BLOQUEADA — Fundação Supabase`, foi auditado e teve o bloqueio formal removido.

Decisão registrada no PR:

- promover a fundação Supabase;
- não migrar stores operacionais nesta etapa;
- não alterar telas operacionais principais nesta etapa;
- não remover Apps Script definitivamente nesta etapa;
- não limpar IndexedDB real nesta etapa;
- não lançar fluxo Supabase para atletas nesta etapa.

Evidências verificadas antes do merge:

- CI verde no commit da branch `feat/supabase-foundation`;
- workflow `Supabase Foundation` executando `npm run validate:supabase-foundation` com sucesso;
- preview Vercel pronto;
- escopo restrito a migrations, seed, RLS, grants, RPCs, testes SQL, scripts, workflow, cliente Supabase mínimo, AuthProvider mínimo e documentação;
- `src/lib/supabase.ts` sem `service_role` no frontend.

Resultado:

- PR #3 mergeado na `main`;
- merge commit: `4f92106ef67c271ab1a23bf98764b4e16e02d718`.

### Fase: workflow Supabase Foundation em push para `main`

Após o merge da fundação Supabase, foi identificado que o workflow `.github/workflows/supabase-foundation.yml` não rodava em push para `main`, apenas em `pull_request` para `main` e push para `feat/supabase-foundation`.

Alteração aplicada:

- inclusão de `main` em `on.push.branches`.

Commit:

- `acd42223fb01f91f4ce0bec52f7bc7339120883b`
- mensagem: `ci: run Supabase Foundation workflow on main pushes`

Validação:

- Vercel concluído com sucesso;
- GitHub Actions concluído com sucesso conforme verificação operacional.

### Fase: planejamento aprovado para Presence Tokens + confirmação de presença

Foi aprovado o plano de seguir com o fluxo de presence tokens e confirmação pública via Supabase, sem migrar ainda todo o `attendanceStore`.

Escopo aprovado:

- criar camada isolada para presence tokens;
- usar feature flag `VITE_PRESENCE_TOKENS_BACKEND=legacy | supabase`;
- preservar produção em `legacy` até validação explícita;
- conectar rota pública Supabase por token;
- manter rota legada ativa;
- não migrar `attendanceStore`, `athleteStore`, `trainingStore` ou `scoutStore`;
- não remover Apps Script;
- não limpar IndexedDB;
- não persistir token puro no frontend;
- manter mensagens públicas de erro genéricas.

### Fase: implementação inicial de Presence Tokens Supabase

Implementada camada isolada em:

```text
src/features/presence-tokens/
```

Arquivos adicionados:

- `presenceTokenTypes.ts`
- `presenceTokenFeatureFlag.ts`
- `presenceTokenApi.ts`

RPCs encapsuladas na API TypeScript:

- `create_presence_token_batch`
- `mark_presence_token_batch_exported`
- `revoke_presence_token_batch`
- `confirm_presence_by_token`

Feature flag criada:

```text
VITE_PRESENCE_TOKENS_BACKEND=legacy | supabase
```

Padrão seguro:

```text
legacy
```

Rotas:

- rota legada preservada: `/confirmar/:treinoId/:atletaId`;
- rota Supabase adicionada: `/confirmar-presenca?token=<token>`.

Página pública alterada para suportar os dois modos:

- modo legado: mantém IndexedDB + Apps Script/fallback WhatsApp;
- modo Supabase: chama `confirmPresenceByToken({ token, status })` e usa a RPC pública `confirm_presence_by_token`.

Documentação adicionada:

- `docs/presence-tokens-supabase.md`.

Commits da fase:

- `3b2302f74c2846ce62ddcb12b7856197e3d1abc6` — tipos do domínio;
- `22466980054ea9a8fad521ec32f3804aab6e65c6` — feature flag;
- `3775fb1867ecc25d9b0829b6cd4b6a84053a3c5c` — API Supabase para presence tokens;
- `c6fcd5b8d11128bb6b7a255bbcde59ecaed6f9a1` — rota `/confirmar-presenca`;
- `e0f4c48adc9e8288133d050845511c094247c6d3` — suporte da página pública ao token Supabase;
- `7cc479858066010c1d58ec28f1bcbf65cccb4132` — documentação da fase.

Decisão de segurança:

A geração operacional de lotes pelo treinador ainda não foi conectada à UI, porque as RPCs administrativas exigem sessão Supabase autenticada e `team_id` operacional. A aplicação atual ainda usa PIN legado no painel do treinador. Forçar a geração agora violaria o critério de segurança.

### Validação de produção do changelog

O deploy de produção na Vercel foi confirmado como `Ready` para o commit:

- `895ce1c97756cf5113a02362b493699c1583ee53`
- mensagem: `docs: add project changelog and process log`

Decisão de processo reiterada:

- toda nova ação relevante deve atualizar este changelog.

Próxima fase planejada:

- adicionar autenticação/sessão Supabase mínima para treinador;
- definir explicitamente `team_id` operacional;
- só depois ligar geração, exportação e revogação de lotes no painel.
