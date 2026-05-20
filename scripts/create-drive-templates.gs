/**
 * COACH DATABASE — Criação de Templates Google Docs no Drive
 *
 * Execução: cole este script no Apps Script da planilha
 * Menu: Extensões > Apps Script > colar > salvar > executar createAllTemplates()
 *
 * O que faz:
 *   1. Cria pasta "COACH DATABASE — Modelos Oficiais" no Drive (ou reutiliza existente)
 *   2. Cria 11 Google Docs com conteúdo e placeholders {{CAMPO}}
 *   3. Atualiza aba DOC_MODELOS da planilha com os links reais
 *
 * Templates alinhados com os documentos oficiais reais analisados em maio/2026.
 * Referências: pasta googledrive/ no repositório do projeto.
 */

// ─── CONFIGURAÇÃO ────────────────────────────────────────────────────────────
const SPREADSHEET_ID = '1HLM9n33wI67nBP-1ytHtLS_6thHrFJ1smSWs9JZE4-I';
const FOLDER_NAME    = 'COACH DATABASE — Modelos Oficiais';
const SHEET_MODELOS  = 'DOC_MODELOS';

// ─── CATÁLOGO DE TEMPLATES ───────────────────────────────────────────────────
const TEMPLATES = [

  // ── MOD-001: Relação Nominal (formato oficial FHERJ) ─────────────────────
  {
    id:     'MOD-001',
    nome:   'Relação Nominal',
    tipo:   'Relação Nominal',
    campos: '{{COMPETICAO_NOME}}, {{COMPETICAO}}, {{TURNO}}, {{DATA_JOGO}}, {{HORARIO}}, {{LOCAL}}, {{JOGO}}, {{CATEGORIA}}, {{NAIPE}}, {{EQUIPE}}, {{ATLETAS_ROWS}}, {{DIRIGENTE_B}}',
    obs:    'Formato oficial FHERJ. Tabelas: atletas (REG FHERJ | Nº | NOME | ASSINATURA) + dirigentes (FUNÇÃO | NOME | REG/IDENT/CREF | ASSINATURA).',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      // Cabeçalho oficial FHERJ
      body.appendParagraph('FEDERAÇÃO DE HANDEBOL DO ESTADO DO RIO DE JANEIRO')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('{{COMPETICAO_NOME}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('RELAÇÃO NOMINAL')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      // Informações do jogo
      body.appendParagraph('{{COMPETICAO}} — {{TURNO}}');
      body.appendParagraph('DATA: {{DATA_JOGO}}   HORA: {{HORARIO}}');
      body.appendParagraph('LOCAL: {{LOCAL}}');
      body.appendParagraph('JOGO: {{JOGO}}');
      body.appendParagraph('');

      // Categoria e naipe
      body.appendParagraph('CATEGORIA:  [ ] INFANTIL  [ ] CADETE  [ ] JUVENIL  [ ] JÚNIOR  [ ] ADULTO  |  [ ] FEMININO  [ ] MASCULINO');
      body.appendParagraph('(marcar: {{CATEGORIA}} — {{NAIPE}})').setItalic(true);
      body.appendParagraph('');
      body.appendParagraph('EQUIPE: {{EQUIPE}}');
      body.appendParagraph('');

      // Tabela de atletas (15 linhas de exemplo — ajustar conforme convocação)
      body.appendParagraph('ATLETAS CONVOCADAS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendTable([
        ['REGISTRO FHERJ', 'Nº', 'NOME COMPLETO DOS(AS) ATLETAS', 'ASSINATURA'],
        ['', '{{NUM_01}}', '{{NOME_01}}', ''],
        ['', '{{NUM_02}}', '{{NOME_02}}', ''],
        ['', '{{NUM_03}}', '{{NOME_03}}', ''],
        ['', '{{NUM_04}}', '{{NOME_04}}', ''],
        ['', '{{NUM_05}}', '{{NOME_05}}', ''],
        ['', '{{NUM_06}}', '{{NOME_06}}', ''],
        ['', '{{NUM_07}}', '{{NOME_07}}', ''],
        ['', '{{NUM_08}}', '{{NOME_08}}', ''],
        ['', '{{NUM_09}}', '{{NOME_09}}', ''],
        ['', '{{NUM_10}}', '{{NOME_10}}', ''],
        ['', '{{NUM_11}}', '{{NOME_11}}', ''],
        ['', '{{NUM_12}}', '{{NOME_12}}', ''],
        ['', '{{NUM_13}}', '{{NOME_13}}', ''],
        ['', '{{NUM_14}}', '{{NOME_14}}', ''],
        ['', '{{NUM_15}}', '{{NOME_15}}', ''],
      ]);

      body.appendParagraph('');

      // Tabela de dirigentes
      body.appendParagraph('DIRIGENTES').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendTable([
        ['FUNÇÃO', 'NOME DOS(AS) DIRIGENTES', 'REGISTRO FHERJ / IDENT. / CREF', 'ASSINATURA'],
        ['DIRIGENTE A', 'Davi Costa Sermenho do Nascimento', '20.381.288-8', ''],
        ['DIRIGENTE B', '{{DIRIGENTE_B}}', '', ''],
        ['DIRIGENTE C', '', '', ''],
        ['DIRIGENTE D', '', '', ''],
      ]);

      body.appendParagraph('');
      body.appendParagraph('⚠️ Não gerar versão final se houver convocação pendente de confirmação.').setItalic(true);
    }
  },

  // ── MOD-002: Cronograma de Competição ────────────────────────────────────
  {
    id:     'MOD-002',
    nome:   'Cronograma',
    tipo:   'Cronograma',
    campos: '{{COMPETICAO}}, {{DATA}}, {{LOCAL}}, {{EQUIPE}}, {{JOGO_1_TIMES}}, {{HORA_JOGO_1}}, {{JOGO_2_TIMES}}, {{HORA_JOGO_2}}, {{HORA_REPESCAGEM}}',
    obs:    'Cronograma de dia de competição com horários, jogos, refeições e bloco de repescagem condicional.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('CRONOGRAMA DE COMPETIÇÃO')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendParagraph('Data: {{DATA}}');
      body.appendParagraph('Local: {{LOCAL}}');
      body.appendParagraph('Equipe: {{EQUIPE}}');
      body.appendHorizontalRule();

      body.appendParagraph('PROGRAMAÇÃO DO DIA').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('• {{HORA_CAFE}} — Café da manhã');
      body.appendParagraph('• {{HORA_REUNIAO_1}} — Reunião pré-jogo (uniformizadas)');
      body.appendParagraph('• {{HORA_SAIDA_1}} — Saída para o jogo');
      body.appendParagraph('• {{HORA_AQUECIMENTO_1}} — Aquecimento');
      body.appendParagraph('• {{HORA_JOGO_1}} — {{JOGO_1_TIMES}}');
      body.appendParagraph('• {{HORA_RECUPERACAO}} — Recuperação / hidratação / reposição energética');
      body.appendParagraph('• {{HORA_REUNIAO_2}} — Reunião pré-jogo (uniformizadas)');
      body.appendParagraph('• {{HORA_SAIDA_2}} — Saída para o jogo');
      body.appendParagraph('• {{HORA_AQUECIMENTO_2}} — Aquecimento');
      body.appendParagraph('• {{HORA_JOGO_2}} — {{JOGO_2_TIMES}}');
      body.appendParagraph('');

      body.appendParagraph('SE HOUVER REPESCAGEM').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('• {{HORA_REUNIAO_REPESC}} — Reunião pré-jogo (uniformizadas)');
      body.appendParagraph('• {{HORA_SAIDA_REPESC}} — Saída para o jogo');
      body.appendParagraph('• {{HORA_AQUECIMENTO_REPESC}} — Aquecimento');
      body.appendParagraph('• {{HORA_REPESCAGEM}} — Jogo da repescagem');
      body.appendParagraph('• {{HORA_JANTAR}} — Jantar');
      body.appendParagraph('• {{HORA_REUNIAO_FINAL}} — Reunião final do dia');
      body.appendParagraph('• {{HORA_DESCANSO}} — Descanso');
      body.appendParagraph('');

      body.appendParagraph('SE NÃO HOUVER REPESCAGEM').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('• {{HORA_LANCHE}} — Lanche de recuperação');
      body.appendParagraph('• {{HORA_JANTAR_SEM_REPESC}} — Jantar');
      body.appendParagraph('• {{HORA_REUNIAO_ESTRATEGICA}} — Reunião estratégica para o próximo dia');
      body.appendParagraph('• {{HORA_DESCANSO_SEM_REPESC}} — Descanso');
      body.appendParagraph('');

      body.appendParagraph('BLOCO DE RECUPERAÇÃO').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('• {{HORA_ALMOCO_RECUPERACAO}} — Almoço de recuperação');
      body.appendParagraph('• {{HORA_REUNIAO_CENARIO}} — Reunião de cenário e definição da rodada final');
      body.appendHorizontalRule();
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
      body.appendParagraph('Data de emissão: {{DATA_EMISSAO}}');
    }
  },

  // ── MOD-003: Informativo de Jogo ─────────────────────────────────────────
  {
    id:     'MOD-003',
    nome:   'Informativo de Jogo',
    tipo:   'Informativo',
    campos: '{{EQUIPE}}, {{ADVERSARIO}}, {{DATA}}, {{LOCAL}}, {{HORARIO_APRESENTACAO}}, {{UNIFORME}}, {{TRANSPORTE}}, {{PONTO_ENCONTRO}}, {{OBSERVACOES}}',
    obs:    'Informativo enviado às atletas antes do jogo com instruções de horário, uniforme e transporte.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('INFORMATIVO DE JOGO')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Equipe: {{EQUIPE}}');
      body.appendParagraph('Adversário: {{ADVERSARIO}}');
      body.appendParagraph('Data: {{DATA}}');
      body.appendParagraph('Local: {{LOCAL}}');
      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendHorizontalRule();

      body.appendParagraph('INSTRUÇÕES PARA AS ATLETAS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('Horário de apresentação: {{HORARIO_APRESENTACAO}}');
      body.appendParagraph('Ponto de encontro: {{PONTO_ENCONTRO}}');
      body.appendParagraph('Uniforme: {{UNIFORME}}');
      body.appendParagraph('Transporte: {{TRANSPORTE}}');
      body.appendParagraph('');

      body.appendParagraph('CRONOGRAMA DO DIA').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('• {{HORA_APRESENTACAO}} — Apresentação no ponto de encontro');
      body.appendParagraph('• {{HORA_SAIDA}} — Saída para o local do jogo');
      body.appendParagraph('• {{HORA_AQUECIMENTO}} — Início do aquecimento');
      body.appendParagraph('• {{HORA_JOGO}} — Início do jogo');
      body.appendParagraph('');

      body.appendParagraph('OBSERVAÇÕES IMPORTANTES').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('{{OBSERVACOES}}');
      body.appendHorizontalRule();
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
      body.appendParagraph('Data de emissão: {{DATA_EMISSAO}}');
    }
  },

  // ── MOD-004: Solicitação de Transporte IDEC ──────────────────────────────
  {
    id:     'MOD-004',
    nome:   'Solicitação Transporte IDEC',
    tipo:   'Solicitação Transporte',
    campos: '{{COMPETICAO}}, {{DATA_EMISSAO}}, {{JOGOS_TABLE}}',
    obs:    'Formato oficial: cabeçalho Para/Assunto + tabela DATA|LOCAL|JOGO|TOTAL|CRONOGRAMA. Saídas e retornos pela Casa da Coruja (Bonsucesso).',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('SOLICITAÇÃO DE TRANSPORTE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('{{COMPETICAO}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Para:');
      body.appendParagraph('Coordenação do IDEC');
      body.appendParagraph('');
      body.appendParagraph('Assunto:');
      body.appendParagraph('Solicitação de transporte — {{COMPETICAO}}');
      body.appendParagraph('');
      body.appendParagraph('Solicitamos transporte para as equipes de handebol para os jogos de {{COMPETICAO}}, conforme o cronograma abaixo.');
      body.appendParagraph('Saídas e retornos previstos pela Casa da Coruja (Bonsucesso).');
      body.appendParagraph('');

      // Tabela de jogos (modelo real: DATA | LOCAL | JOGO | TOTAL | CRONOGRAMA)
      body.appendTable([
        ['DATA', 'LOCAL', 'JOGO', 'TOTAL', 'CRONOGRAMA'],
        [
          '{{DATA_JOGO_1}}',
          '{{LOCAL_JOGO_1}}',
          '{{JOGO_1}}',
          '{{TOTAL_1}}',
          'Saída Coruja: {{SAIDA_1}}\nInício Jogo: {{INICIO_1}}\nRetorno Coruja: {{RETORNO_1}}'
        ],
        [
          '{{DATA_JOGO_2}}',
          '{{LOCAL_JOGO_2}}',
          '{{JOGO_2}}',
          '{{TOTAL_2}}',
          'Saída Coruja: {{SAIDA_2}}\nInício Jogo: {{INICIO_2}}\nRetorno Coruja: {{RETORNO_2}}'
        ],
        [
          '{{DATA_JOGO_3}}',
          '{{LOCAL_JOGO_3}}',
          '{{JOGO_3}}',
          '{{TOTAL_3}}',
          'Saída Coruja: {{SAIDA_3}}\nInício Jogo: {{INICIO_3}}\nRetorno Coruja: {{RETORNO_3}}'
        ],
      ]);

      body.appendParagraph('');
      body.appendParagraph('Rio de Janeiro, {{DATA_EMISSAO}}');
      body.appendParagraph('');
      body.appendParagraph('Equipes de Handebol IDEC');
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
    }
  },

  // ── MOD-005: Solicitação de Uniforme ─────────────────────────────────────
  {
    id:     'MOD-005',
    nome:   'Solicitação Uniforme',
    tipo:   'Solicitação Uniforme',
    campos: '{{COMPETICAO}}, {{DATA_EMISSAO}}, {{ATLETAS_CADETE_ROWS}}, {{ATLETAS_INFANTIL_ROWS}}, {{TOTAL_CADETE}}, {{TOTAL_INFANTIL}}',
    obs:    'Tabela: Atleta | Data de Nasc | Nº Uniforme | Cor do Uniforme | Categoria. Uniform IDEC emprestado por jogo — devolução obrigatória.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('SOLICITAÇÃO DE UNIFORMES — IDEC')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendParagraph('Data de emissão: {{DATA_EMISSAO}}');
      body.appendParagraph('');

      // Tabela Cadete Feminino
      body.appendParagraph('CADETE FEMININO').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendTable([
        ['Atleta', 'Data de Nasc', 'Nº Uniforme', 'Cor do Uniforme', 'Categoria'],
        ['{{NOME_CAD_01}}', '{{NASC_CAD_01}}', '{{NUM_CAD_01}}', '{{COR_CAD_01}}', 'Cadete Feminino'],
        ['{{NOME_CAD_02}}', '{{NASC_CAD_02}}', '{{NUM_CAD_02}}', '{{COR_CAD_02}}', 'Cadete Feminino'],
        ['{{NOME_CAD_03}}', '{{NASC_CAD_03}}', '{{NUM_CAD_03}}', '{{COR_CAD_03}}', 'Cadete Feminino'],
        ['{{NOME_CAD_04}}', '{{NASC_CAD_04}}', '{{NUM_CAD_04}}', '{{COR_CAD_04}}', 'Cadete Feminino'],
        ['{{NOME_CAD_05}}', '{{NASC_CAD_05}}', '{{NUM_CAD_05}}', '{{COR_CAD_05}}', 'Cadete Feminino'],
        ['{{NOME_CAD_06}}', '{{NASC_CAD_06}}', '{{NUM_CAD_06}}', '{{COR_CAD_06}}', 'Cadete Feminino'],
        ['{{NOME_CAD_07}}', '{{NASC_CAD_07}}', '{{NUM_CAD_07}}', '{{COR_CAD_07}}', 'Cadete Feminino'],
        ['{{NOME_CAD_08}}', '{{NASC_CAD_08}}', '{{NUM_CAD_08}}', '{{COR_CAD_08}}', 'Cadete Feminino'],
        ['TOTAL CADETE', '', '', '', '{{TOTAL_CADETE}} atletas'],
      ]);

      body.appendParagraph('');

      // Tabela Infantil Feminino
      body.appendParagraph('INFANTIL FEMININO').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendTable([
        ['Atleta', 'Data de Nasc', 'Nº Uniforme', 'Cor do Uniforme', 'Categoria'],
        ['{{NOME_INF_01}}', '{{NASC_INF_01}}', '{{NUM_INF_01}}', '{{COR_INF_01}}', 'Infantil Feminino'],
        ['{{NOME_INF_02}}', '{{NASC_INF_02}}', '{{NUM_INF_02}}', '{{COR_INF_02}}', 'Infantil Feminino'],
        ['{{NOME_INF_03}}', '{{NASC_INF_03}}', '{{NUM_INF_03}}', '{{COR_INF_03}}', 'Infantil Feminino'],
        ['{{NOME_INF_04}}', '{{NASC_INF_04}}', '{{NUM_INF_04}}', '{{COR_INF_04}}', 'Infantil Feminino'],
        ['{{NOME_INF_05}}', '{{NASC_INF_05}}', '{{NUM_INF_05}}', '{{COR_INF_05}}', 'Infantil Feminino'],
        ['TOTAL INFANTIL', '', '', '', '{{TOTAL_INFANTIL}} atletas'],
      ]);

      body.appendParagraph('');
      body.appendParagraph('⚠️ Uniforme IDEC emprestado por jogo — devolução obrigatória ao final. Registrar devolução na planilha.')
          .setItalic(true);
      body.appendParagraph('');
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
    }
  },

  // ── MOD-006: Plano de Jogo ───────────────────────────────────────────────
  {
    id:     'MOD-006',
    nome:   'Plano de Jogo',
    tipo:   'Plano de Jogo',
    campos: '{{EQUIPE}}, {{ADVERSARIO}}, {{DATA}}, {{COMPETICAO}}, {{MODALIDADE}}, {{SISTEMA_DEFENSIVO_1}}, {{SISTEMA_DEFENSIVO_2}}, {{FORMACAO_INICIAL_DEFESA}}, {{SISTEMA_OFENSIVO}}, {{FORMACAO_INICIAL_ATAQUE}}, {{ROTACAO_ATLETAS}}, {{GOLEIRA}}, {{OBSERVACOES}}',
    obs:    'Plano tático detalhado. Modalidade: QUADRA ou PRAIA. Seções: DEFESA, ATAQUE POSICIONADO, TRANSIÇÃO OFENSIVA, RETORNO DEFENSIVO, ROTAÇÃO.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('PLANO DE JOGO')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Equipe: {{EQUIPE}}');
      body.appendParagraph('Adversário: {{ADVERSARIO}}');
      body.appendParagraph('Data: {{DATA}}');
      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendParagraph('Modalidade: {{MODALIDADE}}   (QUADRA / PRAIA)');
      body.appendHorizontalRule();

      // DEFESA
      body.appendParagraph('DEFESA').setHeading(DocumentApp.ParagraphHeading.HEADING2);

      body.appendParagraph('Sistema principal: {{SISTEMA_DEFENSIVO_1}}').setBold(true);
      body.appendParagraph('Postura básica: pés afastados, joelhos flexionados, braço alto para bloquear e braço baixo para interceptar.');
      body.appendParagraph('');
      body.appendParagraph('Formação inicial:').setBold(true);
      body.appendParagraph('{{FORMACAO_INICIAL_DEFESA}}');
      body.appendParagraph('');
      body.appendParagraph('Responsabilidades individuais:').setBold(true);
      body.appendParagraph('1ª Defensoras: {{FUNC_1A_DEFENSORA}}');
      body.appendParagraph('2ª Defensoras: {{FUNC_2A_DEFENSORA}}');
      body.appendParagraph('Bases: {{FUNC_BASE}}');
      body.appendParagraph('Goleira: {{GOLEIRA}}');
      body.appendParagraph('');
      body.appendParagraph('Sistema alternativo: {{SISTEMA_DEFENSIVO_2}}').setBold(true);
      body.appendParagraph('{{INSTRUCOES_DEF_ALTERNATIVA}}');
      body.appendHorizontalRule();

      // TRANSIÇÃO OFENSIVA
      body.appendParagraph('TRANSIÇÃO OFENSIVA').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Gatilho: após recuperação da bola ou gol sofrido. Objetivo: explorar a defesa desorganizada em 3 linhas.');
      body.appendParagraph('');
      body.appendParagraph('1ª Linha (velocidade): {{1A_LINHA_TRANSICAO}}');
      body.appendParagraph('2ª Linha (apoio): {{2A_LINHA_TRANSICAO}}');
      body.appendParagraph('Condutora: {{CONDUTORA_TRANSICAO}}');
      body.appendParagraph('');
      body.appendParagraph('Fases do ataque rápido:').setBold(true);
      body.appendParagraph('{{FASES_ATAQUE_RAPIDO}}');
      body.appendHorizontalRule();

      // ATAQUE POSICIONADO
      body.appendParagraph('ATAQUE POSICIONADO').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Sistema: {{SISTEMA_OFENSIVO}}');
      body.appendParagraph('');
      body.appendParagraph('Movimentações principais:').setBold(true);
      body.appendParagraph('• Desdobramento das armadoras: {{DESDOBRAMENTO_ARMADORAS}}');
      body.appendParagraph('• Cruzamentos lateral/central: {{CRUZAMENTOS}}');
      body.appendParagraph('• Circulação de pontas: {{CIRCULACAO_PONTAS}}');
      body.appendParagraph('• Jogo com pivô: {{JOGO_PIVO}}');
      body.appendParagraph('');
      body.appendParagraph('Formação inicial:').setBold(true);
      body.appendParagraph('{{FORMACAO_INICIAL_ATAQUE}}');
      body.appendHorizontalRule();

      // RETORNO DEFENSIVO
      body.appendParagraph('RETORNO DEFENSIVO').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Objetivo: reorganizar a defesa em no máximo 7 segundos após perda da bola.');
      body.appendParagraph('');
      body.appendParagraph('1ª linha de retorno: {{RETORNO_1A_LINHA}}');
      body.appendParagraph('2ª linha de retorno: {{RETORNO_2A_LINHA}}');
      body.appendParagraph('Regra inegociável: todo mundo retorna. Ninguém desiste antes do apito final.');
      body.appendHorizontalRule();

      // ROTAÇÃO DE ATLETAS
      body.appendParagraph('ROTAÇÃO DAS ATLETAS').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{ROTACAO_ATLETAS}}');
      body.appendParagraph('');
      body.appendParagraph('OBSERVAÇÕES GERAIS').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('{{OBSERVACOES}}');
      body.appendParagraph('');
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
      body.appendParagraph('Comunicação é o diferencial. Use a sua voz para jogar.').setItalic(true);
    }
  },

  // ── MOD-007: Plano de Treino (planejamento mensal por sessão) ─────────────
  {
    id:     'MOD-007',
    nome:   'Plano de Treino',
    tipo:   'Plano de Treino',
    campos: '{{EQUIPE}}, {{MES}}, {{ANO}}, {{OBJETIVO_GERAL_MES}}, {{SESSOES}}',
    obs:    'Formato real: planejamento mensal com sessões por data. Cada sessão: Objetivo Geral + Objetivos Específicos + Atividades (Aquecimento/Técnica/Jogo/Alongamento).',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('PLANEJAMENTO DE TREINOS {{EQUIPE}} — {{MES}} {{ANO}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Objetivo geral do mês:').setBold(true);
      body.appendParagraph('{{OBJETIVO_GERAL_MES}}');
      body.appendHorizontalRule();

      // ── SESSÃO 1 ──
      body.appendParagraph('{{DIA_SEMANA_1}} — {{DATA_SESSAO_1}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Objetivo Geral:').setBold(true);
      body.appendParagraph('{{OBJETIVO_GERAL_SESSAO_1}}');
      body.appendParagraph('Objetivos Específicos:').setBold(true);
      body.appendParagraph('{{OBJETIVOS_ESPECIFICOS_1}}');
      body.appendParagraph('Atividades:').setBold(true);
      body.appendParagraph('Aquecimento — {{DURACAO_AQUECIMENTO_1}} minutos');
      body.appendParagraph('{{AQUECIMENTO_1}}');
      body.appendParagraph('Parte Técnica — {{DURACAO_TECNICA_1}} minutos');
      body.appendParagraph('{{TECNICA_1}}');
      body.appendParagraph('Situação de Jogo — {{DURACAO_JOGO_1}} minutos');
      body.appendParagraph('{{JOGO_1}}');
      body.appendParagraph('Alongamento — {{DURACAO_ALONGAMENTO_1}} minutos');
      body.appendParagraph('{{ALONGAMENTO_1}}');
      body.appendHorizontalRule();

      // ── SESSÃO 2 ──
      body.appendParagraph('{{DIA_SEMANA_2}} — {{DATA_SESSAO_2}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Objetivo Geral:').setBold(true);
      body.appendParagraph('{{OBJETIVO_GERAL_SESSAO_2}}');
      body.appendParagraph('Objetivos Específicos:').setBold(true);
      body.appendParagraph('{{OBJETIVOS_ESPECIFICOS_2}}');
      body.appendParagraph('Atividades:').setBold(true);
      body.appendParagraph('Aquecimento — {{DURACAO_AQUECIMENTO_2}} minutos');
      body.appendParagraph('{{AQUECIMENTO_2}}');
      body.appendParagraph('Parte Técnica — {{DURACAO_TECNICA_2}} minutos');
      body.appendParagraph('{{TECNICA_2}}');
      body.appendParagraph('Situação de Jogo — {{DURACAO_JOGO_2}} minutos');
      body.appendParagraph('{{JOGO_2}}');
      body.appendParagraph('Alongamento — {{DURACAO_ALONGAMENTO_2}} minutos');
      body.appendParagraph('{{ALONGAMENTO_2}}');
      body.appendHorizontalRule();

      // ── SESSÃO 3 ──
      body.appendParagraph('{{DIA_SEMANA_3}} — {{DATA_SESSAO_3}}')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('Objetivo Geral:').setBold(true);
      body.appendParagraph('{{OBJETIVO_GERAL_SESSAO_3}}');
      body.appendParagraph('Objetivos Específicos:').setBold(true);
      body.appendParagraph('{{OBJETIVOS_ESPECIFICOS_3}}');
      body.appendParagraph('Atividades:').setBold(true);
      body.appendParagraph('Aquecimento — {{DURACAO_AQUECIMENTO_3}} minutos');
      body.appendParagraph('{{AQUECIMENTO_3}}');
      body.appendParagraph('Parte Técnica — {{DURACAO_TECNICA_3}} minutos');
      body.appendParagraph('{{TECNICA_3}}');
      body.appendParagraph('Situação de Jogo — {{DURACAO_JOGO_3}} minutos');
      body.appendParagraph('{{JOGO_3}}');
      body.appendParagraph('Alongamento — {{DURACAO_ALONGAMENTO_3}} minutos');
      body.appendParagraph('{{ALONGAMENTO_3}}');
      body.appendHorizontalRule();

      body.appendParagraph('(duplicar blocos de sessão conforme número de treinos no mês)').setItalic(true);
      body.appendHorizontalRule();

      body.appendParagraph('Observações pedagógicas para {{MES}}').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('{{OBSERVACOES_PEDAGOGICAS}}');
      body.appendParagraph('');
      body.appendParagraph('Síntese do trimestre').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('{{SINTESE_TRIMESTRE}}');
      body.appendHorizontalRule();
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
    }
  },

  // ── MOD-008: Relatório Pós-Jogo (formato "Relatório de evento externo") ──
  {
    id:     'MOD-008',
    nome:   'Relatório Pós-Jogo',
    tipo:   'Relatório Pós-Jogo',
    campos: '{{COMPETICAO}}, {{DATA}}, {{CATEGORIA}}, {{NAIPE}}, {{LOCAL}}, {{PARTIDA}}, {{PLACAR_PROPRIO}}, {{PLACAR_ADVERSARIO}}, {{EQUIPE}}, {{ADVERSARIO}}, {{RESPONSAVEL}}, {{RESUMO}}, {{DESTAQUES_INDIVIDUAIS}}, {{PONTOS_POSITIVOS}},{{OBSERVACOES}}',
    obs:    'Formato real: "Relatório de evento externo". Seções: cabeçalho técnico + Resumo da Partida + Destaques Individuais + Pontos Positivos + Registros fotográficos.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('Relatório de evento externo')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      // Cabeçalho técnico
      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendParagraph('Data: {{DATA}}');
      body.appendParagraph('Categoria: {{CATEGORIA}}');
      body.appendParagraph('Naipe: {{NAIPE}}');
      body.appendParagraph('Local: {{LOCAL}}');
      body.appendParagraph('Partida válida pelo {{TURNO}}: {{PARTIDA}}');
      body.appendParagraph('');
      body.appendParagraph('Placar Final:').setBold(true);
      body.appendParagraph('{{EQUIPE}} {{PLACAR_PROPRIO}} x {{PLACAR_ADVERSARIO}} {{ADVERSARIO}}');
      body.appendParagraph('');
      body.appendParagraph('Treinador(a): {{RESPONSAVEL}}');
      body.appendHorizontalRule();

      // Resumo
      body.appendParagraph('Resumo da Partida').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{RESUMO}}');
      body.appendHorizontalRule();

      // Destaques individuais
      body.appendParagraph('Destaques Individuais').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{DESTAQUES_INDIVIDUAIS}}');
      body.appendParagraph('(formato: Nome: descrição do desempenho e número de gols/defesas)').setItalic(true);
      body.appendHorizontalRule();

      // Pontos positivos
      body.appendParagraph('Pontos Positivos').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{PONTOS_POSITIVOS}}');
      body.appendHorizontalRule();

      // Pontos a melhorar
      body.appendParagraph('Pontos a Melhorar').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{PONTOS_MELHORIA}}');
      body.appendHorizontalRule();

      // Observações gerais
      body.appendParagraph('Observações Gerais').setHeading(DocumentApp.ParagraphHeading.HEADING2);
      body.appendParagraph('{{OBSERVACOES}}');
      body.appendHorizontalRule();

      body.appendParagraph('Registros fotográficos:').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('(inserir fotos aqui)').setItalic(true);
      body.appendHorizontalRule();
      body.appendParagraph('Responsável Técnico: Davi Costa Sermenho do Nascimento');
      body.appendParagraph('Data do relatório: {{DATA_EMISSAO}}');
    }
  },

  // ── MOD-009: Informativo Geral IDEC ──────────────────────────────────────
  {
    id:     'MOD-009',
    nome:   'Informativo Geral IDEC',
    tipo:   'Informativo',
    campos: '{{TITULO}}, {{DATA}}, {{DESTINATARIOS}}, {{CONTEUDO}}, {{RESPONSAVEL}}',
    obs:    'Comunicados gerais para responsáveis das atletas IDEC.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('INFORMATIVO GERAL — IDEC')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Título: {{TITULO}}');
      body.appendParagraph('Data: {{DATA}}');
      body.appendParagraph('Para: {{DESTINATARIOS}}');
      body.appendParagraph('(responsáveis das atletas de handebol IDEC — Cadete e Infantil Feminino)').setItalic(true);
      body.appendHorizontalRule();

      body.appendParagraph('{{CONTEUDO}}');
      body.appendHorizontalRule();

      body.appendParagraph('Atenciosamente,');
      body.appendParagraph('');
      body.appendParagraph('{{RESPONSAVEL}}');
      body.appendParagraph('COACH DATABASE — Gestão de Equipes de Handebol IDEC');
      body.appendParagraph('Davi Costa Sermenho do Nascimento');
    }
  },

  // ── MOD-010: Checklist Pré-Jogo ──────────────────────────────────────────
  {
    id:     'MOD-010',
    nome:   'Checklist Pré-Jogo',
    tipo:   'Cronograma',
    campos: '{{EQUIPE}}, {{DATA_JOGO}}, {{LOCAL}}, {{COMPETICAO}}, {{RESPONSAVEL}}',
    obs:    'Checklist operacional a ser preenchido no dia do jogo. Cobre documentação, uniformes, logística e pós-jogo.',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('CHECKLIST PRÉ-JOGO')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Equipe: {{EQUIPE}}');
      body.appendParagraph('Data do jogo: {{DATA_JOGO}}');
      body.appendParagraph('Competição: {{COMPETICAO}}');
      body.appendParagraph('Local: {{LOCAL}}');
      body.appendHorizontalRule();

      body.appendParagraph('DOCUMENTAÇÃO').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('[ ] Relação nominal gerada e assinada (MOD-001)');
      body.appendParagraph('[ ] RG/CPF de todas as atletas verificados');
      body.appendParagraph('[ ] Ficha federativa FHERJ atualizada');

      body.appendParagraph('UNIFORMES').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('[ ] Uniformes IDEC retirados e registrados (MOD-005)');
      body.appendParagraph('[ ] Uniformes CEPRAEA separados (se aplicável)');
      body.appendParagraph('[ ] Número e cor de cada uniforme confere com a relação nominal');

      body.appendParagraph('LOGÍSTICA').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('[ ] Transporte confirmado — solicitação protocolada (MOD-004)');
      body.appendParagraph('[ ] Horário de apresentação comunicado às atletas (MOD-003)');
      body.appendParagraph('[ ] Local verificado: {{LOCAL}}');
      body.appendParagraph('[ ] Contato do local do jogo disponível');

      body.appendParagraph('PÓS-JOGO').setHeading(DocumentApp.ParagraphHeading.HEADING3);
      body.appendParagraph('[ ] Súmula registrada na planilha (RESULTADOS)');
      body.appendParagraph('[ ] Uniformes IDEC devolvidos e contagem conferida');
      body.appendParagraph('[ ] Relatório pós-jogo preenchido (MOD-008)');
      body.appendParagraph('[ ] Destaques individuais registrados');
      body.appendHorizontalRule();

      body.appendParagraph('Responsável: {{RESPONSAVEL}}');
      body.appendParagraph('Data de verificação: {{DATA_EMISSAO}}');
    }
  },

  // ── MOD-011: Ofício à Coordenação IDEC ───────────────────────────────────
  {
    id:     'MOD-011',
    nome:   'Ofício Coordenação IDEC',
    tipo:   'Relação Nominal',
    campos: '{{DESTINATARIO}}, {{ASSUNTO}}, {{CORPO}}, {{DATA}}, {{ASSINATURA}}',
    obs:    'Ofício formal para a coordenação do IDEC (autorizações, comunicados oficiais, solicitações diversas).',
    buildContent: (doc) => {
      const body = doc.getBody();
      body.clear();

      body.appendParagraph('COACH DATABASE')
          .setHeading(DocumentApp.ParagraphHeading.HEADING1)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendParagraph('OFÍCIO À COORDENAÇÃO DO IDEC')
          .setHeading(DocumentApp.ParagraphHeading.HEADING2)
          .setAlignment(DocumentApp.HorizontalAlignment.CENTER);
      body.appendHorizontalRule();

      body.appendParagraph('Rio de Janeiro, {{DATA}}');
      body.appendParagraph('');
      body.appendParagraph('À {{DESTINATARIO}},');
      body.appendParagraph('');
      body.appendParagraph('Assunto: {{ASSUNTO}}');
      body.appendParagraph('');
      body.appendParagraph('{{CORPO}}');
      body.appendParagraph('');
      body.appendHorizontalRule();
      body.appendParagraph('Atenciosamente,');
      body.appendParagraph('');
      body.appendParagraph('{{ASSINATURA}}');
      body.appendParagraph('Davi Costa Sermenho do Nascimento');
      body.appendParagraph('Responsável Técnico — COACH DATABASE');
      body.appendParagraph('Equipes de Handebol IDEC e CEPRAEA');
    }
  }

];

// ─── FUNÇÕES UTILITÁRIAS ──────────────────────────────────────────────────────

/**
 * Encontra ou cria a pasta "COACH DATABASE — Modelos Oficiais" no Drive
 */
function getOrCreateFolder() {
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) {
    const existing = folders.next();
    Logger.log('✅ Pasta já existe: ' + existing.getUrl());
    return existing;
  }
  const folder = DriveApp.createFolder(FOLDER_NAME);
  Logger.log('📁 Pasta criada: ' + folder.getUrl());
  return folder;
}

/**
 * Encontra ou cria um Google Doc na pasta, com o nome dado
 */
function getOrCreateDoc(folder, fileName) {
  const files = folder.getFilesByName(fileName);
  if (files.hasNext()) {
    const existing = files.next();
    Logger.log('📄 Doc já existe: ' + fileName);
    return DocumentApp.openById(existing.getId());
  }
  const doc = DocumentApp.create(fileName);
  DriveApp.getFileById(doc.getId()).moveTo(folder);
  Logger.log('📄 Doc criado: ' + fileName);
  return doc;
}

/**
 * Atualiza a linha do modelo em DOC_MODELOS com o link real
 * Assume: coluna A = modelo_id, coluna D (índice 3) = link_drive
 */
function updateSheetLink(sheet, modeloId, linkUrl, nomeModelo) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === modeloId) {
      sheet.getRange(i + 1, 4).setValue(linkUrl);
      Logger.log('🔗 Link atualizado para ' + modeloId + ': ' + linkUrl);
      return true;
    }
  }
  Logger.log('⚠️ ' + modeloId + ' não encontrado em DOC_MODELOS — linha não atualizada');
  return false;
}

// ─── FUNÇÃO PRINCIPAL ─────────────────────────────────────────────────────────

/**
 * Cria todos os 11 templates e atualiza DOC_MODELOS
 * Executar: createAllTemplates()
 */
function createAllTemplates() {
  Logger.log('=== COACH DATABASE — Criação de Templates ===');
  Logger.log('Data: ' + new Date().toLocaleString('pt-BR'));
  Logger.log('Templates baseados nos documentos oficiais analisados em maio/2026.');
  Logger.log('');

  // 1. Pasta no Drive
  const folder = getOrCreateFolder();

  // 2. Planilha
  const ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_MODELOS);
  if (!sheet) {
    Logger.log('❌ Aba DOC_MODELOS não encontrada na planilha!');
    return;
  }

  // 3. Criar cada template
  const results = [];
  for (const tmpl of TEMPLATES) {
    try {
      const fileName = tmpl.id + ' — ' + tmpl.nome;
      const doc      = getOrCreateDoc(folder, fileName);

      // Popular conteúdo
      tmpl.buildContent(doc);
      doc.saveAndClose();

      const url = 'https://docs.google.com/document/d/' + doc.getId() + '/edit';
      updateSheetLink(sheet, tmpl.id, url, tmpl.nome);
      results.push({ id: tmpl.id, nome: tmpl.nome, url: url, ok: true });
      Logger.log('✅ ' + tmpl.id + ' — ' + tmpl.nome + ': ' + url);
    } catch (e) {
      results.push({ id: tmpl.id, nome: tmpl.nome, erro: e.message, ok: false });
      Logger.log('❌ ' + tmpl.id + ' — ERRO: ' + e.message);
    }
  }

  // 4. Sumário final
  Logger.log('');
  Logger.log('=== SUMÁRIO ===');
  Logger.log('Pasta Drive: ' + folder.getUrl());
  Logger.log('Templates criados: ' + results.filter(r => r.ok).length + '/11');
  Logger.log('Erros: ' + results.filter(r => !r.ok).length);

  Logger.log('');
  Logger.log('=== LINKS GERADOS ===');
  results.forEach(r => {
    if (r.ok) Logger.log(r.id + ': ' + r.url);
    else Logger.log(r.id + ': ERRO — ' + r.erro);
  });

  SpreadsheetApp.getUi().alert(
    'COACH DATABASE — Templates criados!\n\n' +
    results.filter(r => r.ok).map(r => r.id + ' — ' + r.nome).join('\n') +
    '\n\nVeja os logs (Ctrl+Enter) para os links.\nAba DOC_MODELOS atualizada.'
  );
}

// ─── MENU NA PLANILHA ─────────────────────────────────────────────────────────

/**
 * Adiciona menu "COACH DATABASE" na planilha após abrir
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('COACH DATABASE')
    .addItem('📁 Criar Templates no Drive', 'createAllTemplates')
    .addSeparator()
    .addItem('📋 Gerar Relação Nominal (MOD-001)', 'menuGerarRelacaoNominal')
    .addToUi();
}

/**
 * Stub para futura geração de Relação Nominal (F3-01)
 */
function menuGerarRelacaoNominal() {
  const ui       = SpreadsheetApp.getUi();
  const response = ui.prompt(
    'Gerar Relação Nominal',
    'Digite o evento_id (ex: EVT-001):',
    ui.ButtonSet.OK_CANCEL
  );
  if (response.getSelectedButton() === ui.Button.OK) {
    const eventoId = response.getResponseText().trim();
    if (eventoId) {
      ui.alert('⚠️ F3-01 ainda não implementado.\nEvento: ' + eventoId + '\nImplementar após templates estarem linkados em DOC_MODELOS (G-004).');
    }
  }
}
