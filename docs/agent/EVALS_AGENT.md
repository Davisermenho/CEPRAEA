# Evals do Agente

## Objetivo

Medir qualidade de execução do agente em três dimensões:

- instruction following;
- compliance de evidência;
- coerência de trajetória.

## Artefatos

- `docs/agent/evals/agent-instruction-following.json`
- `docs/agent/evals/agent-evidence-compliance.json`

## Critério de aprovação sugerido

- `instruction_following_score >= 0.9`
- `evidence_compliance_score >= 0.9`
- sem falhas críticas em `required_checks`.
