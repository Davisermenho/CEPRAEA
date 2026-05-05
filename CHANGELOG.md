# Changelog — CEPRAEA

Registro das decisões técnicas e passos operacionais do projeto.

## Política

Toda ação relevante no repositório deve atualizar este arquivo no mesmo commit ou em commit imediatamente subsequente.

Registrar: decisões arquiteturais, merges, CI/CD, migrations, RLS, grants, RPCs, feature flags, rotas públicas, validações de produção e decisões de manter legado ativo.

Não registrar valores sensíveis de ambiente.

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

Próxima fase:

- validar papel `owner` ou `coach` do usuário Supabase contra `VITE_SUPABASE_TEAM_ID`;
- só depois conectar geração, exportação e revogação de lotes no painel.
