# Validação automatizada remota — lotes de Presence Tokens Supabase

## Objetivo

Executar de forma segura os testes pendentes do checklist de lotes Supabase sem registrar valores sensíveis no repositório.

## Workflow

```text
.github/workflows/presence-token-batch-remote-validation.yml
```

Nome no GitHub Actions:

```text
Presence Token Batch Remote Validation
```

Disparo:

```text
workflow_dispatch
```

Ou seja: execução manual pela aba Actions.

## Script

```text
scripts/validate-presence-token-batch.mjs
```

Comando npm:

```text
npm run test:presence-token-batch:remote
```

## Secrets necessários

Configurar como GitHub Actions Secrets:

```text
SUPABASE_TEST_URL
SUPABASE_TEST_ANON_KEY
SUPABASE_TEST_TEAM_ID
SUPABASE_TEST_EMAIL
SUPABASE_TEST_PASSWORD
```

Não registrar os valores desses secrets em commits, issues, logs, changelog ou documentação.

## O que o teste faz

O teste executa contra um ambiente Supabase controlado:

1. autentica usuário de teste;
2. valida papel `owner` ou `coach` no time configurado;
3. cria uma atleta de teste;
4. cria um treino de teste;
5. gera lote de tokens;
6. marca lote como exportado;
7. confirma presença via token usando cliente anônimo;
8. verifica registro de presença;
9. revoga lote;
10. confirma que token revogado é rejeitado;
11. confirma que token inválido é rejeitado;
12. faz cleanup por soft-delete de treino/atleta e revogação do lote.

## Segurança

- O workflow usa apenas secrets do GitHub Actions.
- O script não imprime token gerado.
- O script não imprime valores de ambiente.
- O token puro fica apenas em memória durante a execução.
- O cleanup tenta revogar lote e marcar dados de teste como removidos mesmo em caso de falha.
- A produção deve continuar em `legacy` até aprovação explícita.

## Critério de aprovação

A fase automatizada é aprovada quando o workflow manual termina com sucesso e os logs mostram somente mensagens sanitizadas de sucesso.

## Critério de reprovação

Reprovar se qualquer etapa falhar, especialmente:

- usuário sem papel adequado;
- falha na geração de lote;
- falha ao marcar exportado;
- falha na confirmação pública;
- token revogado ainda aceito;
- token inválido aceito;
- cleanup incompleto que exija ação manual.
