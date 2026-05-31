# PR Validation Instructions — CEPRAEA

## Obrigatório no PR

- preencher template de evidências;
- compatibilizar escopo alterado com validações executadas;
- manter checks obrigatórios em `SUCCESS`.

## Checks mínimos esperados

- `pr-evidence-guard`
- `ci / typecheck`
- `ci / test`
- `ci / build`
- `ci / deps-check`
- `ci / runtime-legacy`
- `ci / validate-mvp-v1`
- `scout-preview-smoke` (quando escopo Scout/Auth/Supabase/RLS)

## Bloqueio

Se o texto do PR afirmar validação inexistente nos checks, reprovar o PR.
