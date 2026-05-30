# E2E — CEPRAEA

Playwright tests para a PWA. Configurados via `playwright.config.ts` e `.env.test`.

## Estrutura

| Pasta | Escopo |
|---|---|
| `access/` | Guards de rota e onboarding inicial (acesso autenticado/não autenticado). |
| `athlete/` | Fluxos da atleta (login, perfil, treinos, hardening de auth). |
| `auth/` | Anti-enumeração e redirect guard (compartilhados). |
| `coach/` | Painel do treinador (login, atletas, presença, treinos). |
| `helpers/` | Utilitários (provisionamento de auth, factories). |
| `public/` | Fluxos públicos sem login (presence tokens). |
| `scout/` | Scout live (UX, smokes, matriz de compatibilidade). |

## Comandos

```bash
npm run test:e2e               # suíte completa
npm run test:e2e -- e2e/athlete/auth-hardening.spec.ts   # arquivo específico
npm run test:e2e -- --project=athlete                    # projeto específico
```

## Requisitos

- Supabase local up (`supabase start`).
- `.env.test` populado (ver `.env.test.example`). **Obrigatório:**
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA` (chave dummy "always passes")
  - `VITE_TURNSTILE_TEST_TOKEN=XXXX.DUMMY.TOKEN.XXXX` (bypass do widget; ver §12.4 do AUTH_ACCESS_CONTRACT)

## Notas de hardening (CEPR-AUTH-02E)

Em ambientes de teste, o `TurnstileWidget` injeta `VITE_TURNSTILE_TEST_TOKEN` automaticamente sem renderizar o iframe da Cloudflare. Em produção, esta variável **SHALL NOT** estar definida.
