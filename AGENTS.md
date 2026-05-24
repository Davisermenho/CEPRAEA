> Este AGENTS.md é um loader operacional.
> Fonte única de verdade: `./AGENTS.json`.
> O arquivo AGENT.md foi substituído por este documento.

# CEPRAEA — AGENTS Loader (Shim)

## Regra central

Toda execução de agente neste repositório deve carregar e cumprir `AGENTS.json` integralmente.

## Contrato determinístico de carregamento

1. Antes de qualquer ação, ler `./AGENTS.json`.
2. Considerar `./AGENTS.json` como contrato oficial e completo.
3. Não usar interpretação alternativa quando houver regra explícita no JSON.
4. Se `AGENTS.json` não estiver acessível, não estiver válido (JSON inválido) ou estiver ambíguo para execução segura:
   - interromper a execução;
   - reportar bloqueio com evidência objetiva;
   - não prosseguir com mudanças de código, dados, infraestrutura, CI ou merge.

## Escopo de substituição

- Todas as regras operacionais previamente mantidas em `AGENTS.md` foram preservadas em `AGENTS.json`.
- Este arquivo existe apenas para direcionar agentes e ferramentas que esperam especificamente o nome `AGENTS.md`.
