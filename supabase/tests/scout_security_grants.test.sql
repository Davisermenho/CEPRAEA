-- Scout security grant checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

do $$
begin
  if not has_table_privilege('authenticated', 'public.scout_plays', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_plays';
  end if;
  if not has_table_privilege('authenticated', 'public.scout_play_participations', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_play_participations';
  end if;
  if not has_table_privilege('authenticated', 'public.scout_mental_events', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_mental_events';
  end if;
  if not has_table_privilege('authenticated', 'public.scout_play_validations', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_play_validations';
  end if;
  if not has_table_privilege('authenticated', 'public.athlete_scout_profiles', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on athlete_scout_profiles';
  end if;
  if not has_table_privilege('authenticated', 'public.scout_catalog_teams', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_catalog_teams';
  end if;

  if not has_table_privilege('authenticated', 'public.scout_code_lists', 'SELECT') then
    raise exception 'authenticated should have SELECT grant on scout_code_lists';
  end if;
  if has_table_privilege('authenticated', 'public.scout_code_lists', 'INSERT,UPDATE,DELETE') then
    raise exception 'authenticated must not have write grants on scout_code_lists';
  end if;

  if not has_table_privilege('authenticated', 'public.scout_code_values', 'SELECT') then
    raise exception 'authenticated should have SELECT grant on scout_code_values';
  end if;
  if has_table_privilege('authenticated', 'public.scout_code_values', 'INSERT,UPDATE,DELETE') then
    raise exception 'authenticated must not have write grants on scout_code_values';
  end if;

  if not has_table_privilege('authenticated', 'public.scout_field_codebook_map', 'SELECT') then
    raise exception 'authenticated should have SELECT grant on scout_field_codebook_map';
  end if;
  if has_table_privilege('authenticated', 'public.scout_field_codebook_map', 'INSERT,UPDATE,DELETE') then
    raise exception 'authenticated must not have write grants on scout_field_codebook_map';
  end if;

  if has_table_privilege('anon', 'public.scout_plays', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_plays';
  end if;
  if has_table_privilege('anon', 'public.scout_play_participations', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_play_participations';
  end if;
  if has_table_privilege('anon', 'public.scout_mental_events', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_mental_events';
  end if;
  if has_table_privilege('anon', 'public.scout_play_validations', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_play_validations';
  end if;
  if has_table_privilege('anon', 'public.athlete_scout_profiles', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on athlete_scout_profiles';
  end if;
  if has_table_privilege('anon', 'public.scout_catalog_teams', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_catalog_teams';
  end if;
  if has_table_privilege('anon', 'public.scout_code_lists', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_code_lists';
  end if;
  if has_table_privilege('anon', 'public.scout_code_values', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_code_values';
  end if;
  if has_table_privilege('anon', 'public.scout_field_codebook_map', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_field_codebook_map';
  end if;
end $$;

rollback;
