# THREAT_MODEL — CEPRAEA Auth

**Versão:** 1.0
**Escopo:** CEPR-AUTH-02A
**Data:** 2026-05-29
**Metodologia:** [STRIDE](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats) (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege).
**Documento companheiro:** [AUTH_ACCESS_CONTRACT.md](./AUTH_ACCESS_CONTRACT.md)

> Este threat model cobre exclusivamente a superfície de **autenticação e autorização** do CEPRAEA PWA. Camadas adjacentes (Scout, Match, ontologia esportiva) não estão em escopo desta versão. Toda ameaça **SHALL** ter ≥ 1 controle mapeado; controles `Pendente` declaram dívida explícita rastreada em [AUTH_ACCESS_CONTRACT §22](./AUTH_ACCESS_CONTRACT.md).

---

## 1. Ativos protegidos

| ID | Ativo | Sensibilidade | Confidencialidade | Integridade | Disponibilidade |
|---|---|---|---|---|---|
| A1 | Credencial (email + senha) | Alta | Alta | Alta | Média |
| A2 | Sessão Supabase (JWT em `localStorage`) | Alta | Alta | Alta | Média |
| A3 | `auth.users` | Alta | Alta | Alta | Alta |
| A4 | `public.profiles` | Média | Média | Alta | Média |
| A5 | `public.team_members` (papéis de acesso) | Alta | Média | **Alta** | Alta |
| A6 | `coach_invites` (link de convite) | Média | Média | Alta | Média |
| A7 | `public.athletes` (PII de atleta) | Alta | Alta (LGPD) | Alta | Média |
| A8 | Audit log de auth (`audit_logs`, futuro `auth_events`) | Média | Média | **Alta (não-repúdio)** | Alta |
| A9 | Configuração Supabase (`config.toml`, env Vercel) | Crítica | Alta | Crítica | Alta |

---

## 2. Atores / fronteiras de confiança

```
[Atacante externo anônimo]
        |
        v
[Navegador do usuário legítimo / atleta] --(HTTPS)--> [CDN Vercel] --(HTTPS)--> [Supabase Auth + PostgREST]
        |                                                                                 |
        |--localStorage (A2)                                                              |--auth.users (A3)
                                                                                          |--public.* (A4..A7)
```

Fronteiras:
- **TB1:** Cliente PWA ↔ Vercel (HTTPS público).
- **TB2:** Vercel ↔ Supabase (HTTPS API).
- **TB3:** Cliente PWA ↔ localStorage (mesmo origem; XSS pode atravessar).
- **TB4:** Comissão técnica (owner/coach/viewer) ↔ Atleta (modelos de risco distintos).

---

## 3. Matriz STRIDE × controles

### 3.1 Spoofing — falsificação de identidade

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| S1 | Credential stuffing usando vazamentos de outros sites | Listas HIBP/coleções públicas | CRÍTICA | (a) Verificação HIBP k-anonymity no cadastro/troca; (b) rate limit por IP; (c) CAPTCHA Turnstile | §10.2, §11.1, §12 | Pendente (02E) |
| S2 | Brute-force online de senha de conta específica | Tentativas repetidas | ALTA | (a) Rate limit `sign_in_sign_ups=30/5min` por IP; (b) CAPTCHA managed challenge após N falhas; (c) latência uniforme (§13.3) | §11.1, §12 | Pendente (02E) |
| S3 | Phishing capturando senha legítima | Email/SMS spoofado | ALTA | (a) Vocabulário canônico §13 reduz reuso de mensagens copiáveis; (b) MFA futuro; (c) email confirmation obrigatório | §13, §25 (roadmap MFA) | Parcial |
| S4 | Sequestro de link de convite (`coach_invites`) | Vazamento de URL `/aceitar-convite/:id` | MÉDIA | (a) `accept_coach_invite` valida `auth.jwt() email == invited_email`; (b) `revoked_at` + expiração via cron (futuro) | §17 v1, G17 | Parcial (cron pendente 02F+) |
| S5 | Sequestro de sessão Supabase via XSS lendo `localStorage` | Script malicioso carregado pela página | CRÍTICA | (a) CSP estrita `default-src 'self'` (§15); (b) SW denylist (§15.4) impede entrega cacheada modificada; (c) HSTS (§15) | §14.2, §15 | Pendente (02D Report-Only → 02F+ enforcement) |
| S6 | Login com identidade falsificada via OAuth provider comprometido | OAuth IdP malicioso | BAIXA | OAuth desabilitado no MVP; apenas email+senha em uso | §1 (definições) | Implementado (por omissão) |

### 3.2 Tampering — adulteração de dados

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| T1 | Alteração de papel de acesso (`team_members.role`) por usuário não-owner | Chamada direta à API REST | CRÍTICA | (a) RLS em `team_members` (`policy_team_members_owner_only_write`); (b) `AccessRole ≠ SportRole` (§3-bis impede confusão de domínio) | §2, §3-bis | Implementado (CEPR-AUTH-01) |
| T2 | Alteração de email de atleta por outro atleta | API REST sem RLS adequada | ALTA | RLS em `athletes` por `team_id` + `user_id`; futuro RPC `coach_reset_athlete_email` audit-trailed | §17 v1, §19 | Parcial (RPC + audit em 02F+) |
| T3 | MITM em ambiente sem HTTPS | Rede pública sem TLS | ALTA | HSTS obrigatório (§15.1); Vercel força HTTPS | §15 | Pendente (02D) |
| T4 | Modificação do bundle JS via cache stale do SW após exploit | SW serve versão antiga vulnerável | MÉDIA | (a) `navigateFallbackDenylist` em rotas de auth (§15.4); (b) workbox versionado por build hash | §15.4 | Pendente (02D) |
| T5 | Adulteração do `config.toml` em repo via PR malicioso | Insider/contributor malicioso | MÉDIA | (a) `scripts/verify-supabase-config.ts` no CI; (b) review obrigatório em `supabase/**` (CODEOWNERS); (c) PR Evidence Guard | §20.2 | Parcial (script em 02E; CODEOWNERS pendente) |

### 3.3 Repudiation — negação de autoria

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| R1 | Usuário nega ter feito login (suporte/disputa) | Falta de log | MÉDIA | `auth_events` com `actor_user_id`, IP, UA hash, timestamp (§19) | §19 | Pendente (02F+) |
| R2 | Coach nega ter convidado outro coach | Falta de log de `invite_created` | MÉDIA | `auth_events.event_type='invite_created'` + `actor_user_id` | §19.1 | Pendente (02F+) |
| R3 | Coach nega reset de email de atleta | RPC sem audit | MÉDIA | `coach_reset_athlete_email` registra `athlete_email_reset_by_coach` | §19.1 | Pendente (02F+) |
| R4 | Atleta nega aceite de termos LGPD | Falta de carimbo | MÉDIA | `profiles.lgpd_accepted_at` + IP no momento do aceite | (campo já existe; carimbo IP pendente) | Parcial |

### 3.4 Information Disclosure — vazamento de informação

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| I1 | Enumeração de emails cadastrados via diferença de mensagem (login/reset/signup) | Mensagem condicional | ALTA | (a) Vocabulário canônico unificado (§13); (b) paridade de timing ±200 ms (§13.3); (c) signup retorna 200 mesmo se email existe | §13 | Pendente (02C) |
| I2 | Vazamento de email no log do servidor | Logging acidental | MÉDIA | `auth_events.actor_email_hash` SHA-256, nunca texto claro (§19.3) | §19.3 | Pendente (02F+) |
| I3 | Vazamento de senha em HTTP referer / URL | Senha em GET acidental | ALTA | Formulários POST; CSP `form-action 'self'`; `Referrer-Policy: strict-origin-when-cross-origin` | §15 | Pendente (02D) |
| I4 | Vazamento de sessão por XSS lendo `localStorage` | (ver S5) | CRÍTICA | (ver S5: CSP + HSTS + SW denylist) | §14, §15 | Pendente (02D + 02F+) |
| I5 | Vazamento de PII de atleta em mensagens de erro | Erro do banco escapa para UI | MÉDIA | Vocabulário canônico (§13) mascara erros técnicos; PostgREST não expõe nomes | §13 | Pendente (02C) |
| I6 | Vazamento da chave `SUPABASE_PUBLISHABLE_KEY` | Bundle público — chave é **publicável por design**; risco é confundi-la com `service_role` | BAIXA | (a) Nome explícito `*_PUBLISHABLE_KEY` no `.env.example` (02B); (b) **SHALL NOT** existir `SUPABASE_SERVICE_ROLE_KEY` em código cliente | §20 | Parcial (lint pendente) |
| I7 | Vazamento de Authorization Bearer em logs do navegador (DevTools / extensão) | Hostil local | BAIXA | Aceito como risco residual; mitigado por sessão curta (futuro idle timeout §14.4) | §14.4 | Pendente (02F+) |

### 3.5 Denial of Service

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| D1 | Flood de signup para esgotar quota de email do Supabase | Bot massivo | ALTA | (a) `email_sent=10/h` (§11.1); (b) CAPTCHA Turnstile (§12); (c) quota Supabase Free limita custo | §11, §12 | Pendente (02E) |
| D2 | Flood de signin para esgotar rate limit de IPs legítimos NAT | Compartilhamento de IP corporativo | MÉDIA | Mensagem clara 429 (§11.2); janela curta; CAPTCHA absorve carga | §11.2 | Pendente (02E) |
| D3 | Service Worker cache poisoning bloqueia rotas auth | SW antigo após exploit | MÉDIA | `navigateFallbackDenylist` força network-first para rotas auth (§15.4) | §15.4 | Pendente (02D) |
| D4 | Indisponibilidade do Turnstile bloqueia 100% dos logins | Cloudflare outage | MÉDIA | Fallback registrado em log (§12.3); SLA Cloudflare Turnstile aceito | §12.3 | Pendente (02E) |
| D5 | Indisponibilidade total do Supabase Auth | Supabase outage | ALTA | Aceito como dependência fundamental; status page monitorada | (operacional) | Aceito |

### 3.6 Elevation of Privilege

| # | Ameaça | Vetor | Severidade | Controle(s) | Cláusula | Status |
|---|---|---|---|---|---|---|
| E1 | `viewer` consegue criar Scout via API direta | RLS frouxa | CRÍTICA | RLS em `scouts` checa `team_members.role IN ('owner','coach')` | §2, §5 | Implementado (CEPR-AUTH-01) |
| E2 | `coach` se promove a `owner` editando `team_members.role` | UPDATE direto via PostgREST | CRÍTICA | RLS write em `team_members` restrita a `role='owner' AND user_id = auth.uid()`; trigger `prevent_role_change` (se existir) | §3 | Implementado (CEPR-AUTH-01) |
| E3 | Atleta promove-se a `coach` via aceite indevido de invite | Manipula `team_id` no aceite | ALTA | `accept_coach_invite` confere `auth.jwt() email == invited_email`; invite single-use | §17 v1 | Implementado (CEPR-AUTH-01) |
| E4 | Atleta acessa `/` (área de comissão) com `AccessRole=athlete` | Bypass de guard cliente | ALTA | (a) `AppAccessGuard` server-checked via `get_my_access()`; (b) RLS final do banco | §2, §4 | Implementado (CEPR-AUTH-01) |
| E5 | Não-autenticado acessa rotas via `AuthGuard` legado mal configurado | Rota nova esquece de migrar | MÉDIA | (a) §8.4 invariante "AuthGuard deprecated"; (b) lint/grep CI futuro | §8.4 | Parcial (decisão documentada; lint pendente) |
| E6 | Confusão `AccessRole` × `SportRole` em RLS gera elevação | Misturar enums em policy | ALTA | (a) §3-bis proíbe; (b) revisão de RLS em CODEOWNERS para `supabase/migrations/*` | §3-bis | Implementado (documental); enforcement por review |
| E7 | Recovery link reutilizado por atacante após visualização do alvo | Posse do link basta para reset | ALTA | (a) `otp_expiry=3600` (§20.1); (b) `secure_password_change=true` (§20.1) força nova senha; (c) link single-use por design Supabase | §20.1 | Pendente (02E) |

---

## 4. Resumo executivo de controles pendentes

| Sub-PR | Ameaças que fecha (parcial ou total) |
|---|---|
| **02A** (este) | S6 (por omissão), E6 (documental), framework para todas |
| **02B** | I6 (parcial — env explícita) |
| **02C** | I1, I3 (parcial via CSP em 02D), I5 |
| **02D** | S5, T3, T4, D3, I3 |
| **02E** | S1, S2, D1, D2, D4, E7 |
| **02F+** | R1–R4, I2, I7, S4 (cron), E5 (lint), T2 (audit), §25 MFA |

---

## 5. Riscos aceitos / fora de escopo

| Risco | Justificativa de aceitação | Reavaliação |
|---|---|---|
| OAuth provider compromissado | OAuth desabilitado no MVP | Quando habilitar Google/Apple |
| Supabase outage total | Dependência fundamental escolhida | Status page; SLO Supabase |
| Atacante com controle físico do dispositivo do usuário | Fora de escopo de auth de aplicação | — |
| Engenharia social out-of-band (atacante liga para suporte) | Política humana, não técnica | Runbook §INCIDENT (02F+) |

---

## 6. Próxima revisão

Este threat model **SHALL** ser revisado:
- Ao fim de cada sub-PR (02B–02E), atualizando coluna "Status".
- Ao habilitar OAuth, MFA ou WhatsApp OTP (mudança de superfície).
- A cada 12 meses, independente de mudanças.

Próxima revisão programada: **2026-11-29** ou ao merge de CEPR-AUTH-02E (o que vier primeiro).
