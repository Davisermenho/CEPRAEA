# CHANGELOG — docs/auth

Histórico do contrato de autenticação e documentos companheiros. Datas em UTC.

---

## v2.1 — 2026-05-30 (CEPR-AUTH-02B/02C/02D/02E)

**Tipo:** implementação de hardening de autenticação (sem migrations).
**Escopo:** fail-fast de boot, vocabulário canônico, normalização de email, redirect guard, headers HTTP, HIBP k-anonymity, CAPTCHA Turnstile (atleta), rate-limit/lockout 429, redirect WEAK-PASSWORD, scripts de verificação e E2E.
**PRs:** #47 (02B) · #58 (02C) · #59 (02D) · #61 (02E)

### Adicionado

- **`src/lib/supabase.ts`** — fail-fast: lança `Error` se `VITE_SUPABASE_URL` ou `VITE_SUPABASE_ANON_KEY` ausentes na inicialização (§20, PR #47).
- **`.env.example`** — todas as variáveis obrigatórias documentadas com comentário normativo (PR #47).
- **`scripts/verify-supabase-config.ts`** — verifica configuração Supabase via `CONDITIONAL_RULES` + hard rule `jwt_expiry`; `exit 1` se violação detectada (PR #47).
- **`src/lib/authVocabulary.ts`** — vocabulário canônico pt-BR exportado (`atleta`, `treinador`, `equipe`, `especialista`, `goleiro`) (§3-bis, PR #58).
- **`src/lib/normalizeEmail.ts`** — função única `normalizeEmail()`; implementações inline duplicadas removidas (§17, PR #58).
- **`src/lib/redirectGuard.ts`** — `redirectGuard()` com whitelist same-origin; bloqueia redirects externos pós-login (§18, PR #58).
- **`scripts/check-headers.sh`** — verifica os 6 headers obrigatórios em URL Vercel; `exit 1` se header ausente (PR #59).
- **`src/lib/validatePasswordPolicy.ts`** — valida ≥10 chars + lower+upper+dígito; retorna erros canônicos (§10, PR #61).
- **HIBP k-anonymity** — `src/lib/hibpCheck.ts`: verifica senha contra Have I Been Pwned API via k-anonymity (5-char SHA-1 prefix); nunca transmite senha completa (§10, PR #61).
- **Cloudflare Turnstile (atleta)** — `TurnstileWidget` integrado no fluxo de cadastro/login de atleta; token validado antes do `signUp`/`signIn` (§12, PR #61).
- **`supabase/seed.sql`** — mirror de `treinador@cepraea.com` com UUID de produção + `team_member` owner para preview branches (PR #61).
- **E2E anti-enumeração** — testes de timing paridade ±200 ms cobrindo login inválido × válido (§13, PR #58).
- **`e2e/scout/scout-preview-smoke.spec.ts`** — `isIgnorableConsoleError()` filtra padrões `vercel.live` e `report-only Content Security Policy` (PR #61).

### Alterado

- **`vercel.json`** — 6 headers de segurança adicionados: `Strict-Transport-Security` (max-age=300), `Content-Security-Policy-Report-Only`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(),microphone=(),geolocation=()` (§15, PR #59).
- **SW denylist** — rotas de autenticação adicionadas ao denylist do service worker para evitar cache de respostas de auth (PR #59).
- **`AUTH_ACCESS_CONTRACT.md`** — status dos gaps §22 atualizados para refletir estado pós-02B–02E (PR #62):
  - §10 política de senha: Pendente → **Implementado**
  - §11 rate limiting: Pendente → **Parcial** (lockout 30s atleta; `config.toml` deferido)
  - §12 CAPTCHA: Pendente → **Parcial** (Turnstile atleta; coach deferido)
  - §15 headers: Pendente → **Implementado**
  - §20 `supabase/config.toml`: Pendente → **Parcial** (verify-script ok; valores toml deferidos)
  - §21 threat model: Pendente → **Implementado**
  - §22 tabela FAIL-FAST → Implementado; G7 → Implementado; G3/G4 → Parcial

### Deferido (02E fase 2)

- **`supabase/config.toml`** — `[auth.captcha]`, `minimum_password_length = 10`, `password_requirements`, `[auth.rate_limit]`: aguarda rotação de senha de `treinador@cepraea.com` (senha atual `98701665` não passa a política).
- **Turnstile gate (coach)** — `LoginPage.tsx`: aguarda provisionamento de `VITE_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` em Vercel Production & Preview.

### Validação em produção

- `bash scripts/check-headers.sh https://cepraea.vercel.app` → 6/6 headers OK (2026-05-30, registrado em [#40 comentário](https://github.com/Davisermenho/CEPRAEA/issues/40#issuecomment-4584924170)).

### Critérios de aceitação 02B–02E (verificação)

1. ✅ `npm run typecheck` — 0 erros.
2. ✅ `git diff --stat -- ':!docs/'` após 02A — zero arquivos `.md`-only no diff de produção.
3. ✅ PR Evidence Guard verde em todos os PRs (#47, #58, #59, #61).
4. ✅ `scripts/check-headers.sh https://cepraea.vercel.app` — todos os 6 headers presentes.
5. ✅ Zero migration nova em 02B–02E.
6. ⏳ `supabase/config.toml` hardening — deferido para 02E fase 2.
7. ⏳ Turnstile coach — deferido para 02E fase 2.

---

## v2.0 — 2026-05-29 (CEPR-AUTH-02A)

**Tipo:** somente documentação (sem código de produção alterado).
**Escopo:** estabelecer base normativa para o épico CEPR-AUTH-02 (sub-PRs 02A–02F).

### Adicionado

- **§3-bis Ontologia × Identidade** — separação estrita entre `AccessRole` (owner/coach/viewer/athlete) e `SportRole` (GoalkeeperRole/SpecialistRole/DefenderRole/WingerRole/PivotRole); vocabulário canônico pt-BR (atleta, treinador, equipe, especialista, goleiro); regra "login concede acesso, não papel esportivo".
- **§10 Política de senha** — mínimo 10 chars + composição (minúscula, maiúscula, dígito); verificação HIBP via k-anonymity client-side (Free Plan); tratamento de `WeakPasswordError` para legado.
- **§11 Rate limiting** — valores numéricos para `email_sent`, `sign_in_sign_ups`, `token_refresh`, `token_verifications`; comportamento UX para 429.
- **§12 CAPTCHA** — Cloudflare Turnstile como provider; endpoints protegidos; fallback registrado.
- **§13 Vocabulário oficial de erros** — tabela canônica de 10 cenários com mensagem pt-BR e código interno (`AUTH-LOGIN-001` … `AUTH-BOOT-001`); regra de paridade de timing ±200 ms.
- **§14 Sessão e cookies** — decisão explícita de manter `localStorage`; compensações via §15; lifecycle (idle 8 h comissão / 30 d atleta) movido para 02F+.
- **§15 Headers de segurança** — 6 headers obrigatórios em `vercel.json` (HSTS, CSP Report-Only, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy); rollout CSP em duas fases; denylist de SW.
- **§16 Reauth** — operações que exigem reauth; janela "recente" de 15 min.
- **§17 Normalização de email** — função única `normalizeEmail()`; proibição de implementações inline duplicadas.
- **§18 Redirect pós-login seguro** — `redirectGuard()` whitelist same-origin; cenários E2E.
- **§19 Audit log de auth** — taxonomia de 15 `auth_event_type`; schema com `actor_email_hash` SHA-256 (LGPD); RLS owner-only.
- **§20 Configuração `supabase/config.toml`** — checklist mínimo com valores normativos; script de verificação.
- **§21 Threat model** — delegação para [THREAT_MODEL.md](./THREAT_MODEL.md).
- **§22 Inventário de gaps** — tabela G1–G17 + FAIL-FAST com severidade, status, sub-PR alvo e cláusula correspondente; matriz mínima de testes.
- **Apêndice A** — referências normativas externas (NIST 800-63B, OWASP cheat sheets, ASVS v5, Supabase, HIBP, LGPD, RFCs).
- **Apêndice B** — ponteiro para este CHANGELOG.
- **Documento novo:** [THREAT_MODEL.md](./THREAT_MODEL.md) — STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, DoS, Elevation of Privilege) com 35 ameaças catalogadas, ≥ 1 controle por ameaça, mapeamento sub-PR ↔ ameaças fechadas.
- **Documento novo:** este arquivo `CHANGELOG.md`.

### Mantido sem alteração

- §1 Definições canônicas (apenas `AthleteRecord` agora referencia §3-bis).
- §2 Matriz de autorização.
- §3 Hierarquia de papéis (`owner > coach > viewer`).
- §4 Fluxos de entrada (4.1–4.4).
- §5 Decisão sobre `viewer` no MVP.
- §6 Contrato da RPC `get_my_access()`.
- §7 Regra de backfill (`0042_backfill_auth_consistency`).
- §8 Invariantes (1–5; item 3 referencia §3-bis).
- §9 Pendências do MVP do CEPR-AUTH-01.

### Decisões registradas (não alteram código)

1. **Plano Supabase:** Free Plan confirmado; HIBP via k-anonymity client-side (não usa server-side HIBP do Supabase Pro).
2. **CAPTCHA:** Cloudflare Turnstile (managed challenge). Conta Cloudflare a ser provisionada antes de CEPR-AUTH-02E.
3. **SMTP:** domínio próprio + Resend será configurado em CEPR-AUTH-02F+ (não bloqueia 02E).
4. **WhatsApp OTP:** aprovado como roadmap (02F+), fora do MVP de hardening.
5. **`coach_reset_athlete_email`:** aprovado como roadmap (02F+) com audit obrigatório.
6. **CSP report endpoint próprio:** roadmap (02F+); 02D usa apenas Report-Only via DevTools/console.
7. **Migrations:** próxima livre confirmada como **`0043`** (existem `0040_access_resolution`, `0041_onboarding_rpcs`, `0042_backfill_auth_consistency`). Nenhuma migration nova nesta v2.0.
8. **Ontologia técnica:** `athlete_sport_roles` e RPC `get_my_athlete_sport_roles()` ficam em **épico separado** posterior; v2.0 reserva apenas a nomenclatura.

### Não alterado (declarado explicitamente)

- Nenhum arquivo `.ts`, `.tsx`, `.sql`, `.toml`, `.json` de produção foi modificado neste sub-PR.
- Nenhuma migration nova foi adicionada.
- Nenhum endpoint, RPC ou RLS foi criado, alterado ou removido.
- Configuração de Vercel/Supabase Dashboard não foi tocada.

### Critérios de aceitação 02A (verificação)

1. ✅ `docs/auth/AUTH_ACCESS_CONTRACT.md` v2.0 publicado.
2. ✅ `docs/auth/THREAT_MODEL.md` criado.
3. ✅ `docs/auth/CHANGELOG.md` criado.
4. ✅ Gaps G1–G17 + FAIL-FAST classificados em §22 com status (Implementado/Parcial/Pendente/Roadmap) e sub-PR alvo.
5. ✅ Seção ontológica (§3-bis) presente com separação `AccessRole ≠ SportRole` e vocabulário pt-BR.
6. ✅ `git diff --stat -- ':!docs/'` vazio — validado.
7. ✅ Zero migration nova — validado.
8. ✅ PR Evidence Guard verde — CI OK (PR #54).

---

## v1.0 — 2026-05-28 (CEPR-AUTH-01)

**Tipo:** primeiro contrato formal de autenticação e autorização.

### Adicionado

- Documento inicial `AUTH_ACCESS_CONTRACT.md` com §1–§9.
- Definições canônicas: AuthUser, Profile, TeamMember, AthleteRecord.
- Matriz de autorização cobrindo 9 combinações de estado.
- Hierarquia `owner > coach > viewer`.
- Fluxos 4.1–4.4 (sem vínculo, owner bootstrap, aceite de convite, atleta pré-cadastrado).
- Decisão `viewer` incluído no `AppAccessGuard` para MVP.
- Contrato da RPC `get_my_access()` (JSONB com `user_id`, `profile_complete`, `memberships`, `athlete_link`).
- Regra de backfill com 4 guardas em `0042_backfill_auth_consistency`.
- Invariantes 1–5 (profile espelhado por trigger, unicidade de `athletes.user_id`, separação papel acesso/esportivo, `AuthGuard` deprecated, single-pending invite).
- Pendências de MVP fora de CEPR-AUTH-01 (UI viewer read-only, remoção AuthGuard legado, tela aguardando convite, expiração de convites).

