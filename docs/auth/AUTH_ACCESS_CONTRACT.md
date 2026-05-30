# AUTH_ACCESS_CONTRACT — CEPRAEA

**Versão:** 2.0
**Escopo:** CEPR-AUTH-02A (revisão normativa do contrato definido em CEPR-AUTH-01)
**Data:** 2026-05-29
**Status:** Documento normativo. Cláusulas usam **SHALL / SHOULD / MAY** no sentido [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119) / [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174).

> **Importante:** Esta versão 2.0 amplia a v1.0 com cláusulas normativas (§10–§22) sobre política de senha, rate limit, CAPTCHA, vocabulário de erro, headers, sessão, redirect, audit log e configuração Supabase, **sem alterar** o modelo de autorização original (§1–§9). Cláusulas com status `> Status: PENDENTE (sub-PR XX)` documentam intenção normativa; a implementação ocorre nos sub-PRs do épico CEPR-AUTH-02. Ver [CHANGELOG.md](./CHANGELOG.md).

---

## 1. Definições canônicas

| Conceito | Definição | Tabela/RPC |
|---|---|---|
| **AuthUser** | Conta registrada no `auth.users` do Supabase. Representa identidade de login (email + senha). | `auth.users` |
| **Profile** | Registro em `public.profiles` vinculado 1:1 ao `auth.users` por `id`. Criado pelo trigger `handle_new_user` ao registrar. | `public.profiles` |
| **TeamMember** | Vínculo de um `Profile` a um `Team` com papel de acesso. | `public.team_members` |
| **AthleteRecord** | Cadastro esportivo de atleta. Pode existir antes do login (pré-cadastro). Vinculado ao `AuthUser` via `athletes.user_id`. | `public.athletes` |
| **Papel de acesso (`AccessRole`)** | Role que define o que o usuário pode fazer na plataforma de gestão. | `team_members.role` |
| **Papel esportivo (`SportRole`)** | Posição/função de atleta dentro do jogo (ontologia de handebol de praia). Não tem relação com autorização. | Ontologia ([glossário](../ontologia/manuais/glossario-ontologico-controlado.md)) |

> **Regra fundamental:** Papel de acesso (`owner/coach/viewer/athlete`) e papel esportivo (posição no handebol) são conceitos **ortogonais** e **nunca devem ser misturados** em guards, RPCs ou RLS. Ver §3-bis.

---

## 2. Matriz de autorização

| AuthUser | Profile | TeamMember.role | AthleteRecord | RouteScope | Permissões |
|---|---|---|---|---|---|
| ✅ | ✅ | `owner` | qualquer | `/` (guard) | Leitura + escrita total do time |
| ✅ | ✅ | `coach` | qualquer | `/` (guard) | Leitura + escrita de scouts/treinos |
| ✅ | ✅ | `viewer` | qualquer | `/` (guard) | **Somente leitura** — UI oculta ações de escrita |
| ✅ | ✅ | ausente | ausente | `/onboarding/equipe` | Criar time próprio (vira `owner`) |
| ✅ | ✅ | ausente | ausente | `/aceitar-convite/:id` | Aceitar convite de coach/viewer |
| ✅ | ✅ | ausente | ✅ | `/atleta/*` | Acesso à área de atleta |
| ✅ | ✅ | ausente | ausente | qualquer rota do guard | → redirect `/onboarding/equipe` |
| ✅ | ✅ | ausente | ausente | qualquer rota do guard (sem env TEAM_ID) | Tela "Sem acesso" |
| ❌ | — | — | — | qualquer rota do guard | → redirect `/login` |

---

## 3. Hierarquia de papéis de acesso

```
owner  >  coach  >  viewer
```

- **owner**: criador/gestor do time. Único papel que pode criar times (`bootstrap_owner`) e convidar membros (`invite_coach`).
- **coach**: treinador convidado. Pode criar/editar scouts e sessões de treino.
- **viewer**: leitura autorizada. Não pode criar nem editar nada via RLS.

---

## 3-bis. Ontologia × Identidade (novo em v2.0)

**Contexto:** o domínio funcional CEPRAEA é handebol de praia, com vocabulário esportivo definido na [ontologia controlada](../ontologia/manuais/glossario-ontologico-controlado.md). Este contrato define como auth se relaciona com (sem se misturar a) esse vocabulário.

### 3-bis.1 Separação semântica estrita

- `AccessRole` ∈ `{owner, coach, viewer, athlete}` — pertence à camada de autenticação/autorização.
- `SportRole` ∈ `{GoalkeeperRole, SpecialistRole, DefenderRole, WingerRole, PivotRole}` — pertence à ontologia esportiva.
- **SHALL NOT:** enum unificado entre `AccessRole` e `SportRole`.
- **SHALL NOT:** RLS/guard fazer comparação entre os dois domínios.
- **SHALL:** login concede `AccessRole`; **nunca** concede `SportRole`.

### 3-bis.2 Vocabulário canônico em UI de auth (pt-BR)

A UI de autenticação **SHALL** usar termos canônicos do glossário, não anglicismos genéricos:

| Conceito | Termo canônico pt-BR | Inglês ontológico | NÃO usar |
|---|---|---|---|
| Usuário com `AccessRole=coach` | **treinador / treinadora** | `Coach` | `user`, `gestor` |
| Usuário com `AccessRole=athlete` | **atleta** | `Athlete` | `user`, `player`, `jogador` |
| `Team` | **equipe** | `Team` | `clube`, `grupo` |
| `SportRole=GoalkeeperRole` | **goleiro / goleira** | `Goalkeeper` | `goleirão` |
| `SportRole=SpecialistRole` | **especialista** | `Specialist` | `quarto jogador` |
| Comissão técnica (owner+coach+viewer) | **comissão técnica** | — | `staff` |

### 3-bis.3 Capacidades técnicas derivadas

Capacidades de domínio (Scout, Match, Team) **SHALL** ser derivadas da combinação `AccessRole + contexto operacional`, nunca de papel esportivo:

| AccessRole | Capacidade ontológica habilitada após login |
|---|---|
| `owner` | Criar/editar `Team`, atribuir treinadores, definir `OffensiveSystem`/`DefensiveSystem` padrão do clube |
| `coach` | Escalar atletas em `GoalkeeperRole`/`SpecialistRole`, definir formação em `Match`, registrar Scout (`TwoPointGoal`, `SixMetreThrow`, etc) — restrito ao `team_id` do vínculo em `team_members` |
| `viewer` | Visualizar Scout, relatórios, formações; sem mutação |
| `athlete` | Ver próprio histórico esportivo, próprio papel esportivo ativo, estatísticas pessoais; consentir LGPD |

### 3-bis.4 Implementação técnica de `SportRole`

A persistência e RPCs de papel esportivo (ex.: tabela `athlete_sport_roles`, RPC `get_my_athlete_sport_roles()`) **NÃO** fazem parte de CEPR-AUTH-02. Pertencem a um épico separado de domínio esportivo, executado após estabilização do hardening de auth e revisão com o time de produto. Este contrato apenas reserva a nomenclatura.

> Status: PENDENTE (épico próprio pós-CEPR-AUTH-02).

---

## 4. Fluxos de entrada no sistema

### 4.1 Novo usuário sem vínculo
```
Registro → Profile criado (trigger) → Login →
  get_my_access() retorna memberships=[] e athleteLink=null →
  AppAccessGuard redireciona → /onboarding/equipe
```

### 4.2 Owner (cria time)
```
/onboarding/equipe → bootstrap_owner(name, slug) →
  cria Team + insere team_members(role='owner') →
  AccessContext.reload() → AppAccessGuard passa → /
```

### 4.3 Coach/Viewer (aceita convite)
```
Link /aceitar-convite/:id → accept_coach_invite(id) →
  valida email do JWT == invited_email →
  insere team_members(role=invite.role) →
  AccessContext.reload() → AppAccessGuard passa → /
```

### 4.4 Atleta pré-cadastrado
```
Registro com mesmo email → handle_new_user cria Profile →
  ensure_athlete_link() vincula athletes.user_id →
  athleteLink disponível em get_my_access() →
  /atleta/* acessível via AtletaGuard
```

---

## 5. Decisão explícita sobre `viewer` no MVP

**Decisão:** `viewer` está **incluído** no `AppAccessGuard` para o MVP.

**Consequência obrigatória:** Toda tela acessível por `owner/coach` deve ocultar/desabilitar ações de escrita quando o papel for `viewer`. O RLS já bloqueia no banco; a UI deve espelhar isso para evitar erros.

**Implementação mínima:** usar `roleForTeam(teamId) === 'viewer'` para ocultar botões de criar/editar/excluir. Não é necessário criar rotas separadas por papel para o MVP.

---

## 6. Contrato da RPC `get_my_access()`

```typescript
// Retorno (JSONB)
{
  user_id: string | null,
  profile_complete: boolean,
  memberships: Array<{ team_id: string, role: 'owner' | 'coach' | 'viewer' }>,
  athlete_link: { team_id: string, athlete_id: string } | null
}
```

- Chamada somente por `authenticated`.
- `SECURITY DEFINER`, `STABLE` — pode ser chamada a cada login/reload.
- `memberships` é array vazio `[]` (nunca `null`) se usuário não tem vínculo.

---

## 7. Regra de backfill (`0042_backfill_auth_consistency`)

O backfill automático aplica as seguintes **guardas**:

1. **Profiles:** somente cria perfil se `auth.users` não tem `profiles` correspondente. Não sobrescreve dados existentes.
2. **Athletes `user_id`:** somente vincula se:
   - `athletes.user_id IS NULL` (não vinculado ainda),
   - `athletes.deleted_at IS NULL` (registro ativo),
   - O email bate exatamente **1** `auth.users` (sem ambiguidade),
   - Esse `auth.users.id` não está vinculado a outro atleta ativo.
3. A combinação das 4 guardas torna qualquer conflito de unicidade em `athletes_user_id_key` impossível: só vincula quando o `user_id` é `NULL` e o `auth.users.id` não aparece em outro atleta ativo.

Para inspecionar o estado antes de migrar em produção:
```sql
SELECT a.id, a.email, u.id AS would_link_to
FROM athletes a
JOIN auth.users u ON lower(u.email) = lower(a.email)
WHERE a.user_id IS NULL AND a.deleted_at IS NULL
GROUP BY a.id, a.email, u.id HAVING count(u.id) = 1;
```

---

## 8. Invariantes que não devem ser violadas

1. Todo `auth.users` deve ter um `profiles` correspondente — garantido pelo trigger `handle_new_user` + backfill.
2. `athletes.user_id` não pode apontar para dois atletas ativos do mesmo time.
3. Papel de acesso (`team_members.role`) e papel esportivo nunca devem ser comparados na mesma query/guard (§3-bis).
4. `AuthGuard` (legado) está **deprecated** — não deve ser usado em novas rotas. Usar `AppAccessGuard`.
5. `coach_invites` nunca deve ter dois registros `accepted_at IS NULL` para o mesmo `(team_id, lower(invited_email))`.

---

## 9. Pendências para MVP completo (fora do CEPR-AUTH-01)

- [ ] UI read-only para `viewer`: ocultar botões de escrita por papel.
- [ ] Remoção ou alias formal do `AuthGuard` legado.
- [ ] Tela de "aguardando convite" para usuário sem memberships que não quer criar time.
- [ ] Expiração automática de convites (cron ou Edge Function).

> Nota: pendências adicionais de segurança/UX/observabilidade estão catalogadas em §22 (Inventário de gaps).

---

# PARTE NORMATIVA (v2.0) — §10 a §22

> A partir deste ponto, cláusulas usam SHALL / SHOULD / MAY. Cada seção marca o sub-PR responsável pela implementação. Implementações pendentes não invalidam o contrato — apenas declaram dívida normativa explícita.

---

## §10. Política de senha

> Status: PENDENTE (CEPR-AUTH-02E)

### §10.1 Requisitos normativos

A configuração de senha do Supabase Auth **SHALL** ter, no mínimo:

| Parâmetro | Valor mínimo | Fonte |
|---|---|---|
| Comprimento mínimo | **10 caracteres** | NIST SP 800-63B §5.1.1.2 (mínimo absoluto 8; CEPRAEA adota 10 como margem) |
| Composição obrigatória | letra minúscula + maiúscula + dígito | Decisão CEPRAEA (acima do default Supabase) |
| Comprimento máximo | ≥ 64 caracteres aceitos | NIST SP 800-63B §5.1.1.2 |
| Verificação contra senhas vazadas | obrigatória, via Have I Been Pwned k-anonymity client-side | OWASP Auth CS "Password Storage"; HIBP API pública |
| Espaços e Unicode | permitidos | NIST SP 800-63B §5.1.1.2 |

### §10.2 Verificação HIBP (Free Plan)

Como o projeto opera em **Supabase Free Plan**, a verificação contra senhas vazadas **SHALL** ser feita **client-side via k-anonymity**:

1. Computar SHA-1 da senha em texto claro (apenas no navegador, nunca enviar).
2. Enviar somente os 5 primeiros caracteres do hash para `https://api.pwnedpasswords.com/range/{prefix}`.
3. Comparar localmente os sufixos retornados; se o sufixo da senha aparecer com count > 0, **SHALL** rejeitar a senha.
4. **SHALL NOT** logar senha em texto claro, hash completo, prefixo enviado ou resultado por usuário identificável.

### §10.3 Comportamento para usuários existentes

Se Supabase emitir `WeakPasswordError` ao logar usuário com senha < 10 chars (legado), a aplicação **SHALL** capturar o erro e redirecionar para fluxo de troca de senha (`AtletaNovaSenhaPage` ou tela equivalente da comissão técnica), com mensagem clara da nova política.

---

## §11. Rate limiting e lockout

> Status: PENDENTE (CEPR-AUTH-02E)

### §11.1 Valores normativos

O `supabase/config.toml` **SHALL** declarar explicitamente:

| Endpoint | Limite | Janela |
|---|---|---|
| `email_sent` | 10 | por hora |
| `sign_in_sign_ups` | 30 | por IP por 5 min |
| `token_refresh` | 150 | por 5 min |
| `token_verifications` | 30 | por 5 min |

### §11.2 Comportamento em 429

- O cliente **SHALL** exibir mensagem vocabulário-canônica ("Muitas tentativas. Aguarde alguns minutos e tente novamente.") sem revelar contagem exata ou janela restante (anti-enumeração).
- O cliente **SHOULD** desabilitar o botão de submit por ≥ 30 s após receber 429.
- O sistema **SHOULD** registrar evento `auth_rate_limited` em log (§19).

### §11.3 Lockout

Lockout por conta **NÃO** será implementado em v2.0 (decisão: rate limit por IP + CAPTCHA cobre cenário de credential stuffing sem expor enumeração via lockout). MFA cobre conta individual em roadmap (§25).

---

## §12. CAPTCHA / bot defense

> Status: PENDENTE (CEPR-AUTH-02E)

### §12.1 Provider

- Provider **SHALL** ser **Cloudflare Turnstile** (managed challenge invisível na maioria dos casos).
- `[auth.captcha] enabled = true` e `provider = "turnstile"` no `supabase/config.toml`.

### §12.2 Endpoints protegidos

CAPTCHA **SHALL** ser exigido em: `signup`, `signin`, `recover`, `magiclink`, `verify`.

### §12.3 Fallback

Se o script Turnstile falhar ao carregar (rede), a aplicação **MAY** permitir entrada para não bloquear UX legítima; **SHALL** logar evento `captcha_fallback_used` (§19) para monitoramento.

### §12.4 Testes

E2E **SHALL** stubbar o token Turnstile via env override em `playwright.config.ts`; CAPTCHA real só é validado em testes manuais de Preview.

---

## §13. Vocabulário oficial de erros (anti-enumeração)

> Status: IMPLEMENTADO (CEPR-AUTH-02C — `src/features/auth/lib/authVocabulary.ts`)

### §13.1 Princípio normativo

A aplicação **SHALL NOT** revelar, por mensagem ou timing, se um email está cadastrado. Toda mensagem de erro de auth **SHALL** vir de fonte única (`src/features/auth/lib/authVocabulary.ts`).

### §13.2 Tabela canônica

| Cenário | Mensagem canônica pt-BR | Código interno | Status HTTP comum |
|---|---|---|---|
| Login: credencial inválida (email/senha errados) | "Email ou senha incorretos." | `AUTH-LOGIN-001` | 400 |
| Login: conta não confirmada | "Confirme seu email antes de entrar." | `AUTH-LOGIN-002` | 400 |
| Login: muitas tentativas | "Muitas tentativas. Aguarde alguns minutos e tente novamente." | `AUTH-LOGIN-003` | 429 |
| Registro: email já existente | "Verifique seu email para confirmar a conta." | `AUTH-SIGNUP-001` | 200 (intencional, anti-enumeração) |
| Reset: solicitação | "Se o email existir em nossa base, enviaremos o link." | `AUTH-RESET-001` | 200 (intencional) |
| Reset: senha fraca | "Senha não atende à política mínima (≥ 10 chars, com letra, número e maiúscula)." | `AUTH-RESET-002` | 400 |
| Reset: senha vazada (HIBP) | "Esta senha apareceu em vazamentos públicos. Escolha outra." | `AUTH-RESET-003` | 400 |
| Sessão expirada | "Sua sessão expirou. Entre novamente." | `AUTH-SESSION-001` | 401 |
| CAPTCHA falhou | "Falha na verificação de segurança. Tente novamente." | `AUTH-CAPTCHA-001` | 400 |
| Boot: env Supabase ausente | "[CEPR-AUTH-02:E001] Supabase não configurado. Consulte AUTH_ACCESS_CONTRACT §20." | `AUTH-BOOT-001` | n/a |

### §13.3 Paridade de timing

Cenários idênticos (login com email inexistente vs senha errada) **SHOULD** ter latência semelhante (±200 ms) para não vazar enumeração por canal lateral.

---

## §14. Sessão e cookies

> Status: PARCIAL (decisão documentada; compensação via §15 em CEPR-AUTH-02D)

### §14.1 Decisão sobre storage

A aplicação **MANTÉM** `localStorage` para sessão Supabase no MVP (`persistSession: true` em `src/lib/supabase.ts`). Decisão justificada por: arquitetura SPA/PWA, ausência de BFF, simplicidade operacional.

### §14.2 Compensações obrigatórias

Como `localStorage` é vulnerável a XSS, **SHALL** existir:

- CSP estrito (§15) bloqueando inline scripts não-nonced.
- HSTS obrigatório (§15).
- `frame-ancestors 'none'` (§15) eliminando clickjacking.
- Service Worker **SHALL NOT** servir rotas de auth de cache (ver §15.4).

### §14.3 Migração futura

Cookie HttpOnly via BFF é roadmap §25 (não bloqueia v2.0).

### §14.4 Lifecycle (idle/absolute timeout, reauth)

> Status: PENDENTE (CEPR-AUTH-02F+)

- Idle timeout **SHALL** ser **8 h** para comissão técnica (owner/coach/viewer) e **30 dias** para atleta.
- Reauth obrigatória **SHALL** ser exigida em: troca voluntária de senha, troca de email, convite de coach, ativação de MFA (futuro).
- Recovery via link (fluxo `PASSWORD_RECOVERY` do Supabase) **NÃO** exige reauth — a posse do link é a prova.

---

## §15. Headers de segurança HTTP

> Status: PENDENTE (CEPR-AUTH-02D)

### §15.1 Headers obrigatórios

`vercel.json` **SHALL** declarar, para `source: "/(.*)"`:

| Header | Valor inicial | Notas |
|---|---|---|
| `Strict-Transport-Security` | `max-age=300; includeSubDomains` (depois aumentar para `max-age=63072000; includeSubDomains; preload`) | Rolagem gradual evita pin permanente prematuro |
| `Content-Security-Policy-Report-Only` | `default-src 'self'; connect-src 'self' https://*.supabase.co; frame-ancestors 'none'; base-uri 'self'; form-action 'self'` | Em modo **Report-Only** em CEPR-AUTH-02D; enforcement só em 02F+ após análise |
| `X-Frame-Options` | `DENY` | Defesa em profundidade contra clickjacking |
| `X-Content-Type-Options` | `nosniff` | |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Ajustar conforme features futuras |

### §15.2 CSP — política de rollout

1. **CEPR-AUTH-02D:** publicar como `Content-Security-Policy-Report-Only`. Coletar violações por DevTools/console por ≥ 1 sprint.
2. **CEPR-AUTH-02F+:** após análise, publicar coletor próprio (Edge Function) + promover para `Content-Security-Policy` enforcement.

### §15.3 Verificação

Script `scripts/check-headers.sh` **SHALL** validar presença dos 6 headers via `curl -I <URL>` e retornar exit 1 se algum ausente.

### §15.4 Service Worker — denylist de rotas auth

`vite.config.ts` (vite-plugin-pwa/workbox) **SHALL** declarar `navigateFallbackDenylist` cobrindo:

```
/^\/login/
/^\/atleta\/login/
/^\/atleta\/nova-senha/
/^\/aceitar-convite/
/^\/onboarding/
```

Rotas de auth **NÃO PODEM** ser servidas de cache stale.

---

## §16. Reauth para ação sensível

> Status: PENDENTE (CEPR-AUTH-02F+)

### §16.1 Operações que exigem reauth

| Operação | Exige reauth? | Mecanismo |
|---|---|---|
| Troca voluntária de senha (em /configurações) | **SIM** | `supabase.auth.reauthenticate()` + nonce |
| Troca de email | **SIM** | Idem |
| Reset via link de recovery (PASSWORD_RECOVERY) | **NÃO** | Posse do link é a prova |
| Convidar coach (`invite_coach`) | **SIM** | Reauth recente (< 15 min) |
| Ativar MFA (futuro) | **SIM** | Reauth recente |

### §16.2 Janela de "recente"

Reauth **SHOULD** ser considerada válida por 15 minutos para a mesma sessão antes de ser solicitada novamente.

---

## §17. Validação e normalização de email

> Status: IMPLEMENTADO (CEPR-AUTH-02C — `src/features/auth/lib/emailNormalization.ts`)

### §17.1 Normalização canônica

Função única `normalizeEmail(input: string): string` em `src/features/auth/lib/emailNormalization.ts`:

```
trim → toLowerCase → validar comprimento (1..254 chars conforme RFC 5321) →
validar formato com regex conservador `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
```

### §17.2 Regras

- **SHALL** chamar `normalizeEmail()` em todos os pontos onde email entra no sistema (login, signup, reset, invite, atleta login).
- **SHALL NOT** existir mais de uma implementação inline (`email.trim().toLowerCase()`) no `src/features/`.
- **SHALL NOT** normalizar nomes de usuário fora do dominio email (case-sensitive em locais).

---

## §18. Redirect pós-login seguro

> Status: IMPLEMENTADO (CEPR-AUTH-02C — `src/features/auth/lib/redirectGuard.ts`)

### §18.1 Princípio

Parâmetros `returnUrl`, `next`, `redirect` recebidos pela aplicação **SHALL** passar por `redirectGuard()` (whitelist same-origin) antes de qualquer `navigate()`.

### §18.2 Regras

- `redirectGuard(url)` **SHALL** retornar `'/'` se:
  - `url` não for same-origin,
  - `url` for protocolo não-http(s) (`javascript:`, `data:`, etc.),
  - `url` for vazio ou ausente,
  - `url` apontar para rotas de auth (`/login`, `/atleta/login`, etc.) para evitar loop.
- `redirectGuard(url)` **SHALL** retornar o path original se same-origin e válido.

### §18.3 Teste E2E

`e2e/auth/redirect-guard.spec.ts` **SHALL** validar:
- `returnUrl=https://evil.com` cai em `/`.
- `returnUrl=javascript:alert(1)` cai em `/`.
- `returnUrl=/dashboard` permanece em `/dashboard`.
- `returnUrl=/login` cai em `/` (evita loop).

---

## §19. Audit log de auth

> Status: PENDENTE (CEPR-AUTH-02F+)

### §19.1 Tipos canônicos de evento

`auth_event_type` ∈ `{login_success, login_failed, password_reset_requested, password_reset_completed, signup, email_confirmation, account_locked, captcha_fallback_used, auth_rate_limited, invite_created, invite_accepted, invite_revoked, athlete_email_reset_by_coach, mfa_enrolled, mfa_challenge_failed}`.

### §19.2 Schema

Tabela `auth_events`:

| Coluna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `actor_user_id` | uuid NULL | NULL quando login falha por email inexistente |
| `actor_email_hash` | text | **SHA-256** do email normalizado (LGPD: minimização) |
| `actor_ip` | inet | |
| `actor_user_agent_hash` | text | SHA-256 do UA |
| `team_id` | uuid NULL | quando aplicável |
| `event_type` | text check (in `auth_event_type`) | |
| `metadata` | jsonb | sem PII, sem senha |
| `created_at` | timestamptz default now() | |

### §19.3 Privacidade (LGPD)

- **SHALL NOT** armazenar email em texto claro em `auth_events`.
- **SHALL NOT** armazenar IP por mais de 6 meses sem justificativa formal.
- **SHALL** ter RLS owner-only por `team_id` (suporte/auditoria interna).

---

## §20. Configuração obrigatória `supabase/config.toml`

> Status: PENDENTE (CEPR-AUTH-02E)

### §20.1 Checklist mínimo

```toml
[auth]
minimum_password_length = 10
password_requirements = "lower_upper_number"
jwt_expiry = 3600
enable_refresh_token_rotation = true
refresh_token_reuse_interval = 10

[auth.email]
enable_confirmations = true
secure_password_change = true
otp_expiry = 3600

[auth.email.smtp]
# Habilitado em CEPR-AUTH-02F+ via Resend Free + domínio próprio
enabled = false

[auth.rate_limit]
email_sent = 10
sign_in_sign_ups = 30
token_refresh = 150
token_verifications = 30

[auth.captcha]
enabled = true
provider = "turnstile"
secret = "env(TURNSTILE_SECRET_KEY)"
```

### §20.2 Verificação

Script `scripts/verify-supabase-config.ts` **SHALL** validar valores acima e falhar com exit 1 se divergente.

---

## §21. Threat model

> Status: PENDENTE (CEPR-AUTH-02A — este sub-PR)

O contrato delega o threat model STRIDE × controles ao documento [THREAT_MODEL.md](./THREAT_MODEL.md). Toda ameaça catalogada **SHALL** ter ≥ 1 controle mapeado nesta versão 2.0 ou em sub-PR rastreável.

---

## §22. Inventário de gaps com classificação de status

> Esta tabela é o **registro vivo** do estado de hardening. Atualizada a cada sub-PR.

**Legenda de status:**
- **Implementado** — código + teste + deploy em produção concluídos.
- **Parcial** — implementação existe mas incompleta ou sem teste.
- **Pendente** — escopado para sub-PR específico, ainda não iniciado.
- **Roadmap** — fora de CEPR-AUTH-02; vai para CEPR-AUTH-03 ou backlog.

| # | Gap | Severidade | Status (2026-05-29) | Sub-PR alvo | Cláusula |
|---|---|---|---|---|---|
| G1 | Política de senha (≥ 10 chars + composição + HIBP) | CRÍTICO | **Implementado** | CEPR-AUTH-02E | §10 |
| G2 | MFA (TOTP/WebAuthn) | ALTO | **Roadmap** | CEPR-AUTH-03 | §25 (roadmap) |
| G3 | Rate limiting/lockout explícito | ALTO | **Parcial** | CEPR-AUTH-02E | §11 |
| G4 | CAPTCHA (Turnstile) | ALTO | **Pendente** | CEPR-AUTH-02E | §12 |
| G5 | Vocabulário anti-enumeração | ALTO | **Implementado** | CEPR-AUTH-02C | §13 |
| G6 | localStorage sem CSP compensatório | ALTO | **Parcial** (decisão documentada §14; CSP Report-Only em 02D, enforcement em 02F+) | CEPR-AUTH-02D + 02F+ | §14, §15 |
| G7 | Headers de segurança HTTP | ALTO | **Pendente** | CEPR-AUTH-02D | §15 |
| G8 | Lifecycle de sessão (idle/absolute timeout) | MÉDIO | **Pendente** | CEPR-AUTH-02F+ | §14.4 |
| G9 | Reauth para ação sensível | ALTO | **Pendente** | CEPR-AUTH-02F+ | §16 |
| G10 | Normalização de email centralizada | MÉDIO | **Implementado** | CEPR-AUTH-02C | §17 |
| G11 | Open redirect / redirect guard | MÉDIO | **Implementado** | CEPR-AUTH-02C | §18 |
| G12 | Audit log canônico de auth | MÉDIO | **Parcial** (`audit_logs` existe em `0003`; sem schema auth) | CEPR-AUTH-02F+ | §19 |
| G13 | Contrato UI/UX (DDR/WCAG) | MÉDIO | **Pendente** | CEPR-AUTH-02F+ | (roadmap UX) |
| G14 | `supabase/config.toml` hardening | MÉDIO | **Parcial** | CEPR-AUTH-02E | §20 |
| G15 | Threat model STRIDE | MÉDIO | **Implementado** (este sub-PR) | CEPR-AUTH-02A | §21, [THREAT_MODEL.md](./THREAT_MODEL.md) |
| G16 | Matriz de testes + SLO de auth | MÉDIO | **Parcial** (matriz documentada nesta v2.0; SLO em 02F+) | CEPR-AUTH-02A + 02F+ | §22.1 |
| G17 | Hardening de convites (revoked_at, expiração) | BAIXO-MÉDIO | **Parcial** (contrato em §17 v1; cron/RPC pendentes) | CEPR-AUTH-02F+ | (Edge Function `expire-invites`) |
| FAIL-FAST | `src/lib/supabase.ts` aceita env ausente com `?? ''` | CRÍTICO | **Pendente** | CEPR-AUTH-02B | §13 (`AUTH-BOOT-001`) |

### §22.1 Matriz de testes (mínima v2.0)

| Camada | Teste | Sub-PR | Estado |
|---|---|---|---|
| Unit | Fail-fast de `supabase.ts` sem env | 02B | Pendente |
| Unit | `normalizeEmail()` (RFC, edge cases) | 02C | Pendente |
| Unit | `redirectGuard()` (whitelist, javascript:, evil.com) | 02C | Pendente |
| Unit | `hibpCheck()` (mock fetch, sufixo match/no-match) | 02E | Implementado |
| E2E | Anti-enumeração (login/signup/reset com paridade ±200 ms) | 02C | Pendente |
| E2E | Redirect guard | 02C | Pendente |
| E2E | Password policy (< 10 chars rejeitada; HIBP-leaked rejeitada) | 02E | Pendente |
| E2E (manual) | Headers presentes em Preview (`scripts/check-headers.sh`) | 02D | Pendente |
| E2E (manual) | CAPTCHA Turnstile dispara após N falhas | 02E | Pendente |
| Script | `scripts/verify-supabase-config.ts` valida `config.toml` | 02E | Implementado |
| Script | `scripts/test-rate-limit.ts` recebe ≥ 1 status 429 | 02E | Pendente |

SLOs de latência/disponibilidade ficam para CEPR-AUTH-02F+ (k6).

---

## Apêndice A — Referências normativas externas

- [NIST SP 800-63B — Digital Identity Guidelines: Authentication and Lifecycle Management](https://pages.nist.gov/800-63-3/sp800-63b.html)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [OWASP HTTP Headers Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html)
- [OWASP Credential Stuffing Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Credential_Stuffing_Prevention_Cheat_Sheet.html)
- [OWASP Unvalidated Redirects and Forwards Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
- [OWASP Threat Modeling Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html)
- [OWASP ASVS v5](https://owasp.org/www-project-application-security-verification-standard/)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [Supabase Auth Rate Limits](https://supabase.com/docs/guides/auth/rate-limits)
- [Supabase Auth CAPTCHA](https://supabase.com/docs/guides/auth/auth-captcha)
- [Have I Been Pwned — Pwned Passwords API (k-anonymity)](https://haveibeenpwned.com/API/v3#PwnedPasswords)
- [LGPD — Lei nº 13.709/2018](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- [RFC 2119 — Key words for use in RFCs](https://www.rfc-editor.org/rfc/rfc2119) / [RFC 8174](https://www.rfc-editor.org/rfc/rfc8174)
- [RFC 5321 — SMTP (validação de email)](https://www.rfc-editor.org/rfc/rfc5321)
- [Glossário Ontológico Controlado — Handebol de Praia](../ontologia/manuais/glossario-ontologico-controlado.md)

---

## Apêndice B — Histórico de versões

Ver [CHANGELOG.md](./CHANGELOG.md).
