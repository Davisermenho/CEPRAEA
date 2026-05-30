# E2E — Auth (compartilhado)

Specs transversais de autenticação aplicáveis às telas de login (atleta e treinador).

| Spec | Contrato | Escopo |
|---|---|---|
| `anti-enumeration.spec.ts` | §13 | Login/signup/reset não diferenciam email existente vs inexistente; paridade ±200 ms. |
| `redirect-guard.spec.ts` | §18 | `redirectGuard()` rejeita `javascript:`, hosts externos e mantém apenas paths whitelisted. |
