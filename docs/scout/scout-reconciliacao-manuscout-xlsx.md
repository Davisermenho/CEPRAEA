---
tipo: MATRIZ-RECONCILIACAO
nome: "Scout — Reconciliação MANUSCOUT × XLSX"
papel: "Consolida os achados de aderência metodológica do MANUSCOUT.md contra a Tabela_Mestre_dos_Campos.xlsx, separando o que já está operacional na planilha do que ainda precisa virar SSOT textual."
autoridade: "Hierarquia 4/4 — documento de trabalho para consolidação metodológica; não substitui a SSOT final do scout."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de planejar a implementação do scout; ao decidir se um conceito já está fechado; ao transformar metodologia em contrato técnico."
atualizado_por: "Agente executor"
quando_atualizar: "nova leitura do workbook ou revisão do manual alterar o diagnóstico de reconciliação."
validade: "2026-05-07"
status: PARCIAL
status_nota: "A planilha operacional está madura, mas a consolidação textual ainda não foi concluída."
conflito: "Se esta matriz divergir da planilha operacional, a planilha prevalece para catálogo e estrutura; se divergir do manual sobre intenção semântica, revalidar ambos antes de implementar."
proibido:
  - "Agentes NÃO devem usar esta matriz como desculpa para implementar scout sem consolidar a SSOT textual."
  - "NÃO devem assumir que 'PASS' na auditoria da planilha significa que o manual textual já está completo."
nao_cobre: "Schema final de banco, rotas de runtime, desenho de UI, plano de rollout de implementação."
---

# Scout — Matriz de Reconciliação `MANUSCOUT.md` × `Tabela_Mestre_dos_Campos.xlsx`

## 1. Objetivo

Esta matriz responde a uma pergunta prática:

> o que do scout já está fechado operacionalmente na planilha e o que ainda precisa ser consolidado em SSOT textual antes da implementação?

## 2. Leitura executiva

Conclusão:

1. o scout **não está pronto para implementação direta** com base apenas no `MANUSCOUT.md`;
2. a planilha `.xlsx` já contém uma estrutura operacional muito mais madura do que o diagnóstico textual isolado sugere;
3. a lacuna real não é ausência de modelagem, e sim **distribuição da verdade** entre manual e workbook;
4. a Etapa A deve produzir uma SSOT textual derivada da planilha, não reinventar o domínio.

## 3. Evidência da planilha

Resumo do workbook `Tabela_Mestre_dos_Campos.xlsx`:

Convenção usada neste documento:

- `linhas` = volume bruto de linhas de dados por aba, excluindo apenas o cabeçalho;
- quando um número se referir a subconjunto lógico do workbook, isso será dito explicitamente.

- `TABELA_MESTRE`: `466` linhas
- `COLETA_SCOUT`: `337` campos catalogados na tabela-mestre
- `PARTICIPACOES`: `17` campos
- `EVENTOS_MENTAIS`: `16` campos
- `VALIDACAO`: `10` campos
- `RELATORIO`: `10` campos
- `FEEDBACK`: `12` campos
- `CAD_ATLETAS`: `19` campos
- `CAD_EQUIPES`: `5` campos
- `LISTAS`: `16` linhas catalogadas na `TABELA_MESTRE` e `57` linhas na aba `LISTAS`
- `DASHBOARD`: `6` linhas catalogadas na `TABELA_MESTRE`
- `COLETA_AO_VIVO`: `18` linhas catalogadas na `TABELA_MESTRE`
- `DICIONARIO_CODIGOS`: `942` linhas
- `AUDITORIA_SSOT`: `Status SSOT = PASS`

Perfil do catálogo:

- tipos de campo dominantes:
  - `LISTA`: `275`
  - `REFERENCIA`: `75`
  - `TEXTO`: `50`
- obrigatoriedade:
  - `Condicional`: `344`
  - `Sim`: `82`
  - `Opcional`: `34`
  - `Derivado`: `6`

Leitura:

- a modelagem já existe;
- o problema principal é transformar esse catálogo em narrativa normativa fechada e auditável em texto.

## 4. Matriz de reconciliação

| Domínio | Diagnóstico no `MANUSCOUT.md` | Evidência no `.xlsx` | Veredito de reconciliação | Ação da Etapa A |
|---|---|---|---|---|
| SSOT e precedência | `PARCIAL` | `README` declara base, governança SSOT e precedência do manual central; `AUDITORIA_SSOT` marca `PASS` | A planilha já se comporta como artefato operacional governado, mas a precedência textual ainda não está consolidada no repo | Escrever seção de precedência única no `scout-ssot.md` |
| Estrutura-base da coleta | `CLARO` | `COLETA_SCOUT` + `TABELA_MESTRE` definem campos, tipos, obrigatoriedade e regra/definição | Fechado operacionalmente | Levar a estrutura-base para documento textual derivado |
| `FASE_DA_BOLA` vs `FASE_DA_ATLETA` | `PARCIAL` | `PARTICIPACOES` já contém ambos os campos; `DICIONARIO_CODIGOS` já codifica `AT_POS`, `DEF_POS`, `TRANS_OF`, `TRANS_DEF` com regra de uso | Semântica existe parcialmente no dicionário, mas não está consolidada de forma explícita em texto principal | Criar regra textual formal de coexistência e “não confundir” |
| Transição vs sistema estabilizado | `PARCIAL` | `TABELA_MESTRE` tem blocos fortes de “Organização inicial das transições”; dicionário já separa códigos de transição | Fechado na estrutura, incompleto no texto | Consolidar regra semântica e exemplos |
| `AT_3X1` vs `AT_4X0` | `PARCIAL` | `LISTAS` já traz `LISTA_SISTEMA_OFENSIVO`, `LISTA_CONFIGURACAO_OFENSIVA`, `LISTA_CONFIG_3X1`, `LISTA_CONFIG_4X0` | A taxonomia está modelada; a definição narrativa ainda está frouxa | Formalizar definição textual dos sistemas |
| Pivô fixa vs pivô temporária | `PARCIAL` | Há campos como `OCUPACAO_TEMPORARIA_PIVO` e `ATLETA_OCUPA_PIVO_TEMP` em `COLETA_SCOUT` | Estrutura pronta, semântica textual incompleta | Fechar regra de uso e proibição de confusão com `AT_3X1` |
| Sistemas defensivos e OUT | `PARCIAL` | `TABELA_MESTRE` possui bloco “Sistemas defensivos e OUT”; dicionário cobre `LISTA_RESULTADO_OUT`, `LISTA_CAUSA_OUT` | Modelagem existe, leitura normativa ainda não está fechada | Formalizar `ESTRUTURA_NUMERICA_REAL` e critérios de julgamento |
| Goleira | `PARCIAL` | `DICIONARIO_CODIGOS` tem bloco `Goleira` com `33` entradas | Há material operacional, mas o manual textual ainda não fecha o conjunto mínimo de variáveis | Consolidar subdomínio da goleira em texto |
| Bola parada e contextos especiais | `PARCIAL` | bloco “Bola parada e situações especiais” com `54` campos; `LISTA_CONTEXTO_ESPECIAL` tem `16` códigos | Estrutura muito mais avançada que o manual sugere | Inventariar famílias `6M_*`, `TL_*`, `RL_*`, `RG_*`, `GG_*`, `ULTIMA_POSSE_*` em texto |
| Shootout | `CLARO` | bloco próprio com `20` campos e `LISTA_SHOOTOUT` com `11` códigos | Fechado estruturalmente | Documentar sem reinventar |
| Eventos mentais/comportamentais | `PARCIAL` | `EVENTOS_MENTAIS` tem `16` campos; dicionário tem `125` entradas no bloco `Mental/comportamental` | A camada mental já está densamente modelada | Consolidar taxonomias e gatilhos em SSOT textual |
| `COMUNICACAO_MOMENTO_CRITICO` | `PARCIAL` | dicionário cobre `LISTA_CONTEXTO_PRESSAO` e famílias mentais; indício de taxonomia operacional já materializada | Provável gap do texto, não da modelagem | Extrair categorias reais do dicionário e formalizar no manual |
| `VALIDACAO` | não enfatizado no diagnóstico | aba dedicada com `10` campos | A pipeline de revisão/correção já existe | Levar para texto as regras de uso e ciclo de estados |
| `RELATORIO` e `FEEDBACK` | `PARCIAL` | abas próprias com `10` e `12` campos; dicionário tem bloco `Relatório/feedback` com `32` entradas | As saídas derivadas existem como contrato operacional | Fechar critérios de derivação e prioridade |
| `LISTAS` | `CLARO` | `58` linhas; famílias extensas já organizadas | Fechado operacionalmente | Espelhar em documento textual navegável |
| `DICIONARIO_CODIGOS` | `PARCIAL`/“nominal” | aba própria com `942` linhas, colunas de definição, quando usar, quando não usar, exemplo e erro comum | O workbook já resolve muito mais do que o texto reconhece | Transformar em dicionário textual versionável por famílias |
| Dependência do `.xlsx` | `CRÍTICO` | o `.xlsx` é hoje o artefato mais completo | Verdade operacional excessivamente dependente de planilha | Migrar a regra oficial para docs textuais do repo |

## 5. O que o `MANUSCOUT.md` acertou

O diagnóstico textual continua válido em pontos centrais:

- a SSOT textual ainda não está pronta;
- implementar scout agora geraria dependência de interpretação livre;
- faltam regras semânticas consolidadas em texto para:
  - `FASE_DA_ATLETA`
  - transição vs estabilização
  - `AT_3X1`/`AT_4X0`
  - pivô fixa/temporária
  - OUT
  - goleira
  - contextos especiais
  - prioridade de treino/feedback

## 6. O que o `MANUSCOUT.md` subestima

O manual auditado subestima a maturidade do workbook em três frentes:

1. o `DICIONARIO_CODIGOS` já existe e é grande (`942` linhas);
2. a planilha já possui pipeline explícita de `VALIDACAO`, `RELATORIO` e `FEEDBACK`;
3. o status `PASS` em `AUDITORIA_SSOT` indica que a governança do workbook está mais adiantada do que o texto principal deixa transparecer.

Isso não invalida o `MANUSCOUT.md`; apenas muda a natureza da Etapa A:

- não é “criar método do zero”;
- é “internalizar em texto versionável o método já operacionalizado na planilha”.

## 7. Decisão metodológica para a Etapa A

Durante a consolidação, usar esta precedência:

1. `Tabela_Mestre_dos_Campos.xlsx`
2. `MANUSCOUT.md`
3. artefatos de código do scout apenas como referência residual

Regra:

- se a planilha já fecha um conceito por campos + lista + dicionário, o trabalho é textualizar e rastrear;
- se a planilha não fecha o conceito e o `MANUSCOUT.md` aponta o gap, o gap continua aberto e precisa de decisão explícita.

## 8. Backlog objetivo da Etapa A

### 8.1 Artefatos textuais a produzir

1. `docs/scout/scout-ssot.md`
2. `docs/scout/scout-campos.md`
3. `docs/scout/scout-listas.md`
4. `docs/scout/scout-dicionario-codigos.md`
5. `docs/scout/scout-validacoes.md`
6. `docs/scout/scout-rastreabilidade.md`

### 8.2 Sequência lógica

1. Fechar semântica nuclear:
   - `FASE_DA_BOLA`
   - `FASE_DA_ATLETA`
   - transição
   - sistema estabilizado
2. Fechar taxonomia tática:
   - `AT_3X1`
   - `AT_4X0`
   - pivô fixa
   - pivô temporária
   - OUT
3. Fechar contextos especiais e goleira
4. Fechar eventos mentais e comunicação crítica
5. Publicar dicionário textual por famílias
6. Publicar matriz de rastreabilidade:
   - `conceito -> campo -> lista -> validação -> derivado`

## 9. Critério de aceite da reconciliação

Esta reconciliação terá cumprido seu papel quando:

1. a implementação futura não depender mais do `.xlsx` como única fonte prática de verdade;
2. o texto no repositório permitir reconstruir o modelo do scout sem ambiguidade relevante;
3. cada conceito crítico apontado pelo `MANUSCOUT.md` tiver destino explícito em documento textual derivado.

## 10. Veredito final

**Veredito:** a Etapa A deve começar pela consolidação textual derivada do workbook, e não por testes em produção nem por implementação de UI/store.

O próximo passo lógico não é “codar scout”.

O próximo passo lógico é:

1. promover o conteúdo operacional da planilha para SSOT textual;
2. fechar as lacunas semânticas apontadas pelo `MANUSCOUT.md`;
3. só então abrir o plano técnico de implementação Supabase-first.
