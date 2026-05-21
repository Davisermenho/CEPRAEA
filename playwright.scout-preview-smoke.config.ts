import { defineConfig, devices } from '@playwright/test'

const smokeBaseURL = process.env.SMOKE_BASE_URL

if (!smokeBaseURL) {
  throw new Error('SMOKE_BASE_URL é obrigatório para o smoke de preview do Scout.')
}

export default defineConfig({
  testDir: './e2e/scout',
  testMatch: ['**/scout-preview-smoke.spec.ts'],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: smokeBaseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
})
