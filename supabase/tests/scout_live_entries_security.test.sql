-- Scout live entries security checks. Run after migrations + seed.
\set ON_ERROR_STOP on

begin;

do $$
begin
  if not has_table_privilege('authenticated', 'public.scout_live_entries', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'authenticated should have CRUD grant on scout_live_entries';
  end if;

  if has_table_privilege('anon', 'public.scout_live_entries', 'SELECT,INSERT,UPDATE,DELETE') then
    raise exception 'anon must not have grants on scout_live_entries';
  end if;
end $$;

insert into public.scout_games (
  id, team_id, game_date, analyzed_team, opponent, status
) values
  (
    '76000000-0000-0000-0000-000000000511',
    '10000000-0000-0000-0000-000000000001',
    '2026-12-04',
    'CEPRAEA',
    'Adversario Seg',
    'em_andamento'
  ),
  (
    '76000000-0000-0000-0000-000000000512',
    '10000000-0000-0000-0000-000000000002',
    '2026-12-04',
    'Outra Equipe',
    'Adversario Seg',
    'em_andamento'
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
  resultado_factual_code,
  status_validacao_code
) values
  (
    '77000000-0000-0000-0000-000000000511',
    '10000000-0000-0000-0000-000000000001',
    '76000000-0000-0000-0000-000000000511',
    'LIVE-RLS-001',
    '01:01',
    'AT_POS',
    '10000000-0000-0000-0000-000000000001',
    'ATAQUE',
    'GOL',
    'PENDENTE'
  ),
  (
    '77000000-0000-0000-0000-000000000512',
    '10000000-0000-0000-0000-000000000002',
    '76000000-0000-0000-0000-000000000512',
    'LIVE-RLS-002',
    '01:02',
    'DEF_POS',
    '10000000-0000-0000-0000-000000000002',
    'DEFESA',
    'DEFENDIDO',
    'PENDENTE'
  );

set local role authenticated;
set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000001';

do $$
begin
  if not exists (select 1 from public.scout_live_entries where id = '77000000-0000-0000-0000-000000000511') then
    raise exception 'owner should read own scout_live_entries';
  end if;
  if exists (select 1 from public.scout_live_entries where id = '77000000-0000-0000-0000-000000000512') then
    raise exception 'owner must not read other team scout_live_entries';
  end if;

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
    '77000000-0000-0000-0000-000000000513',
    '10000000-0000-0000-0000-000000000001',
    '76000000-0000-0000-0000-000000000511',
    'LIVE-RLS-003',
    '01:03',
    'AT_POS',
    '10000000-0000-0000-0000-000000000001',
    'ATAQUE',
    'GOL',
    'PENDENTE'
  );
end $$;

set local request.jwt.claim.sub = '00000000-0000-0000-0000-000000000003';

do $$
begin
  if not exists (select 1 from public.scout_live_entries where id = '77000000-0000-0000-0000-000000000511') then
    raise exception 'viewer should read own team scout_live_entries';
  end if;

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
      '77000000-0000-0000-0000-000000000514',
      '10000000-0000-0000-0000-000000000001',
      '76000000-0000-0000-0000-000000000511',
      'LIVE-RLS-004',
      '01:04',
      'AT_POS',
      '10000000-0000-0000-0000-000000000001',
      'ATAQUE',
      'GOL',
      'PENDENTE'
    );
    raise exception 'viewer inserted scout_live_entries unexpectedly';
  exception when others then
    null;
  end;
end $$;

reset role;

rollback;
