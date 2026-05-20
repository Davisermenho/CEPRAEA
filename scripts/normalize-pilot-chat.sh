#!/usr/bin/env bash

set -euo pipefail

INPUT_PATH="${1:-pilot-chat.json}"
OUTPUT_PATH="${2:-docs/scout/contexto/pilot-chat.normalized.jsonl}"

if [[ ! -f "$INPUT_PATH" ]]; then
  echo "Input file not found: $INPUT_PATH" >&2
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_PATH")"

jq -c '
  def text_blocks:
    [.contents[]? | select(.type == "text") | (.content // "")];

  def joined_text:
    (text_blocks | map(select(length > 0)) | join("\n\n"));

  def normalized_text:
    (joined_text
      | gsub("\\r\\n|\\r"; "\n")
      | gsub("[\\t ]+"; " ")
      | gsub("\\n{3,}"; "\n\n")
      | sub("^[\\s\\n]+"; "")
      | sub("[\\s\\n]+$"; ""));

  def attachments($msg):
    [$msg.contents[]? | select(.type == "attachment") | .attachment];

  def text_flags($t):
    {
      mentions_piloto_01: ($t | test("PILOTO-01"; "i")),
      mentions_cepr: ($t | test("CEPR-"; "i")),
      mentions_coleta_ao_vivo: ($t | test("COLETA_AO_VIVO|coleta_ao_vivo"; "i")),
      mentions_notion: ($t | test("Notion"; "i")),
      mentions_matriz: ($t | test("matriz"; "i")),
      mentions_manual: ($t | test("manual"; "i"))
    };

  to_entries[]
  | .value as $msg
  | ($msg | normalized_text) as $text
  | {
      source_file: $INPUT_PATH,
      idx: .key,
      message_id: $msg.id,
      chat_group_id: $msg.chatGroupId,
      role: $msg.role,
      model: $msg.model,
      display_model: $msg.displayModel,
      model_id: $msg.modelId,
      created_at: $msg.created_at,
      content_types: ([$msg.contents[]?.type] | unique),
      text_block_count: ([$msg.contents[]? | select(.type == "text")] | length),
      text_length: ($text | length),
      has_text: (($text | length) > 0),
      text: $text,
      preview: ($text[0:240]),
      attachment_count: (attachments($msg) | length),
      attachment_names: (attachments($msg) | map(.name // empty)),
      attachment_mime_types: (attachments($msg) | map(.mime_type // empty) | unique),
      attachment_big_paste_count: (attachments($msg) | map(select(.is_big_paste // false)) | length),
      image_count: ([$msg.contents[]? | select(.type == "image")] | length),
      flags: text_flags($text)
    }
' \
  --arg INPUT_PATH "$INPUT_PATH" \
  "$INPUT_PATH" > "$OUTPUT_PATH"

echo "Wrote $OUTPUT_PATH"
