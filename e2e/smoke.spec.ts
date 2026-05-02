/**
 * smoke.spec.ts — Testes de fumaça contra cepraea.vercel.app (production).
 *
 * Roda com o project 'smoke' (baseURL: https://cepraea.vercel.app).
 * Não requer servidor local.
 *
 * SABOTAGEM: remover VITE_SYNC_ENDPOINT_URL do Vercel → bundle não tem a variável → DETECTADO.
 */
import { test, expect } from '@playwright/test'

test.describe('Produção — cepraea.vercel.app', () => {
  test('homepage carrega com status 200', async ({ page }) => {
    const resp = await page.goto('/')
    expect(resp?.status()).toBe(200)
  })

  test('título da página contém CEPRAEA', async ({ page }) => {
    await page.goto('/')
    const title = await page.title()
    expect(title).toMatch(/cepraea/i)
  })

  test('manifest.webmanifest está presente e válido', async ({ page }) => {
    const resp = await page.goto('/manifest.webmanifest')
    expect(resp?.status()).toBe(200)
    const text = await page.content()
    // O body raw não está disponível via page.content(), usar evaluate
    const manifest = await page.evaluate(() => document.body.innerText)
    const parsed = JSON.parse(manifest)
    expect(parsed).toHaveProperty('name')
    expect(parsed).toHaveProperty('icons')
  })

  test('Service Worker está registrado', async ({ page, request }) => {
    // Verifica se os arquivos do SW estão acessíveis em produção
    const swResp = await request.get('https://cepraea.vercel.app/sw.js')
    const manifestResp = await request.get('https://cepraea.vercel.app/registerSW.js')
    // Pelo menos um dos arquivos de SW deve existir
    const swExists = swResp.ok() || manifestResp.ok()
    expect(swExists).toBe(true)
  })

  test('bundle contém VITE_SYNC_ENDPOINT_URL embutida', async ({ page }) => {
    // Captura todas as requisições de JS
    const jsUrls: string[] = []
    page.on('response', async (resp) => {
      if (resp.url().endsWith('.js') || resp.url().includes('/assets/')) {
        jsUrls.push(resp.url())
      }
    })
    await page.goto('/')
    await page.waitForLoadState('networkidle', { timeout: 15000 })

    // Verifica se a URL do Apps Script aparece em algum chunk JS
    let found = false
    for (const url of jsUrls) {
      const resp = await page.request.get(url)
      const text = await resp.text()
      if (text.includes('script.google.com')) {
        found = true
        break
      }
    }
    expect(found).toBe(true)
  })

  test('welcome page mostra opções de Treinador e Atleta', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText(/treinador/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/atleta/i).first()).toBeVisible({ timeout: 10000 })
  })
})
