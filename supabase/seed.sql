-- CEPRAEA Supabase staging seed fixtures.
-- IDs fixos para testes de RLS/RPC. Não usar como seed de produção.

insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, aud, role, instance_id, confirmation_token, recovery_token, email_change_token_new, email_change_token_current, email_change)
values
  ('00000000-0000-0000-0000-000000000001', 'owner@cepraea.test', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000002', 'coach@cepraea.test', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000003', 'viewer@cepraea.test', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000004', 'noteam@cepraea.test', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '', '', '', '', ''),
  ('00000000-0000-0000-0000-000000000005', 'owner@other.test', crypt('password', gen_salt('bf')), now(), now(), now(), '{"provider":"email","providers":["email"]}', '{}', 'authenticated', 'authenticated', '00000000-0000-0000-0000-000000000000', '', '', '', '', '')
on conflict (id) do nothing;

insert into auth.identities (provider_id, user_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values
  ('owner@cepraea.test',  '00000000-0000-0000-0000-000000000001', 'email', '{"sub":"00000000-0000-0000-0000-000000000001","email":"owner@cepraea.test","email_verified":true}',  now(), now(), now()),
  ('coach@cepraea.test',  '00000000-0000-0000-0000-000000000002', 'email', '{"sub":"00000000-0000-0000-0000-000000000002","email":"coach@cepraea.test","email_verified":true}',  now(), now(), now()),
  ('viewer@cepraea.test', '00000000-0000-0000-0000-000000000003', 'email', '{"sub":"00000000-0000-0000-0000-000000000003","email":"viewer@cepraea.test","email_verified":true}', now(), now(), now()),
  ('noteam@cepraea.test', '00000000-0000-0000-0000-000000000004', 'email', '{"sub":"00000000-0000-0000-0000-000000000004","email":"noteam@cepraea.test","email_verified":true}', now(), now(), now()),
  ('owner@other.test',    '00000000-0000-0000-0000-000000000005', 'email', '{"sub":"00000000-0000-0000-0000-000000000005","email":"owner@other.test","email_verified":true}',    now(), now(), now())
on conflict (provider_id, provider) do nothing;

insert into public.profiles (id, name, email)
values
  ('00000000-0000-0000-0000-000000000001', 'Owner CEPRAEA', 'owner@cepraea.test'),
  ('00000000-0000-0000-0000-000000000002', 'Coach CEPRAEA', 'coach@cepraea.test'),
  ('00000000-0000-0000-0000-000000000003', 'Viewer CEPRAEA', 'viewer@cepraea.test'),
  ('00000000-0000-0000-0000-000000000004', 'Sem equipe', 'noteam@cepraea.test'),
  ('00000000-0000-0000-0000-000000000005', 'Owner Outra Equipe', 'owner@other.test')
on conflict (id) do nothing;

insert into public.teams (id, name, slug, created_by)
values
  ('10000000-0000-0000-0000-000000000001', 'CEPRAEA', 'cepraea', '00000000-0000-0000-0000-000000000001'),
  ('10000000-0000-0000-0000-000000000002', 'Outra Equipe', 'outra-equipe', '00000000-0000-0000-0000-000000000005')
on conflict (id) do nothing;

insert into public.team_members (team_id, user_id, role)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'owner'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'coach'),
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'viewer'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'owner')
on conflict (team_id, user_id) do nothing;

insert into public.athletes (id, team_id, name, phone, status)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Atleta Teste 1', null, 'ativo'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Atleta Teste 2', null, 'ativo'),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Atleta Outra Equipe', null, 'ativo')
on conflict (id) do nothing;
