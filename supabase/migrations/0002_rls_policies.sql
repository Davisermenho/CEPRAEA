-- CEPRAEA RLS baseline and explicit grants.

create or replace function public.is_team_member(input_team_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
  );
$$;

create or replace function public.has_team_role(input_team_id uuid, allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.team_members tm
    where tm.team_id = input_team_id
      and tm.user_id = auth.uid()
      and tm.role = any(allowed_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.teams enable row level security;
alter table public.team_members enable row level security;
alter table public.athletes enable row level security;
alter table public.training_series enable row level security;
alter table public.trainings enable row level security;
alter table public.attendance_records enable row level security;
alter table public.presence_token_batches enable row level security;
alter table public.presence_tokens enable row level security;
alter table public.scout_games enable row level security;
alter table public.scout_events enable row level security;
alter table public.audit_logs enable row level security;

create policy profiles_select_self_or_team
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1
    from public.team_members mine
    join public.team_members theirs on theirs.team_id = mine.team_id
    where mine.user_id = auth.uid()
      and theirs.user_id = public.profiles.id
  )
);

create policy profiles_update_self
on public.profiles for update to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy teams_select_member
on public.teams for select to authenticated
using (public.is_team_member(id));

create policy teams_insert_owner
on public.teams for insert to authenticated
with check (created_by = auth.uid());

create policy teams_update_owner
on public.teams for update to authenticated
using (public.has_team_role(id, array['owner']))
with check (public.has_team_role(id, array['owner']));

create policy team_members_select_member
on public.team_members for select to authenticated
using (public.is_team_member(team_id));

create policy team_members_insert_owner
on public.team_members for insert to authenticated
with check (public.has_team_role(team_id, array['owner']));

create policy team_members_update_owner
on public.team_members for update to authenticated
using (public.has_team_role(team_id, array['owner']))
with check (public.has_team_role(team_id, array['owner']));

create policy athletes_select_member
on public.athletes for select to authenticated
using (public.is_team_member(team_id));

create policy athletes_insert_coach
on public.athletes for insert to authenticated
with check (public.has_team_role(team_id, array['owner','coach']));

create policy athletes_update_coach
on public.athletes for update to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy training_series_select_member
on public.training_series for select to authenticated
using (public.is_team_member(team_id));

create policy training_series_write_coach
on public.training_series for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy trainings_select_member
on public.trainings for select to authenticated
using (public.is_team_member(team_id));

create policy trainings_insert_coach
on public.trainings for insert to authenticated
with check (public.has_team_role(team_id, array['owner','coach']));

create policy trainings_update_coach
on public.trainings for update to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy attendance_select_member
on public.attendance_records for select to authenticated
using (public.is_team_member(team_id));

create policy attendance_insert_coach
on public.attendance_records for insert to authenticated
with check (public.has_team_role(team_id, array['owner','coach']));

create policy attendance_update_coach
on public.attendance_records for update to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy presence_batches_select_member
on public.presence_token_batches for select to authenticated
using (public.is_team_member(team_id));

create policy presence_batches_write_coach
on public.presence_token_batches for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy presence_tokens_select_coach
on public.presence_tokens for select to authenticated
using (public.has_team_role(team_id, array['owner','coach']));

create policy presence_tokens_write_coach
on public.presence_tokens for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy scout_games_select_member
on public.scout_games for select to authenticated
using (public.is_team_member(team_id));

create policy scout_games_write_coach
on public.scout_games for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy scout_events_select_member
on public.scout_events for select to authenticated
using (public.is_team_member(team_id));

create policy scout_events_write_coach
on public.scout_events for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

create policy audit_logs_select_coach
on public.audit_logs for select to authenticated
using (public.has_team_role(team_id, array['owner','coach']));

-- Audit logs are inserted through RPCs/functions only.

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
revoke execute on all functions in schema public from authenticated;

grant execute on function public.is_team_member(uuid) to authenticated;
grant execute on function public.has_team_role(uuid, text[]) to authenticated;
