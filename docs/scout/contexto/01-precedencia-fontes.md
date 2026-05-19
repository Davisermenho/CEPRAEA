# Precedencia de Fontes

Quando um agente for trabalhar no Scout, use esta ordem de confianca.

## 1. Estado operacional curto

Ler primeiro:

1. [03-estado-atual.md](/home/davis/cepraea-pwa/docs/scout/contexto/03-estado-atual.md)
2. [04-achados-piloto-01.md](/home/davis/cepraea-pwa/docs/scout/contexto/04-achados-piloto-01.md), se a tarefa tocar `COLETA_AO_VIVO`

Motivo: essas duas leituras dizem onde o projeto realmente esta agora e quais gaps continuam vivos.

## 2. Fontes normativas do repo

Depois, usar os documentos ativos:

1. [scout-ssot.md](/home/davis/cepraea-pwa/docs/scout/scout-ssot.md)
2. [matriz-compatibilidade-coleta-ao-vivo.md](/home/davis/cepraea-pwa/docs/scout/matriz-compatibilidade-coleta-ao-vivo.md)
3. [scout-contrato-tecnico-supabase.md](/home/davis/cepraea-pwa/docs/scout/scout-contrato-tecnico-supabase.md)
4. [scout-campos.md](/home/davis/cepraea-pwa/docs/scout/scout-campos.md)
5. [scout-listas.md](/home/davis/cepraea-pwa/docs/scout/scout-listas.md)
6. [scout-validacoes.md](/home/davis/cepraea-pwa/docs/scout/scout-validacoes.md)

Motivo: aqui esta a verdade operacional versionada no repo.

## 3. Historico curado

Se ainda houver ambiguidade:

1. [02-mapa-pilot-chat.md](/home/davis/cepraea-pwa/docs/scout/contexto/02-mapa-pilot-chat.md)
2. `pilot-chat.json`

Motivo: o chat bruto deve servir para rastrear origem de decisao, nao para substituir a documentacao viva.

## 4. Regra de desempate

Se houver conflito:

1. runtime validado e testes passam na frente de memoria do chat;
2. SSOT e matriz ativos passam na frente de trecho antigo do chat;
3. `pilot-chat.json` so prevalece quando a documentacao atual estiver incompleta e o trecho historico for claro o bastante para fechar a lacuna sem inventar regra nova.
