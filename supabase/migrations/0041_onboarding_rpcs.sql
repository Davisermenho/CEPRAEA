-- CEPR-AUTH-01: onboarding RPCs.
-- Adds coach_invites table, bootstrap_owner(), invite_coach(),
-- accept_coach_invite() and ensure_athlete_link().

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. coach_invites table
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.coach_invites (
  id            uuid primary key default gen_random_uuid(),
  team_id       uuid not null references public.teams(id) on delete cascade,
  invited_email text not null,
  invited_by    uuid not null references public.profiles(id),
  role          text not null default 'coach' check (role in ('coach', 'viewer')),
  accepted_at   timestamptz,
  expires_at    timestamptz not null default (now() + interval '7 days'),
  created_at    timestamptz not null default now()
);

create index if not exists coach_invites_team_id_idx
  on public.coach_invites(team_id);
create index if not exists coach_invites_invited_email_idx
  on public.coach_invites(lower(invited_email));

alter table public.coach_invites enable row level security;

-- Only team owner may read/manage invites for their team.
create policy "owner_manage_invites"
  on public.coach_invites
  for all
  to authenticated
  using  (public.has_team_role(team_id, array['owner']))
  with check (public.has_team_role(team_id, array['owner']));

-- Any authenticated user may read an invite addressed to their own email (to accept).
create policy "invitee_read_own_invite"
  on public.coach_invites
  for select
  to authenticated
  using (lower(invited_email) = lower(auth.jwt() ->> 'email'));

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. bootstrap_owner(team_name, team_slug)
--    Creates a team and makes the caller its owner.  One team per user (check).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.bootstrap_owner(
  p_team_name text,
  p_team_slug text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_team_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Idempotent: return existing ownership if already an owner somewhere.
  select team_id into v_team_id
  from public.team_members
  where user_id = v_user_id and role = 'owner'
  limit 1;

  if v_team_id is not null then
    return v_team_id;
  end if;

  -- Validate slug format.
  if p_team_slug !~ '^[a-z0-9][a-z0-9\-]{1,62}[a-z0-9]$' then
    raise exception 'invalid_slug';
  end if;

  -- Ensure profile exists.
  insert into public.profiles (id, email)
  select v_user_id, (select email from auth.users where id = v_user_id)
  on conflict (id) do nothing;

  -- Create team.
  insert into public.teams (name, slug, created_by)
  values (p_team_name, p_team_slug, v_user_id)
  returning id into v_team_id;

  -- Make caller owner.
  insert into public.team_members (team_id, user_id, role)
  values (v_team_id, v_user_id, 'owner');

  return v_team_id;
end;
$$;

revoke all on function public.bootstrap_owner(text, text) from public, anon, authenticated;
grant execute on function public.bootstrap_owner(text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. invite_coach(team_id, email, role)
--    Creates a coach_invite (owner-only).
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.invite_coach(
  p_team_id uuid,
  p_email   text,
  p_role    text default 'coach'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id  uuid;
  v_invite_id uuid;
begin
  v_user_id := auth.uid();

  if not public.has_team_role(p_team_id, array['owner']) then
    raise exception 'forbidden';
  end if;

  if p_role not in ('coach', 'viewer') then
    raise exception 'invalid_role';
  end if;

  -- Check for existing pending invite first (by team + email, not by PK).
  -- on conflict (id) do nothing would never fire since id is a new UUID each call.
  select id into v_invite_id
  from public.coach_invites
  where team_id = p_team_id
    and lower(invited_email) = lower(p_email)
    and accepted_at is null
  limit 1;

  if v_invite_id is not null then
    -- Renew expiry of existing pending invite.
    update public.coach_invites
    set expires_at = now() + interval '7 days'
    where id = v_invite_id;
    return v_invite_id;
  end if;

  -- No pending invite — insert fresh.
  insert into public.coach_invites (team_id, invited_email, invited_by, role, expires_at)
  values (p_team_id, lower(p_email), v_user_id, p_role, now() + interval '7 days')
  returning id into v_invite_id;

  return v_invite_id;
end;
$$;

revoke all on function public.invite_coach(uuid, text, text) from public, anon, authenticated;
grant execute on function public.invite_coach(uuid, text, text) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. accept_coach_invite(invite_id)
--    Validates the invite, inserts team_members row, marks invite accepted.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.accept_coach_invite(p_invite_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id    uuid;
  v_user_email text;
  v_invite     record;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  select u.email into v_user_email
  from auth.users u where u.id = v_user_id;

  select * into v_invite
  from public.coach_invites
  where id = p_invite_id
    and lower(invited_email) = lower(v_user_email)
    and accepted_at is null
    and expires_at > now()
  for update;

  if not found then
    return false;
  end if;

  -- Ensure profile.
  insert into public.profiles (id, email)
  values (v_user_id, v_user_email)
  on conflict (id) do nothing;

  -- Insert membership (idempotent).
  insert into public.team_members (team_id, user_id, role)
  values (v_invite.team_id, v_user_id, v_invite.role)
  on conflict (team_id, user_id) do nothing;

  -- Mark accepted.
  update public.coach_invites
  set accepted_at = now()
  where id = p_invite_id;

  return true;
end;
$$;

revoke all on function public.accept_coach_invite(uuid) from public, anon, authenticated;
grant execute on function public.accept_coach_invite(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. ensure_athlete_link()
--    Calls link_athlete_user_id() and upserts profile.
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.ensure_athlete_link()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid;
  v_user_email text;
  v_athlete_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'not_authenticated';
  end if;

  -- Fast path: already linked.
  select id into v_athlete_id
  from public.athletes
  where user_id = v_user_id
    and status = 'ativo'
    and deleted_at is null
  limit 1;

  if v_athlete_id is not null then
    return v_athlete_id;
  end if;

  -- First-login: claim record by email.
  v_athlete_id := public.link_athlete_user_id();

  if v_athlete_id is null then
    return null;
  end if;

  -- Upsert profile.
  select email into v_user_email from auth.users where id = v_user_id;

  insert into public.profiles (id, email)
  values (v_user_id, v_user_email)
  on conflict (id) do update
    set email = coalesce(excluded.email, public.profiles.email);

  return v_athlete_id;
end;
$$;

revoke all on function public.ensure_athlete_link() from public, anon, authenticated;
grant execute on function public.ensure_athlete_link() to authenticated;
