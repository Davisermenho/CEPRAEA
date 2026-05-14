/**
 * Smoke visual CEPR-0083: Scout Central UX Refactor
 * Cobre os 9 critérios de smoke visual solicitados.
 */
import { test, expect } from '@playwright/test'
import { loginAsCoach } from '../helpers/auth'

const TODAY = new Date().toISOString().split('T')[0]
const TOMORROW = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

async function selectNaoObservadoSlice(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Não observado', exact: true }).click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nao observado', exact: true }).click()
}

async function expectEntryCreated(page: import('@playwright/test').Page) {
  await expect(page.getByText(/Entrada criada como/i)).toBeVisible({ timeout: 15_000 })
}

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-01: /scout abre ScoutCentralPage, não ScoutWorkspacePage
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-01: /scout abre Central do Scout', async ({ page }) => {
  await loginAsCoach(page)
  await page.goto('/scout')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })

  // Cabeçalho da Central do Scout
  await expect(page.getByText('Central do Scout')).toBeVisible({ timeout: 8_000 })
  await expect(page.getByRole('heading', { name: 'O que você quer fazer?' })).toBeVisible()
  // Card "Preparar nova sessão" confirma que é a Central, não o Workspace
  await expect(page.getByText('Preparar nova sessão')).toBeVisible()
  // Certifica que o formulário antigo de "Criar jogo" / "Selecionar jogo" não aparece
  await expect(page.getByText('Criar jogo')).not.toBeVisible()
  await expect(page.getByLabel('Selecionar jogo')).not.toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-02: Sem sessão ativa, cards bloqueados ou orientam preparar sessão
// (Este teste assume estado limpo — se houver jogo em_andamento no seed,
//  ele verifica o comportamento de sessão ativa em vez disso)
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-02: Central exibe empty state ou sessão ativa', async ({ page }) => {
  await loginAsCoach(page)
  await page.goto('/scout')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })

  const hasActiveSession = await page.getByText('Sessão ativa').isVisible().catch(() => false)

  if (hasActiveSession) {
    // Com sessão ativa: cards de "Coletar ao vivo" e "Analisar por vídeo" devem estar habilitados
    await expect(page.getByText('Coletar ao vivo')).toBeVisible()
    await expect(page.getByText('Analisar por vídeo')).toBeVisible()
  } else {
    // Sem sessão ativa: empty state e cards bloqueados
    await expect(page.getByText('Nenhum scout preparado')).toBeVisible()
    // Cards bloqueados têm texto "Prepare uma sessão primeiro."
    const disabledCards = page.getByText('Prepare uma sessão primeiro.')
    await expect(disabledCards.first()).toBeVisible()
  }
  // "Preparar nova sessão" sempre habilitado
  await expect(page.getByText('Preparar nova sessão')).toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-03: /scout/preparar cria sessão com session_type
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-03: preparar nova sessão com session_type TREINO', async ({ page }) => {
  await loginAsCoach(page)
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })

  // Cabeçalho do modo criação
  await expect(page.getByRole('heading', { name: 'Preparar nova sessão' })).toBeVisible()
  await expect(page.getByText('Dados da sessão')).toBeVisible()

  // Tipo de sessão: chip "Treino"
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  // Para Treino, adversária é opcional — não exige preenchimento
  await expect(page.getByText('Adversária (opcional)')).toBeVisible()

  // Preencher data (já tem default hoje)
  await page.locator('input[type="date"]').fill(TODAY)

  // Confirmar sessão — navega para /scout/preparar/:gameId
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()

  // Após criação → modo elenco (header muda)
  await expect(page.getByRole('heading', { name: 'Confirmar elenco da sessão' })).toBeVisible({
    timeout: 10_000,
  })
  // URL deve conter /scout/preparar/ + uuid
  expect(page.url()).toMatch(/\/scout\/preparar\/[0-9a-f-]{36}$/)
  // Badge de atletas confirmadas presente
  await expect(page.getByText(/atleta(s)? confirmada(s)?/i)).toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-04: /scout/preparar/:gameId permite add/remove atletas no roster
// (Usa a sessão criada no SMOKE-03 — partimos do estado pós-criação)
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-04: roster add/remove atleta em /scout/preparar/:gameId', async ({ page }) => {
  await loginAsCoach(page)

  // Criar sessão fresh para este teste
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  await page.waitForLoadState('networkidle', { timeout: 15_000 })

  // Se não há atletas cadastradas, pular o toggle (empty state é esperado)
  const noAthletesMsg = page.getByText('Nenhuma atleta cadastrada')
  const hasNoAthletes = await noAthletesMsg.isVisible().catch(() => false)
  if (hasNoAthletes) {
    // Confirmado: empty state de roster está correto
    await expect(noAthletesMsg).toBeVisible()
    return
  }

  // Badge inicial: "0 atletas confirmadas"
  await expect(page.getByText('0 atletas confirmadas')).toBeVisible()

  // Clicar na primeira atleta da lista para adicionar ao roster
  const firstAthleteBtn = page.locator('ul li button').first()
  await firstAthleteBtn.click()
  await page.waitForTimeout(1500) // aguarda operação async

  // Badge deve agora mostrar "1 atleta confirmada"
  await expect(page.getByText('1 atleta confirmada')).toBeVisible({ timeout: 8_000 })

  // Clicar novamente para remover
  await firstAthleteBtn.click()
  await page.waitForTimeout(1500)

  // Badge volta a "0 atletas confirmadas"
  await expect(page.getByText('0 atletas confirmadas')).toBeVisible({ timeout: 8_000 })
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-05: /scout/ao-vivo/:gameId carrega jogo pela URL
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-05: workspace carrega jogo pela URL e registra live entry', async ({ page }) => {
  await loginAsCoach(page)

  // Criar sessão e obter gameId
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Jogo', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  // Adversária obrigatória para JOGO
  await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-SMOKE05')
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })

  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()

  // Navegar diretamente para /scout/ao-vivo/:gameId
  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })

  // Workspace deve exibir cabeçalho da sessão com "Rival-SMOKE05"
  await expect(page.getByText('Rival-SMOKE05')).toBeVisible({ timeout: 10_000 })
  // Não deve ter dropdown "Selecionar jogo"
  await expect(page.getByLabel('Selecionar jogo')).not.toBeVisible()
  // Deve ter link "Central" de volta
  await expect(page.getByText(/Central do Scout|Central/)).toBeVisible()

  // SMOKE-05b: Registrar uma live entry — TRANS_DEF + Nao observado
  // (único padrão que não exige acao_principal_text nem sistema defensivo/ofensivo)
  await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
  await selectNaoObservadoSlice(page)
  await page.getByRole('button', { name: 'Registrar entrada' }).click()
  await expectEntryCreated(page)

  // Entrada salva: <article> card com LIVE-0001 na lista de entradas
  await expect(page.locator('article', { hasText: 'LIVE-0001' })).toBeVisible({ timeout: 8_000 })
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-06: Labels de fase são nomes humanos no workspace
// (Validado acima no SMOKE-05, testado aqui explicitamente)
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-06: labels de fase aparecem como nomes humanos', async ({ page }) => {
  await loginAsCoach(page)

  // Criar sessão Treino (sem adversária)
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()

  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })

  // Os 4 labels humanos devem estar visíveis como botões de fase
  await expect(page.getByRole('button', { name: 'Ataque posicionado', exact: true })).toBeVisible({ timeout: 8_000 })
  await expect(page.getByRole('button', { name: 'Defesa posicionada', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Transição ofensiva', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Transição defensiva', exact: true })).toBeVisible()

  // Códigos brutos não devem estar visíveis como botões de fase
  await expect(page.getByRole('button', { name: 'AT_POS', exact: true })).not.toBeVisible()
  await expect(page.getByRole('button', { name: 'DEF_POS', exact: true })).not.toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-07: /scout/review/:gameId — Nova sequência por vídeo com zero live entries
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-07: video review — nova sequência por vídeo sem live entries', async ({ page }) => {
  await loginAsCoach(page)

  // Criar sessão Treino fresh
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Treino', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()

  await page.goto(`/scout/review/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })

  // Sidebar deve mostrar o botão "+ Nova sequência por vídeo"
  await expect(page.getByRole('button', { name: /Nova sequência por vídeo/i })).toBeVisible({
    timeout: 8_000,
  })

  // Clicar abre formulário de revisão sem live entry selecionada
  await page.getByRole('button', { name: /Nova sequência por vídeo/i }).click()
  await page.waitForTimeout(500)

  // O form aparece com a seção "Código da Jogada" visível (label de texto, não input value)
  await expect(page.getByText('Código da Jogada')).toBeVisible({ timeout: 5_000 })
  // E a seção "Fase de Bola" confirma que o draft foi carregado
  await expect(page.getByText('Fase de Bola')).toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-08: /scout/review/:gameId — revisão com live entry existente continua funcionando
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-08: video review — live entry existente continua funcionando', async ({ page }) => {
  await loginAsCoach(page)

  // Captura erros de RPC para diagnóstico em caso de falha
  const rpcErrors: string[] = []
  page.on('response', async (resp) => {
    if (!resp.ok() && resp.url().includes('rpc')) {
      try { rpcErrors.push(`${resp.status()} → ${await resp.text()}`) }
      catch { rpcErrors.push(`${resp.status()} ${resp.url()}`) }
    }
  })

  // Criar sessão Jogo com entrada ao vivo
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Jogo', exact: true }).click()
  await page.locator('input[type="date"]').fill(TODAY)
  await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-SMOKE08')
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()

  // Criar live entry via workspace — TRANS_DEF + Nao observado
  // (não exige acao_principal_text nem sistema defensivo/ofensivo)
  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
  await selectNaoObservadoSlice(page)
  await page.getByRole('button', { name: 'Registrar entrada' }).click()
  await expectEntryCreated(page)

  // Confirma save via <article> card — único <article> no workspace = entrada salva
  // (não usar getByText genérico: o resumo do form também exibe o idJogada corrente)
  await expect(page.locator('article', { hasText: 'LIVE-0001' })).toBeVisible({
    timeout: 8_000,
  })
  if (rpcErrors.length) console.error('SMOKE-08 RPC errors:', rpcErrors)

  // Navega para review
  await page.goto(`/scout/review/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })
  await page.waitForTimeout(1_500)

  // Review sidebar: a live entry aparece com o idJogada (não com "PENDENTE" — usa ícones de status)
  await expect(page.getByText('Nenhuma entrada registrada.')).not.toBeVisible({ timeout: 5_000 })
  await expect(page.getByText('LIVE-0001')).toBeVisible({ timeout: 5_000 })

  // Botão "+ Nova sequência por vídeo" ainda presente no topo
  await expect(page.getByRole('button', { name: /Nova sequência por vídeo/i })).toBeVisible()
})

// ─────────────────────────────────────────────────────────────────────────────
// SMOKE-09: /scout mostra status atualizado da sessão ativa
// ─────────────────────────────────────────────────────────────────────────────
test('SMOKE-09: Central mostra status atualizado após criar sessão e entrada', async ({ page }) => {
  await loginAsCoach(page)

  // Captura erros de RPC para diagnóstico em caso de falha
  const rpcErrors: string[] = []
  page.on('response', async (resp) => {
    if (!resp.ok() && resp.url().includes('rpc')) {
      try { rpcErrors.push(`${resp.status()} → ${await resp.text()}`) }
      catch { rpcErrors.push(`${resp.status()} ${resp.url()}`) }
    }
  })

  // Criar sessão Jogo
  await page.goto('/scout/preparar')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })
  await page.getByRole('button', { name: 'Jogo', exact: true }).click()
  await page.locator('input[type="date"]').fill(TOMORROW)
  await page.locator('input[placeholder="Nome da equipe adversária"]').fill('Rival-SMOKE09')
  await page.getByRole('button', { name: /Confirmar sessão/i }).click()
  await page.waitForURL(/\/scout\/preparar\/[0-9a-f-]{36}/, { timeout: 10_000 })
  const gameId = page.url().match(/\/scout\/preparar\/([0-9a-f-]{36})/)?.[1]
  expect(gameId).toBeTruthy()

  // Criar live entry via workspace — TRANS_DEF + Nao observado
  // (não exige acao_principal_text nem sistema defensivo/ofensivo)
  await page.goto(`/scout/ao-vivo/${gameId}`)
  await page.waitForLoadState('networkidle', { timeout: 20_000 })
  await page.getByRole('button', { name: 'Transição defensiva', exact: true }).click()
  await selectNaoObservadoSlice(page)
  await page.getByRole('button', { name: 'Registrar entrada' }).click()
  await expectEntryCreated(page)

  // Confirma save via <article> card — único <article> no workspace = entrada salva
  // (não usar getByText genérico: o resumo do form também exibe o idJogada corrente)
  await expect(page.locator('article', { hasText: 'LIVE-0001' })).toBeVisible({
    timeout: 8_000,
  })
  if (rpcErrors.length) console.error('SMOKE-09 RPC errors:', rpcErrors)

  // Voltar à Central
  await page.goto('/scout')
  await page.waitForLoadState('networkidle', { timeout: 15_000 })

  // Painel "Sessão ativa" deve mostrar "Rival-SMOKE09"
  await expect(page.getByText('Sessão ativa')).toBeVisible({ timeout: 8_000 })
  await expect(page.getByText('Rival-SMOKE09')).toBeVisible()
  // Contagem de entradas: span mostra "{n} entradas" — qualquer n >= 1 passa
  await expect(page.locator('span', { hasText: /^[1-9]\d* entradas$/ })).toBeVisible({ timeout: 8_000 })
  // Cards "Coletar ao vivo" e "Analisar por vídeo" habilitados
  await expect(page.getByText('Coletar ao vivo')).toBeVisible()
  await expect(page.getByText('Analisar por vídeo')).toBeVisible()
})
