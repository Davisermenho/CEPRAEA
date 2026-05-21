import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '.env.test'), override: true })

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  globalSetup: './e2e/global.setup.ts',
  globalTeardown: './e2e/global.teardown.ts',
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: ['**/athlete/**'],
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
      testMatch: ['**/athlete/**'],
    },
    {
      name: 'mobile-coach',
      use: { ...devices['Pixel 5'] },
      testMatch: [
        '**/guards.spec.ts',
        '**/coach/login.spec.ts',
        '**/settings.spec.ts',
        '**/coach/mobile-nav.spec.ts',
      ],
    },
  ],

  webServer: {
    command: 'npm run dev -- --mode test',
    env: {
      ...process.env,
    },
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 30_000,
  },
})
