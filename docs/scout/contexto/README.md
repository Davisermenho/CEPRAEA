# Contexto do Scout

Esta pasta existe para impedir que `pilot-chat.json` seja usado como contexto bruto.

O arquivo na raiz continua sendo a fonte primária de evidência histórica, mas o agente não deve começar por ele. O fluxo correto é:

1. Ler [03-estado-atual.md](/home/davis/cepraea-pwa/docs/scout/contexto/03-estado-atual.md).
2. Ler [01-precedencia-fontes.md](/home/davis/cepraea-pwa/docs/scout/contexto/01-precedencia-fontes.md).
3. Ler os SSOTs ativos do scout.
4. Consultar [04-achados-piloto-01.md](/home/davis/cepraea-pwa/docs/scout/contexto/04-achados-piloto-01.md) se a tarefa tocar `COLETA_AO_VIVO`.
5. Usar [06-pilot-chat-jsonl.md](/home/davis/cepraea-pwa/docs/scout/contexto/06-pilot-chat-jsonl.md) e [pilot-chat.normalized.jsonl](/home/davis/cepraea-pwa/docs/scout/contexto/pilot-chat.normalized.jsonl) para busca rapida.
6. Ir para [02-mapa-pilot-chat.md](/home/davis/cepraea-pwa/docs/scout/contexto/02-mapa-pilot-chat.md) para localizar o trecho histórico relevante.
7. Abrir `pilot-chat.json` apenas quando houver conflito, lacuna ou necessidade de evidência original.

## O que esta pasta faz

- reduz carga cognitiva;
- separa estado atual de histórico bruto;
- registra precedência entre fontes;
- preserva rastreabilidade até o chat original.

## O que esta pasta nao faz

- nao substitui `docs/scout/scout-ssot.md`;
- nao substitui `docs/scout/matriz-compatibilidade-coleta-ao-vivo.md`;
- nao substitui contrato tecnico, testes ou runtime;
- nao deve virar novo lugar para duplicar conversa inteira.
