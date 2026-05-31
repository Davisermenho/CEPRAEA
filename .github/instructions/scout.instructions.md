# Scout Instructions — CEPRAEA

## Trigger de obrigatoriedade

Qualquer PR com impacto em Scout, Auth, Supabase, RLS, RPC ou fluxo de jogo.

## Validação obrigatória

1. validar `npm run typecheck`, `npm test`, `npm run build`;
2. resolver URL de preview da Vercel;
3. executar `SMOKE_BASE_URL="<preview-url>" npm run test:smoke:scout:preview`;
4. verificar logs do preview sem erro crítico.

## Regra de merge

Sem `scout-preview-smoke` em `SUCCESS`, PR não está pronto para merge em `main`.
