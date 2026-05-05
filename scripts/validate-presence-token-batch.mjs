import { createClient } from '@supabase/supabase-js'

const requiredEnv = [
  'SUPABASE_TEST_URL',
  'SUPABASE_TEST_ANON_KEY',
  'SUPABASE_TEST_TEAM_ID',
  'SUPABASE_TEST_EMAIL',
  'SUPABASE_TEST_PASSWORD',
]

function fail(message, details) {
  console.error(`❌ ${message}`)
  if (details) console.error(details)
  process.exit(1)
}

function assertEnv() {
  const missing = requiredEnv.filter((key) => !process.env[key])
  if (missing.length > 0) {
    fail(`Variáveis obrigatórias ausentes: ${missing.join(', ')}`)
  }
}

function toDateOnly(date) {
  return date.toISOString().slice(0, 10)
}

function assertRpcOk(data, context) {
  const row = Array.isArray(data) ? data[0] : data
  if (!row?.ok) {
    fail(`${context}: resposta inesperada da RPC pública.`)
  }
  return row
}

function assertRpcNotOk(data, context) {
  const row = Array.isArray(data) ? data[0] : data
  if (row?.ok) {
    fail(`${context}: operação deveria ser rejeitada, mas retornou ok.`)
  }
  return row
}

async function main() {
  assertEnv()

  const url = process.env.SUPABASE_TEST_URL
  const anonKey = process.env.SUPABASE_TEST_ANON_KEY
  const teamId = process.env.SUPABASE_TEST_TEAM_ID
  const email = process.env.SUPABASE_TEST_EMAIL
  const password = process.env.SUPABASE_TEST_PASSWORD

  const authenticated = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const anonymous = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const runId = `gha-${Date.now()}-${Math.random().toString(16).slice(2)}`
  const future = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const startsAt = new Date(future)
  startsAt.setUTCHours(20, 0, 0, 0)
  const lockAt = new Date(startsAt.getTime() - 6 * 60 * 60 * 1000)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  let athleteId = null
  let trainingId = null
  let batchId = null
  let token = null

  console.log('▶️ Iniciando validação automatizada de lote de presença Supabase.')
  console.log(`Run: ${runId}`)

  try {
    const signIn = await authenticated.auth.signInWithPassword({ email, password })
    if (signIn.error || !signIn.data.session?.user) {
      fail('Falha ao autenticar usuário Supabase de teste.', signIn.error?.message)
    }

    const roleCheck = await authenticated.rpc('has_team_role', {
      input_team_id: teamId,
      allowed_roles: ['owner', 'coach'],
    })
    if (roleCheck.error) fail('Falha ao validar papel owner/coach.', roleCheck.error.message)
    if (roleCheck.data !== true) fail('Usuário de teste não possui papel owner/coach no time configurado.')
    console.log('✅ Sessão e papel owner/coach validados.')

    const athleteInsert = await authenticated
      .from('athletes')
      .insert({
        team_id: teamId,
        name: `Teste Automático ${runId}`,
        phone: null,
        category: 'teste',
        level: 'teste',
        status: 'ativo',
        notes: 'Criado por validação automatizada de presence tokens.',
      })
      .select('id')
      .single()
    if (athleteInsert.error) fail('Falha ao criar atleta de teste.', athleteInsert.error.message)
    athleteId = athleteInsert.data.id
    console.log('✅ Atleta de teste criada.')

    const trainingInsert = await authenticated
      .from('trainings')
      .insert({
        team_id: teamId,
        type: 'extra',
        status: 'agendado',
        training_date: toDateOnly(startsAt),
        start_time: '20:00:00',
        end_time: '21:00:00',
        timezone: 'America/Sao_Paulo',
        starts_at: startsAt.toISOString(),
        presence_lock_at: lockAt.toISOString(),
        location: 'Validação automatizada',
        notes: 'Treino criado por validação automatizada de presence tokens.',
        created_manually: true,
        generation_key: runId,
      })
      .select('id')
      .single()
    if (trainingInsert.error) fail('Falha ao criar treino de teste.', trainingInsert.error.message)
    trainingId = trainingInsert.data.id
    console.log('✅ Treino de teste criado.')

    const batch = await authenticated.rpc('create_presence_token_batch', {
      input_team_id: teamId,
      input_training_id: trainingId,
      input_expires_at: expiresAt,
    })
    if (batch.error) fail('Falha ao gerar lote de tokens.', batch.error.message)
    if (!Array.isArray(batch.data) || batch.data.length < 1) fail('Lote gerado sem links.')
    batchId = batch.data[0].batch_id
    token = batch.data[0].token
    if (!batchId || !token) fail('Lote gerado sem batch_id ou token em memória.')
    console.log(`✅ Lote gerado com ${batch.data.length} link(s).`)

    const exported = await authenticated.rpc('mark_presence_token_batch_exported', {
      input_batch_id: batchId,
    })
    if (exported.error) fail('Falha ao marcar lote como exportado.', exported.error.message)

    const batchStatus = await authenticated
      .from('presence_token_batches')
      .select('status, exported_at')
      .eq('id', batchId)
      .single()
    if (batchStatus.error) fail('Falha ao ler status do lote.', batchStatus.error.message)
    if (batchStatus.data.status !== 'exported' || !batchStatus.data.exported_at) {
      fail('Lote não foi marcado como exportado corretamente.')
    }
    console.log('✅ Lote marcado como exportado.')

    const confirm = await anonymous.rpc('confirm_presence_by_token', {
      input_token: token,
      input_status: 'presente',
      input_justification: null,
    })
    if (confirm.error) fail('Falha na confirmação pública por token.', confirm.error.message)
    assertRpcOk(confirm.data, 'Confirmação pública')

    const attendance = await authenticated
      .from('attendance_records')
      .select('status, confirmed_by_athlete')
      .eq('training_id', trainingId)
      .eq('athlete_id', athleteId)
      .single()
    if (attendance.error) fail('Falha ao ler presença confirmada.', attendance.error.message)
    if (attendance.data.status !== 'presente' || attendance.data.confirmed_by_athlete !== true) {
      fail('Presença pública não foi registrada como esperado.')
    }
    console.log('✅ Confirmação pública registrada.')

    const revoke = await authenticated.rpc('revoke_presence_token_batch', {
      input_batch_id: batchId,
    })
    if (revoke.error) fail('Falha ao revogar lote.', revoke.error.message)
    console.log('✅ Lote revogado.')

    const confirmAfterRevoke = await anonymous.rpc('confirm_presence_by_token', {
      input_token: token,
      input_status: 'ausente',
      input_justification: null,
    })
    if (confirmAfterRevoke.error) fail('Falha ao testar token revogado.', confirmAfterRevoke.error.message)
    assertRpcNotOk(confirmAfterRevoke.data, 'Token revogado')
    console.log('✅ Token revogado rejeitado com resposta genérica.')

    const invalidToken = await anonymous.rpc('confirm_presence_by_token', {
      input_token: `invalid-${runId}`,
      input_status: 'presente',
      input_justification: null,
    })
    if (invalidToken.error) fail('Falha ao testar token inválido.', invalidToken.error.message)
    assertRpcNotOk(invalidToken.data, 'Token inválido')
    console.log('✅ Token inválido rejeitado com resposta genérica.')

    console.log('✅ Validação automatizada concluída com sucesso.')
  } finally {
    const cleanupErrors = []

    if (batchId) {
      const { error } = await authenticated.rpc('revoke_presence_token_batch', { input_batch_id: batchId })
      if (error) cleanupErrors.push(`revogar lote: ${error.message}`)
    }

    if (trainingId) {
      const { error } = await authenticated
        .from('trainings')
        .update({ deleted_at: new Date().toISOString(), status: 'cancelado' })
        .eq('id', trainingId)
      if (error) cleanupErrors.push(`soft-delete treino: ${error.message}`)
    }

    if (athleteId) {
      const { error } = await authenticated
        .from('athletes')
        .update({ deleted_at: new Date().toISOString(), status: 'inativo' })
        .eq('id', athleteId)
      if (error) cleanupErrors.push(`soft-delete atleta: ${error.message}`)
    }

    await authenticated.auth.signOut()

    if (cleanupErrors.length > 0) {
      console.warn('⚠️ Cleanup parcial:', cleanupErrors.join(' | '))
    } else {
      console.log('✅ Cleanup concluído.')
    }
  }
}

main().catch((error) => fail('Erro inesperado na validação automatizada.', error?.message ?? String(error)))
