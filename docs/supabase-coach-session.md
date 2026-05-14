---
tipo: SPEC-TÉCNICA
nome: "Sessão Supabase do Treinador — Fase Intermediária"
papel: "Especifica o mecanismo de sessão Supabase do treinador como camada complementar ao login PIN legado, sem substituí-lo nesta fase."
autoridade: "Hierarquia 4/4 — spec de fase intermediária; pode estar superada se migração de auth do treinador foi concluída."
lido_por: "Agente responsável por auth do treinador"
quando_ler: "ao trabalhar em SupabaseAuthProvider, LoginPage do treinador ou /configuracoes/supabase"
atualizado_por: "Agente executor"
quando_atualizar: "decisão de migração completa do treinador para Supabase auth (T07 ou fase seguinte)"
validade: "2026-05-05"
status: PARCIAL
status_nota: "Verificar estado atual de LoginPage.tsx e SupabaseAuthProvider.tsx antes de assumir que PIN ainda é o guard principal"
conflito: "Código prevalece; se PIN foi removido e esta spec ainda diz PIN continua como guard principal, atualizar spec."
proibido:
  - "Agentes NÃO devem re-introduzir PIN como guard principal com base nesta spec sem verificar decisão atual em plan.md e CEPRAEA.md"
nao_cobre: "Migração de stores, geração de lotes de tokens, auth da atleta"
---

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
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key-publica>
VITE_SUPABASE_TEAM_ID=<uuid-do-time>
```

A `publishable key` é pública por desenho do Supabase. A `service_role` continua proibida no frontend.

## Rota de validação operacional

```text
/configuracoes/supabase
```

A rota fica protegida pelo `AuthGuard` legado. Isso mantém a segurança operacional atual: apenas quem já entrou no painel com PIN consegue abrir a tela de sessão Supabase.

## Critérios para liberar a próxima fase

Antes de ligar geração/exportação/revogação de lotes de presença no painel:

1. `VITE_SUPABASE_URL` configurado no ambiente de preview/staging.
2. `VITE_SUPABASE_PUBLISHABLE_KEY` configurado no ambiente de preview/staging.
3. `VITE_SUPABASE_TEAM_ID` configurado como UUID válido.
4. Treinador consegue autenticar na rota `/configuracoes/supabase`.
5. Usuário autenticado possui role `owner` ou `coach` no `team_id` configurado.
6. RLS/grants continuam passando no GitHub Actions.
7. Produção permanece em `VITE_PRESENCE_TOKENS_BACKEND=legacy` até validação explícita.

## Decisão

A autenticação Supabase é uma camada complementar nesta fase. O PIN legado continua sendo o guard operacional principal do painel até a migração completa ser aprovada.
