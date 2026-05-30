# E2E — Scout

Coleta ao vivo do scout. Usa `playwright.scout.config.ts` e `playwright.scout-preview-smoke.config.ts` para variantes.

## Comandos

```bash
npm run test:e2e:scout                   # suíte completa do scout
npm run test:e2e:scout-preview-smoke     # smoke contra Vercel Preview
```

## Specs principais

| Spec | Issue |
|---|---|
| `scout-smoke.spec.ts` | Smoke geral. |
| `scout-cepr0083-smoke.spec.ts` … `scout-cepr0091-ux.spec.ts` | Issues específicas do scout (CEPR-0083..0091). |
| `scout-matriz-compat.spec.ts` | Matriz de compatibilidade da live collection. |
| `scout-pontuacao-gol.spec.ts` | Pontuação de gol. |
| `scout-visual.spec.ts` | Snapshots visuais. |
