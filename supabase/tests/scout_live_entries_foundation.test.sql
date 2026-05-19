-- Scout live entries foundation checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

do $$
begin
  if to_regclass('public.scout_live_entries') is null then
    raise exception 'missing relation public.scout_live_entries';
  end if;

  if not exists (
    select 1
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relname = 'scout_live_entries'
      and c.relrowsecurity = true
      and c.relforcerowsecurity = false
  ) then
    raise exception 'unexpected RLS flags for public.scout_live_entries';
  end if;

  if not exists (select 1 from pg_constraint where conname = 'scout_live_entries_game_team_fk') then
    raise exception 'missing scout_live_entries_game_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_live_entries_main_athlete_team_fk') then
    raise exception 'missing scout_live_entries_main_athlete_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_live_entries_derived_play_team_fk') then
    raise exception 'missing scout_live_entries_derived_play_team_fk';
  end if;
  if not exists (select 1 from pg_constraint where conname = 'scout_live_entries_team_game_code_key') then
    raise exception 'missing scout_live_entries_team_game_code_key';
  end if;
end $$;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values (
  '76000000-0000-0000-0000-000000000501',
  '10000000-0000-0000-0000-000000000001',
  '2026-12-03',
  'CEPRAEA',
  'Adversario Live',
  'em_andamento'
);

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
  factual_result
) values (
  '71000000-0000-0000-0000-000000000601',
  '10000000-0000-0000-0000-000000000001',
  '76000000-0000-0000-0000-000000000501',
  'LIVE-DERIVED-001',
  '2026-12-03',
  'JOGO',
  'Adversario Live',
  'SET_1',
  '00:31',
  'AO_VIVO',
  'AT_POS',
  'ANALYZED',
  'OPPONENT',
  'GOL'
);

insert into public.scout_live_entries (
  id,
  team_id,
  scout_game_id,
  id_jogada,
  tempo_jogo,
  fase_da_bola_code,
  equipe_analisada_id,
  fase_equipe_analisada_code,
  sistema_ofensivo_code,
  atleta_principal_id,
  acao_principal_text,
  acao_principal_suggestion_code,
  acao_principal_is_custom,
  tipo_finalizacao_code,
  resultado_factual_code,
  pontos_jogada,
  causa_provavel_code,
  prioridade_treino_code,
  status_validacao_code,
  derived_scout_play_id
) values (
  '77000000-0000-0000-0000-000000000501',
  '10000000-0000-0000-0000-000000000001',
  '76000000-0000-0000-0000-000000000501',
  'LIVE-001',
  '00:31',
  'AT_POS',
  '10000000-0000-0000-0000-000000000001',
  'ATAQUE',
  'AT_3X1',
  '20000000-0000-0000-0000-000000000001',
  'GIRO',
  'GIRO',
  false,
  'GIRO',
  'GOL',
  2,
  'DEC_OF',
  'FIN2',
  'PENDENTE',
  '71000000-0000-0000-0000-000000000601'
);

do $$
begin
  if not exists (
    select 1 from public.scout_live_entries
    where id = '77000000-0000-0000-0000-000000000501'
      and acao_principal_text = 'GIRO'
      and pontos_jogada = 2
      and status_validacao_code = 'PENDENTE'
  ) then
    raise exception 'scout_live_entries row not persisted correctly';
  end if;
end $$;

do $$
begin
  begin
    insert into public.scout_live_entries (
      id,
      team_id,
      scout_game_id,
      id_jogada,
      tempo_jogo,
      fase_da_bola_code,
      equipe_analisada_id,
      fase_equipe_analisada_code,
      resultado_factual_code,
      status_validacao_code
    ) values (
      '77000000-0000-0000-0000-000000000502',
      '10000000-0000-0000-0000-000000000001',
      '76000000-0000-0000-0000-000000000501',
      'LIVE-001',
      '00:32',
      'AT_POS',
      '10000000-0000-0000-0000-000000000001',
      'ATAQUE',
      'GOL',
      'PENDENTE'
    );
    raise exception 'duplicate team/game/id_jogada unexpectedly succeeded';
  exception when unique_violation then
    null;
  end;

  begin
    insert into public.scout_live_entries (
      id,
      team_id,
      scout_game_id,
      id_jogada,
      tempo_jogo,
      fase_da_bola_code,
      equipe_analisada_id,
      fase_equipe_analisada_code,
      resultado_factual_code,
      pontos_jogada,
      status_validacao_code
    ) values (
      '77000000-0000-0000-0000-000000000503',
      '10000000-0000-0000-0000-000000000001',
      '76000000-0000-0000-0000-000000000501',
      'LIVE-003',
      '00:33',
      'AT_POS',
      '10000000-0000-0000-0000-000000000001',
      'ATAQUE',
      'GOL',
      3,
      'PENDENTE'
    );
    raise exception 'invalid pontos_jogada unexpectedly succeeded';
  exception when check_violation then
    null;
  end;

  begin
    insert into public.scout_live_entries (
      id,
      team_id,
      scout_game_id,
      id_jogada,
      tempo_jogo,
      fase_da_bola_code,
      equipe_analisada_id,
      fase_equipe_analisada_code,
      atleta_principal_id,
      resultado_factual_code,
      status_validacao_code
    ) values (
      '77000000-0000-0000-0000-000000000504',
      '10000000-0000-0000-0000-000000000001',
      '76000000-0000-0000-0000-000000000501',
      'LIVE-004',
      '00:34',
      'AT_POS',
      '10000000-0000-0000-0000-000000000001',
      'ATAQUE',
      '20000000-0000-0000-0000-000000000003',
      'GOL',
      'PENDENTE'
    );
    raise exception 'cross-team athlete unexpectedly succeeded';
  exception when foreign_key_violation then
    null;
  end;
end $$;

rollback;
