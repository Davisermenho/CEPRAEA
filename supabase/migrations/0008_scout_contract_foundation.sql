-- Scout contract foundation
-- Objetivo: abrir a base relacional normalizada do scout sem quebrar o runtime
-- legado (`scout_games` + `scout_events.payload`).
-- Esta migração NÃO ativa o scout novo no app; ela apenas cria os contratos-base.

create table if not exists public.scout_plays (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null,
  play_code text not null,
  session_date date not null,
  session_type text not null check (session_type in ('JOGO', 'TREINO', 'AMISTOSO', 'SIMULADO')),
  opponent_name text,
  period text not null,
  game_clock text not null,
  source text not null check (source in ('AO_VIVO', 'VIDEO', 'MISTA')),
  phase_of_ball text not null check (phase_of_ball in ('AT_POS', 'DEF_POS', 'TRANS_OF', 'TRANS_DEF')),
  attacking_team_side text not null,
  defending_team_side text not null,
  analyzed_team_phase text,
  offensive_system text,
  offensive_configuration text,
  special_offensive_role text,
  temporary_pivot_occupation text,
  temporary_pivot_athlete_id uuid,
  temporary_pivot_result text,
  defensive_system text,
  expected_defensive_action text,
  defensive_connection text,
  defensive_adjustment text,
  main_offensive_threat text,
  defensive_adjustment_result text,
  finish_type text,
  shot_destination text,
  shot_region text,
  factual_result text not null,
  play_points text,
  play_score_reason text,
  main_cause text,
  goalkeeper_initial_posture text,
  goalkeeper_reaction_form text,
  goalkeeper_decision text,
  goalkeeper_response text,
  goalkeeper_pass_quality text,
  goalkeeper_pass_type text,
  goalkeeper_game_vision text,
  transition_offensive_form text,
  transition_offensive_goal text,
  transition_defensive_form text,
  transition_defensive_goal text,
  out_situation text,
  numerical_structure_real text,
  offensive_system_adjusted_out text,
  defensive_adjustment_out text,
  priority_out_threat text,
  out_result text,
  out_cause text,
  special_context text,
  validation_status text not null default 'PENDENTE'
    check (validation_status in ('PENDENTE', 'REVISADO', 'CORRIGIDO', 'VALIDADO', 'DUVIDA')),
  video_ref text,
  free_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint scout_plays_game_team_fk
    foreign key (scout_game_id, team_id)
    references public.scout_games(id, team_id)
    on delete cascade,
  constraint scout_plays_temp_pivot_athlete_team_fk
    foreign key (temporary_pivot_athlete_id, team_id)
    references public.athletes(id, team_id)
    on delete set null,
  constraint scout_plays_id_team_id_key unique (id, team_id),
  constraint scout_plays_id_game_team_id_key unique (id, scout_game_id, team_id),
  constraint scout_plays_team_game_code_key unique (team_id, scout_game_id, play_code)
);

create table if not exists public.scout_play_participations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null,
  scout_play_id uuid not null,
  participant_scope text not null check (participant_scope in ('ATQ', 'DEF')),
  participant_side text not null check (participant_side in ('ANALYZED', 'OPPONENT')),
  slot_order smallint not null check (slot_order >= 1 and slot_order <= 8),
  athlete_id uuid,
  external_athlete_label text,
  phase_of_athlete text,
  participation_role text not null,
  position_code text,
  special_function_code text,
  action_code text,
  individual_result text,
  main_cause text,
  training_priority text,
  created_at timestamptz not null default now(),
  constraint scout_play_participations_play_team_fk
    foreign key (scout_play_id, scout_game_id, team_id)
    references public.scout_plays(id, scout_game_id, team_id)
    on delete cascade,
  constraint scout_play_participations_athlete_team_fk
    foreign key (athlete_id, team_id)
    references public.athletes(id, team_id)
    on delete set null,
  constraint scout_play_participations_identity_check
    check (
      athlete_id is not null
      or nullif(btrim(coalesce(external_athlete_label, '')), '') is not null
    ),
  constraint scout_play_participations_id_team_id_key unique (id, team_id),
  constraint scout_play_participations_slot_key unique (
    team_id,
    scout_play_id,
    participant_side,
    participant_scope,
    slot_order
  )
);

create table if not exists public.scout_mental_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null,
  scout_play_id uuid not null,
  athlete_id uuid,
  external_athlete_label text,
  mental_code text not null,
  mental_mark text not null,
  pressure_context text,
  mental_trigger text,
  response_after_error text,
  impact_previous_error text,
  pressure_behavior text,
  reset_quality text,
  critical_communication text,
  body_language text,
  pressure_profile_game text,
  error_sequence text,
  post_error_action text,
  mental_observation text,
  validation_status text not null default 'PENDENTE'
    check (validation_status in ('PENDENTE', 'REVISADO', 'CORRIGIDO', 'VALIDADO', 'DUVIDA')),
  created_at timestamptz not null default now(),
  constraint scout_mental_events_play_team_fk
    foreign key (scout_play_id, scout_game_id, team_id)
    references public.scout_plays(id, scout_game_id, team_id)
    on delete cascade,
  constraint scout_mental_events_athlete_team_fk
    foreign key (athlete_id, team_id)
    references public.athletes(id, team_id)
    on delete set null,
  constraint scout_mental_events_id_team_id_key unique (id, team_id)
);

create table if not exists public.scout_play_validations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null,
  scout_play_id uuid not null,
  field_name text not null,
  original_value text,
  corrected_value text,
  validation_status text not null
    check (validation_status in ('PENDENTE', 'REVISADO', 'CORRIGIDO', 'VALIDADO', 'DUVIDA')),
  validator_user_id uuid references public.profiles(id) on delete set null,
  validation_at timestamptz,
  correction_reason text not null,
  validation_notes text,
  created_at timestamptz not null default now(),
  constraint scout_play_validations_play_team_fk
    foreign key (scout_play_id, scout_game_id, team_id)
    references public.scout_plays(id, scout_game_id, team_id)
    on delete cascade,
  constraint scout_play_validations_id_team_id_key unique (id, team_id)
);

create table if not exists public.athlete_scout_profiles (
  athlete_id uuid primary key,
  team_id uuid not null references public.teams(id) on delete cascade,
  dominant_hand text,
  main_function text,
  pos_of_3x1 text,
  pos_of_4x0 text,
  pos_def_3x0 text,
  is_goalkeeper boolean not null default false,
  is_specialist boolean not null default false,
  is_playmaker boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_scout_profiles_athlete_team_fk
    foreign key (athlete_id, team_id)
    references public.athletes(id, team_id)
    on delete cascade,
  constraint athlete_scout_profiles_athlete_id_team_id_key unique (athlete_id, team_id)
);

create table if not exists public.scout_catalog_teams (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  team_type text,
  category text,
  is_internal boolean not null default false,
  linked_team_id uuid references public.teams(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scout_catalog_teams_id_team_id_key unique (id, team_id)
);

create index if not exists scout_plays_team_game_idx
  on public.scout_plays(team_id, scout_game_id, created_at);

create index if not exists scout_plays_validation_status_idx
  on public.scout_plays(team_id, validation_status);

create index if not exists scout_play_participations_play_idx
  on public.scout_play_participations(team_id, scout_play_id, participant_scope, participant_side);

create index if not exists scout_play_participations_athlete_idx
  on public.scout_play_participations(team_id, athlete_id)
  where athlete_id is not null;

create index if not exists scout_mental_events_play_idx
  on public.scout_mental_events(team_id, scout_play_id, created_at);

create index if not exists scout_mental_events_athlete_idx
  on public.scout_mental_events(team_id, athlete_id)
  where athlete_id is not null;

create index if not exists scout_play_validations_play_idx
  on public.scout_play_validations(team_id, scout_play_id, validation_status);

create index if not exists athlete_scout_profiles_team_idx
  on public.athlete_scout_profiles(team_id);

create index if not exists scout_catalog_teams_team_idx
  on public.scout_catalog_teams(team_id, name);

create trigger scout_plays_set_updated_at before update on public.scout_plays
  for each row execute function public.set_updated_at();

create trigger athlete_scout_profiles_set_updated_at before update on public.athlete_scout_profiles
  for each row execute function public.set_updated_at();

create trigger scout_catalog_teams_set_updated_at before update on public.scout_catalog_teams
  for each row execute function public.set_updated_at();

alter table public.scout_plays enable row level security;
alter table public.scout_play_participations enable row level security;
alter table public.scout_mental_events enable row level security;
alter table public.scout_play_validations enable row level security;
alter table public.athlete_scout_profiles enable row level security;
alter table public.scout_catalog_teams enable row level security;
