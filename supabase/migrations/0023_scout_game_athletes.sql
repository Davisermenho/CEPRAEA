-- Migration 0023: elenco por sessão de scout (scout_game_athletes)
-- FKs compostas: scout_games_id_team_id_key e athletes_id_team_id_key já existem (verificado)

CREATE TABLE IF NOT EXISTS public.scout_game_athletes (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       uuid        NOT NULL,
  scout_game_id uuid        NOT NULL,
  athlete_id    uuid        NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_sga_game
    FOREIGN KEY (scout_game_id, team_id)
    REFERENCES public.scout_games(id, team_id) ON DELETE CASCADE,
  CONSTRAINT fk_sga_athlete
    FOREIGN KEY (athlete_id, team_id)
    REFERENCES public.athletes(id, team_id) ON DELETE CASCADE,
  CONSTRAINT uq_sga
    UNIQUE (scout_game_id, athlete_id)
);

ALTER TABLE public.scout_game_athletes ENABLE ROW LEVEL SECURITY;

-- Leitura: membros da equipe
CREATE POLICY sga_select ON public.scout_game_athletes
  FOR SELECT TO authenticated USING (public.is_team_member(team_id));

-- Escrita: owner ou coach apenas (padrão de migration 0010)
CREATE POLICY sga_insert ON public.scout_game_athletes
  FOR INSERT TO authenticated WITH CHECK (public.has_team_role(team_id, ARRAY['owner','coach']));

CREATE POLICY sga_delete ON public.scout_game_athletes
  FOR DELETE TO authenticated USING (public.has_team_role(team_id, ARRAY['owner','coach']));

GRANT SELECT, INSERT, DELETE ON public.scout_game_athletes TO authenticated;

CREATE INDEX IF NOT EXISTS scout_game_athletes_game_idx
  ON public.scout_game_athletes (scout_game_id, team_id);
