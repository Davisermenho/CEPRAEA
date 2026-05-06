-- ─── 0006: Athlete Supabase Auth ─────────────────────────────────────────────
-- Links athletes to Supabase Auth users via email+password.
-- Adds email and user_id columns, a helper RPC, and RLS policies so that
-- authenticated athletes can read their team's data and manage their own
-- attendance without touching any coach-only tables.

-- ── Schema ────────────────────────────────────────────────────────────────────

ALTER TABLE public.athletes
  ADD COLUMN IF NOT EXISTS email      text,
  ADD COLUMN IF NOT EXISTS user_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- One Supabase auth user per athlete (nullable for pre-registered athletes)
CREATE UNIQUE INDEX IF NOT EXISTS athletes_user_id_key
  ON public.athletes(user_id)
  WHERE user_id IS NOT NULL;

-- Case-insensitive unique email per team (pre-registration uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS athletes_team_email_key
  ON public.athletes(team_id, lower(email))
  WHERE email IS NOT NULL AND deleted_at IS NULL;

-- ── Helper ────────────────────────────────────────────────────────────────────

-- Returns the team_id for the currently authenticated athlete.
-- Used inside RLS policies to avoid repeated subqueries.
CREATE OR REPLACE FUNCTION public.get_athlete_team_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT team_id
  FROM   public.athletes
  WHERE  user_id    = auth.uid()
    AND  deleted_at IS NULL
    AND  status     = 'ativo'
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_athlete_team_id() TO authenticated;

-- ── RLS: athletes table ───────────────────────────────────────────────────────

-- Athlete reads their own record (already linked)
CREATE POLICY "athlete_select_own_record" ON public.athletes
  FOR SELECT
  USING (user_id = auth.uid());

-- Athlete reads a matching-email record with no user_id yet (first-login linking)
CREATE POLICY "athlete_select_by_email_for_linking" ON public.athletes
  FOR SELECT
  USING (
    user_id    IS NULL
    AND lower(email) = lower(auth.jwt() ->> 'email')
    AND deleted_at   IS NULL
  );

-- Athlete claims the record by writing their user_id (one-time operation)
CREATE POLICY "athlete_link_user_id" ON public.athletes
  FOR UPDATE
  USING (
    user_id    IS NULL
    AND lower(email) = lower(auth.jwt() ->> 'email')
    AND deleted_at   IS NULL
  )
  WITH CHECK (user_id = auth.uid());

-- Athlete lists all active teammates (to see who's coming to a training session)
CREATE POLICY "athlete_select_team_athletes" ON public.athletes
  FOR SELECT
  USING (
    team_id    = public.get_athlete_team_id()
    AND deleted_at IS NULL
  );

-- ── RLS: trainings table ──────────────────────────────────────────────────────

CREATE POLICY "athlete_select_team_trainings" ON public.trainings
  FOR SELECT
  USING (
    team_id    = public.get_athlete_team_id()
    AND deleted_at IS NULL
  );

-- ── RLS: attendance_records table ─────────────────────────────────────────────

-- Athlete reads all attendance for their team's trainings.
-- Justification masking for other athletes is enforced at the application layer.
CREATE POLICY "athlete_select_team_attendance" ON public.attendance_records
  FOR SELECT
  USING (team_id = public.get_athlete_team_id());

-- Athlete inserts their own attendance record
CREATE POLICY "athlete_insert_own_attendance" ON public.attendance_records
  FOR INSERT
  WITH CHECK (
    team_id    = public.get_athlete_team_id()
    AND athlete_id = (
      SELECT id FROM public.athletes
      WHERE  user_id    = auth.uid()
        AND  deleted_at IS NULL
      LIMIT 1
    )
  );

-- Athlete updates their own attendance record (time-window enforced in app/future RPC)
CREATE POLICY "athlete_update_own_attendance" ON public.attendance_records
  FOR UPDATE
  USING (
    team_id    = public.get_athlete_team_id()
    AND athlete_id = (
      SELECT id FROM public.athletes
      WHERE  user_id    = auth.uid()
        AND  deleted_at IS NULL
      LIMIT 1
    )
  )
  WITH CHECK (
    team_id    = public.get_athlete_team_id()
    AND athlete_id = (
      SELECT id FROM public.athletes
      WHERE  user_id    = auth.uid()
        AND  deleted_at IS NULL
      LIMIT 1
    )
  );
