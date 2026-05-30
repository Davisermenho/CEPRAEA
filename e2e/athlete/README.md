# E2E — Atleta

Fluxos do app da atleta.

| Spec | Escopo |
|---|---|
| `login.spec.ts` | Modos login/registro/reset, validações de email. |
| `auth-hardening.spec.ts` | CEPR-AUTH-02E: política de senha (≥10), HIBP gate, CAPTCHA bypass. |
| `onboarding.spec.ts` | Primeiro acesso e ativação de conta. |
| `profile.spec.ts` | Tela de perfil. |
| `training-flow.spec.ts` | Lista de treinos e confirmação de presença. |

## Auth hardening

`auth-hardening.spec.ts` cobre os gaps G1 (política/HIBP) e G4 (CAPTCHA) do AUTH_ACCESS_CONTRACT:

- Hint da política exibe `≥ 10 caracteres` com letra/número/maiúscula.
- Senhas curtas exibem `AUTH-RESET-002` e bloqueiam a chamada Supabase.
- Senhas vazadas (mock HIBP) exibem `AUTH-RESET-003` e bloqueiam a chamada Supabase.
- Em modo bypass (`VITE_TURNSTILE_TEST_TOKEN`), nenhum iframe da Cloudflare é carregado.

Mocks de rede usam `page.route('**/api.pwnedpasswords.com/range/**', ...)` para forçar o caminho pwned sem dependência externa.
