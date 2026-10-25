import { defineConfig } from '@playwright/test'
import dotenv from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const backendRoot = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(backendRoot, '../.env') })

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: {
    baseURL: process.env.Q65_E2E_BASE_URL || `http://localhost:${process.env.FRONTEND_PORT || '8080'}`,
    browserName: 'chromium',
    headless: true,
    trace: 'retain-on-failure',
  },
})