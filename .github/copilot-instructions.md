# GitHub Copilot Instructions — CEPRAEA

Fonte de verdade operacional: `AGENTS.md` (loader) + `AGENTS.json` (contrato).

## Regras obrigatórias

- Ler `AGENTS.json` antes de executar qualquer ação.
- Ler `CEPRAEA.md` antes de atuar no projeto.
- Verificar os 3 PRs mais recentes para contexto.
- Usar apenas caminhos Linux (`/home/...`).
- Nunca usar caminhos Windows (`C:\\Users\\...`).
- Não declarar conclusão apenas por alteração de código.

## Evidência mínima obrigatória

Toda entrega deve conter:

1. escopo entendido;
2. arquivos alterados;
3. ferramentas usadas;
4. comandos executados;
5. resultado dos comandos;
6. status de PR/Preview (quando aplicável);
7. riscos pendentes.

## Gates técnicos mínimos

Conforme escopo da mudança:

- Código local: `npm run typecheck`, `npm test`, `npm run build`.
- UI/fluxo visual: adicionar `npm run test:e2e`.
- Supabase/schema/RLS: `supabase db reset`, `npm run test:supabase`, `npm run typecheck`, `npm run build`.
- PR com Preview: validar preview e executar smoke.
- Scout/Auth/Supabase/RLS/fluxo de jogo: executar `SMOKE_BASE_URL="<preview-url>" npm run test:smoke:scout:preview`.

## Restrições críticas

- Proibido alterar produção, migrations remotas ou env vars sem confirmação humana explícita.
- Proibido ocultar falha de typecheck/test/build.
- Proibido reportar sucesso sem evidência verificável.
- Proibido usar `git stash`, `git reset` ou `git revert`.

## Instruções por domínio

- `.github/instructions/frontend.instructions.md`
- `.github/instructions/supabase.instructions.md`
- `.github/instructions/scout.instructions.md`
- `.github/instructions/agent-evidence.instructions.md`
- `.github/instructions/pr-validation.instructions.md`
- `.github/instructions/visual-ui.instructions.md`
