import { randomBytes } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import dotenv from 'dotenv'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const envPath = resolve(projectRoot, '.env')
const templatePath = resolve(projectRoot, '.env.example')
const envText = await readFile(envPath, 'utf8').catch(async (error) => {
  if (error.code !== 'ENOENT') throw error
  return readFile(templatePath, 'utf8')
})
const values = dotenv.parse(envText)

function updateValue(text, key, value) {
  const expression = new RegExp(`^${key}=.*$`, 'm')
  return expression.test(text) ? text.replace(expression, `${key}=${value}`) : `${text.trimEnd()}\n${key}=${value}\n`
}

let nextText = envText
if (!values.DEMO_STUDENT_PASSWORD) {
  nextText = updateValue(nextText, 'DEMO_STUDENT_PASSWORD', `Q65-${randomBytes(24).toString('base64url')}-aA7!`)
}
if (!values.SESSION_SECRET || values.SESSION_SECRET.length < 32) {
  nextText = updateValue(nextText, 'SESSION_SECRET', randomBytes(48).toString('base64url'))
}

const nextValues = dotenv.parse(nextText)
if (nextValues.DEMO_STUDENT_PASSWORD.length < 12) {
  throw new Error('DEMO_STUDENT_PASSWORD must contain at least 12 characters; update it in the local .env file')
}
if (nextValues.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must contain at least 32 characters; update it in the local .env file')
}

await writeFile(envPath, nextText, { mode: 0o600 })
console.info('Local authentication configuration is ready. Generated credentials were stored in the ignored .env file and were not printed.')
