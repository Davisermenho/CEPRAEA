/**
 * CEPRAEA — Sync API via Google Apps Script
 *
 * SETUP:
 * 1. Abra script.google.com e crie um novo projeto
 * 2. Cole este código substituindo o conteúdo padrão
 * 3. Substitua SYNC_SECRET pelo secret gerado em Configurações > Sincronização no app
 * 4. Clique em "Implantar" > "Nova implantação"
 *    - Tipo: "Aplicativo da Web"
 *    - Executar como: "Eu (seu email)"
 *    - Quem tem acesso: "Qualquer pessoa"
 * 5. Copie a URL gerada e cole em Configurações > Sincronização > URL do endpoint
 *
 * A planilha "confirmacoes" é criada automaticamente na primeira confirmação.
 */

// ⚠️ ALTERE ESTE VALOR para o secret copiado do app CEPRAEA
var SYNC_SECRET = 'COLE_SEU_SECRET_AQUI';

var SHEET_NAME = 'confirmacoes';
var HEADERS = ['id', 'treinoId', 'atletaId', 'nomeAtleta', 'status', 'timestamp', 'origem'];

// ─── Entry point ─────────────────────────────────────────────────────────────

function doGet(e) {
  var params = e.parameter || {};

  if (!params.secret || params.secret !== SYNC_SECRET) {
    return respond({ error: 'unauthorized' }, 403);
  }

  var action = params.action;

  if (action === 'ping') {
    return respond({ ok: true, timestamp: new Date().toISOString() });
  }

  if (action === 'confirm') {
    return handleConfirm(params);
  }

  if (action === 'list') {
    return handleList(params);
  }

  return respond({ error: 'unknown_action' });
}

// ─── Handlers ────────────────────────────────────────────────────────────────

function handleConfirm(params) {
  if (!params.treinoId || !params.atletaId || !params.status) {
    return respond({ error: 'missing_params' });
  }

  var sheet = getOrCreateSheet();
  var id = params.treinoId + '::' + params.atletaId;

  var newRow = [
    id,
    params.treinoId,
    params.atletaId,
    params.nomeAtleta || '',
    params.status,
    params.timestamp || new Date().toISOString(),
    params.origem || 'link'
  ];

  // Upsert: atualiza linha existente se já houver registro para este par treino+atleta
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 1, 1, newRow.length).setValues([newRow]);
      return respond({ ok: true, action: 'updated' });
    }
  }

  sheet.appendRow(newRow);
  return respond({ ok: true, action: 'created' });
}

function handleList(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) return respond({ records: [], syncedAt: new Date().toISOString() });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return respond({ records: [], syncedAt: new Date().toISOString() });

  var sinceFilter = params.since || null;
  var treinoFilter = params.treinoId || null;

  var records = data.slice(1)
    .map(function(row) {
      return {
        id:          String(row[0] || ''),
        treinoId:    String(row[1] || ''),
        atletaId:    String(row[2] || ''),
        nomeAtleta:  String(row[3] || ''),
        status:      String(row[4] || ''),
        timestamp:   String(row[5] || ''),
        origem:      String(row[6] || 'link')
      };
    })
    .filter(function(r) {
      if (!r.treinoId) return false;
      if (treinoFilter && r.treinoId !== treinoFilter) return false;
      if (sinceFilter && r.timestamp && r.timestamp < sinceFilter) return false;
      return true;
    });

  return respond({ records: records, syncedAt: new Date().toISOString() });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    // Formatar cabeçalho
    sheet.getRange(1, 1, 1, HEADERS.length)
      .setBackground('#1d4ed8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  return sheet;
}

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
