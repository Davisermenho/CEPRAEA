---
role: ontology-artifact
artifact-type: triage-table
domain: beach-handball-ontology
authority: derived
applies-to: [agent, developer, coach]
version: 0.3-draft
status: ready-for-triage
source: docs/ontologia/artigos/2-point goals (spin and in-flight shots)-min.pdf
parent: docs/ontologia/manuais/manual-ontologia-handebol-de-praia.md
---

# Triagem Ontológica — 2-point goals (spin and in-flight shots)-min

## Status

`PRONTO_PASSO_1` — Passo 0 concluído com OCR. Artigo legível e pronto para triagem.

## Passo 0 — Resultado da conversão (2026-05-24)

**Fonte:** `docs/ontologia/artigos/2-point goals (spin and in-flight shots)-min.pdf`
**Tipo:** PDF exportado do PowerPoint (IHF Online Education Weeks 2023), 55 páginas, 100% imagens rasterizadas.
**Autores:** Agnieszka Skowronek; Sylwia Bartkowiak; Weronika Lakomy

**Comando executado:**
```bash
source .venv/bin/activate
python3 scripts/pdf2md.py \
    "docs/ontologia/artigos/2-point goals (spin and in-flight shots)-min.pdf" \
    --out docs/ontologia/ \
    --lang en
```

**Resultado:**
- Markdown gerado: `docs/ontologia/2-point goals (spin and in-flight shots)-min.md`
- Páginas com OCR: 53/55 (2 páginas sem texto — apenas diagramas/imagens)
- Imagens extraídas: 708
- Qualidade do texto: legível — conceitos principais identificáveis

**Histórico do bloqueio anterior:**
- `tesseract-ocr` indisponível no sistema (dependências `liblept5`/`libtesseract5` ausentes)
- Bloqueio encerrado com instalação de `easyocr` (Python, sem dependência de sistema)

---

## Passo 1 — Identificação da fonte

| Campo | Valor |
|---|---|
| Arquivo | `2-point goals (spin and in-flight shots)-min.pdf` |
| Título | 2-point Goals, Spin and In-flight Shots |
| Autores | Agnieszka Skowronek; Sylwia Bartkowiak; Weronika Lakomy |
| Ano | 2023 |
| Evento | IHF Online Education Weeks 2023 |
| Tema principal | Gol de 2 pontos no handebol de praia |
| Tipo de conteúdo | `regra` + `técnica` + `tática-ofensiva` |

---

## Passo 2 — Conceitos candidatos extraídos do artigo

Trechos-base usados para extração (OCR legível):

- `Página 10`: gol de 2 pontos para `spin shots`, `in-flight shots`, gols de `goalkeeper/specialist` e `6m throws`.
- `Página 12`: `Spin shot` correto requer giro completo no ar (360°) com orientação dos pés no take-off.
- `Página 37`: `In-flight` de 2 pontos requer controle da bola e finalização no ar; "slapping/pushing" vale 1 ponto.
- `Página 45`: `6-metre throw` convertido vale 2 pontos; critérios de concessão por chance clara destruída.
- `Página 49`: gol marcado por goleiro ou especialista vale 2 pontos; distinção de camisa.

Conceitos candidatos (pré-triagem):

1. `TwoPointGoal` (escopo e gatilhos de pontuação)
2. `SpinThrow` (critério técnico de giro completo)
3. `AerialThrow` / `In-flight shot` (critério técnico de controle no ar)
4. `SixMetreThrow` (regras de concessão e pontuação)
5. `GoalkeeperRole` (gol de 2 pontos e finalização direta da própria área)
6. `SpecialistRole` (gol de 2 pontos quando finaliza)
7. `OnePointGoal` (gol regular e execução espetacular tecnicamente incorreta)
8. Critério `slapping/pushing` no in-flight (vale 1 ponto)
9. Critério de camisa distinta para goleiro/especialista

---

## Passo 3 — Verificação de duplicidade com a ontologia atual

| Conceito candidato | Existe no glossário/matriz? | Resultado de duplicidade |
|---|---|---|
| `TwoPointGoal` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `SpinThrow` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `AerialThrow` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `SixMetreThrow` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `GoalkeeperRole` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `SpecialistRole` | Sim | Duplicata semântica (`REJEITAR_DUPLICATA`) |
| `OnePointGoal` | Não | Novo candidato, porém melhor modelado como atributo de pontuação (`REJEITAR_GENERICO`) |
| `slapping/pushing` no in-flight | Não (como classe) | Não vira classe; entra como atributo/critério técnico |
| camisa distinta goleiro/especialista | Sim (AthleteUniform + GoalkeeperRole) | Evidência adicional (`ADICIONAR_EVIDENCIA`) |

Conclusão do Passo 3: o artigo não exige novas classes centrais; exige enriquecimento de atributos e relações já existentes, com 1 nova relação explícita para o especialista.

---

## Passo 4 — Classificação e decisão ontológica

| Conceito extraído | Fonte | Classificação | Decisão | Onde entra | Justificativa |
|---|---|---|---|---|---|
| `TwoPointGoal` inclui `SpinThrow` | SKOWRONEK-2023 (p.10) | evidência | `ADICIONAR_EVIDENCIA` | `TwoPointGoal` / matriz | Já existia; artigo reforça regra aplicada |
| `TwoPointGoal` inclui `AerialThrow` | SKOWRONEK-2023 (p.10, p.37) | evidência | `ADICIONAR_EVIDENCIA` | `TwoPointGoal` / matriz | Já existia; artigo adiciona critério operacional de validação |
| `TwoPointGoal` inclui gol do goleiro | SKOWRONEK-2023 (p.10, p.49) | evidência | `ADICIONAR_EVIDENCIA` | `GoalkeeperRole` / matriz | Reforça regra normativa |
| Gol do especialista vale 2 pontos | SKOWRONEK-2023 (p.10, p.49) | relação | `ADICIONAR_RELACAO` | `TwoPointGoal` ↔ `SpecialistRole` | Relação explícita no artigo e útil no bloco de arremessos/pontuação |
| `SpinThrow`: giro completo (360°) | SKOWRONEK-2023 (p.12, p.17, p.25) | atributo | `ADICIONAR_ATRIBUTO` | `SpinThrow` | Critério técnico operacional da execução |
| `SpinThrow`: orientação de pés no take-off | SKOWRONEK-2023 (p.12) | atributo | `ADICIONAR_ATRIBUTO` | `SpinThrow` | Critério técnico de validação do giro |
| `AerialThrow`: controle de bola e finalização no ar | SKOWRONEK-2023 (p.37) | atributo | `ADICIONAR_ATRIBUTO` | `AerialThrow` | Critério técnico para 2 pontos |
| `AerialThrow`: slapping/pushing vale 1 ponto | SKOWRONEK-2023 (p.37) | atributo | `ADICIONAR_ATRIBUTO` | `AerialThrow` | Diferencia 2 pontos vs 1 ponto |
| `SixMetreThrow`: critérios a/b/c de concessão | SKOWRONEK-2023 (p.45) | atributo | `ADICIONAR_ATRIBUTO` | `SixMetreThrow` | Granularidade normativa útil |
| Camisa distinta para goleiro/especialista | SKOWRONEK-2023 (p.49) | evidência | `ADICIONAR_EVIDENCIA` | `AthleteUniform` | Já representado, artigo reforça rastreabilidade |
| `OnePointGoal` como classe nova | SKOWRONEK-2023 (p.6, p.37) | classe (candidato) | `REJEITAR_GENERICO` | `ShootingAction` (atributo) | Já coberto por `pointValue=1`; evitar inflar o diagrama |

---

## Passo 5 — Bloco alvo para atualização do Draw.io

Bloco principal: `ShootingAction` (camada técnico-tática), com conexão normativa em `TwoPointGoal`.

Atualização prevista:
- reforçar relações de pontuação de `TwoPointGoal` com técnicas e papéis já consolidados;
- incluir relação explícita com `SpecialistRole` para refletir o artigo.
