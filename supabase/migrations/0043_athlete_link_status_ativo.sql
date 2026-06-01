-- CEPR-ATHLETE-LOGIN-SIMPLE
-- Reforça que link_athlete_user_id() só vincula registros com status='ativo'.
-- A regra canônica de acesso simples da atleta (decisão CEPRAEA) determina
-- que o vínculo auth.users.id ↔ public.athletes.id só pode ser feito quando
-- o cadastro feito pelo treinador está ativo. O fast path de
-- ensure_athlete_link() já filtra por status='ativo', mas link_athlete_user_id()
-- precisa do mesmo filtro para evitar vincular cadastros inativos/arquivados.

CREATE OR REPLACE FUNCTION public.link_athlete_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_athlete_id uuid;
BEGIN
  SELECT id INTO v_athlete_id
  FROM   public.athletes
  WHERE  user_id    IS NULL
    AND  status     = 'ativo'
    AND  lower(email) = lower(auth.jwt() ->> 'email')
    AND  deleted_at   IS NULL
  LIMIT 1;

  IF v_athlete_id IS NULL THEN
    RETURN NULL;
  END IF;

  UPDATE public.athletes
  SET    user_id = auth.uid()
  WHERE  id      = v_athlete_id
    AND  user_id IS NULL
    AND  status  = 'ativo';   -- guarda contra concurrent claim e mudança de status

  RETURN v_athlete_id;
END;
$$;

REVOKE ALL ON FUNCTION public.link_athlete_user_id() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_athlete_user_id() TO authenticated;
