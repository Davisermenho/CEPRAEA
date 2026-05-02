/**
 * CEPRAEA — Sync API via Google Apps Script (V2 — MVP multi-usuário)
 *
 * Veja apps-script/SETUP.md para instruções completas de deploy.
 *
 * Auth:
 * - SYNC_SECRET: secret do treinador (conhecido só pelo treinador, configurado no app)
 * - atletaToken: HMAC retornado no login da atleta (telefone+PIN)
 *
 * Endpoints públicos (sem auth): action=login
 * Endpoints atleta (secret OU atletaToken): listAthletes, listTrainings, list, confirm, getRecurrenceConfig
 * Endpoints treinador (somente secret): upsertAthlete, deleteAthlete, upsertTraining,
 *   deleteTraining, setRecurrenceConfig, setPin (quando acionado pelo treinador)
 */

// ⚠️ ALTERE ESTE VALOR para o secret copiado de Configurações > Sincronização no app
var SYNC_SECRET = 'COLE_SEU_SECRET_AQUI';

var SHEET_CONFIRMACOES = 'confirmacoes';
var SHEET_ATHLETES = 'athletes';
var SHEET_TRAININGS = 'trainings';
var SHEET_CONFIG = 'recurrenceConfig';

var HEADERS_CONFIRMACOES = ['id', 'treinoId', 'atletaId', 'nomeAtleta', 'status', 'timestamp', 'origem'];
var HEADERS_ATHLETES = ['id', 'nome', 'telefone', 'pinHash', 'categoria', 'nivel', 'status', 'observacoes', 'createdAt', 'updatedAt'];
var HEADERS_TRAININGS = ['id', 'tipo', 'status', 'data', 'horaInicio', 'horaFim', 'local', 'observacoes', 'feriadoOrigem', 'criadoManualmente', 'createdAt', 'updatedAt'];
var HEADERS_CONFIG = ['key', 'value'];

var ATLETA_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

// ─── Entry point ─────────────────────────────────────────────────────────────

function doGet(e) {
  var params = e.parameter || {};
  var action = params.action;

  // Endpoints públicos (sem auth)
  if (action === 'login') return handleLogin(params);

  // Auth: secret (treinador) ou atletaToken (atleta)
  var authResult = authenticate(params);
  if (!authResult.ok) return respond({ error: authResult.error }, 403);

  // Endpoints abertos a qualquer auth válido
  if (action === 'ping') return respond({ ok: true, timestamp: new Date().toISOString(), role: authResult.role });
  if (action === 'confirm') return handleConfirm(params, authResult);
  if (action === 'list') return handleList(params);
  if (action === 'listAthletes') return handleListAthletes();
  if (action === 'listTrainings') return handleListTrainings(params);
  if (action === 'getRecurrenceConfig') return handleGetRecurrenceConfig();

  // Endpoints exclusivos do treinador
  if (authResult.role !== 'coach') return respond({ error: 'forbidden' }, 403);

  if (action === 'upsertAthlete') return handleUpsertAthlete(params);
  if (action === 'deleteAthlete') return handleDeleteAthlete(params);
  if (action === 'upsertTraining') return handleUpsertTraining(params);
  if (action === 'deleteTraining') return handleDeleteTraining(params);
  if (action === 'setRecurrenceConfig') return handleSetRecurrenceConfig(params);
  if (action === 'setPin') return handleSetPin(params);

  return respond({ error: 'unknown_action' });
}

// ─── Autenticação ────────────────────────────────────────────────────────────

function authenticate(params) {
  if (params.secret && params.secret === SYNC_SECRET) {
    return { ok: true, role: 'coach' };
  }
  if (params.atletaToken) {
    var verified = verifyAtletaToken(params.atletaToken);
    if (verified.ok) return { ok: true, role: 'atleta', atletaId: verified.atletaId };
    return { ok: false, error: verified.error };
  }
  return { ok: false, error: 'unauthorized' };
}

function makeAtletaToken(atletaId) {
  var expiresAt = Date.now() + ATLETA_TOKEN_TTL_MS;
  var payload = atletaId + '|' + expiresAt;
  var sig = hmac(payload);
  return Utilities.base64EncodeWebSafe(payload + '|' + sig);
}

function verifyAtletaToken(token) {
  try {
    var decoded = Utilities.newBlob(Utilities.base64DecodeWebSafe(token)).getDataAsString();
    var parts = decoded.split('|');
    if (parts.length !== 3) return { ok: false, error: 'invalid_token' };
    var atletaId = parts[0];
    var expiresAt = parseInt(parts[1], 10);
    var sig = parts[2];
    if (Date.now() > expiresAt) return { ok: false, error: 'token_expired' };
    var expected = hmac(atletaId + '|' + expiresAt);
    if (sig !== expected) return { ok: false, error: 'invalid_signature' };
    return { ok: true, atletaId: atletaId };
  } catch (e) {
    return { ok: false, error: 'invalid_token' };
  }
}

function hmac(message) {
  var raw = Utilities.computeHmacSha256Signature(message, SYNC_SECRET);
  return raw.map(function(b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function hashPin(pin, telefone) {
  // pinHash = SHA256(pin + telefone + secret) — telefone serve de salt único
  var input = String(pin) + '|' + String(telefone) + '|' + SYNC_SECRET;
  var raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  return raw.map(function(b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function normalizePhone(phone) {
  return String(phone || '').replace(/\D/g, '');
}

// ─── Login ───────────────────────────────────────────────────────────────────

function handleLogin(params) {
  if (!params.telefone || !params.pin) return respond({ error: 'missing_params' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATHLETES);
  if (!sheet) return respond({ error: 'invalid_credentials' }, 401);

  var phone = normalizePhone(params.telefone);
  var expectedHash = hashPin(params.pin, phone);

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    var rowPhone = normalizePhone(data[i][2]);
    var status = String(data[i][6] || '');
    if (rowPhone === phone && status === 'ativo') {
      var storedHash = String(data[i][3] || '');
      if (!storedHash) return respond({ error: 'pin_not_set' }, 401);
      if (storedHash !== expectedHash) return respond({ error: 'invalid_credentials' }, 401);

      var atletaId = String(data[i][0]);
      var nome = String(data[i][1] || '');
      return respond({
        ok: true,
        atletaId: atletaId,
        nome: nome,
        token: makeAtletaToken(atletaId)
      });
    }
  }
  return respond({ error: 'invalid_credentials' }, 401);
}

// ─── Confirmação de presença ─────────────────────────────────────────────────

function handleConfirm(params, authResult) {
  if (!params.treinoId || !params.atletaId || !params.status) {
    return respond({ error: 'missing_params' });
  }
  // Atleta só pode confirmar para si mesma
  if (authResult.role === 'atleta' && authResult.atletaId !== params.atletaId) {
    return respond({ error: 'forbidden' }, 403);
  }

  var sheet = getOrCreateSheet(SHEET_CONFIRMACOES, HEADERS_CONFIRMACOES);
  var id = params.treinoId + '::' + params.atletaId;

  var newRow = [
    id,
    params.treinoId,
    params.atletaId,
    params.nomeAtleta || '',
    params.status,
    params.timestamp || new Date().toISOString(),
    params.origem || (authResult.role === 'atleta' ? 'link' : 'manual')
  ];

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
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIRMACOES);
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

// ─── Atletas ─────────────────────────────────────────────────────────────────

function handleListAthletes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATHLETES);
  if (!sheet) return respond({ records: [], syncedAt: new Date().toISOString() });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return respond({ records: [], syncedAt: new Date().toISOString() });

  // Não expõe pinHash. Telefone só para o treinador (mas como esse endpoint aceita
  // atletaToken, omitimos para evitar vazamento entre atletas).
  var records = data.slice(1).map(function(row) {
    return {
      id: String(row[0] || ''),
      nome: String(row[1] || ''),
      categoria: String(row[4] || ''),
      nivel: String(row[5] || ''),
      status: String(row[6] || ''),
      observacoes: String(row[7] || ''),
      createdAt: String(row[8] || ''),
      updatedAt: String(row[9] || '')
    };
  });
  return respond({ records: records, syncedAt: new Date().toISOString() });
}

function handleUpsertAthlete(params) {
  if (!params.id || !params.nome || !params.telefone) {
    return respond({ error: 'missing_params' });
  }

  var sheet = getOrCreateSheet(SHEET_ATHLETES, HEADERS_ATHLETES);
  var phone = normalizePhone(params.telefone);
  var pinHash = '';

  // Lê pinHash existente (preservar se não vier um novo PIN)
  var data = sheet.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === params.id) {
      existingRow = i;
      pinHash = String(data[i][3] || '');
      break;
    }
  }
  if (params.pin) pinHash = hashPin(params.pin, phone);

  var now = new Date().toISOString();
  var createdAt = existingRow >= 0 ? String(data[existingRow][8] || now) : (params.createdAt || now);

  var newRow = [
    params.id,
    params.nome,
    phone,
    pinHash,
    params.categoria || '',
    params.nivel || '',
    params.status || 'ativo',
    params.observacoes || '',
    createdAt,
    params.updatedAt || now
  ];

  if (existingRow >= 0) {
    sheet.getRange(existingRow + 1, 1, 1, newRow.length).setValues([newRow]);
    return respond({ ok: true, action: 'updated' });
  }
  sheet.appendRow(newRow);
  return respond({ ok: true, action: 'created' });
}

function handleDeleteAthlete(params) {
  if (!params.id) return respond({ error: 'missing_params' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATHLETES);
  if (!sheet) return respond({ ok: true, action: 'noop' });

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === params.id) {
      sheet.deleteRow(i + 1);
      return respond({ ok: true, action: 'deleted' });
    }
  }
  return respond({ ok: true, action: 'noop' });
}

function handleSetPin(params) {
  if (!params.atletaId || !params.pin) return respond({ error: 'missing_params' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_ATHLETES);
  if (!sheet) return respond({ error: 'athlete_not_found' }, 404);

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === params.atletaId) {
      var phone = normalizePhone(data[i][2]);
      var newHash = hashPin(params.pin, phone);
      sheet.getRange(i + 1, 4).setValue(newHash);
      sheet.getRange(i + 1, 10).setValue(new Date().toISOString());
      return respond({ ok: true });
    }
  }
  return respond({ error: 'athlete_not_found' }, 404);
}

// ─── Treinos ─────────────────────────────────────────────────────────────────

function handleListTrainings(params) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TRAININGS);
  if (!sheet) return respond({ records: [], syncedAt: new Date().toISOString() });

  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return respond({ records: [], syncedAt: new Date().toISOString() });

  var since = params.since || null;
  var until = params.until || null;

  var records = data.slice(1)
    .map(function(row) {
      return {
        id: String(row[0] || ''),
        tipo: String(row[1] || ''),
        status: String(row[2] || ''),
        data: String(row[3] || ''),
        horaInicio: String(row[4] || ''),
        horaFim: String(row[5] || ''),
        local: String(row[6] || ''),
        observacoes: String(row[7] || ''),
        feriadoOrigem: String(row[8] || ''),
        criadoManualmente: row[9] === true || row[9] === 'true',
        createdAt: String(row[10] || ''),
        updatedAt: String(row[11] || '')
      };
    })
    .filter(function(r) {
      if (!r.id) return false;
      if (since && r.data < since) return false;
      if (until && r.data > until) return false;
      return true;
    });

  return respond({ records: records, syncedAt: new Date().toISOString() });
}

function handleUpsertTraining(params) {
  if (!params.id || !params.data || !params.horaInicio) {
    return respond({ error: 'missing_params' });
  }

  var sheet = getOrCreateSheet(SHEET_TRAININGS, HEADERS_TRAININGS);
  var data = sheet.getDataRange().getValues();
  var existingRow = -1;
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === params.id) {
      existingRow = i;
      break;
    }
  }

  var now = new Date().toISOString();
  var createdAt = existingRow >= 0 ? String(data[existingRow][10] || now) : (params.createdAt || now);

  var newRow = [
    params.id,
    params.tipo || 'recorrente',
    params.status || 'agendado',
    params.data,
    params.horaInicio,
    params.horaFim || '',
    params.local || '',
    params.observacoes || '',
    params.feriadoOrigem || '',
    params.criadoManualmente === 'true' || params.criadoManualmente === true,
    createdAt,
    params.updatedAt || now
  ];

  if (existingRow >= 0) {
    sheet.getRange(existingRow + 1, 1, 1, newRow.length).setValues([newRow]);
    return respond({ ok: true, action: 'updated' });
  }
  sheet.appendRow(newRow);
  return respond({ ok: true, action: 'created' });
}

function handleDeleteTraining(params) {
  if (!params.id) return respond({ error: 'missing_params' });

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_TRAININGS);
  if (!sheet) return respond({ ok: true, action: 'noop' });

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === params.id) {
      sheet.deleteRow(i + 1);
      return respond({ ok: true, action: 'deleted' });
    }
  }
  return respond({ ok: true, action: 'noop' });
}

// ─── Configuração de recorrência ─────────────────────────────────────────────

function handleGetRecurrenceConfig() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_CONFIG);
  if (!sheet) return respond({ config: null });

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === 'recurrenceConfig') {
      try {
        return respond({ config: JSON.parse(String(data[i][1] || '{}')) });
      } catch (e) {
        return respond({ config: null });
      }
    }
  }
  return respond({ config: null });
}

function handleSetRecurrenceConfig(params) {
  if (!params.config) return respond({ error: 'missing_params' });

  // Valida JSON
  try { JSON.parse(params.config); } catch (e) { return respond({ error: 'invalid_json' }); }

  var sheet = getOrCreateSheet(SHEET_CONFIG, HEADERS_CONFIG);
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === 'recurrenceConfig') {
      sheet.getRange(i + 1, 2).setValue(params.config);
      return respond({ ok: true, action: 'updated' });
    }
  }
  sheet.appendRow(['recurrenceConfig', params.config]);
  return respond({ ok: true, action: 'created' });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getOrCreateSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
      .setBackground('#1d4ed8')
      .setFontColor('#ffffff')
      .setFontWeight('bold');
  }
  return sheet;
}

function respond(data, statusCode) {
  // Apps Script Web App não expõe statusCode em ContentService — código fica embutido na resposta.
  if (statusCode && statusCode >= 400 && !data.error) data.error = 'http_' + statusCode;
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
