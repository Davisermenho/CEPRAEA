-- Scout live entries security
-- Objetivo: aplicar grants e RLS à camada de COLETA_AO_VIVO.

revoke all on table public.scout_live_entries from public;
revoke all on table public.scout_live_entries from anon;
revoke all on table public.scout_live_entries from authenticated;

grant select, insert, update, delete on table public.scout_live_entries to authenticated;

drop policy if exists scout_live_entries_select_member on public.scout_live_entries;
create policy scout_live_entries_select_member
on public.scout_live_entries for select to authenticated
using (public.is_team_member(team_id));

drop policy if exists scout_live_entries_write_coach on public.scout_live_entries;
create policy scout_live_entries_write_coach
on public.scout_live_entries for all to authenticated
using (public.has_team_role(team_id, array['owner','coach']))
with check (public.has_team_role(team_id, array['owner','coach']));
