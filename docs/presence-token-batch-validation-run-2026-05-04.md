# Execução do checklist — lotes de Presence Tokens Supabase

Data: 2026-05-04

## Escopo

Execução inicial do checklist `docs/presence-token-batch-validation.md`.

Esta execução valida os itens verificáveis por repositório, CI/CD e código. Os itens que exigem interação no app com ambiente Supabase configurado permanecem pendentes até execução manual em preview/staging ou ambiente controlado.

## Ambiente-alvo

Repositório:

```text
Davisermenho/CEPRAEA
```

Branch:

```text
main
```

Produção deve permanecer em modo legado até aprovação explícita:

```text
VITE_PRESENCE_TOKENS_BACKEND=legacy
```

## Resultado por item

### 1. GitHub Actions

Status: aprovado por evidência visual.

Evidência operacional:

- `Supabase Foundation #57` concluído com sucesso.
- `Supabase Foundation #58` concluído com sucesso.

### 2. Vercel

Status: aprovado.

Evidência:

- Vercel retornou `success` para o commit `9f99fc9e72eb6939fa05f67f68beebfd0a6112cd`.
- Vercel retornou `success` para o commit `66f242d99b7d22f82b84c3f0569d84858db08440`.

### 3. Gate por feature flag

Status: aprovado por inspeção de código.

Evidência:

- A seção `Tokens Supabase` em `TrainingDetailPage` depende de `isSupabasePresenceTokensEnabled()`.
- Se a flag não estiver em modo Supabase, a seção não é renderizada.

### 4. Validação de acesso antes de gerar lote

Status: aprovado por inspeção de código.

Evidência:

- Antes de chamar `createPresenceTokenBatch`, o painel executa `validatePresenceTokenCoachAccess()`.
- Se `access.authorized` for falso, a geração é bloqueada.

### 5. Validação de acesso antes de revogar lote

Status: aprovado por inspeção de código.

Evidência:

- Antes de chamar `revokePresenceTokenBatch`, o painel executa `validatePresenceTokenCoachAccess()`.
- Se `access.authorized` for falso, a revogação é bloqueada.

### 6. Geração de lote

Status: pendente de execução manual.

Motivo:

- Requer ambiente com Supabase configurado, sessão válida e `VITE_SUPABASE_TEAM_ID` válido.
- Não há acesso interativo disponível nesta execução para clicar no painel e disparar a RPC contra o ambiente real.

Critério de aprovação manual:

- Clicar em `Gerar lote de links` no painel de um treino e receber links para atletas ativas.

### 7. Copiar e marcar exportado

Status: pendente de execução manual.

Motivo:

- Requer lote real gerado no painel.

Critério de aprovação manual:

- Copiar lote pelo modal e confirmar sucesso da chamada de exportação.

### 8. Confirmação pública por token

Status: pendente de execução manual.

Motivo:

- Requer link real gerado por lote Supabase.

Critério de aprovação manual:

- Abrir `/confirmar-presenca?token=<valor>` em aba anônima ou outro dispositivo e registrar presença/ausência com sucesso.

### 9. Revogação de lote

Status: pendente de execução manual.

Motivo:

- Requer lote real gerado no painel.

Critério de aprovação manual:

- Revogar lote e confirmar que links do lote deixam de funcionar.

### 10. Testes negativos

Status: pendente de execução manual.

Casos pendentes:

- sessão ausente bloqueia geração;
- usuário sem papel permitido bloqueia geração;
- `team_id` ausente ou inválido bloqueia geração;
- token inválido retorna erro genérico;
- token revogado retorna erro genérico.

## Resultado desta execução

Resultado: parcialmente aprovado.

Aprovado:

- CI/CD;
- Vercel;
- gate por feature flag;
- validação de acesso antes de gerar;
- validação de acesso antes de revogar;
- preservação do legado no código.

Pendente:

- geração real de lote;
- cópia/exportação real;
- confirmação pública real;
- revogação real;
- testes negativos em ambiente real.

## Decisão

Não ativar Supabase em produção ainda.

Manter:

```text
VITE_PRESENCE_TOKENS_BACKEND=legacy
```

Próximo passo: executar os itens pendentes em preview/staging ou ambiente controlado com Supabase configurado e registrar evidência de aprovação/reprovação.
