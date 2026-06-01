-- CEPR-MVP-PR-A — Plano de treino do dia (Fluxo I do PRD).
-- Cria training_plans (1:1 com trainings), training_plan_blocks (1:N) e
-- training_plan_exercises (1:N). RLS:
--   • coach/owner do team: leitura/escrita;
--   • viewer e atleta ativa do team: leitura.
-- Coluna training_plan_exercises.goal_id é nullable; FK adicionada em PR-B.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. training_plans
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.training_plans (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  training_id uuid not null references public.trainings(id) on delete cascade,
  objetivo_principal text,
  observacoes text,
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(training_id) -- um plano por treino
);

create index if not exists training_plans_team_idx
  on public.training_plans(team_id) where deleted_at is null;

create trigger training_plans_set_updated_at
  before update on public.training_plans
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. training_plan_blocks
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.training_plan_blocks (
  id uuid primary key default gen_random_uuid(),
  training_plan_id uuid not null references public.training_plans(id) on delete cascade,
  ordem integer not null default 0,
  objetivo_especifico text,
  observacoes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_plan_blocks_plan_idx
  on public.training_plan_blocks(training_plan_id, ordem);

create trigger training_plan_blocks_set_updated_at
  before update on public.training_plan_blocks
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. training_plan_exercises
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.training_plan_exercises (
  id uuid primary key default gen_random_uuid(),
  training_plan_block_id uuid not null references public.training_plan_blocks(id) on delete cascade,
  ordem integer not null default 0,
  descricao text not null,
  observacoes text,
  goal_id uuid, -- FK adicionada em PR-B (0045_goals.sql)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_plan_exercises_block_idx
  on public.training_plan_exercises(training_plan_block_id, ordem);

create trigger training_plan_exercises_set_updated_at
  before update on public.training_plan_exercises
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Helpers de RLS
-- ─────────────────────────────────────────────────────────────────────────────

-- Retorna o team_id de um plano (usado em policies de blocks/exercises).
create or replace function public.training_plan_team_id(p_plan_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select team_id from public.training_plans where id = p_plan_id;
$$;

create or replace function public.training_plan_block_team_id(p_block_id uuid)
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tp.team_id
  from public.training_plan_blocks b
  join public.training_plans tp on tp.id = b.training_plan_id
  where b.id = p_block_id;
$$;

revoke all on function public.training_plan_team_id(uuid) from public, anon, authenticated;
revoke all on function public.training_plan_block_team_id(uuid) from public, anon, authenticated;
grant execute on function public.training_plan_team_id(uuid) to authenticated;
grant execute on function public.training_plan_block_team_id(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.training_plans enable row level security;
alter table public.training_plan_blocks enable row level security;
alter table public.training_plan_exercises enable row level security;

-- training_plans: SELECT (team member OR atleta ativa do team)
create policy training_plans_select_team_or_athlete
  on public.training_plans for select to authenticated
  using (
    public.is_team_member(team_id)
    or team_id = public.get_athlete_team_id()
  );

create policy training_plans_insert_coach
  on public.training_plans for insert to authenticated
  with check (public.has_team_role(team_id, array['owner','coach']));

create policy training_plans_update_coach
  on public.training_plans for update to authenticated
  using (public.has_team_role(team_id, array['owner','coach']))
  with check (public.has_team_role(team_id, array['owner','coach']));

create policy training_plans_delete_coach
  on public.training_plans for delete to authenticated
  using (public.has_team_role(team_id, array['owner','coach']));

-- training_plan_blocks
create policy training_plan_blocks_select_team_or_athlete
  on public.training_plan_blocks for select to authenticated
  using (
    exists (
      select 1 from public.training_plans tp
      where tp.id = training_plan_id
        and (
          public.is_team_member(tp.team_id)
          or tp.team_id = public.get_athlete_team_id()
        )
    )
  );

create policy training_plan_blocks_insert_coach
  on public.training_plan_blocks for insert to authenticated
  with check (
    public.has_team_role(public.training_plan_team_id(training_plan_id), array['owner','coach'])
  );

create policy training_plan_blocks_update_coach
  on public.training_plan_blocks for update to authenticated
  using (
    public.has_team_role(public.training_plan_team_id(training_plan_id), array['owner','coach'])
  )
  with check (
    public.has_team_role(public.training_plan_team_id(training_plan_id), array['owner','coach'])
  );

create policy training_plan_blocks_delete_coach
  on public.training_plan_blocks for delete to authenticated
  using (
    public.has_team_role(public.training_plan_team_id(training_plan_id), array['owner','coach'])
  );

-- training_plan_exercises
create policy training_plan_exercises_select_team_or_athlete
  on public.training_plan_exercises for select to authenticated
  using (
    exists (
      select 1
      from public.training_plan_blocks b
      join public.training_plans tp on tp.id = b.training_plan_id
      where b.id = training_plan_block_id
        and (
          public.is_team_member(tp.team_id)
          or tp.team_id = public.get_athlete_team_id()
        )
    )
  );

create policy training_plan_exercises_insert_coach
  on public.training_plan_exercises for insert to authenticated
  with check (
    public.has_team_role(public.training_plan_block_team_id(training_plan_block_id), array['owner','coach'])
  );

create policy training_plan_exercises_update_coach
  on public.training_plan_exercises for update to authenticated
  using (
    public.has_team_role(public.training_plan_block_team_id(training_plan_block_id), array['owner','coach'])
  )
  with check (
    public.has_team_role(public.training_plan_block_team_id(training_plan_block_id), array['owner','coach'])
  );

create policy training_plan_exercises_delete_coach
  on public.training_plan_exercises for delete to authenticated
  using (
    public.has_team_role(public.training_plan_block_team_id(training_plan_block_id), array['owner','coach'])
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Grants
-- ─────────────────────────────────────────────────────────────────────────────
grant select, insert, update, delete on public.training_plans to authenticated;
grant select, insert, update, delete on public.training_plan_blocks to authenticated;
grant select, insert, update, delete on public.training_plan_exercises to authenticated;
