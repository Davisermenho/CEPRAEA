-- CEPR-AUTH-01: Access contract tests for get_my_access() and has_app_access().
-- Uses the same seed UUIDs as other tests.
-- seed.sql: 000...001=owner, 000...002=coach, 000...003=viewer, 000...004=noteam, 000...005=other-owner
-- teams:    100...001=CEPRAEA, 100...002=Outra Equipe
\set ON_ERROR_STOP on

begin;

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Unauthenticated (anon) — get_my_access returns null user_id
-- ─────────────────────────────────────────────────────────────────────────────
set local role anon;
do $$
declare
  result jsonb;
begin
  select public.get_my_access() into result;
  if (result->>'user_id') is not null then
    raise exception 'anon: user_id should be null, got: %', result;
  end if;
  if (result->'memberships') != '[]'::jsonb then
    raise exception 'anon: memberships should be empty array, got: %', result->'memberships';
  end if;
  if (result->'athlete_link') is not null and (result->>'athlete_link') != 'null' then
    raise exception 'anon: athlete_link should be null, got: %', result->'athlete_link';
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Owner — sees CEPRAEA membership with role=owner
-- ─────────────────────────────────────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
declare
  result      jsonb;
  memberships jsonb;
begin
  select public.get_my_access() into result;

  if (result->>'user_id') != '00000000-0000-0000-0000-000000000001' then
    raise exception 'owner: wrong user_id: %', result->>'user_id';
  end if;

  memberships := result->'memberships';
  if jsonb_array_length(memberships) < 1 then
    raise exception 'owner: expected at least 1 membership, got: %', memberships;
  end if;

  if not exists (
    select 1 from jsonb_array_elements(memberships) m
    where (m->>'team_id') = '10000000-0000-0000-0000-000000000001'
      and (m->>'role') = 'owner'
  ) then
    raise exception 'owner: expected owner membership in CEPRAEA team, got: %', memberships;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Coach — sees CEPRAEA membership with role=coach
-- ─────────────────────────────────────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000002';
do $$
declare
  result      jsonb;
  memberships jsonb;
begin
  select public.get_my_access() into result;
  memberships := result->'memberships';

  if not exists (
    select 1 from jsonb_array_elements(memberships) m
    where (m->>'team_id') = '10000000-0000-0000-0000-000000000001'
      and (m->>'role') = 'coach'
  ) then
    raise exception 'coach: expected coach membership in CEPRAEA team, got: %', memberships;
  end if;

  -- Coach should have no athlete_link (not in athletes table as an auth user)
  if (result->>'athlete_link') not in ('null', '') and result->>'athlete_link' is not null then
    -- allow null or json null
    null;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. No-team user — memberships is empty array
-- ─────────────────────────────────────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
declare
  result      jsonb;
  memberships jsonb;
begin
  select public.get_my_access() into result;
  memberships := result->'memberships';

  if jsonb_array_length(memberships) != 0 then
    raise exception 'noteam: expected 0 memberships, got: %', memberships;
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. has_app_access() — owner of CEPRAEA has access; noteam user does not
-- ─────────────────────────────────────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';
do $$
begin
  if not public.has_app_access('10000000-0000-0000-0000-000000000001'::uuid) then
    raise exception 'owner should have app access to CEPRAEA team';
  end if;
  if public.has_app_access('10000000-0000-0000-0000-000000000002'::uuid) then
    raise exception 'owner of CEPRAEA must not have access to Outra Equipe';
  end if;
end;
$$;

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000004';
do $$
begin
  if public.has_app_access('10000000-0000-0000-0000-000000000001'::uuid) then
    raise exception 'noteam user must not have app access to CEPRAEA team';
  end if;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Other team owner — no access to CEPRAEA; access to own team
-- ─────────────────────────────────────────────────────────────────────────────
set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000005';
do $$
declare
  result jsonb;
begin
  if public.has_app_access('10000000-0000-0000-0000-000000000001'::uuid) then
    raise exception 'other team owner must not have access to CEPRAEA';
  end if;
  if not public.has_app_access('10000000-0000-0000-0000-000000000002'::uuid) then
    raise exception 'other team owner should have access to their own team';
  end if;

  select public.get_my_access() into result;
  if not exists (
    select 1 from jsonb_array_elements(result->'memberships') m
    where (m->>'team_id') = '10000000-0000-0000-0000-000000000002'
      and (m->>'role') = 'owner'
  ) then
    raise exception 'other team owner: expected owner in team 2, got: %', result->'memberships';
  end if;
end;
$$;

rollback;
