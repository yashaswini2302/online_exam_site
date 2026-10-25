import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { hashPassword, validatePassword, verifyPassword } from '../src/services/passwordService.js'

test('hashes configured passwords with bcrypt and verifies them with the same algorithm', async () => {
  const password = randomBytes(24).toString('base64url')
  const hash = await hashPassword(password)

  assert.match(hash, /^\$2[aby]\$/)
  assert.equal(await verifyPassword(password, hash), true)
  assert.equal(await verifyPassword(`${password}wrong`, hash), false)
})

test('requires passwords to contain at least 12 characters', () => {
  assert.throws(() => validatePassword('too-short'), /at least 12 characters/)
  assert.doesNotThrow(() => validatePassword('Long-enough-Password7!'))
  assert.throws(() => validatePassword('Aa1!' + 'é'.repeat(36)), /72 UTF-8 bytes/)
})