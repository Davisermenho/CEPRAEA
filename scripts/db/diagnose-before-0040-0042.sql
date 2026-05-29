-- ─────────────────────────────────────────────────────────────────────────────
-- CEPR-AUTH-ROLL-01 — Diagnóstico pré-rollout migrations 0040–0042
-- Executar em staging E em produção ANTES de aplicar as migrations.
-- Nenhuma dessas queries modifica dados.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── D1: auth.users sem profiles ──────────────────────────────────────────────
-- Esses usuários receberão um profile criado pela migration 0042.
-- Esperado: qualquer número (podem existir usuários antigos sem profile).
select
  u.id       as auth_user_id,
  u.email,
  u.created_at
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
)
order by u.created_at;

-- ── D2: type public.team_membership_record já existe? ────────────────────────
-- Migration 0040 executa CREATE TYPE (sem IF NOT EXISTS).
-- Se retornar linha, há risco de erro ao aplicar 0040 — exige investigação antes de prosseguir.
-- A ação correta depende do estado real: ajustar a migration, marcá-la como já aplicada ou remover o tipo.
select typname, typtype
from pg_type
where typname = 'team_membership_record'
  and typnamespace = (select oid from pg_namespace where nspname = 'public');

-- ── D3: trigger on_auth_user_created já existe? ──────────────────────────────
-- Migration 0040 faz DROP TRIGGER IF EXISTS antes de criar — é seguro.
-- Retornar linha aqui é normal; serve como confirmação de estado atual.
select trigger_name, event_manipulation, action_timing
from information_schema.triggers
where trigger_name = 'on_auth_user_created'
  and event_object_table = 'users';

-- ── D4: tabela coach_invites já existe? ──────────────────────────────────────
-- Migration 0041 usa CREATE TABLE IF NOT EXISTS — é idempotente.
-- Se retornar linha, a migration foi aplicada parcialmente (investigar).
select table_name, table_schema
from information_schema.tables
where table_name = 'coach_invites'
  and table_schema = 'public';

-- ── D5: atletas ativas sem user_id (candidatas ao backfill) ─────────────────
-- Essas atletas serão linkadas se o email corresponder a exatamente 1 auth.user.
select
  a.id,
  a.name,
  a.email,
  a.deleted_at
from public.athletes a
where a.user_id is null
  and a.deleted_at is null
order by a.name;

-- ── D6: atletas ativas com email duplicado (bloqueiam backfill — esperado: 0) ─
-- Se retornar linhas, o backfill NÃO linkará essas atletas (guarda count=1).
-- Investigar antes de aplicar a migration.
select
  lower(a.email) as email_lower,
  count(*)       as qtd_atletas
from public.athletes a
where a.user_id is null
  and a.deleted_at is null
group by lower(a.email)
having count(*) > 1
order by qtd_atletas desc;

-- ── D7: auth.users com email duplicado (bloqueiam backfill — esperado: 0) ────
select
  lower(u.email) as email_lower,
  count(*)       as qtd_auth_users
from auth.users u
group by lower(u.email)
having count(*) > 1
order by qtd_auth_users desc;

-- ── D8: athletes.user_id já preenchidos ──────────────────────────────────────
-- Essas atletas NÃO serão alteradas pelo backfill (guarda user_id is null).
select
  a.id,
  a.name,
  a.email,
  a.user_id
from public.athletes a
where a.user_id is not null
  and a.deleted_at is null
order by a.name;

-- ── D9: conflitos potenciais (auth.user_id já linked a mais de 1 atleta ativa) ─
-- Esperado: 0 linhas. Se retornar, indica inconsistência pré-existente.
select
  a.user_id,
  count(*) as qtd_atletas_vinculadas
from public.athletes a
where a.user_id is not null
  and a.deleted_at is null
group by a.user_id
having count(*) > 1;

-- ── D10: simulação do backfill (read-only preview) ───────────────────────────
-- Mostra exatamente quais atletas SERÃO linkadas pela migration 0042,
-- sem modificar nada.
select
  at.id                  as athlete_id,
  at.name                as athlete_name,
  at.email               as athlete_email,
  u.id                   as will_link_to_auth_user_id
from public.athletes at
join (
  select u2.id, lower(u2.email) as email_lower
  from auth.users u2
  where lower(u2.email) in (
    select lower(a2.email)
    from public.athletes a2
    where a2.user_id is null
      and a2.deleted_at is null
    group by lower(a2.email)
    having count(*) = 1
  )
  group by u2.id, lower(u2.email)
  having count(*) = 1
) u on lower(at.email) = u.email_lower
where at.user_id is null
  and at.deleted_at is null
  and not exists (
    select 1 from public.athletes a3
    where a3.user_id = u.id and a3.deleted_at is null
  )
order by at.name;
