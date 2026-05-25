---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.1-draft
status: ready
source: docs/ontologia/artigos/6-metre throw + punishments.pdf
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontológica — 6-metre throw + punishments

## Passo 1 — Identificação da fonte

| Campo | Valor |
|---|---|
| Arquivo | `6-metre throw + punishments.pdf` |
| Título | 6-Metre Throw + Punishments |
| Autores | Luiz Filipe Caldas (BRA); Luis Monico (URU); Pablo Martinez |
| Ano | não informado |
| Tema principal | decisão, execução e critérios de punição no arremesso de 6 metros |
| Tipo de conteúdo | `regra` + `técnica` (arbitragem aplicada) |
| Camada provável | normativa |
| Bloco provável de atualização | `ThrowType` / `SixMetreThrow` / `Punishment` |

## Passo 2 — Conceitos candidatos extraídos

Trechos OCR legíveis usados:
- `Página 4`: três gatilhos de 6m por chance clara destruída (ação irregular, apito indevido, interferência externa).
- `Página 6`: definição de chance clara como controle de bola e corpo para finalizar ao gol.
- `Página 9`: execução do 6m (regras 14.5–14.10): chute direto, linha de 6m, segunda bola, distância de oponentes, restrição de troca de goleiro quando lançador está pronto, fair play.
- `Página 11–12`: ações no corpo do oponente geram punição; quando defensor vai na bola, sem punição.
- `Página 15`: em invasão da linha da área de gol, punir a jogadora correta.

Candidatos:
1. `SixMetreThrow` (refino de gatilho e execução)
2. `Punishment` (critérios operacionais de aplicação)
3. `ClearChanceOfScoring` (critério de definição)
4. `GoalkeeperRole` na execução do 6m
5. `FairPlay` na execução do 6m

## Passo 3 — Verificação de duplicidade com ontologia atual

| Conceito candidato | Existe? | Resultado |
|---|---|---|
| `SixMetreThrow` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidência) |
| `Punishment` | Sim | `REJEITAR_DUPLICATA` (enriquecer atributos/evidência) |
| `GoalkeeperRole` | Sim | `REJEITAR_DUPLICATA` (possível nova relação com 6m) |
| `ClearChanceOfScoring` | Não (como classe) | `REJEITAR_GENERICO` (manter como atributo de `SixMetreThrow`) |
| `FairPlay` | Não (como classe) | `REJEITAR_GENERICO` (manter como atributo de execução) |

Conclusão: sem novas classes. Atualização por atributos + 1 relação normativa nova.

## Passo 4 — Classificação e decisão

| Conceito extraído | Fonte | Classificação | Decisão | Onde entra | Justificativa |
|---|---|---|---|---|---|
| Chance clara destruída gera 6m (3 casos) | CALDAS-MONICO-MARTINEZ-SD (p.4) | evidência | `ADICIONAR_EVIDENCIA` | `SixMetreThrow` | já existe e confirma gatilhos normativos |
| Chance clara = controle de bola + corpo para finalizar | CALDAS-MONICO-MARTINEZ-SD (p.6) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | refina critério técnico do gatilho |
| Execução do 6m em até 3s após apito | CALDAS-MONICO-MARTINEZ-SD (p.9) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | regra operacional de execução |
| Lançador não toca/cruza linha de 6m | CALDAS-MONICO-MARTINEZ-SD (p.9) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | regra operacional de execução |
| Lançador não joga a bola de novo antes de tocar gol/oponente | CALDAS-MONICO-MARTINEZ-SD (p.9) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | regra operacional de execução |
| Sem troca de goleiro quando lançador pronto | CALDAS-MONICO-MARTINEZ-SD (p.9) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | regra de setup do 6m |
| Oponentes respeitam distância mínima/fair play na execução | CALDAS-MONICO-MARTINEZ-SD (p.9) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | requisito operacional da execução |
| Ações no corpo do oponente geram punição | CALDAS-MONICO-MARTINEZ-SD (p.11) | evidência | `ADICIONAR_EVIDENCIA` | `Punishment` | reforça progressão disciplinar |
| Se defensor vai na bola, sem punição | CALDAS-MONICO-MARTINEZ-SD (p.12) | atributo | `ADICIONAR_ATRIBUTO` | `Punishment` | critério operacional de não punição |
| 6m exige presença funcional de goleiro na execução | CALDAS-MONICO-MARTINEZ-SD (p.9) | relação | `ADICIONAR_RELACAO` | `SixMetreThrow` → `GoalkeeperRole` | conecta regra de execução com papel normativo |

## Passo 5 — Bloco de atualização no Draw.io

Bloco: **camada normativa**, sub-bloco `ThrowType` (conceito `SixMetreThrow`), com relação para `GoalkeeperRole`.

Atualização aprovada no diagrama:
- adicionar aresta `SixMetreThrow` `requires` `GoalkeeperRole`.
