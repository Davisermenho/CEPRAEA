-- CEPR-AUTH-01: access resolution layer.
-- Adds get_my_access() RPC, has_app_access() helper, and handle_new_user trigger.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Auto-create profile on auth.users insert
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
    set email = coalesce(excluded.email, public.profiles.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. get_my_access() — resolves caller identity, team memberships and athlete link
-- ─────────────────────────────────────────────────────────────────────────────

create type public.team_membership_record as (
  team_id  uuid,
  role     text
);

create or replace function public.get_my_access()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id        uuid;
  v_profile_exists boolean;
  v_memberships    jsonb;
  v_athlete_link   jsonb;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    return jsonb_build_object(
      'user_id',         null,
      'profile_complete', false,
      'memberships',     '[]'::jsonb,
      'athlete_link',    null
    );
  end if;

  select exists (
    select 1 from public.profiles where id = v_user_id and name is not null
  ) into v_profile_exists;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('team_id', tm.team_id, 'role', tm.role)
      order by tm.created_at
    ),
    '[]'::jsonb
  )
  from public.team_members tm
  where tm.user_id = v_user_id
  into v_memberships;

  select jsonb_build_object('team_id', a.team_id, 'athlete_id', a.id)
  from public.athletes a
  where a.user_id = v_user_id
    and a.status = 'ativo'
    and a.deleted_at is null
  limit 1
  into v_athlete_link;

  return jsonb_build_object(
    'user_id',          v_user_id,
    'profile_complete', v_profile_exists,
    'memberships',      v_memberships,
    'athlete_link',     v_athlete_link
  );
end;
$$;

grant execute on function public.get_my_access() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. has_app_access(team_id) — true when caller is team member OR linked athlete
-- ─────────────────────────────────────────────────────────────────────────────

create or replace function public.has_app_access(input_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_team_member(input_team_id)
    or exists (
      select 1 from public.athletes a
      where a.user_id = auth.uid()
        and a.team_id = input_team_id
        and a.status = 'ativo'
        and a.deleted_at is null
    );
$$;

grant execute on function public.has_app_access(uuid) to authenticated;
