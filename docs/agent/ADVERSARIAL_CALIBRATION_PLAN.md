# Plano de Calibração — Adversarial Review

## Objetivo

Promover o `adversarial-review-required` de `advisory` para `enforced` sem bloquear PRs válidos.

## Janela de calibração

- Rodar em `advisory` por 3 a 5 PRs reais em `main`.
- Registrar cada execução no quadro abaixo.

## Regras iniciais monitoradas

- `NO_DIFF`
- `MISSING_<CAMPO_TEMPLATE>`
- `TESTS_REMOVED`
- `COMMAND_CHECK_MISMATCH`
- `SCOUT_SMOKE_MISSING`
- `SCOUT_SMOKE_NOT_SUCCESS`

## Critério de promoção para enforced

- `0` falso positivo crítico em 3 PRs consecutivos.
- `100%` de detecção de falha crítica conhecida (quando houver caso de teste controlado).
- Concordância humana de que as regras não bloqueiam fluxo legítimo.

## Registro de calibração

| Data | PR | Critical | High | Falso positivo? | Ajuste aplicado |
|---|---:|---:|---:|---|---|
| 2026-05-31 | [#70](https://github.com/Davisermenho/CEPRAEA/pull/70) | 0 | 3 | Sim (timing de checks no evento `synchronize`) | `adversarial-review-required`: `COMMAND_CHECK_MISMATCH` agora só em `strictMode` |

## Procedimento de promoção

1. Mudar o input default `mode` para `enforced` no workflow.
2. Adicionar `adversarial-review-required` nos required checks da branch `main`.
3. Rodar PR de validação final.
4. Confirmar status `SUCCESS` em caso válido e `FAIL` em caso crítico controlado.
