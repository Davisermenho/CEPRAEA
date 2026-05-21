## Resumo

-

## Evidências Técnicas (obrigatório)

- Escopo alterado:
- Arquivos alterados:
- Comandos executados:
- Resultado dos comandos:
- URL do Preview Vercel:
- Link do run `scout-preview-smoke`:
- Logs críticos do preview:

## Scout / Preview checklist

Quando o PR toca Scout, Supabase, Auth, RLS, sessão Scout ou coleta ao vivo:

- [ ] Existe teste automatizado para cada regra alterada.
- [ ] Smoke automatizado do Scout rodou contra Preview Vercel.
- [ ] Smoke criou equipe de teste (dados E2E rastreáveis).
- [ ] Smoke criou atleta de teste (dados E2E rastreáveis).
- [ ] Smoke preparou sessão/jogo.
- [ ] Smoke confirmou elenco.
- [ ] Smoke abriu coleta ao vivo.
- [ ] Smoke validou o fluxo crítico impactado pelo PR.
- [ ] Smoke falhou automaticamente em erro de RLS/Auth/insert/update/select.
- [ ] Logs do preview foram verificados.
- [ ] Não há erro crítico no console do fluxo validado.
- [ ] Dados E2E foram limpos/inativados quando possível ou ficaram com prefixo rastreável.

## Validação local

- [ ] `npm run typecheck`
- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run test:e2e` (quando houver mudança de UI/fluxo)
- [ ] `npm run test:supabase` + `supabase db reset` (quando houver mudança de DB/RLS/RPC)

## Bloqueios e pendências

- [ ] Este PR está bloqueado por falha de gate
- [ ] Não há bloqueios

## Segurança operacional

- [ ] Não alterei produção
- [ ] Não apliquei migration remota sem confirmação humana
- [ ] Não alterei env da Vercel sem confirmação humana
