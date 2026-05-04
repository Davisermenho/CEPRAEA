# Sessão Supabase do Treinador — CEPRAEA

## Status

Base técnica em validação.

## Objetivo

Adicionar um mecanismo explícito para sessão Supabase do treinador sem substituir o login legado por PIN e sem ativar ainda geração/exportação/revogação de lotes de presença.

## Escopo desta fase

Incluído:

- `SupabaseAuthProvider` global;
- leitura de sessão Supabase existente;
- login Supabase por e-mail e senha via `signInWithPassword`;
- logout Supabase;
- validação explícita de `VITE_SUPABASE_TEAM_ID`;
- página operacional protegida pelo login legado para visualizar/configurar sessão Supabase.

Fora do escopo:

- substituir o login PIN;
- migrar stores operacionais;
- ativar geração de lotes de tokens no painel;
- remover Apps Script;
- limpar IndexedDB;
- usar `service_role` no frontend.

## Variáveis necessárias

```text
VITE_SUPABASE_URL=<url-publica-do-projeto>
VITE_SUPABASE_ANON_KEY=<anon-key-publica>
VITE_SUPABASE_TEAM_ID=<uuid-do-time>
```

A `anon key` é pública por desenho do Supabase. A `service_role` continua proibida no frontend.

## Rota de validação operacional

```text
/configuracoes/supabase
```

A rota fica protegida pelo `AuthGuard` legado. Isso mantém a segurança operacional atual: apenas quem já entrou no painel com PIN consegue abrir a tela de sessão Supabase.

## Critérios para liberar a próxima fase

Antes de ligar geração/exportação/revogação de lotes de presença no painel:

1. `VITE_SUPABASE_URL` configurado no ambiente de preview/staging.
2. `VITE_SUPABASE_ANON_KEY` configurado no ambiente de preview/staging.
3. `VITE_SUPABASE_TEAM_ID` configurado como UUID válido.
4. Treinador consegue autenticar na rota `/configuracoes/supabase`.
5. Usuário autenticado possui role `owner` ou `coach` no `team_id` configurado.
6. RLS/grants continuam passando no GitHub Actions.
7. Produção permanece em `VITE_PRESENCE_TOKENS_BACKEND=legacy` até validação explícita.

## Decisão

A autenticação Supabase é uma camada complementar nesta fase. O PIN legado continua sendo o guard operacional principal do painel até a migração completa ser aprovada.
