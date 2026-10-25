import '../src/config/loadEnv.js'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const frontendPort = process.env.FRONTEND_PORT || '8080'
process.env.Q65_AUTH_TEST_ORIGIN ||= `http://localhost:${frontendPort}`

const result = spawnSync(process.execPath, [
  '--test',
  'tests/authSession.integration.test.js',
  'tests/registration.integration.test.js',
], {
  cwd: backendRoot,
  env: process.env,
  stdio: 'inherit',
})

if (result.error) throw result.error
process.exitCode = result.status ?? 1
