---
tipo: PLANO-OPERACIONAL
nome: "Planilha Operacional CEPRAEA — Plano Completo"
papel: "Define a ponte operacional de agenda, treino, metas, scout, convocações e documentos enquanto o runtime do PWA ainda não cobre integralmente esses fluxos."
autoridade: "Documento auxiliar — subordinado ao CEPRAEA.md e plan.md"
atualizado_por: "Codex — 18 de maio de 2026"
---

# PLANILHA OPERACIONAL CEPRAEA — Plano Completo

## 1. Diagnóstico real (o que o ChatGPT não sabia)

O ChatGPT sugeriu Google Sheets como solução permanente **sem saber que você já tem:**

| O que você já tem | Onde |
|---|---|
| Banco relacional robusto | Supabase (PostgreSQL + RLS + RPCs) |
| Tabelas: `teams`, `athletes`, `trainings`, `attendance_records`, `scout_games` | `supabase/migrations/` |
| Auth completo (coach + atleta com token de presença) | migration 0006 |
| PWA com build, testes E2E, CI | `src/`, `e2e/`, Playwright |
| Scout tático com livro de códigos | migrations 0008–0016 |

**O que falta no schema atual** (causa raiz do problema):

| Tabela / módulo faltante | Por que é necessária |
|---|---|
| `training_plans` | Plano de treino do dia com objetivo, blocos, exercícios e observações |
| `athlete_goals` | Metas individuais com origem `atleta`, `treinador` e `scout` |
| `team_goals` | Metas da equipe com origem `treinador` e `scout` |
| `games` | Jogos de competição e amistosos |
| `competitions` | Campeonatos, torneios, ligas |
| `team_agenda_events` | Agenda oficial da equipe para treinos, jogos, viagens e competições |
| `convocations` | Relação nominal por jogo/viagem com confirmação ativa da atleta |
| `athlete_details` | Responsável, documento, nº camisa, posição ofensiva, função defensiva, uniforme |
| `athlete_scout_views` | Leitura individual do scout pela atleta |
| `sumulas` | Resultado e placar oficial por jogo |
| `generated_documents` | Controle do que foi gerado e enviado |

**Conclusão:** o problema não é falta de planilha. É que o runtime atual do PWA ainda não cobre integralmente os módulos de operação esportiva definidos no PRD. A planilha é a **ponte operacional** para treino, metas, agenda, convocações, scout e documentos enquanto esses módulos não estão consolidados no app.

---

## 2. Estratégia (zero custo, superior ao ChatGPT)

### Por que a proposta do ChatGPT não é a melhor

| Limitação do ChatGPT | Solução correta |
|---|---|
| Google Sheets como banco permanente | Supabase já existe — extensão do schema |
| Make/Zapier para automação (pode ter custo) | Google Apps Script (sempre gratuito) |
| Estrutura desconectada do PWA | Sheets alinhado ao schema Supabase existente |
| Atleta duplicada por equipe | Schema Supabase já tem `team_id` + migração |
| Sem geração de PDF no app | HTML `window.print()` no PWA (zero custo) |
| Sem caminho de migração | IDs do Sheets exportáveis para Supabase |
| Sem módulos operacionais completos no app | Proposta de ponte + extensão de schema abaixo |

### Arquitetura em 3 camadas (todas gratuitas)

```
AGORA                    PRÓXIMAS SPRINTS           FUTURO
─────────────────────    ──────────────────────     ────────────────────────────────
Google Sheets            Supabase Schema            PWA: Operação esportiva integrada
(ponte operacional)  →   Extension            →     treino + metas + agenda +
AppScript p/ docs        migrations 0017+           convocações + documentos + scout
```

---

## 3. Camada 1 — Google Sheets (uso imediato, zero custo)

### 3.1 Estrutura de abas

Crie **um único arquivo** no Google Drive: `CEPRAEA — Base Operacional 2026`

#### ABA 1: `EQUIPES`
> Fonte de verdade das equipes. Cada linha = 1 equipe. No contexto atual do CEPRAEA, a equipe principal é `Adulto Feminino` de `Handebol de Praia`, mas a aba pode comportar outras equipes se isso for decisão operacional futura.

| Coluna | Tipo | Validação | Exemplo |
|---|---|---|---|
| `equipe_id` | texto | auto: `EQ-001` | `EQ-001` |
| `supabase_uuid` | texto | UUID colado do Supabase | `3fa8...` |
| `nome_equipe` | texto | obrigatório | `CEPRAEA Adulto Feminino` |
| `modalidade` | lista | Handebol de Praia / Handebol de Quadra | `Handebol de Praia` |
| `categoria` | lista | Adulto / Cadete / Infantil / Sub-16 | `Adulto` |
| `naipe` | lista | Feminino / Masculino / Misto | `Feminino` |
| `temporada` | número | 4 dígitos | `2026` |
| `status` | lista | Ativa / Inativa / Suspensa | `Ativa` |

> **Diferença do ChatGPT:** coluna `supabase_uuid` para sincronização direta com o banco existente — sem re-digitação.

---

#### ABA 2: `ATLETAS`
> Extensão dos dados do Supabase `athletes`. Não duplica — complementa.

| Coluna | Tipo | Notas |
|---|---|---|
| `atleta_id` | texto | `ATL-001` |
| `supabase_uuid` | texto | UUID do `athletes.id` no Supabase |
| `nome_completo` | texto | obrigatório |
| `nome_curto` | texto | apelido/nome no colete |
| `data_nascimento` | data | formato `DD/MM/AAAA` |
| `email` | texto | único por equipe |
| `telefone_atleta` | texto | com DDD |
| `nome_responsavel` | texto | obrigatório se menor |
| `telefone_responsavel` | texto | com DDD |
| `tipo_documento` | lista | RG / CPF / RG+CPF / Passaporte |
| `numero_documento` | texto | |
| `status_documento` | lista | Entregue / Pendente / Vencido / Não informado |
| `observacoes` | texto | |

> **Aba `ATLETAS` não tem equipe_id.** A ligação é feita na aba `VINCULOS`.

---

#### ABA 3: `VINCULOS_ATLETA_EQUIPE`
> Liga atleta ↔ equipe para a temporada. Uma atleta pode estar em N equipes.

| Coluna | Tipo | Notas |
|---|---|---|
| `vinculo_id` | texto | `VINC-001` |
| `atleta_id` | texto | referência → `ATLETAS.atleta_id` |
| `equipe_id` | texto | referência → `EQUIPES.equipe_id` |
| `temporada` | número | `2026` |
| `numero_camisa` | número | inteiro |
| `posicao_ofensiva` | lista | Central / Lateral Esquerda / Lateral Direita / Pivô / Goleira |
| `funcao_defensiva` | lista | Defensora Solta / Defensora Base / Defensora API |
| `tamanho_uniforme` | lista | PP / P / M / G / GG / XGG |
| `status_vinculo` | lista | Ativa / Suspensa / Desligada |

---

#### ABA 4: `PLANOS_TREINO_DIA`
> Plano oficial do treino do dia publicado para a equipe.

| Coluna | Tipo | Notas |
|---|---|---|
| `plano_id` | texto | `PLAN-001` |
| `equipe_id` | texto | referência → `EQUIPES.equipe_id` |
| `data_treino` | data | obrigatória |
| `objetivo_principal` | texto | obrigatório |
| `observacoes` | texto | observações técnicas e operacionais |
| `publicado_por` | texto | treinador responsável |
| `status_plano` | lista | Rascunho / Publicado / Encerrado |

---

#### ABA 5: `BLOCOS_TREINO`
> Desdobra o plano do dia em blocos com objetivo específico e exercício principal.

| Coluna | Tipo | Notas |
|---|---|---|
| `bloco_id` | texto | `BLOC-001` |
| `plano_id` | texto | referência → `PLANOS_TREINO_DIA.plano_id` |
| `ordem_bloco` | número | inteiro, sequência visual |
| `objetivo_especifico` | texto | obrigatório |
| `exercicio_principal` | texto | obrigatório |
| `meta_relacionada` | texto | ids ou títulos resumidos das metas impactadas |
| `observacoes_bloco` | texto | |

---

#### ABA 6: `METAS_INDIVIDUAIS`
> Uma linha por meta individual. Suporta origens `atleta`, `treinador` e `scout`.

| Coluna | Tipo | Notas |
|---|---|---|
| `meta_individual_id` | texto | `METAI-001` |
| `equipe_id` | texto | referência → `EQUIPES.equipe_id` |
| `atleta_id` | texto | referência → `ATLETAS.atleta_id` |
| `origem_meta` | lista | Atleta / Treinador / Scout |
| `contexto_meta` | lista | Treino / Jogo / Scout / Competição |
| `titulo_meta` | texto | obrigatório |
| `descricao_meta` | texto | |
| `status_meta` | lista | Ativa / Em acompanhamento / Concluída / Cancelada |
| `inicio_meta` | data | |
| `prazo_meta` | data | |
| `referencia_scout` | texto | opcional, quando origem = Scout |
| `observacoes_meta` | texto | |

---

#### ABA 7: `METAS_EQUIPE`
> Metas coletivas da equipe, criadas por treinador ou derivadas do scout.

| Coluna | Tipo | Notas |
|---|---|---|
| `meta_equipe_id` | texto | `METAE-001` |
| `equipe_id` | texto | referência → `EQUIPES.equipe_id` |
| `origem_meta` | lista | Treinador / Scout |
| `contexto_meta` | lista | Treino / Jogo / Scout / Competição |
| `titulo_meta` | texto | obrigatório |
| `descricao_meta` | texto | |
| `status_meta` | lista | Ativa / Em acompanhamento / Concluída / Cancelada |
| `inicio_meta` | data | |
| `prazo_meta` | data | |
| `referencia_scout` | texto | opcional |
| `observacoes_meta` | texto | |

---

#### ABA 8: `COMPETICOES`
> **Ausente no ChatGPT.** Campeonatos e torneios da temporada.

| Coluna | Tipo | Notas |
|---|---|---|
| `competicao_id` | texto | `COMP-001` |
| `nome` | texto | ex: `CBHb Handebol de Praia 2026` |
| `organizador` | texto | |
| `modalidade` | lista | mesma do EQUIPES |
| `fase_atual` | texto | Fase de Grupos / Quartas / Semi / Final |
| `data_inicio` | data | |
| `data_fim` | data | |
| `local_sede` | texto | |
| `status` | lista | A Iniciar / Em Andamento / Encerrado |

---

#### ABA 9: `JOGOS_EVENTOS`
> Agenda oficial da equipe para treinos, jogos, viagens, reuniões e competições.

| Coluna | Tipo | Notas |
|---|---|---|
| `evento_id` | texto | `EVT-001` |
| `equipe_id` | texto | referência → `EQUIPES` |
| `competicao_id` | texto | referência → `COMPETICOES` (pode ser vazio) |
| `tipo_evento` | lista | Jogo Oficial / Amistoso / Treino / Reunião / Viagem / Competição |
| `adversario` | texto | nome do time adversário |
| `data` | data | |
| `horario_apresentacao` | hora | horário de chegada no local |
| `horario_jogo` | hora | |
| `local_nome` | texto | |
| `local_endereco` | texto | |
| `uniforme` | lista | Azul (titular) / Branco (visitante) / Alternativo |
| `transporte_necessario` | lista | Sim / Não / A confirmar |
| `status_evento` | lista | Agendado / Confirmado / Cancelado / Realizado |

> **Como usar:** você fala "jogo do Adulto Feminino sábado" ou "viagem da equipe para a competição" — o sistema localiza por data+equipe. O `EVT-001` é referência interna, não precisa memorizar.

---

#### ABA 10: `CONVOCACOES`
> Uma linha por atleta por jogo ou viagem. Gera relação nominal e registra confirmação ativa da atleta.

| Coluna | Tipo | Notas |
|---|---|---|
| `convocacao_id` | texto | `CONV-001` |
| `evento_id` | texto | referência → `JOGOS_EVENTOS` |
| `atleta_id` | texto | referência → `ATLETAS` |
| `status_convocacao` | lista | Convocada / Dispensada / Lesionada / Suspeita |
| `resposta_atleta` | lista | Confirmada / Recusada / Pendente |
| `respondido_em` | data e hora | vazio enquanto pendente |
| `documento_ok` | lista | Sim / Não |
| `autorizacao_responsavel_ok` | lista | Sim / Não / N/A (maior de idade) |
| `observacao_atleta` | texto | justificativa da resposta |
| `observacao_comissao` | texto | uso da comissão técnica |

---

#### ABA 11: `SUMULAS_RESULTADOS`
> Registro do resultado oficial após cada jogo.

| Coluna | Tipo | Notas |
|---|---|---|
| `sumula_id` | texto | `SUM-001` |
| `evento_id` | texto | referência → `JOGOS_EVENTOS` |
| `placar_nos_1t` | número | nosso placar 1º tempo/set |
| `placar_adv_1t` | número | adversário 1º tempo/set |
| `placar_nos_2t` | número | |
| `placar_adv_2t` | número | |
| `shootout_nos` | número | vazio se não houve |
| `shootout_adv` | número | |
| `resultado` | lista | Vitória / Derrota / Empate |
| `link_sumula` | texto | URL do PDF oficial |
| `destaques` | texto | texto livre |
| `observacoes_tecnicas` | texto | |
| `data_registro` | data | |

---

#### ABA 12: `SCOUT_ATLETA_VISOES`
> Estrutura operacional de leitura individual do scout para conferência e exportação antes da consolidação no app.

| Coluna | Tipo | Notas |
|---|---|---|
| `visao_id` | texto | `SCV-001` |
| `equipe_id` | texto | referência → `EQUIPES.equipe_id` |
| `atleta_id` | texto | referência → `ATLETAS.atleta_id` |
| `periodo_referencia` | texto | ex: `2026-Q2` |
| `jogo_referencia` | texto | opcional |
| `tipo_visao` | lista | Evento Bruto / Resumo por Jogo / Indicador Agregado / Histórico por Período |
| `fonte_scout` | texto | id ou código de origem |
| `conteudo_resumido` | texto | resumo legível para conferência operacional |
| `atualizado_em` | data e hora | |

---

#### ABA 13: `DOCUMENTOS_MODELOS`
> Controle dos templates oficiais no Google Drive.

| Coluna | Tipo | Notas |
|---|---|---|
| `modelo_id` | texto | `MOD-001` |
| `tipo_documento` | lista | Relação Nominal / Cronograma / Informativo / Solicitação Transporte / Solicitação Uniforme / Plano de Jogo / Plano de Treino / Relatório Pós-Jogo / Relatório de Metas |
| `equipe_id` | texto | vazio = modelo genérico |
| `nome_arquivo` | texto | |
| `link_template` | texto | URL do Google Docs |
| `campos_variaveis` | texto | `{{NOME_EVENTO}}, {{DATA}}, {{ATLETAS}}` |
| `status_modelo` | lista | Ativo / Rascunho / Obsoleto |

---

#### ABA 14: `DOCUMENTOS_GERADOS`
> Histórico de todos os documentos emitidos.

| Coluna | Tipo | Notas |
|---|---|---|
| `documento_id` | texto | `DOC-001` |
| `evento_id` | texto | referência → `JOGOS_EVENTOS` |
| `equipe_id` | texto | referência → `EQUIPES` |
| `modelo_id` | texto | referência → `DOCUMENTOS_MODELOS` |
| `tipo_documento` | lista | mesmo do MODELOS |
| `versao` | número | `1` |
| `link_pdf` | texto | URL do Google Drive |
| `data_geracao` | data | |
| `gerado_por` | texto | nome do responsável |
| `status` | lista | Rascunho / Enviado / Protocolado / Arquivado |
| `data_envio` | data | |
| `destinatario` | texto | quem recebeu |

---

#### ABA 15: `VALIDACOES` (aba oculta — nunca editar direto)
> Listas controladas usadas em todas as validações. Fonte das dropdowns.

Coluna única por lista:
- `status_evento`: Agendado / Confirmado / Cancelado / Realizado
- `status_atleta`: Ativa / Inativa / Suspensa / Desligada
- `status_documento`: Entregue / Pendente / Vencido / Não informado
- `status_convocacao`: Convocada / Dispensada / Lesionada / Suspeita
- `resposta_atleta`: Confirmada / Recusada / Pendente
- `tipo_evento`: Jogo Oficial / Amistoso / Treino / Reunião / Viagem / Competição
- `tipo_documento`: Relação Nominal / Cronograma / Informativo / Solicitação Transporte / Solicitação Uniforme / Plano de Jogo / Plano de Treino / Relatório Pós-Jogo / Relatório de Metas
- `posicao_ofensiva`: Central / Lateral Esquerda / Lateral Direita / Pivô / Goleira
- `funcao_defensiva`: Defensora Solta / Defensora Base / Defensora API
- `tamanho_uniforme`: PP / P / M / G / GG / XGG
- `resultado_jogo`: Vitória / Derrota / Empate
- `status_modelo`: Ativo / Rascunho / Obsoleto
- `status_pdf`: Rascunho / Enviado / Protocolado / Arquivado
- `status_plano`: Rascunho / Publicado / Encerrado
- `status_meta`: Ativa / Em acompanhamento / Concluída / Cancelada
- `origem_meta_individual`: Atleta / Treinador / Scout
- `origem_meta_equipe`: Treinador / Scout
- `contexto_meta`: Treino / Jogo / Scout / Competição
- `tipo_visao_scout`: Evento Bruto / Resumo por Jogo / Indicador Agregado / Histórico por Período
- `naipe`: Feminino / Masculino / Misto
- `categoria`: Adulto / Cadete / Infantil / Sub-16 / Sub-14
- `modalidade`: Handebol de Praia / Handebol de Quadra

---

### 3.2 Regras de formatação obrigatórias

1. **Linha 1 de cada aba** = cabeçalho fixo, congelado (`Exibir → Fixar → 1 linha`)
2. **Coluna A** sempre = ID sequencial (`EQ-001`, `ATL-001`, etc.)
3. **Coluna B** sempre = `supabase_uuid` ou chave estrangeira principal
4. **Toda coluna de status** = lista suspensa via Dados → Validação → Dropdown (de `VALIDACOES`)
5. **Formatação condicional obrigatória:**
   - Células com `Pendente` / `Não informado` → fundo amarelo
   - Células com `Vencido` / `Cancelado` → fundo vermelho claro
   - Células com `Sim` / `Entregue` / `Confirmado` → fundo verde claro
6. **Proteção:** aba `VALIDACOES` protegida com senha (impede edição acidental)

---

### 3.3 Sistema de IDs

| Prefixo | Entidade | Exemplo |
|---|---|---|
| `EQ-` | Equipe | `EQ-001` |
| `ATL-` | Atleta | `ATL-042` |
| `VINC-` | Vínculo atleta-equipe | `VINC-001` |
| `PLAN-` | Plano de treino do dia | `PLAN-001` |
| `BLOC-` | Bloco de treino | `BLOC-001` |
| `METAI-` | Meta individual | `METAI-014` |
| `METAE-` | Meta da equipe | `METAE-003` |
| `COMP-` | Competição | `COMP-003` |
| `EVT-` | Jogo / Evento | `EVT-017` |
| `CONV-` | Convocação (linha) | `CONV-089` |
| `SUM-` | Súmula / Resultado | `SUM-004` |
| `SCV-` | Visão operacional de scout | `SCV-010` |
| `MOD-` | Modelo de documento | `MOD-008` |
| `DOC-` | Documento gerado | `DOC-031` |

> **Regra:** IDs são sequenciais e imutáveis. Nunca reutilize um ID removido.
> **Automação:** use Apps Script para gerar o próximo ID automaticamente (ver seção 3.4).

---

### 3.4 Google Apps Script — Funcionalidades (100% gratuito)

Acesse via `Extensões → Apps Script` no Google Sheets.

#### Script 1: Auto-gerar próximo ID

```javascript
function proximoId(prefixo, abaId, coluna) {
  const aba = SpreadsheetApp.getActive().getSheetByName(abaId);
  const valores = aba.getRange(2, coluna, aba.getLastRow()).getValues()
    .filter(r => r[0] !== '').map(r => parseInt(r[0].replace(prefixo + '-', '')));
  const proximo = valores.length > 0 ? Math.max(...valores) + 1 : 1;
  return `${prefixo}-${String(proximo).padStart(3, '0')}`;
}
```

#### Script 2: Gerar Relação Nominal por Evento

```javascript
function gerarRelacaoNominal(eventoId) {
  const ss = SpreadsheetApp.getActive();
  const eventos = ss.getSheetByName('JOGOS_EVENTOS').getDataRange().getValues();
  const convocacoes = ss.getSheetByName('CONVOCACOES').getDataRange().getValues();
  const atletas = ss.getSheetByName('ATLETAS').getDataRange().getValues();

  const headersEventos = eventos[0];
  const headersConv = convocacoes[0];
  const headersAtletas = atletas[0];
  const idxEventoId = headersEventos.indexOf('evento_id');
  const idxAdversario = headersEventos.indexOf('adversario');
  const idxData = headersEventos.indexOf('data');
  const idxLocal = headersEventos.indexOf('local_nome');
  const idxApresentacao = headersEventos.indexOf('horario_apresentacao');
  const idxConvEvento = headersConv.indexOf('evento_id');
  const idxConvAtleta = headersConv.indexOf('atleta_id');
  const idxConvStatus = headersConv.indexOf('status_convocacao');
  const idxAtletaId = headersAtletas.indexOf('atleta_id');
  const idxNome = headersAtletas.indexOf('nome_completo');
  const idxTelefone = headersAtletas.indexOf('telefone_atleta');
  const idxDocStatus = headersAtletas.indexOf('status_documento');

  const evento = eventos.slice(1).find(r => r[idxEventoId] === eventoId);
  if (!evento) { SpreadsheetApp.getUi().alert('Evento não encontrado.'); return; }

  const convocadasIds = convocacoes.slice(1)
    .filter(r => r[idxConvEvento] === eventoId && r[idxConvStatus] === 'Convocada')
    .map(r => r[idxConvAtleta]);

  const listaAtletas = atletas.slice(1)
    .filter(r => convocadasIds.includes(r[idxAtletaId]))
    .map(r => `${r[idxNome]} | ${r[idxTelefone]} | ${r[idxDocStatus]}`)
    .join('\n');

  const modelo = DriveApp.getFilesByName('MODELO_RELACAO_NOMINAL.docx').next();
  const copia = modelo.makeCopy(`Relação Nominal — ${evento[idxAdversario]} — ${evento[idxData]}`);
  const doc = DocumentApp.openById(copia.getId());
  const corpo = doc.getBody();

  corpo.replaceText('{{EQUIPE}}', String(evento[1]));
  corpo.replaceText('{{ADVERSARIO}}', String(evento[idxAdversario] || ''));
  corpo.replaceText('{{DATA}}', Utilities.formatDate(new Date(evento[idxData]), 'America/Sao_Paulo', 'dd/MM/yyyy'));
  corpo.replaceText('{{LOCAL}}', String(evento[idxLocal] || ''));
  corpo.replaceText('{{HORARIO_APRESENTACAO}}', String(evento[idxApresentacao] || ''));
  corpo.replaceText('{{ATLETAS}}', listaAtletas);

  doc.saveAndClose();
  SpreadsheetApp.getUi().alert('Documento gerado! Verifique o Google Drive.');
}
```

#### Script 3: Menu personalizado no Sheets

```javascript
function onOpen() {
  SpreadsheetApp.getUi().createMenu('⚽ CEPRAEA')
    .addItem('Gerar Relação Nominal', 'menuGerarRelacaoNominal')
    .addItem('Exportar JSON para Supabase', 'exportarJsonSupabase')
    .addItem('Verificar dados pendentes', 'verificarPendencias')
    .addToUi();
}

function menuGerarRelacaoNominal() {
  const eventoId = Browser.inputBox('ID do Evento (ex: EVT-007):');
  if (eventoId && eventoId !== 'cancel') gerarRelacaoNominal(eventoId);
}

function verificarPendencias() {
  const ss = SpreadsheetApp.getActive();
  const convs = ss.getSheetByName('CONVOCACOES').getDataRange().getValues();
  const headers = convs[0];
  const idxResposta = headers.indexOf('resposta_atleta');
  const idxDocumento = headers.indexOf('documento_ok');
  const idxAutorizacao = headers.indexOf('autorizacao_responsavel_ok');
  const pendentes = convs.slice(1).filter(r =>
    r[idxResposta] === 'Pendente' ||
    r[idxDocumento] === 'Não' ||
    r[idxAutorizacao] === 'Não'
  ).length;
  SpreadsheetApp.getUi().alert(`${pendentes} convocações com resposta pendente ou pendência documental.`);
}
```

#### Script 4: Exportar JSON para importar no Supabase

```javascript
function exportarJsonSupabase() {
  const ss = SpreadsheetApp.getActive();
  const atletas = ss.getSheetByName('ATLETAS').getDataRange().getValues();
  const headers = atletas[0];
  const json = atletas.slice(1).map(row => {
    return headers.reduce((obj, h, i) => { obj[h] = row[i]; return obj; }, {});
  });
  const arquivo = DriveApp.createFile('cepraea_atletas_export.json', JSON.stringify(json, null, 2), 'application/json');
  SpreadsheetApp.getUi().alert(`JSON exportado: ${arquivo.getUrl()}`);
}
```

---

### 3.5 Templates de documentos no Google Drive

Crie uma pasta `CEPRAEA — Modelos Oficiais` no Google Drive e crie os seguintes Google Docs:

| Arquivo | Campos variáveis |
|---|---|
| `MODELO_RELACAO_NOMINAL.docx` | `{{EQUIPE}}`, `{{ADVERSARIO}}`, `{{DATA}}`, `{{LOCAL}}`, `{{HORARIO_APRESENTACAO}}`, `{{ATLETAS}}` |
| `MODELO_INFORMATIVO_JOGO.docx` | `{{EQUIPE}}`, `{{ADVERSARIO}}`, `{{DATA}}`, `{{LOCAL}}`, `{{HORARIO_APRESENTACAO}}`, `{{UNIFORME}}`, `{{TRANSPORTE}}` |
| `MODELO_SOLICITACAO_TRANSPORTE.docx` | `{{EQUIPE}}`, `{{DESTINO}}`, `{{DATA}}`, `{{HORARIO_SAIDA}}`, `{{N_PESSOAS}}` |
| `MODELO_SOLICITACAO_UNIFORME.docx` | `{{EQUIPE}}`, `{{TEMPORADA}}`, `{{LISTA_TAMANHOS}}` |
| `MODELO_PLANO_JOGO.docx` | `{{EQUIPE}}`, `{{ADVERSARIO}}`, `{{DATA}}`, `{{SISTEMA}}`, `{{OBSERVACOES}}` |
| `MODELO_PLANO_TREINO.docx` | `{{EQUIPE}}`, `{{DATA}}`, `{{OBJETIVO_PRINCIPAL}}`, `{{BLOCOS}}`, `{{OBSERVACOES}}` |
| `MODELO_RELATORIO_METAS.docx` | `{{EQUIPE}}`, `{{ATLETA}}`, `{{TIPO_META}}`, `{{STATUS_META}}`, `{{OBSERVACOES}}` |
| `MODELO_RELATORIO_POS_JOGO.docx` | `{{EQUIPE}}`, `{{ADVERSARIO}}`, `{{PLACAR}}`, `{{RESULTADO}}`, `{{DESTAQUES}}`, `{{OBSERVACOES}}` |

---

## 4. Camada 2 — Extensão do Supabase (próximas sprints, zero custo)

### 4.1 Diagnóstico do schema atual

O schema existente cobre:
- ✅ `teams` — equipes
- ✅ `athletes` — atletas (básico: name, phone, category, email)
- ✅ `trainings` + `attendance_records` — treinos e presença
- ✅ `scout_games` + `scout_events` — scout tático
- ❌ `training_plans` — plano de treino do dia
- ❌ `athlete_goals` — metas individuais
- ❌ `team_goals` — metas da equipe
- ❌ `team_agenda_events` — agenda consolidada da equipe
- ❌ `athlete_details` — dados pessoais completos
- ❌ `competitions` — campeonatos
- ❌ `games` — jogos de competição
- ❌ `convocations` — convocações por jogo
- ❌ `athlete_scout_views` — leitura individual do scout
- ❌ `sumulas` — resultados oficiais
- ❌ `generated_documents` — controle de PDFs

### 4.2 Migration SQL proposta (base `0017_competitions_module.sql`)

> **Nota de fronteira:** a migration abaixo cobre principalmente o recorte competitivo-operacional. O PRD atual também exige tabelas para `training_plans`, `athlete_goals`, `team_goals` e projeções de leitura do scout pela atleta, que devem entrar na mesma onda de modelagem ou em migrations imediatamente subsequentes.

```sql
-- ─── 0017: Módulo de Competições ─────────────────────────────────────────────
-- Adiciona: athlete_details, competitions, games, convocations, sumulas,
--           generated_documents

-- Dados pessoais estendidos das atletas
create table if not exists public.athlete_details (
  id             uuid primary key default gen_random_uuid(),
  athlete_id     uuid not null unique references public.athletes(id) on delete cascade,
  date_of_birth  date,
  guardian_name  text,
  guardian_phone text,
  document_type  text check (document_type in ('rg', 'cpf', 'rg_cpf', 'passaporte')),
  document_number text,
  document_status text not null default 'pendente'
    check (document_status in ('entregue', 'pendente', 'vencido', 'nao_informado')),
  jersey_number  smallint,
  offensive_position text check (offensive_position in ('central', 'lateral_esquerda', 'lateral_direita', 'pivo', 'goleira')),
  defensive_role text check (defensive_role in ('defensora_solta', 'defensora_base', 'defensora_api')),
  uniform_size   text check (uniform_size in ('pp', 'p', 'm', 'g', 'gg', 'xgg')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Competições e torneios
create table if not exists public.competitions (
  id          uuid primary key default gen_random_uuid(),
  team_id     uuid not null references public.teams(id) on delete cascade,
  name        text not null,
  organizer   text,
  modality    text,
  start_date  date,
  end_date    date,
  location    text,
  current_phase text,
  status      text not null default 'a_iniciar'
    check (status in ('a_iniciar', 'em_andamento', 'encerrado')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Jogos de competição (distinto de trainings e scout_games)
create table if not exists public.games (
  id                    uuid primary key default gen_random_uuid(),
  team_id               uuid not null references public.teams(id) on delete cascade,
  competition_id        uuid references public.competitions(id) on delete set null,
  type                  text not null default 'oficial'
    check (type in ('oficial', 'amistoso', 'treino_coletivo', 'reuniao', 'viagem')),
  opponent              text,
  game_date             date not null,
  presentation_time     time,
  game_time             time,
  location_name         text,
  location_address      text,
  uniform               text check (uniform in ('titular', 'visitante', 'alternativo')),
  transport_needed      boolean not null default false,
  status                text not null default 'agendado'
    check (status in ('agendado', 'confirmado', 'cancelado', 'realizado')),
  notes                 text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

-- Convocações por jogo
create table if not exists public.convocations (
  id                         uuid primary key default gen_random_uuid(),
  game_id                    uuid not null references public.games(id) on delete cascade,
  athlete_id                 uuid not null references public.athletes(id) on delete cascade,
  team_id                    uuid not null references public.teams(id) on delete cascade,
  status                     text not null default 'convocada'
    check (status in ('convocada', 'dispensada', 'lesionada', 'suspeita')),
  athlete_response           text not null default 'pendente'
    check (athlete_response in ('confirmada', 'recusada', 'pendente')),
  responded_at               timestamptz,
  document_ok                boolean,
  guardian_authorization_ok  boolean,
  athlete_notes              text,
  staff_notes                text,
  created_at                 timestamptz not null default now(),
  unique(game_id, athlete_id)
);

-- Resultados / Súmulas
create table if not exists public.sumulas (
  id                uuid primary key default gen_random_uuid(),
  game_id           uuid not null unique references public.games(id) on delete cascade,
  team_id           uuid not null references public.teams(id) on delete cascade,
  score_us_1h       smallint,
  score_opp_1h      smallint,
  score_us_2h       smallint,
  score_opp_2h      smallint,
  shootout_us       smallint,
  shootout_opp      smallint,
  result            text check (result in ('vitoria', 'derrota', 'empate')),
  official_doc_url  text,
  highlights        text,
  technical_notes   text,
  registered_at     timestamptz not null default now()
);

-- Histórico de documentos gerados
create table if not exists public.generated_documents (
  id             uuid primary key default gen_random_uuid(),
  game_id        uuid references public.games(id) on delete set null,
  team_id        uuid not null references public.teams(id) on delete cascade,
  document_type  text not null,
  version        smallint not null default 1,
  file_url       text,
  generated_by   uuid references public.profiles(id),
  status         text not null default 'rascunho'
    check (status in ('rascunho', 'enviado', 'protocolado', 'arquivado')),
  sent_at        timestamptz,
  recipient      text,
  created_at     timestamptz not null default now()
);

-- Triggers de updated_at
create trigger athlete_details_set_updated_at before update on public.athlete_details
  for each row execute function public.set_updated_at();
create trigger competitions_set_updated_at before update on public.competitions
  for each row execute function public.set_updated_at();
create trigger games_set_updated_at before update on public.games
  for each row execute function public.set_updated_at();

-- Índices
create index if not exists games_team_date_idx on public.games(team_id, game_date);
create index if not exists convocations_game_idx on public.convocations(game_id);
create index if not exists convocations_athlete_idx on public.convocations(athlete_id);
create index if not exists generated_documents_game_idx on public.generated_documents(game_id, team_id);
```

---

## 5. Camada 3 — Geração de documentos no PWA (futuro, zero custo)

Quando o módulo operacional ampliado estiver no PWA, gere PDFs com:

```typescript
// src/features/games/utils/printDocument.ts

export function printRelacaoNominal(game: Game, athletes: Athlete[]) {
  const conteudo = `
    <html>
    <head>
      <title>Relação Nominal — ${game.opponent}</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; font-size: 12pt; }
          .no-print { display: none; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #333; padding: 6px; }
          th { background: #eee; }
        }
      </style>
    </head>
    <body>
      <h2>Relação Nominal — ${game.team} × ${game.opponent}</h2>
      <p>Data: ${game.game_date} | Local: ${game.location_name}</p>
      <p>Apresentação: ${game.presentation_time}</p>
      <table>
        <tr><th>#</th><th>Nome</th><th>Posição Ofensiva</th><th>Função Defensiva</th><th>Documento</th></tr>
        ${athletes.map((a, i) => `
          <tr>
            <td>${i + 1}</td>
            <td>${a.name}</td>
            <td>${a.offensive_position ?? '—'}</td>
            <td>${a.defensive_role ?? '—'}</td>
            <td>${a.document_status}</td>
          </tr>
        `).join('')}
      </table>
    </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela!.document.write(conteudo);
  janela!.document.close();
  janela!.print();
}
```

> **Vantagem:** zero dependência de biblioteca externa, funciona offline (PWA), imprime via `Ctrl+P` com opção "Salvar como PDF" — nativo do navegador.

---

## 6. Roteiro de implementação

### Fase 1 — Agora (1–2 dias)
- [ ] Criar Google Sheets `CEPRAEA — Base Operacional 2026`
- [ ] Criar 15 abas conforme seção 3
- [ ] Configurar validações e formatação condicional
- [ ] Cadastrar: equipe principal, atletas ativas, próximos treinos, jogos, viagens e competições
- [ ] Registrar metas individuais e metas da equipe em operação
- [ ] Instalar AppScript com menu personalizado
- [ ] Criar modelos no Google Drive (8 arquivos Google Docs)

**Critério de aceite:**
- Responde sem inferência: "Quem está convocada para o EVT-003?"
- Gera relação nominal com 1 clique
- Mostra resposta ativa da atleta em convocação
- Campo `Pendente` aparece em amarelo

### Fase 2 — Próxima sprint do PWA
- [ ] Criar migration `0017_competitions_module.sql`
- [ ] Importar dados do Sheets via `exportarJsonSupabase()` → seed
- [ ] Implementar telas de plano de treino, metas, agenda e convocações
- [ ] Implementar leitura do scout individual da atleta

### Fase 3 — Pós-MVP v1.0
- [ ] Implementar geração de PDF no PWA (`printDocument.ts`)
- [ ] Migrar fluxo completo para o PWA
- [ ] Deprecar Google Sheets (mantido como backup histórico)

---

## 7. Por que esta solução não tem solução melhor dentro dos constraints

| Constraint | Decisão |
|---|---|
| Zero custo adicional | Google Sheets + AppScript são gratuitos. Supabase free tier. PWA com `window.print()`. |
| Sem Make/Zapier | AppScript cobre toda automação sem custo |
| Sem duplicar infraestrutura | Sheets alinhado ao schema Supabase existente |
| Sem perder trabalho feito | Migration 0017 estende, não substitui |
| Funciona hoje | Fase 1 independe do PWA e cobre o gap operacional atual |
| Escalável | Fase 3 migra tudo para o PWA sem retrabalho de dados |
| Gemini grátis | Google Sheets + Gemini (workspace gratuito) permite perguntas em linguagem natural sobre os dados das abas |

> **Regra de ouro:** A IA (ChatGPT, Gemini, Copilot) nunca é memória. O Google Sheets e o Supabase são a memória. A IA é consultora que responde **apenas com o que está cadastrado**.

---

*Atualizado por Codex — 18 de maio de 2026*
