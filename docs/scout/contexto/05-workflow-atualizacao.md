# Workflow de Atualizacao do Contexto

Use este fluxo sempre que uma nova sessao grande sobre o Scout gerar contexto relevante.

## Passo 1 — preservar a fonte bruta

- manter o JSON bruto como evidência;
- nao editar historico antigo para "melhorar texto";
- se houver novo export, registrar data e origem.

## Passo 2 — localizar o tipo de mudanca

Antes de resumir, classificar a novidade em uma destas classes:

- decisao estavel de dominio;
- ajuste de matriz;
- ajuste de UX;
- ajuste de backend/schema;
- achado de piloto;
- evidência de validacao;
- historico sem efeito atual.

## Passo 3 — atualizar o arquivo certo

- se mudou regra estavel: atualizar `docs/scout/*` normativos;
- se mudou estado corrente: atualizar [03-estado-atual.md](/home/davis/cepraea-pwa/docs/scout/contexto/03-estado-atual.md);
- se apareceu novo gap de uso real: atualizar [04-achados-piloto-01.md](/home/davis/cepraea-pwa/docs/scout/contexto/04-achados-piloto-01.md) ou criar novo arquivo de achados equivalente;
- se apenas deslocou o entendimento historico: atualizar [02-mapa-pilot-chat.md](/home/davis/cepraea-pwa/docs/scout/contexto/02-mapa-pilot-chat.md).

## Passo 4 — marcar o que ficou superado

Toda atualizacao deve responder:

1. o que continua valido;
2. o que foi substituido;
3. qual arquivo agora deve ser lido primeiro.

Sem isso, o contexto so cresce e volta a ficar confuso.

## Passo 5 — registrar evidência minima

Cada atualizacao curta deve citar:

- data;
- bloco/tema;
- artefatos afetados;
- se houve validacao por teste, runtime ou uso humano.

## Template de atualizacao

```md
## YYYY-MM-DD — Titulo curto

- tipo: decisao | matriz | UX | backend | piloto | validacao
- artefatos: arquivo1, arquivo2, migration X, teste Y
- continua valido:
- substitui:
- evidência:
- proximo ponto de leitura:
```

## Regra final

Se um agente precisar reler o chat inteiro para entender "onde estamos", o contexto curado falhou e deve ser atualizado.
