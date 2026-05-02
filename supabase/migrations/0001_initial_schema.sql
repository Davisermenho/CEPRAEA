-- CEPRAEA Supabase foundation schema
-- Escopo: banco central, constraints e tabelas-base. Não migra stores operacionais.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'coach', 'viewer')),
  created_at timestamptz not null default now(),
  unique(team_id, user_id)
);

create table if not exists public.athletes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text not null,
  phone text,
  category text,
  level text,
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table if not exists public.training_series (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  name text,
  start_date date,
  end_date date,
  days_of_week int[] not null default '{}',
  start_time time,
  end_time time,
  timezone text not null default 'America/Sao_Paulo',
  location text,
  created_at timestamptz not null default now(),
  constraint training_series_days_of_week_valid check (
    not exists (select 1 from unnest(days_of_week) as d where d < 0 or d > 6)
  )
);

create table if not exists public.trainings (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  series_id uuid references public.training_series(id) on delete set null,
  type text not null check (type in ('recorrente', 'extra')),
  status text not null default 'agendado' check (status in ('agendado', 'realizado', 'cancelado')),
  training_date date not null,
  start_time time not null,
  end_time time not null,
  timezone text not null default 'America/Sao_Paulo',
  starts_at timestamptz not null,
  presence_lock_at timestamptz,
  location text,
  notes text,
  holiday_origin text,
  created_manually boolean not null default false,
  generation_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(team_id, generation_key)
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  training_id uuid not null references public.trainings(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  status text not null default 'pendente' check (status in ('presente', 'ausente', 'justificado', 'pendente')),
  justification text,
  confirmed_by_athlete boolean not null default false,
  registered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(training_id, athlete_id)
);

create table if not exists public.presence_token_batches (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  training_id uuid not null references public.trainings(id) on delete cascade,
  created_by uuid references public.profiles(id),
  status text not null default 'created' check (status in ('created', 'exported', 'revoked', 'expired')),
  created_at timestamptz not null default now(),
  exported_at timestamptz,
  revoked_at timestamptz,
  expired_at timestamptz
);

create unique index if not exists presence_token_batches_one_active_per_training
  on public.presence_token_batches(team_id, training_id)
  where status in ('created', 'exported') and revoked_at is null;

create table if not exists public.presence_tokens (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  batch_id uuid not null references public.presence_token_batches(id) on delete cascade,
  training_id uuid not null references public.trainings(id) on delete cascade,
  athlete_id uuid not null references public.athletes(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  first_used_at timestamptz,
  last_used_at timestamptz,
  use_count int not null default 0 check (use_count >= 0),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

create table if not exists public.scout_games (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  game_date date,
  analyzed_team text,
  opponent text,
  location text,
  notes text,
  status text not null default 'em_andamento' check (status in ('em_andamento', 'finalizado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scout_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null references public.scout_games(id) on delete cascade,
  event_time text,
  set_label text,
  payload jsonb not null,
  payload_version int not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  actor_user_id uuid references public.profiles(id),
  actor_type text not null check (actor_type in ('coach', 'athlete_token', 'system')),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists athletes_team_status_idx on public.athletes(team_id, status) where deleted_at is null;
create index if not exists trainings_team_date_idx on public.trainings(team_id, training_date) where deleted_at is null;
create index if not exists attendance_team_training_idx on public.attendance_records(team_id, training_id);
create index if not exists presence_tokens_hash_idx on public.presence_tokens(token_hash);
create index if not exists scout_events_team_game_idx on public.scout_events(team_id, scout_game_id);
create index if not exists scout_events_payload_gin_idx on public.scout_events using gin(payload);
create index if not exists audit_logs_team_entity_idx on public.audit_logs(team_id, entity_type, entity_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger teams_set_updated_at before update on public.teams
  for each row execute function public.set_updated_at();
create trigger athletes_set_updated_at before update on public.athletes
  for each row execute function public.set_updated_at();
create trigger trainings_set_updated_at before update on public.trainings
  for each row execute function public.set_updated_at();
create trigger attendance_records_set_updated_at before update on public.attendance_records
  for each row execute function public.set_updated_at();
create trigger scout_games_set_updated_at before update on public.scout_games
  for each row execute function public.set_updated_at();
