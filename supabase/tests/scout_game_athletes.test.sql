-- Tests: scout_game_athletes (elenco por sessão)
-- Verifica INSERT, SELECT, UNIQUE, DELETE e FK CASCADE

\set ON_ERROR_STOP on

DO $$
DECLARE
  v_team_id   uuid := '10000000-0000-0000-0000-000000000001';
  v_game_id   uuid;
  v_athlete_id uuid;
  v_sga_id    uuid;
  v_count     int;
BEGIN

  -- ── Bootstrap: buscar game e athlete existentes no seed
  SELECT id INTO v_game_id
    FROM scout_games
    WHERE team_id = v_team_id
    LIMIT 1;

  IF v_game_id IS NULL THEN
    -- Criar game temporário para o teste
    INSERT INTO scout_games (team_id, status)
      VALUES (v_team_id, 'em_andamento')
      RETURNING id INTO v_game_id;
  END IF;

  SELECT id INTO v_athlete_id
    FROM athletes
    WHERE team_id = v_team_id
    LIMIT 1;

  ASSERT v_game_id IS NOT NULL, 'Pré-condição: scout_game deve existir';
  ASSERT v_athlete_id IS NOT NULL, 'Pré-condição: athlete deve existir';

  -- ── TESTE 1: INSERT atleta no roster
  RAISE NOTICE 'TEST-SGA-01: INSERT atleta no roster';
  INSERT INTO scout_game_athletes (team_id, scout_game_id, athlete_id)
    VALUES (v_team_id, v_game_id, v_athlete_id)
    RETURNING id INTO v_sga_id;

  ASSERT v_sga_id IS NOT NULL, 'FAIL TEST-SGA-01: id deve ser gerado';
  RAISE NOTICE 'PASS TEST-SGA-01';

  -- ── TESTE 2: SELECT atleta do jogo
  RAISE NOTICE 'TEST-SGA-02: SELECT atletas do jogo';
  SELECT count(*) INTO v_count
    FROM scout_game_athletes
    WHERE scout_game_id = v_game_id
      AND team_id = v_team_id
      AND athlete_id = v_athlete_id;

  ASSERT v_count = 1, 'FAIL TEST-SGA-02: deve retornar exatamente 1 registro';
  RAISE NOTICE 'PASS TEST-SGA-02';

  -- ── TESTE 3: UNIQUE constraint — duplicata deve falhar
  RAISE NOTICE 'TEST-SGA-03: UNIQUE constraint (duplicata deve falhar)';
  BEGIN
    INSERT INTO scout_game_athletes (team_id, scout_game_id, athlete_id)
      VALUES (v_team_id, v_game_id, v_athlete_id);
    ASSERT false, 'FAIL TEST-SGA-03: duplicata deveria ter falhado';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'PASS TEST-SGA-03: unique_violation corretamente disparado';
  END;

  -- ── TESTE 4: DELETE remove corretamente
  RAISE NOTICE 'TEST-SGA-04: DELETE remove atleta do roster';
  DELETE FROM scout_game_athletes
    WHERE id = v_sga_id;

  SELECT count(*) INTO v_count
    FROM scout_game_athletes
    WHERE id = v_sga_id;

  ASSERT v_count = 0, 'FAIL TEST-SGA-04: registro deve ter sido deletado';
  RAISE NOTICE 'PASS TEST-SGA-04';

  -- ── TESTE 5: FK ON DELETE CASCADE — deletar sessão remove roster
  RAISE NOTICE 'TEST-SGA-05: FK CASCADE ao deletar sessão';
  DECLARE
    v_cascade_game_id uuid;
    v_cascade_sga_id  uuid;
  BEGIN
    INSERT INTO scout_games (team_id, status)
      VALUES (v_team_id, 'em_andamento')
      RETURNING id INTO v_cascade_game_id;

    INSERT INTO scout_game_athletes (team_id, scout_game_id, athlete_id)
      VALUES (v_team_id, v_cascade_game_id, v_athlete_id)
      RETURNING id INTO v_cascade_sga_id;

    DELETE FROM scout_games WHERE id = v_cascade_game_id;

    SELECT count(*) INTO v_count
      FROM scout_game_athletes
      WHERE id = v_cascade_sga_id;

    ASSERT v_count = 0, 'FAIL TEST-SGA-05: roster deve ter sido removido por CASCADE';
    RAISE NOTICE 'PASS TEST-SGA-05';
  END;

  RAISE NOTICE '=== scout_game_athletes: TODOS OS TESTES PASSARAM ===';

EXCEPTION WHEN OTHERS THEN
  RAISE EXCEPTION 'FAIL scout_game_athletes: % - %', SQLSTATE, SQLERRM;
END;
$$;
