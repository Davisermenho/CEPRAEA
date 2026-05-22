# Solo Mode Governance Snapshot — 2026-05-21

## Objetivo

Registrar formalmente que o repositório está em modo solo, mantendo gates técnicos obrigatórios para merge em `main`.

## Estado de proteção de branch (`main`)

Snapshot capturado via GitHub API em 2026-05-21:

```json
{
  "enforce_admins": true,
  "strict": true,
  "required_status_checks": [
    "scout-preview-smoke",
    "Vercel",
    "scout-contract-cepr0098d",
    "pr-evidence-guard"
  ],
  "required_reviews": 0,
  "require_code_owner_reviews": false,
  "require_last_push_approval": false
}
```

## Política operacional

- Sem exigência de reviewer humano de terceiros.
- Merge continua bloqueado por checks técnicos obrigatórios.
- Todo PR mantém trilha de evidências técnicas no template e no CI.
