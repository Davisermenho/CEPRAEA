-- Scout — Relatório, Feedback e Dashboard
-- DB-08: scout_report (10 campos), scout_feedback (12 campos), scout_dashboard (6 campos)
-- Derivadas exclusivamente de dados com STATUS_VALIDACAO = VALIDADO.
-- Rastreabilidade: team_id × scout_game_id × id_jogada.
-- SSOT: Manual Oficial do Scout v1.0.1 §3.1, §20, §21.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. scout_report — RELATORIO (10 campos oficiais)
--    Saída técnica agregada por jogo/sessão. Uma linha por indicador por bloco.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scout_report (
  id                uuid        primary key default gen_random_uuid(),
  team_id           uuid        not null references public.teams(id) on delete cascade,
  scout_game_id     uuid        not null,

  -- 10 campos oficiais (Manual §20)
  report_block      text        not null,   -- BLOCO_RELATORIO (ex: ATAQUE_POS, DEFESA_POS, GOLEIRA)
  indicator         text        not null,   -- INDICADOR (ex: TAXA_GOL_AT_POS)
  value_text        text,                   -- VALOR (serializado como texto para suportar %, ratio e label)
  sample_size       int,                    -- AMOSTRA (n de sequências que compõem o indicador)
  technical_reading text,                   -- LEITURA_TECNICA (interpretação em linguagem de treino)
  training_priority text
    check (training_priority is null or
           training_priority in ('ALTA', 'MEDIA', 'BAIXA', 'MANTER')),
                                            -- PRIORIDADE_TREINO
  evidence_ids      text[],                 -- IDS_EVIDENCIA (array de play_code / id de scout_live_entries)
  report_notes      text,                   -- OBS_RELATORIO

  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  -- FK composta garante que o relatório pertence ao jogo certo dentro do time
  constraint scout_report_game_team_fk
    foreign key (scout_game_id, team_id)
    references public.scout_games(id, team_id)
    on delete cascade,

  constraint scout_report_id_team_id_key unique (id, team_id),

  -- Um indicador por bloco por jogo (upsertável)
  constraint scout_report_team_game_block_indicator_key
    unique (team_id, scout_game_id, report_block, indicator)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. scout_feedback — FEEDBACK (12 campos oficiais)
--    Devolutivas individuais/setoriais/coletivas derivadas de evidência validada.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scout_feedback (
  id                  uuid        primary key default gen_random_uuid(),
  team_id             uuid        not null references public.teams(id) on delete cascade,
  scout_game_id       uuid        not null,
  scout_live_entry_id uuid,       -- ID_JOGADA → vínculo com COLETA_AO_VIVO (nullable para feedback setorial/coletivo)

  -- 12 campos oficiais (Manual §21)
  recipient           text        not null
    check (recipient in (
      'ATLETA', 'SETOR_OFENSIVO', 'SETOR_DEFENSIVO',
      'GOLEIRA', 'BLOCO_TRANSICAO', 'EQUIPE', 'COMISSAO'
    )),                                     -- DESTINATARIO_FEEDBACK
  athlete_id          uuid,                 -- ATLETA_FEEDBACK (nullable: feedback setorial/coletivo não tem atleta)
  feedback_type       text        not null
    check (feedback_type in (
      'CORRECAO', 'REFORCO', 'ALERTA', 'ELOGIO_TECNICO',
      'AJUSTE_TATICO', 'ORIENTACAO_TREINO', 'REVISAO_VIDEO'
    )),                                     -- TIPO_FEEDBACK
  feedback_topic      text        not null, -- TEMA_FEEDBACK
  evidence_ref        text        not null, -- EVIDENCIA_FEEDBACK (obrigatória — Manual §21.2 regra 1)
  message             text        not null, -- MENSAGEM_FEEDBACK
  recommended_action  text,                 -- ACAO_RECOMENDADA
  priority            text        not null
    check (priority in ('ALTA', 'MEDIA', 'BAIXA', 'MANTER')),
                                            -- PRIORIDADE_FEEDBACK
  feedback_status     text        not null default 'PENDENTE'
    check (feedback_status in ('PENDENTE', 'ENTREGUE', 'APLICADO')),
                                            -- STATUS_FEEDBACK

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  -- FKs compostas (team_id como segunda âncora em todas)
  constraint scout_feedback_game_team_fk
    foreign key (scout_game_id, team_id)
    references public.scout_games(id, team_id)
    on delete cascade,

  constraint scout_feedback_live_entry_fk
    foreign key (scout_live_entry_id, team_id)
    references public.scout_live_entries(id, team_id)
    on delete set null,

  constraint scout_feedback_athlete_team_fk
    foreign key (athlete_id, team_id)
    references public.athletes(id, team_id)
    on delete set null,

  constraint scout_feedback_id_team_id_key unique (id, team_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. scout_dashboard — DASHBOARD (6 campos oficiais)
--    Leitura executiva derivada. Somente dados VALIDADOS; não corrige dado ruim.
-- ─────────────────────────────────────────────────────────────────────────────
create table if not exists public.scout_dashboard (
  id              uuid        primary key default gen_random_uuid(),
  team_id         uuid        not null references public.teams(id) on delete cascade,
  scout_game_id   uuid        not null,

  -- 6 campos oficiais (Manual §3.1)
  indicator       text        not null,   -- INDICADOR (nome da métrica executiva)
  current_value   text,                   -- VALOR_ATUAL (valor calculado do relatório)
  meta_reference  text,                   -- META_REFERENCIA (referência comparativa)
  dash_status     text,                   -- STATUS (ex: OK, ALERTA, CRITICO)
  obs             text,                   -- OBS

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  constraint scout_dashboard_game_team_fk
    foreign key (scout_game_id, team_id)
    references public.scout_games(id, team_id)
    on delete cascade,

  constraint scout_dashboard_id_team_id_key unique (id, team_id),

  -- Um indicador por jogo (upsertável via ON CONFLICT)
  constraint scout_dashboard_team_game_indicator_key
    unique (team_id, scout_game_id, indicator)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Triggers de updated_at
-- ─────────────────────────────────────────────────────────────────────────────
drop trigger if exists scout_report_set_updated_at    on public.scout_report;
create trigger scout_report_set_updated_at
  before update on public.scout_report
  for each row execute function public.set_updated_at();

drop trigger if exists scout_feedback_set_updated_at  on public.scout_feedback;
create trigger scout_feedback_set_updated_at
  before update on public.scout_feedback
  for each row execute function public.set_updated_at();

drop trigger if exists scout_dashboard_set_updated_at on public.scout_dashboard;
create trigger scout_dashboard_set_updated_at
  before update on public.scout_dashboard
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. RLS — habilitar + grants + policies (member read / coach write)
-- ─────────────────────────────────────────────────────────────────────────────
alter table public.scout_report    enable row level security;
alter table public.scout_feedback  enable row level security;
alter table public.scout_dashboard enable row level security;

revoke all on table public.scout_report    from public;
revoke all on table public.scout_feedback  from public;
revoke all on table public.scout_dashboard from public;

revoke all on table public.scout_report    from anon;
revoke all on table public.scout_feedback  from anon;
revoke all on table public.scout_dashboard from anon;

revoke all on table public.scout_report    from authenticated;
revoke all on table public.scout_feedback  from authenticated;
revoke all on table public.scout_dashboard from authenticated;

grant select, insert, update, delete on table public.scout_report    to authenticated;
grant select, insert, update, delete on table public.scout_feedback  to authenticated;
grant select, insert, update, delete on table public.scout_dashboard to authenticated;

-- scout_report
drop policy if exists scout_report_select_member on public.scout_report;
create policy scout_report_select_member
  on public.scout_report for select to authenticated
  using (public.is_team_member(team_id));

drop policy if exists scout_report_write_coach on public.scout_report;
create policy scout_report_write_coach
  on public.scout_report for all to authenticated
  using  (public.has_team_role(team_id, array['owner', 'coach']))
  with check (public.has_team_role(team_id, array['owner', 'coach']));

-- scout_feedback
drop policy if exists scout_feedback_select_member on public.scout_feedback;
create policy scout_feedback_select_member
  on public.scout_feedback for select to authenticated
  using (public.is_team_member(team_id));

drop policy if exists scout_feedback_write_coach on public.scout_feedback;
create policy scout_feedback_write_coach
  on public.scout_feedback for all to authenticated
  using  (public.has_team_role(team_id, array['owner', 'coach']))
  with check (public.has_team_role(team_id, array['owner', 'coach']));

-- scout_dashboard
drop policy if exists scout_dashboard_select_member on public.scout_dashboard;
create policy scout_dashboard_select_member
  on public.scout_dashboard for select to authenticated
  using (public.is_team_member(team_id));

drop policy if exists scout_dashboard_write_coach on public.scout_dashboard;
create policy scout_dashboard_write_coach
  on public.scout_dashboard for all to authenticated
  using  (public.has_team_role(team_id, array['owner', 'coach']))
  with check (public.has_team_role(team_id, array['owner', 'coach']));
