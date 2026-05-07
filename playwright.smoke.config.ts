import { defineConfig, devices } from '@playwright/test'

const smokeBaseURL = process.env.SMOKE_BASE_URL ?? 'https://cepraea.vercel.app'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['html', { open: 'never' }], ['list']],
  testMatch: ['**/smoke.spec.ts'],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: smokeBaseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
})
