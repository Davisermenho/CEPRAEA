// CEPR-AUTH-01: E2E tests for onboarding flows (invite acceptance).
// These tests require INVITE_ID env var or skip.

import { test, expect } from '@playwright/test'

test.describe('AcceptInvitePage — convite inválido', () => {
  test('UUID inválido mostra erro amigável', async ({ page }) => {
    await page.goto('/aceitar-convite/00000000-0000-0000-0000-000000000000')
    // Should show invalid/error screen — NOT crash.
    await expect(
      page.getByText(/convite inválido|erro|expirado/i)
    ).toBeVisible({ timeout: 10_000 })
  })
})

test.describe('AcceptInvitePage — convite válido', () => {
  test.skip(!process.env.TEST_INVITE_ID, 'TEST_INVITE_ID not set — skip')

  test('aceita convite e redireciona ao painel', async ({ page }) => {
    // Must be logged in as the invitee.
    await page.goto(`/aceitar-convite/${process.env.TEST_INVITE_ID}`)
    await expect(page.getByText(/acesso liberado/i)).toBeVisible({ timeout: 10_000 })
    await page.waitForURL('/', { timeout: 5_000 })
  })
})
