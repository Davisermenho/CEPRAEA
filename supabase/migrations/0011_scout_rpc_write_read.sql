-- Scout write/read RPCs for slice 1
-- Abre a primeira interface segura sobre scout_plays + scout_play_participations.

create or replace function public.scout_field_value_allowed(
  input_contract_name text,
  input_field_name text,
  input_code text,
  input_selector_key text default '*',
  input_selector_value text default '*'
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  with selected_map as (
    select
      m.list_key,
      m.allow_nao_aplica,
      m.allow_nao_observado
    from public.scout_field_codebook_map m
    where m.active = true
      and m.contract_name = input_contract_name
      and m.field_name = input_field_name
      and (
        (m.selector_key = input_selector_key and m.selector_value = input_selector_value)
        or (m.selector_key = '*' and m.selector_value = '*')
      )
    order by
      case
        when m.selector_key = input_selector_key and m.selector_value = input_selector_value then 0
        else 1
      end
    limit 1
  )
  select exists (
    select 1
    from selected_map m
    join public.scout_code_lists l
      on l.list_key = m.list_key
     and l.active = true
    join public.scout_code_values v
      on v.list_id = l.id
     and v.active = true
     and v.code = input_code
    where
      (not v.is_nao_aplica or m.allow_nao_aplica)
      and (not v.is_nao_observado or m.allow_nao_observado)
  );
$$;

create or replace function public.upsert_scout_play_bundle(
  input_team_id uuid,
  input_scout_game_id uuid,
  input_play jsonb,
  input_participations jsonb default '[]'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_play_id uuid;
  v_existing_play_id uuid;
  v_participation jsonb;
  v_play_code text;
  v_session_date date;
  v_session_type text;
  v_opponent_name text;
  v_period text;
  v_game_clock text;
  v_source text;
  v_phase_of_ball text;
  v_attacking_team_side text;
  v_defending_team_side text;
  v_analyzed_team_phase text;
  v_offensive_system text;
  v_offensive_configuration text;
  v_special_offensive_role text;
  v_temporary_pivot_occupation text;
  v_temporary_pivot_athlete_id uuid;
  v_temporary_pivot_result text;
  v_defensive_system text;
  v_expected_defensive_action text;
  v_defensive_connection text;
  v_defensive_adjustment text;
  v_main_offensive_threat text;
  v_defensive_adjustment_result text;
  v_finish_type text;
  v_shot_destination text;
  v_shot_region text;
  v_factual_result text;
  v_play_points text;
  v_play_score_reason text;
  v_main_cause text;
  v_video_ref text;
  v_free_notes text;
  v_count int := 0;
  p_scope text;
  p_side text;
  p_slot smallint;
  p_athlete_id uuid;
  p_external_label text;
  p_phase_of_athlete text;
  p_role text;
  p_position_code text;
  p_special_function_code text;
  p_action_code text;
  p_individual_result text;
  p_main_cause text;
  p_training_priority text;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  if not public.has_team_role(input_team_id, array['owner','coach']) then
    raise exception 'permission denied';
  end if;

  if jsonb_typeof(input_play) <> 'object' then
    raise exception 'invalid play payload';
  end if;

  if input_participations is null then
    input_participations := '[]'::jsonb;
  end if;

  if jsonb_typeof(input_participations) <> 'array' then
    raise exception 'invalid participations payload';
  end if;

  if not exists (
    select 1 from public.scout_games
    where id = input_scout_game_id
      and team_id = input_team_id
  ) then
    raise exception 'scout game not found';
  end if;

  v_existing_play_id := nullif(trim(coalesce(input_play->>'id', '')), '')::uuid;

  if v_existing_play_id is not null then
    select id into v_play_id
    from public.scout_plays
    where id = v_existing_play_id
      and team_id = input_team_id
      and scout_game_id = input_scout_game_id
      and deleted_at is null;

    if v_play_id is null then
      raise exception 'scout play not found';
    end if;
  else
    v_play_id := gen_random_uuid();
  end if;

  v_play_code := nullif(trim(coalesce(input_play->>'play_code', '')), '');
  v_session_date := nullif(trim(coalesce(input_play->>'session_date', '')), '')::date;
  v_session_type := nullif(trim(coalesce(input_play->>'session_type', '')), '');
  v_opponent_name := nullif(trim(coalesce(input_play->>'opponent_name', '')), '');
  v_period := nullif(trim(coalesce(input_play->>'period', '')), '');
  v_game_clock := nullif(trim(coalesce(input_play->>'game_clock', '')), '');
  v_source := nullif(trim(coalesce(input_play->>'source', '')), '');
  v_phase_of_ball := nullif(trim(coalesce(input_play->>'phase_of_ball', '')), '');
  v_attacking_team_side := nullif(trim(coalesce(input_play->>'attacking_team_side', '')), '');
  v_defending_team_side := nullif(trim(coalesce(input_play->>'defending_team_side', '')), '');
  v_analyzed_team_phase := nullif(trim(coalesce(input_play->>'analyzed_team_phase', '')), '');
  v_offensive_system := nullif(trim(coalesce(input_play->>'offensive_system', '')), '');
  v_offensive_configuration := nullif(trim(coalesce(input_play->>'offensive_configuration', '')), '');
  v_special_offensive_role := nullif(trim(coalesce(input_play->>'special_offensive_role', '')), '');
  v_temporary_pivot_occupation := nullif(trim(coalesce(input_play->>'temporary_pivot_occupation', '')), '');
  v_temporary_pivot_athlete_id := nullif(trim(coalesce(input_play->>'temporary_pivot_athlete_id', '')), '')::uuid;
  v_temporary_pivot_result := nullif(trim(coalesce(input_play->>'temporary_pivot_result', '')), '');
  v_defensive_system := nullif(trim(coalesce(input_play->>'defensive_system', '')), '');
  v_expected_defensive_action := nullif(trim(coalesce(input_play->>'expected_defensive_action', '')), '');
  v_defensive_connection := nullif(trim(coalesce(input_play->>'defensive_connection', '')), '');
  v_defensive_adjustment := nullif(trim(coalesce(input_play->>'defensive_adjustment', '')), '');
  v_main_offensive_threat := nullif(trim(coalesce(input_play->>'main_offensive_threat', '')), '');
  v_defensive_adjustment_result := nullif(trim(coalesce(input_play->>'defensive_adjustment_result', '')), '');
  v_finish_type := nullif(trim(coalesce(input_play->>'finish_type', '')), '');
  v_shot_destination := nullif(trim(coalesce(input_play->>'shot_destination', '')), '');
  v_shot_region := nullif(trim(coalesce(input_play->>'shot_region', '')), '');
  v_factual_result := nullif(trim(coalesce(input_play->>'factual_result', '')), '');
  v_play_points := nullif(trim(coalesce(input_play->>'play_points', '')), '');
  v_play_score_reason := nullif(trim(coalesce(input_play->>'play_score_reason', '')), '');
  v_main_cause := nullif(trim(coalesce(input_play->>'main_cause', '')), '');
  v_video_ref := nullif(trim(coalesce(input_play->>'video_ref', '')), '');
  v_free_notes := nullif(trim(coalesce(input_play->>'free_notes', '')), '');

  if v_play_code is null
    or v_session_date is null
    or v_session_type is null
    or v_period is null
    or v_game_clock is null
    or v_source is null
    or v_phase_of_ball is null
    or v_attacking_team_side is null
    or v_defending_team_side is null
    or v_factual_result is null
  then
    raise exception 'missing required scout play fields';
  end if;

  if not public.scout_field_value_allowed('scout_plays', 'phase_of_ball', v_phase_of_ball) then
    raise exception 'invalid phase_of_ball';
  end if;
  if v_offensive_system is not null
     and not public.scout_field_value_allowed('scout_plays', 'offensive_system', v_offensive_system) then
    raise exception 'invalid offensive_system';
  end if;
  if v_offensive_configuration is not null
     and not public.scout_field_value_allowed('scout_plays', 'offensive_configuration', v_offensive_configuration) then
    raise exception 'invalid offensive_configuration';
  end if;
  if v_defensive_system is not null
     and not public.scout_field_value_allowed('scout_plays', 'defensive_system', v_defensive_system) then
    raise exception 'invalid defensive_system';
  end if;
  if not public.scout_field_value_allowed('scout_plays', 'factual_result', v_factual_result) then
    raise exception 'invalid factual_result';
  end if;
  if v_main_cause is not null
     and not public.scout_field_value_allowed('scout_plays', 'main_cause', v_main_cause) then
    raise exception 'invalid main_cause';
  end if;

  insert into public.scout_plays (
    id,
    team_id,
    scout_game_id,
    play_code,
    session_date,
    session_type,
    opponent_name,
    period,
    game_clock,
    source,
    phase_of_ball,
    attacking_team_side,
    defending_team_side,
    analyzed_team_phase,
    offensive_system,
    offensive_configuration,
    special_offensive_role,
    temporary_pivot_occupation,
    temporary_pivot_athlete_id,
    temporary_pivot_result,
    defensive_system,
    expected_defensive_action,
    defensive_connection,
    defensive_adjustment,
    main_offensive_threat,
    defensive_adjustment_result,
    finish_type,
    shot_destination,
    shot_region,
    factual_result,
    play_points,
    play_score_reason,
    main_cause,
    video_ref,
    free_notes
  ) values (
    v_play_id,
    input_team_id,
    input_scout_game_id,
    v_play_code,
    v_session_date,
    v_session_type,
    v_opponent_name,
    v_period,
    v_game_clock,
    v_source,
    v_phase_of_ball,
    v_attacking_team_side,
    v_defending_team_side,
    v_analyzed_team_phase,
    v_offensive_system,
    v_offensive_configuration,
    v_special_offensive_role,
    v_temporary_pivot_occupation,
    v_temporary_pivot_athlete_id,
    v_temporary_pivot_result,
    v_defensive_system,
    v_expected_defensive_action,
    v_defensive_connection,
    v_defensive_adjustment,
    v_main_offensive_threat,
    v_defensive_adjustment_result,
    v_finish_type,
    v_shot_destination,
    v_shot_region,
    v_factual_result,
    v_play_points,
    v_play_score_reason,
    v_main_cause,
    v_video_ref,
    v_free_notes
  )
  on conflict (id) do update
  set play_code = excluded.play_code,
      session_date = excluded.session_date,
      session_type = excluded.session_type,
      opponent_name = excluded.opponent_name,
      period = excluded.period,
      game_clock = excluded.game_clock,
      source = excluded.source,
      phase_of_ball = excluded.phase_of_ball,
      attacking_team_side = excluded.attacking_team_side,
      defending_team_side = excluded.defending_team_side,
      analyzed_team_phase = excluded.analyzed_team_phase,
      offensive_system = excluded.offensive_system,
      offensive_configuration = excluded.offensive_configuration,
      special_offensive_role = excluded.special_offensive_role,
      temporary_pivot_occupation = excluded.temporary_pivot_occupation,
      temporary_pivot_athlete_id = excluded.temporary_pivot_athlete_id,
      temporary_pivot_result = excluded.temporary_pivot_result,
      defensive_system = excluded.defensive_system,
      expected_defensive_action = excluded.expected_defensive_action,
      defensive_connection = excluded.defensive_connection,
      defensive_adjustment = excluded.defensive_adjustment,
      main_offensive_threat = excluded.main_offensive_threat,
      defensive_adjustment_result = excluded.defensive_adjustment_result,
      finish_type = excluded.finish_type,
      shot_destination = excluded.shot_destination,
      shot_region = excluded.shot_region,
      factual_result = excluded.factual_result,
      play_points = excluded.play_points,
      play_score_reason = excluded.play_score_reason,
      main_cause = excluded.main_cause,
      video_ref = excluded.video_ref,
      free_notes = excluded.free_notes,
      deleted_at = null,
      updated_at = now();

  delete from public.scout_play_participations
  where team_id = input_team_id
    and scout_game_id = input_scout_game_id
    and scout_play_id = v_play_id;

  for v_participation in
    select value
    from jsonb_array_elements(input_participations)
  loop
    if jsonb_typeof(v_participation) <> 'object' then
      raise exception 'invalid participation payload';
    end if;

    p_scope := nullif(trim(coalesce(v_participation->>'participant_scope', '')), '');
    p_side := nullif(trim(coalesce(v_participation->>'participant_side', '')), '');
    p_slot := nullif(trim(coalesce(v_participation->>'slot_order', '')), '')::smallint;
    p_athlete_id := nullif(trim(coalesce(v_participation->>'athlete_id', '')), '')::uuid;
    p_external_label := nullif(trim(coalesce(v_participation->>'external_athlete_label', '')), '');
    p_phase_of_athlete := nullif(trim(coalesce(v_participation->>'phase_of_athlete', '')), '');
    p_role := nullif(trim(coalesce(v_participation->>'participation_role', '')), '');
    p_position_code := nullif(trim(coalesce(v_participation->>'position_code', '')), '');
    p_special_function_code := nullif(trim(coalesce(v_participation->>'special_function_code', '')), '');
    p_action_code := nullif(trim(coalesce(v_participation->>'action_code', '')), '');
    p_individual_result := nullif(trim(coalesce(v_participation->>'individual_result', '')), '');
    p_main_cause := nullif(trim(coalesce(v_participation->>'main_cause', '')), '');
    p_training_priority := nullif(trim(coalesce(v_participation->>'training_priority', '')), '');

    if p_scope is null or p_side is null or p_slot is null or p_role is null then
      raise exception 'missing required participation fields';
    end if;

    if p_phase_of_athlete is not null
       and not public.scout_field_value_allowed('scout_play_participations', 'phase_of_athlete', p_phase_of_athlete) then
      raise exception 'invalid phase_of_athlete';
    end if;
    if p_action_code is not null
       and not public.scout_field_value_allowed(
         'scout_play_participations',
         'action_code',
         p_action_code,
         'participant_scope',
         p_scope
       ) then
      raise exception 'invalid action_code';
    end if;
    if p_main_cause is not null
       and not public.scout_field_value_allowed('scout_play_participations', 'main_cause', p_main_cause) then
      raise exception 'invalid participation main_cause';
    end if;
    if p_training_priority is not null
       and not public.scout_field_value_allowed('scout_play_participations', 'training_priority', p_training_priority) then
      raise exception 'invalid training_priority';
    end if;

    insert into public.scout_play_participations (
      team_id,
      scout_game_id,
      scout_play_id,
      participant_scope,
      participant_side,
      slot_order,
      athlete_id,
      external_athlete_label,
      phase_of_athlete,
      participation_role,
      position_code,
      special_function_code,
      action_code,
      individual_result,
      main_cause,
      training_priority
    ) values (
      input_team_id,
      input_scout_game_id,
      v_play_id,
      p_scope,
      p_side,
      p_slot,
      p_athlete_id,
      p_external_label,
      p_phase_of_athlete,
      p_role,
      p_position_code,
      p_special_function_code,
      p_action_code,
      p_individual_result,
      p_main_cause,
      p_training_priority
    );

    v_count := v_count + 1;
  end loop;

  perform public.write_audit_log(
    input_team_id,
    auth.uid(),
    'coach',
    'scout_plays',
    v_play_id,
    'upsert_scout_play_bundle',
    jsonb_build_object(
      'scout_game_id', input_scout_game_id,
      'play_code', v_play_code,
      'participation_count', v_count
    )
  );

  return v_play_id;
end;
$$;

create or replace function public.get_scout_play_bundle(
  input_team_id uuid,
  input_scout_play_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if auth.uid() is null then
    raise exception 'permission denied';
  end if;

  if not public.is_team_member(input_team_id) then
    raise exception 'permission denied';
  end if;

  select jsonb_build_object(
    'play', to_jsonb(p),
    'participations', coalesce(
      (
        select jsonb_agg(to_jsonb(pp) order by pp.participant_scope, pp.participant_side, pp.slot_order)
        from public.scout_play_participations pp
        where pp.team_id = p.team_id
          and pp.scout_game_id = p.scout_game_id
          and pp.scout_play_id = p.id
      ),
      '[]'::jsonb
    )
  )
  into result
  from public.scout_plays p
  where p.id = input_scout_play_id
    and p.team_id = input_team_id
    and p.deleted_at is null;

  if result is null then
    raise exception 'scout play not found';
  end if;

  return result;
end;
$$;

revoke execute on function public.scout_field_value_allowed(text, text, text, text, text) from public;
revoke execute on function public.scout_field_value_allowed(text, text, text, text, text) from anon;
revoke execute on function public.scout_field_value_allowed(text, text, text, text, text) from authenticated;

revoke execute on function public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb) from public;
revoke execute on function public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb) from anon;
revoke execute on function public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb) from authenticated;

revoke execute on function public.get_scout_play_bundle(uuid, uuid) from public;
revoke execute on function public.get_scout_play_bundle(uuid, uuid) from anon;
revoke execute on function public.get_scout_play_bundle(uuid, uuid) from authenticated;

grant execute on function public.upsert_scout_play_bundle(uuid, uuid, jsonb, jsonb) to authenticated;
grant execute on function public.get_scout_play_bundle(uuid, uuid) to authenticated;
