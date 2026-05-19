-- Scout security policies and grants
-- Objetivo: abrir acesso seguro ao scout novo.
-- Regra:
-- - contratos com team_id: member read / owner+coach write
-- - codebook global: authenticated read-only

revoke all on table public.scout_plays from public;
revoke all on table public.scout_play_participations from public;
revoke all on table public.scout_mental_events from public;
revoke all on table public.scout_play_validations from public;
revoke all on table public.athlete_scout_profiles from public;
revoke all on table public.scout_catalog_teams from public;
revoke all on table public.scout_code_lists from public;
revoke all on table public.scout_code_values from public;
revoke all on table public.scout_field_codebook_map from public;

revoke all on table public.scout_plays from anon;
revoke all on table public.scout_play_participations from anon;
revoke all on table public.scout_mental_events from anon;
revoke all on table public.scout_play_validations from anon;
revoke all on table public.athlete_scout_profiles from anon;
revoke all on table public.scout_catalog_teams from anon;
revoke all on table public.scout_code_lists from anon;
revoke all on table public.scout_code_values from anon;
revoke all on table public.scout_field_codebook_map from anon;

revoke all on table public.scout_plays from authenticated;
revoke all on table public.scout_play_participations from authenticated;
revoke all on table public.scout_mental_events from authenticated;
revoke all on table public.scout_play_validations from authenticated;
revoke all on table public.athlete_scout_profiles from authenticated;
revoke all on table public.scout_catalog_teams from authenticated;
revoke all on table public.scout_code_lists from authenticated;
revoke all on table public.scout_code_values from authenticated;
revoke all on table public.scout_field_codebook_map from authenticated;

grant select, insert, update, delete on table public.scout_plays to authenticated;
grant select, insert, update, delete on table public.scout_play_participations to authenticated;
grant select, insert, update, delete on table public.scout_mental_events to authenticated;
grant select, insert, update, delete on table public.scout_play_validations to authenticated;
grant select, insert, update, delete on table public.athlete_scout_profiles to authenticated;
grant select, insert, update, delete on table public.scout_catalog_teams to authenticated;

grant select on table public.scout_code_lists to authenticated;
grant select on table public.scout_code_values to authenticated;
grant select on table public.scout_field_codebook_map to authenticated;

drop policy if exists scout_plays_select_member on public.scout_plays;
create policy scout_plays_select_member
on public.scout_plays for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_plays_write_coach on public.scout_plays;
create policy scout_plays_write_coach
on public.scout_plays for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists scout_play_participations_select_member on public.scout_play_participations;
create policy scout_play_participations_select_member
on public.scout_play_participations for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_play_participations_write_coach on public.scout_play_participations;
create policy scout_play_participations_write_coach
on public.scout_play_participations for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists scout_mental_events_select_member on public.scout_mental_events;
create policy scout_mental_events_select_member
on public.scout_mental_events for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_mental_events_write_coach on public.scout_mental_events;
create policy scout_mental_events_write_coach
on public.scout_mental_events for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists scout_play_validations_select_member on public.scout_play_validations;
create policy scout_play_validations_select_member
on public.scout_play_validations for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_play_validations_write_coach on public.scout_play_validations;
create policy scout_play_validations_write_coach
on public.scout_play_validations for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists athlete_scout_profiles_select_member on public.athlete_scout_profiles;
create policy athlete_scout_profiles_select_member
on public.athlete_scout_profiles for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists athlete_scout_profiles_write_coach on public.athlete_scout_profiles;
create policy athlete_scout_profiles_write_coach
on public.athlete_scout_profiles for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists scout_catalog_teams_select_member on public.scout_catalog_teams;
create policy scout_catalog_teams_select_member
on public.scout_catalog_teams for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_catalog_teams_write_coach on public.scout_catalog_teams;
create policy scout_catalog_teams_write_coach
on public.scout_catalog_teams for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));

drop policy if exists scout_code_lists_select_authenticated on public.scout_code_lists;
create policy scout_code_lists_select_authenticated
on public.scout_code_lists for select to authenticated
using (auth.uid() is not null);

drop policy if exists scout_code_values_select_authenticated on public.scout_code_values;
create policy scout_code_values_select_authenticated
on public.scout_code_values for select to authenticated
using (auth.uid() is not null);

drop policy if exists scout_field_codebook_map_select_authenticated on public.scout_field_codebook_map;
create policy scout_field_codebook_map_select_authenticated
on public.scout_field_codebook_map for select to authenticated
using (auth.uid() is not null);
