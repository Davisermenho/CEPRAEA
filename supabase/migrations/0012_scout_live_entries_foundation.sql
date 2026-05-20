-- Scout live entries foundation
-- Objetivo: abrir uma camada própria de persistência para COLETA_AO_VIVO,
-- preservando a semântica de captura rápida sem forçar normalização precoce
-- em scout_plays + scout_play_participations.

create table if not exists public.scout_live_entries (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  scout_game_id uuid not null,
  id_jogada text not null
    check (nullif(btrim(id_jogada), '') is not null),
  tempo_jogo text not null
    check (nullif(btrim(tempo_jogo), '') is not null),
  fase_da_bola_code text not null
    check (fase_da_bola_code in ('AT_POS', 'DEF_POS', 'TRANS_OF', 'TRANS_DEF')),
  equipe_analisada_id uuid not null references public.teams(id) on delete restrict,
  fase_equipe_analisada_code text not null
    check (fase_equipe_analisada_code in ('ATAQUE', 'DEFESA', 'TRANS_OF', 'TRANS_DEF', 'TROCA', 'NAO_OBSERVADO')),
  sistema_ofensivo_code text,
  sistema_defensivo_code text,
  atleta_principal_id uuid,
  acao_principal_text text
    check (acao_principal_text is null or nullif(btrim(acao_principal_text), '') is not null),
  acao_principal_suggestion_code text,
  acao_principal_is_custom boolean default false,
  tipo_finalizacao_code text
    check (
      tipo_finalizacao_code is null
      or tipo_finalizacao_code in ('SIMPLES', 'GIRO', 'AEREA', 'ESPECIALISTA', 'GOLEIRA', '6M', 'SHOOTOUT', 'NAO_OBSERVADO')
    ),
  resultado_factual_code text not null
    check (resultado_factual_code in ('GOL', 'DEFENDIDO', 'BLOQUEADO', 'FORA', 'TRAVE', 'VIOLACAO', 'PERDA', 'NAO_OBSERVADO')),
  pontos_jogada smallint
    check (pontos_jogada is null or pontos_jogada in (0, 1, 2)),
  causa_provavel_code text,
  prioridade_treino_code text,
  video_ref text,
  status_validacao_code text not null default 'PENDENTE'
    check (status_validacao_code in ('PENDENTE', 'REVISADO', 'CORRIGIDO', 'VALIDADO', 'DUVIDA')),
  obs_geral text,
  derived_scout_play_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint scout_live_entries_game_team_fk
    foreign key (scout_game_id, team_id)
    references public.scout_games(id, team_id)
    on delete cascade,
  constraint scout_live_entries_main_athlete_team_fk
    foreign key (atleta_principal_id, team_id)
    references public.athletes(id, team_id)
    on delete set null,
  constraint scout_live_entries_derived_play_team_fk
    foreign key (derived_scout_play_id, team_id)
    references public.scout_plays(id, team_id)
    on delete set null,
  constraint scout_live_entries_id_team_id_key unique (id, team_id),
  constraint scout_live_entries_team_game_code_key unique (team_id, scout_game_id, id_jogada)
);

create index if not exists scout_live_entries_team_game_idx
  on public.scout_live_entries(team_id, scout_game_id, created_at);

create index if not exists scout_live_entries_validation_status_idx
  on public.scout_live_entries(team_id, status_validacao_code);

create index if not exists scout_live_entries_main_athlete_idx
  on public.scout_live_entries(team_id, atleta_principal_id)
  where atleta_principal_id is not null;

create index if not exists scout_live_entries_derived_play_idx
  on public.scout_live_entries(team_id, derived_scout_play_id)
  where derived_scout_play_id is not null;

drop trigger if exists scout_live_entries_set_updated_at on public.scout_live_entries;
create trigger scout_live_entries_set_updated_at before update on public.scout_live_entries
  for each row execute function public.set_updated_at();

alter table public.scout_live_entries enable row level security;
