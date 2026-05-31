# Supabase Instructions — CEPRAEA

## Escopo

Mudanças de schema, RLS, Auth, RPC, migrations, seed e integrações Supabase.

## Ordem obrigatória

1. validar escopo no diff;
2. aplicar alterações locais;
3. executar `supabase db reset`;
4. executar `npm run test:supabase`;
5. executar `npm run typecheck` e `npm run build`.

## Segurança

- padrão: Supabase local/MCP.
- remoto apenas leitura, salvo confirmação humana explícita.
- proibido aplicar migration remota sem confirmação humana explícita.
