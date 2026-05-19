# `pilot-chat.normalized.jsonl`

Extrato normalizado de `pilot-chat.json` para consulta rapida.

## Arquivos

- gerador: [scripts/normalize-pilot-chat.sh](/home/davis/cepraea-pwa/scripts/normalize-pilot-chat.sh)
- saida padrao: [pilot-chat.normalized.jsonl](/home/davis/cepraea-pwa/docs/scout/contexto/pilot-chat.normalized.jsonl)

## Contrato de cada linha

Cada linha representa uma mensagem original do chat, ja achatada para leitura e busca.

Campos principais:

- `idx`: indice da mensagem no array original
- `message_id`: id da mensagem no export
- `chat_group_id`: id da conversa
- `role`: `user` ou `assistant`
- `created_at`: timestamp original
- `content_types`: tipos encontrados em `contents[]`
- `text`: texto consolidado da mensagem
- `preview`: recorte curto para inspeção
- `attachment_count`, `attachment_names`, `attachment_mime_types`
- `image_count`
- `flags`: booleans derivados para filtros rapidos

## O que foi normalizado

- blocos `contents[].content` de texto foram unidos em um unico campo `text`
- quebras de linha repetidas foram reduzidas
- espacos e tabs redundantes foram compactados
- anexos e imagens foram resumidos como metadados

## Exemplos de consulta

Mensagens do piloto:

```bash
jq -c 'select(.flags.mentions_piloto_01)' docs/scout/contexto/pilot-chat.normalized.jsonl
```

Mensagens sobre `CEPR-0092`:

```bash
rg 'CEPR-0092' docs/scout/contexto/pilot-chat.normalized.jsonl
```

Mensagens do usuario em `DEF_POS`:

```bash
jq -c 'select(.role == "user" and (.text | test("DEF_POS")))' docs/scout/contexto/pilot-chat.normalized.jsonl
```

Mensagens com anexos:

```bash
jq -c 'select(.attachment_count > 0) | {idx, role, created_at, attachment_names}' docs/scout/contexto/pilot-chat.normalized.jsonl
```

Primeiros previews:

```bash
jq -r '[.idx, .role, .created_at, .preview] | @tsv' docs/scout/contexto/pilot-chat.normalized.jsonl | head
```

## Regra de uso

Use este `.jsonl` para:

- busca textual rapida;
- filtros por papel, data e flags;
- localizar o trecho certo antes de abrir o JSON bruto.

Nao use este `.jsonl` para:

- substituir o arquivo original como evidência;
- inferir significado novo sem consultar SSOT ou matriz;
- tratar preview como fonte completa da mensagem quando o caso depender de nuance.
