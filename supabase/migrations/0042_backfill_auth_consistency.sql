-- CEPR-AUTH-01: backfill auth consistency.
-- 1. Backfill profiles for auth.users that have no profile yet.
-- 2. Backfill athletes.user_id for active athletes whose email matches an auth.users row.
--
-- SAFETY GUARDS:
-- - Profiles: only created when missing; existing email is preserved (coalesce).
-- - Athletes: only links when athlete has no user_id, is active (deleted_at IS NULL),
--   the email matches exactly ONE auth.users row, AND that auth.users.id is not already
--   linked to another active athlete (prevents unique-index violations).

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Profiles backfill
-- ─────────────────────────────────────────────────────────────────────────────
insert into public.profiles (id, email)
select u.id, u.email
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do update
  set email = coalesce(excluded.email, public.profiles.email);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Athletes user_id backfill (guarded)
--    Conditions that must ALL be true to link:
--      a) athlete has no user_id yet
--      b) athlete is active (not soft-deleted)
--      c) exactly 1 auth.users row matches athlete.email (no ambiguity)
--      d) that auth.users.id is not already linked to another active athlete
-- ─────────────────────────────────────────────────────────────────────────────
update public.athletes a
set user_id = matched.auth_user_id
from (
  select
    at.id                  as athlete_id,
    u.id                   as auth_user_id
  from public.athletes at
  join (
    -- Only auth.users with exactly one email match to an athlete
    select u2.id, lower(u2.email) as email_lower
    from auth.users u2
    where lower(u2.email) in (
      select lower(a2.email)
      from public.athletes a2
      where a2.user_id is null
        and a2.deleted_at is null
      group by lower(a2.email)
      having count(*) = 1         -- exactly 1 athlete per email
    )
    group by u2.id, lower(u2.email)
    having count(*) = 1           -- exactly 1 auth.users per email
  ) u on lower(at.email) = u.email_lower
  where at.user_id is null
    and at.deleted_at is null
    -- guard d: auth user not already linked to another active athlete
    and not exists (
      select 1
      from public.athletes a3
      where a3.user_id = u.id
        and a3.deleted_at is null
    )
) matched
where a.id = matched.athlete_id
;
