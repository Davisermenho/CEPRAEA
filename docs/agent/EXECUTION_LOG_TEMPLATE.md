# Execution Log Template (Structured)

Use este template para gerar um arquivo JSON validável por `scripts/validate-execution-log.mjs`.

```json
{
  "task_id": "CEPR-EXEMPLO-2026-05-31",
  "date": "2026-05-31",
  "agent": "codex",
  "scope": "ci-governance",
  "summary": "Resumo objetivo da tarefa.",
  "files_changed": [
    ".github/workflows/ci.yml"
  ],
  "tools": [
    "terminal",
    "git",
    "github-actions"
  ],
  "commands": [
    "npm run typecheck",
    "npm test",
    "npm run build"
  ],
  "command_results": {
    "typecheck": "passou",
    "test": "passou",
    "build": "passou"
  },
  "preview_vercel": {
    "url": "nao_aplicavel",
    "status": "nao_aplicavel",
    "logs_criticos": "nao_aplicavel",
    "smoke_test": "nao_aplicavel"
  },
  "risks": [
    "Sem riscos críticos identificados"
  ],
  "status": "success"
}
```
