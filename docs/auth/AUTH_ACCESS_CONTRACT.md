# AUTH_ACCESS_CONTRACT — CEPRAEA

**Versão:** 1.0  
**Escopo:** CEPR-AUTH-01  
**Data:** 2026-05-28  

---

## 1. Definições canônicas

| Conceito | Definição | Tabela/RPC |
|---|---|---|
| **AuthUser** | Conta registrada no `auth.users` do Supabase. Representa identidade de login (email + senha). | `auth.users` |
| **Profile** | Registro em `public.profiles` vinculado 1:1 ao `auth.users` por `id`. Criado pelo trigger `handle_new_user` ao registrar. | `public.profiles` |
| **TeamMember** | Vínculo de um `Profile` a um `Team` com papel de acesso. | `public.team_members` |
| **AthleteRecord** | Cadastro esportivo de atleta. Pode existir antes do login (pré-cadastro). Vinculado ao `AuthUser` via `athletes.user_id`. | `public.athletes` |
| **Papel de acesso** | Role que define o que o usuário pode fazer na plataforma de gestão. | `team_members.role` |
| **Papel esportivo** | Posição/função de atleta dentro do jogo. Não tem relação com autorização. | `athletes.position`, etc. |

> **Regra fundamental:** Papel de acesso (`owner/coach/viewer`) e papel esportivo (posição no handebol) são conceitos ortogonais e **nunca devem ser misturados** em guards, RPCs ou RLS.

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

Para inspecionar o estado antes de migrar em produção, consulte diretamente:
```sql
-- Preview do backfill (atletas sem user_id com match único por email)
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
3. Papel de acesso (`team_members.role`) e papel esportivo nunca devem ser comparados na mesma query/guard.
4. `AuthGuard` (legado) está **deprecated** — não deve ser usado em novas rotas. Usar `AppAccessGuard`.
5. `coach_invites` nunca deve ter dois registros `accepted_at IS NULL` para o mesmo `(team_id, lower(invited_email))`.

---

## 9. Pendências para MVP completo (fora do CEPR-AUTH-01)

- [ ] UI read-only para `viewer`: ocultar botões de escrita por papel.
- [ ] Remoção ou alias formal do `AuthGuard` legado.
- [ ] Tela de "aguardando convite" para usuário sem memberships que não quer criar time.
- [ ] Expiração automática de convites (cron ou Edge Function).
