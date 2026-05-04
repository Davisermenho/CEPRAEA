# Presence Tokens Supabase — CEPRAEA

## Status

Fase inicial implementada com escopo restrito.

## Objetivo

Introduzir o fluxo Supabase de confirmação pública por token sem migrar `attendanceStore`, `athleteStore`, `trainingStore`, `scoutStore`, IndexedDB ou Apps Script.

## Feature flag

```text
VITE_PRESENCE_TOKENS_BACKEND=legacy | supabase
```

- `legacy`: mantém o fluxo atual `/confirmar/:treinoId/:atletaId` com IndexedDB + Apps Script/WhatsApp.
- `supabase`: habilita a rota pública `/confirmar-presenca?token=<token>` para confirmação via RPC Supabase.

O padrão seguro é `legacy`.

## Arquitetura

A camada isolada fica em:

```text
src/features/presence-tokens/
```

Arquivos:

- `presenceTokenTypes.ts`
- `presenceTokenFeatureFlag.ts`
- `presenceTokenApi.ts`

A camada usa `src/lib/supabase.ts` e apenas a anon key pública do Supabase. `service_role` permanece proibido no frontend.

## RPCs usadas

- `confirm_presence_by_token(input_token, input_status, input_justification)`
- `create_presence_token_batch(input_team_id, input_training_id, input_expires_at)`
- `mark_presence_token_batch_exported(input_batch_id)`
- `revoke_presence_token_batch(input_batch_id)`

Nesta fase, a rota pública por token está conectada. As RPCs administrativas estão encapsuladas na API TypeScript, mas a geração operacional pelo treinador permanece legada até existir sessão Supabase autenticada e `team_id` operacional na UI.

## Rotas

Legada:

```text
/confirmar/:treinoId/:atletaId
```

Supabase:

```text
/confirmar-presenca?token=<token>
```

## Garantias desta fase

- Não migra `attendanceStore`.
- Não remove Apps Script.
- Não limpa IndexedDB.
- Não altera a operação principal de treino.
- Não persiste token puro no frontend.
- A mensagem pública de erro permanece genérica.
- Produção deve permanecer em `legacy` até validação de preview/staging.

## Próximo passo

Criar a fase de geração/exportação/revogação de lotes no painel do treinador, dependente de autenticação Supabase e definição explícita de `team_id`.
