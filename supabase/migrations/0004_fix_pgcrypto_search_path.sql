-- Correção fundacional mínima: manter search_path fixo e incluir schema de extensões
-- para resolver funções pgcrypto usadas pelas RPCs de presença.

alter function public.create_presence_token_batch(uuid, uuid, timestamptz)
  set search_path = public, extensions;

alter function public.confirm_presence_by_token(text, text, text)
  set search_path = public, extensions;
