---
tipo: CATALOGO-TEMATICO
nome: "Scout — Regras de Validação"
papel: "Define os gates de consistência, regras condicionais e critérios de bloqueio do scout, derivados da `TABELA_MESTRE`, da aba `VALIDACAO` e da SSOT textual já consolidada."
autoridade: "Hierarquia 3/4 para o domínio scout — prevalece sobre validação ad hoc no runtime; perde para correção factual revalidada do workbook quando houver divergência material de regra ou obrigatoriedade."
lido_por: "Humano, Claude, Codex, Copilot"
quando_ler: "antes de implementar schema, constraints, formulários, importadores, revisão manual e pipelines de validação do scout."
atualizado_por: "Agente executor + confirmação humana"
quando_atualizar: "um campo mudar de obrigatoriedade; uma regra contextual for refinada; a estrutura de revisão/relatório/feedback mudar; uma deriva do workbook for saneada."
validade: "2026-05-08"
status: PARCIAL
status_nota: "Contrato textual inicial de validações da Etapa A. Fecha os gates principais de consistência, mas ainda não substitui futura rastreabilidade linha a linha entre campo, lista e regra."
conflito: "Se este documento divergir da SSOT semântica, a SSOT prevalece; se divergir da `TABELA_MESTRE` em obrigatoriedade ou regra factual, revalidar o workbook; se a `TABELA_MESTRE` estiver omissa, este documento preenche o comportamento normativo mínimo."
proibido:
  - "Agentes NÃO devem tratar ausência de `Obrigatório` na planilha como autorização automática para deixar o campo solto."
  - "NÃO devem reduzir a validação do scout a checagem de enum sem checar contexto, referência e consistência entre contratos."
nao_cobre: "DDL final de banco, mensagens de erro de UI, implementação exata de triggers/RPCs e matriz completa campo -> regra -> lista -> teste automatizado."
---

# Scout — Regras de Validação

## 1. Objetivo

Este documento fecha o próximo nível da Etapa A:

- quais campos são bloqueantes;
- quais regras são condicionais;
- quais inconsistências são erro, alerta ou pendência de revisão;
- como os contratos do scout se validam entre si.

Ele existe para impedir três fracassos clássicos:

1. tratar o scout como um formulário sem contexto;
2. validar apenas “enum correto” e ignorar coerência de jogada;
3. perder rastreabilidade entre coleta, participação, mental, revisão, relatório e feedback.

## 2. O que foi revalidado

### 2.1 `TABELA_MESTRE`

Campos relevantes disponíveis:

- `Aba`
- `Campo`
- `Tipo`
- `Obrigatório`
- `Opções/Origem`
- `Regra/Definição`
- `Bloco`

Resumo factual por aba:

| Aba | `Sim` | `Condicional` | `Opcional` | vazio |
|---|---:|---:|---:|---:|
| `COLETA_SCOUT` | 14 | 298 | 10 | 15 |
| `PARTICIPACOES` | 7 | 10 | 0 | 0 |
| `EVENTOS_MENTAIS` | 10 | 1 | 0 | 5 |
| `CAD_ATLETAS` | 8 | 0 | 11 | 0 |
| `CAD_EQUIPES` | 3 | 0 | 2 | 0 |
| `VALIDACAO` | 3 | 7 | 0 | 0 |
| `RELATORIO` | 4 | 6 | 0 | 0 |
| `FEEDBACK` | 6 | 6 | 0 | 0 |
| `DASHBOARD` | 3 | 3 | 0 | 0 |

### 2.2 Aba `VALIDACAO`

Campos estruturais confirmados:

- `ID_VALIDACAO`
- `ID_JOGADA`
- `CAMPO_REVISADO`
- `VALOR_ORIGINAL`
- `VALOR_CORRIGIDO`
- `STATUS_VALIDACAO`
- `VALIDADOR`
- `DATA_VALIDACAO`
- `MOTIVO_CORRECAO`
- `OBS_VALIDACAO`

## 3. Princípio crítico sobre omissões do workbook

Há linhas com `Obrigatório` vazio, especialmente em:

- `COLETA_SCOUT`
- `EVENTOS_MENTAIS`

Regra:

- ausência de marcação explícita **não** significa “livre”;
- nesses casos, a obrigatoriedade sobe para o nível do contrato;
- se um campo é estrutural para manter coerência do contrato, ele é validado por regra contextual mesmo sem `Sim`/`Condicional` explícito na célula.

## 4. Camadas de validação

Toda linha do scout deve passar por seis camadas:

1. validação estrutural
2. validação categórica
3. validação contextual
4. validação referencial
5. validação semântica
6. validação derivada/revisional

### 4.1 Validação estrutural

Checa:

- presença de IDs;
- formato básico de data/hora;
- preenchimento mínimo de campos obrigatórios;
- campos numéricos realmente numéricos;
- campos de texto livre curtos e controlados quando exigidos.

### 4.2 Validação categórica

Checa:

- se o valor pertence à lista correta;
- se não houve texto livre no lugar de enum;
- se `NAO_APLICA` e `NAO_OBSERVADO` foram usados de forma distinta.

### 4.3 Validação contextual

Checa:

- se o campo faz sentido para aquela fase, contexto especial ou contrato;
- se campos dependentes foram preenchidos quando o gatilho apareceu.

### 4.4 Validação referencial

Checa:

- se IDs referenciados existem;
- se registros filhos apontam para pai válido;
- se `ID_JOGO` e `ID_JOGADA` são coerentes entre contratos.

### 4.5 Validação semântica

Checa:

- coerência com `scout-ssot.md`;
- transição vs sistema estabilizado;
- `AT_3X1` vs `AT_4X0`;
- `OUT` vs estrutura numérica;
- camada mental com evidência observável.

### 4.6 Validação derivada/revisional

Checa:

- consistência de relatório e feedback com evidências;
- correções registradas em `VALIDACAO`;
- ausência de órfãos entre coleta e saídas derivadas.

## 5. Severidades recomendadas

### 5.1 Erro bloqueante

Bloqueia gravação ou publicação:

- ID ausente;
- enum fora da lista;
- referência inexistente;
- campo dependente ausente quando gatilho foi confirmado;
- incoerência grave com a SSOT.

### 5.2 Erro de consistência

Pode permitir salvamento técnico, mas não publicação analítica:

- relatório sem evidência;
- feedback sem destinatário consistente;
- camada mental sem evidência observável suficiente;
- `OUT` sem estrutura numérica.

### 5.3 Alerta de revisão

Não bloqueia imediatamente, mas exige revisão:

- uso excessivo de `NAO_OBSERVADO`;
- campos textuais vagos;
- prioridade de treino pouco sustentada;
- campo com regra ambígua herdada do workbook.

## 6. Invariantes globais

Valem para todos os contratos:

1. `ID_JOGADA` é a unidade primária do scout.
2. Nenhum contrato filho pode existir sem pai válido.
3. Campo categórico só aceita valor da lista de origem.
4. `NAO_APLICA` e `NAO_OBSERVADO` não são intercambiáveis.
5. Campo referencial só aceita ID ou valor padronizado do cadastro correspondente.
6. Campo textual controlado deve ser objetivo, curto e verificável.
7. Campo numérico não aceita semântica textual disfarçada.
8. Campo temporal deve respeitar contexto de sessão, vídeo ou validação.

## 7. Validações de `COLETA_SCOUT`

### 7.1 Gate mínimo estrutural

Devem existir:

- `ID_JOGADA`
- `ID_JOGO`
- `DATA_SESSAO`
- `TIPO_SESSAO`
- `PERIODO`
- `TEMPO_JOGO`
- `FONTE_COLETA`
- `FASE_DA_BOLA`
- `EQUIPE_ATACANTE`

Regra:

- sem esse núcleo, a jogada não existe como unidade válida.

### 7.2 Regras condicionais de sessão

- `ADVERSARIO` é obrigatório quando `TIPO_SESSAO` for `JOGO` ou `AMISTOSO`.
- `ADVERSARIO` pode ser vazio ou `NAO_APLICA` em `TREINO` e `SIMULADO`, conforme o modelo final adotar enum ou nullable.

### 7.3 Regras de fase

- `FASE_DA_BOLA` deve ser um valor de `LISTA_FASES`.
- se `FASE_DA_BOLA` for `TRANS_OF` ou `TRANS_DEF`, a jogada entra no regime de transição.
- se `FASE_DA_BOLA` for `AT_POS` ou `DEF_POS`, não é permitido usar bloco transitório como leitura principal da jogada.

### 7.4 Regras de sistema ofensivo

- `SISTEMA_OFENSIVO` só pode receber valor de `LISTA_SISTEMA_OFENSIVO`.
- `CONFIGURACAO_OFENSIVA` só pode ser preenchida quando `SISTEMA_OFENSIVO` estiver presente e compatível.
- se `SISTEMA_OFENSIVO = AT_3X1`, `CONFIGURACAO_OFENSIVA` deve vir de `LISTA_CONFIG_3X1` ou da lista agregada compatível.
- se `SISTEMA_OFENSIVO = AT_4X0`, `CONFIGURACAO_OFENSIVA` deve vir de `LISTA_CONFIG_4X0` ou da lista agregada compatível.

Erro bloqueante:

- configuração ofensiva sem sistema-base confirmado.

### 7.5 Pivô temporária

Se `OCUPACAO_TEMPORARIA_PIVO = SIM`, então devem existir:

- `ATLETA_OCUPA_PIVO_TEMP`
- `RESULTADO_OCUPACAO_PIVO_TEMP`

Se `OCUPACAO_TEMPORARIA_PIVO = NAO`:

- os campos dependentes não devem carregar valor afirmativo real;
- o modelo final pode optar por vazio ou `NAO_APLICA`, mas deve ser consistente.

Regra semântica:

- pivô temporária não muta automaticamente `AT_4X0` em `AT_3X1`.

### 7.6 Sistema defensivo

- `SISTEMA_DEFENSIVO` só aceita valor da lista defensiva correspondente.
- leitura de sistema defensivo exige organização observável.
- ajuste momentâneo não pode ser salvo como sistema final.

### 7.7 Bloco de transições

Se a jogada usa leitura de transição ofensiva ou defensiva, então ao menos uma combinação coerente deve existir:

- forma da transição;
- objetivo da transição;
- status de estabilização;
- motivo de fim da transição.

Regra:

- posição/função transitória não deve ser “corrigida” pela posição final estabilizada.

Erro bloqueante:

- `TRANS_*` com sistema final preenchido como se fosse a mesma camada sem distinção contextual.

### 7.8 Bloco `OUT`

Se `OUT_SITUACAO` diferente de `SEM_OUT` e `NAO_OBSERVADO`, devem existir:

- `ESTRUTURA_NUMERICA_REAL`
- `RESULTADO_OUT`
- `CAUSA_OUT`

Validações semânticas mínimas:

- `OUT_ATAQUE` deve ser compatível com a lógica de `OF_3_DEF_3`
- `OUT_DEFESA` deve ser compatível com a lógica de `OF_4_DEF_2`

Erro bloqueante:

- registrar `OUT` sem estrutura numérica.

### 7.9 Bola parada e contexto especial

Se `CONTEXTO_ESPECIAL` diferente de `NAO_APLICA`:

- a família específica precisa ser coerente com o evento;
- não é válido preencher `TL_*` em reposição lateral, por exemplo.

Se `TIPO_BOLA_PARADA = TIRO_6M`:

- a família `6M_*` torna-se o bloco principal esperado.

### 7.10 Camada mental na jogada

Se qualquer um destes campos estiver preenchido:

- `EVENTO_MENTAL_GATILHO`
- `RESPOSTA_APOS_ERRO`
- `COMPORTAMENTO_PRESSAO`
- `COMUNICACAO_MOMENTO_CRITICO`

então deve haver, no mínimo:

- contexto coerente;
- evidência observável;
- ausência de rótulo subjetivo solto.

## 8. Validações de `COLETA_AO_VIVO`

### 8.1 Gate mínimo

Devem existir:

- `ID_JOGADA`
- `ID_JOGO`
- `TEMPO_JOGO`
- `FASE_DA_BOLA`
- `EQUIPE_ANALISADA`
- `ACAO_PRINCIPAL`
- `RESULTADO_FACTUAL`

### 8.2 Regra operacional

`COLETA_AO_VIVO` é captura compacta.

Logo:

- pode ser menos densa que `COLETA_SCOUT`;
- não pode contradizer a jogada para a qual depois convergir.

### 8.3 `STATUS_VALIDACAO`

Deve aceitar apenas lista válida e deve orientar o pipeline de revisão posterior.

## 9. Validações de `PARTICIPACOES`

### 9.1 Gate mínimo

Devem existir:

- `ID_JOGADA`
- `ID_JOGO`
- `ATLETA`
- `PAPEL`
- `FASE_DA_BOLA`
- `RESULTADO_INDIVIDUAL`

### 9.2 Coerência com a coleta principal

- `ID_JOGADA` deve existir em `COLETA_SCOUT`
- `ID_JOGO` deve bater com o da jogada pai
- `FASE_DA_BOLA` deve ser compatível com a fase da jogada pai

### 9.3 `FASE_DA_ATLETA`

É condicional, mas quando preenchida:

- pode divergir legitimamente de `FASE_DA_BOLA`;
- não pode contradizer a SSOT de transição/estabilização;
- não pode ser inferida mecanicamente da posição final.

### 9.4 Sistemas e posição

Se `SISTEMA_OFENSIVO` ou `SISTEMA_DEFENSIVO` estiverem preenchidos:

- devem ser compatíveis com a leitura da jogada pai;
- posição e função especial devem respeitar a lista apropriada.

### 9.5 Causa e prioridade

Se `PRIORIDADE_TREINO` estiver preenchida:

- `CAUSA_PRINCIPAL` deve existir ou ser defensável;
- não deve ser chute analítico sem evidência individual.

## 10. Validações de `EVENTOS_MENTAIS`

### 10.1 Gate mínimo

Devem existir:

- `ID_EVENTO_MENTAL`
- `ID_JOGADA`
- `ID_JOGO`
- `TEMPO_VIDEO`
- `ATLETA_OBSERVADA`
- `CODIGO_MENTAL`
- `MARCA_MENTAL`
- `OBS_MENTAL`

### 10.2 Coerência observável

- evento mental só pode existir com evidência observável;
- não usar como diagnóstico interno abstrato.

### 10.3 Contexto de pressão

`CONTEXTO_PRESSAO` aparece como condicional no workbook, mas operacionalmente:

- torna-se obrigatório quando o evento mental depende de contexto crítico;
- ao menos um contexto coerente deve existir quando a leitura mental o exigir.

### 10.4 Vínculo com jogada

- `ID_JOGADA` deve existir
- `ID_JOGO` deve bater com a jogada pai
- `ATLETA_OBSERVADA` deve existir no cadastro tático

## 11. Validações de `VALIDACAO`

### 11.1 Gate mínimo

Devem existir:

- `ID_VALIDACAO`
- `ID_JOGADA`
- `STATUS_VALIDACAO`

### 11.2 Regras condicionais

Se houver correção real, devem existir:

- `CAMPO_REVISADO`
- `VALOR_ORIGINAL`
- `VALOR_CORRIGIDO`

Se `STATUS_VALIDACAO` for diferente de `PENDENTE`, devem existir:

- `VALIDADOR`
- `DATA_VALIDACAO`

`MOTIVO_CORRECAO`:

- deve existir sempre que houver alteração substantiva de valor.

### 11.3 Observação complementar

`OBS_VALIDACAO`:

- só deve ser usado para evidência que não cabe nos campos estruturados;
- não substitui motivo ou valor corrigido.

## 12. Validações de `RELATORIO`

### 12.1 Gate mínimo

Devem existir:

- `ID_RELATORIO`
- `ID_JOGO`
- `VALOR`

### 12.2 Regra operacional

Embora `BLOCO_RELATORIO` apareça como condicional na planilha, um relatório sem bloco é operacionalmente ruim.

Regra recomendada:

- tratar `BLOCO_RELATORIO` como obrigatório para publicação analítica.

### 12.3 Evidência e leitura técnica

Se houver leitura técnica ou prioridade:

- `AMOSTRA` deve ser defensável;
- `IDS_EVIDENCIA` deve apontar para IDs reais ou conjunto de jogadas rastreáveis.

Erro de consistência:

- relatório conclusivo sem amostra nem evidência.

## 13. Validações de `FEEDBACK`

### 13.1 Gate mínimo

Devem existir:

- `ID_FEEDBACK`
- `ID_JOGO`
- `ID_JOGADA`
- `DESTINATARIO_FEEDBACK`
- `TIPO_FEEDBACK`
- `MENSAGEM_FEEDBACK`

### 13.2 Destinatário e alvo

Se `DESTINATARIO_FEEDBACK = ATLETA`, então:

- `ATLETA_FEEDBACK` deve existir.

Se o destinatário for:

- `SETOR_OFENSIVO`
- `SETOR_DEFENSIVO`
- `GOLEIRA`
- `TRANSICAO`
- `EQUIPE`
- `COMISSAO`

então `ATLETA_FEEDBACK` não deve ser usado como se fosse obrigatório individual.

### 13.3 Tema, ação e prioridade

Se houver `TEMA_FEEDBACK`:

- ele deve vir da lista correta;
- a `ACAO_RECOMENDADA` deve ser coerente com o tema.

Se houver `PRIORIDADE_FEEDBACK`:

- ela não substitui a prioridade técnica do relatório, apenas a urgência de entrega do feedback.

## 14. Validações de `CAD_ATLETAS`

### 14.1 Gate mínimo

Devem existir:

- `ID_ATLETA`
- `MAO_DOMINANTE`
- `FUNCAO_PRINCIPAL`
- `GOLEIRA`
- `ESPECIALISTA`

### 14.2 Coerência tática

- posições por sistema devem usar listas corretas;
- campos booleano-observacionais devem respeitar a convenção `SIM`/`NAO`/`NAO_OBSERVADO` se o modelo final mantiver essa estrutura.

## 15. Validações de `CAD_EQUIPES`

### 15.1 Gate mínimo

Devem existir:

- `ID_EQUIPE`
- `NOME_EQUIPE`
- `TIPO_EQUIPE`

### 15.2 Uso referencial

- equipes usadas em sessão, adversário e contexto competitivo devem existir no cadastro ou em conjunto padronizado equivalente.

## 16. Gates entre contratos

### 16.1 Órfãos proibidos

Não pode existir:

- `PARTICIPACOES` sem `COLETA_SCOUT`
- `EVENTOS_MENTAIS` sem `COLETA_SCOUT`
- `VALIDACAO` sem `COLETA_SCOUT`
- `FEEDBACK` com `ID_JOGADA` sem jogada pai

### 16.2 Integridade de `ID_JOGO`

Todo filho de jogada deve herdar:

- o mesmo `ID_JOGO` da jogada pai

### 16.3 Rastreamento analítico

`RELATORIO` e `FEEDBACK` devem poder voltar para:

- `ID_JOGO`
- `ID_JOGADA`
- `IDS_EVIDENCIA` quando aplicável

## 17. Regras de publicação analítica

Uma linha pode existir tecnicamente e ainda assim não estar pronta para uso analítico.

Critério mínimo para “publicável”:

- enums válidos;
- referências válidas;
- sem contradição com a SSOT;
- sem órfãos;
- com evidência mínima quando houver interpretação técnica.

## 18. Implicações técnicas imediatas

Este documento já impõe decisões concretas:

1. o scout precisa de validação contextual, não só enum validation;
2. `NAO_APLICA` e `NAO_OBSERVADO` devem ser persistidos separadamente;
3. a pipeline deve suportar revisão formal em `VALIDACAO`;
4. relatórios e feedbacks precisam de rastreabilidade;
5. ausência de marcação de obrigatoriedade no workbook deve ser resolvida por regra de contrato.

## 19. Próximo artefato obrigatório

Depois deste documento, a Etapa A ainda precisa fechar:

1. `docs/scout/scout-rastreabilidade.md`

## 20. Veredito

Com semântica, campos, listas, dicionário e validações textuais, o scout já tem base suficiente para sair do estado de “planilha inteligente” e entrar em contrato técnico implementável.

O próximo passo lógico depois desta peça não é mais discutir significado isolado.

É fechar a rastreabilidade completa entre:

- conceito
- campo
- lista
- validação
- derivado
