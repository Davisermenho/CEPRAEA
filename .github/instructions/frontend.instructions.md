# Frontend Instructions — CEPRAEA

## Escopo

Mudanças em React, Vite, TypeScript strict, Zustand e React Router.

## Fluxo obrigatório

1. identificar arquivos de UI impactados;
2. implementar mudança mínima de escopo;
3. revisar `git diff`;
4. executar `npm run typecheck`, `npm test`, `npm run build`;
5. se houver impacto visual/fluxo, executar `npm run test:e2e`.

## Critérios de bloqueio

- não aprovar com regressão de build/typecheck/test;
- não concluir sem listar arquivos alterados e comandos com resultado.
