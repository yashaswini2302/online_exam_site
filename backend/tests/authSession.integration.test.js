import test from 'node:test'
import assert from 'node:assert/strict'
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import mongoose from 'mongoose'
import { connectDatabase } from '../src/config/database.js'
import { hashPassword, verifyPassword } from '../src/services/passwordService.js'
import Student from '../src/models/Student.js'

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: resolve(backendRoot, '../.env') })
const origin = process.env.Q65_AUTH_TEST_ORIGIN || `http://localhost:${process.env.FRONTEND_PORT || '8080'}`
const password = process.env.DEMO_STUDENT_PASSWORD

test('configured demo login, logout, protected access, and login again', { skip: !origin || !password }, async () => {
  const provisionIfMissing = process.env.Q65_AUTH_TEST_PROVISION_IF_MISSING === 'true'
  const studentNumber = process.env.DEMO_STUDENT_NUMBER || 'Q65-DEMO-001'
  let provisionedTestHash = false
  let databaseConnected = false

  try {
    if (provisionIfMissing) {
      await connectDatabase()
      databaseConnected = true
      const student = await Student.findOne({ studentNumber }).select('+passwordHash')
      assert.ok(student, 'Demo student must exist before running the auth test')
      if (!student.passwordHash) {
        student.passwordHash = await hashPassword(password)
        await student.save()
        provisionedTestHash = true
      } else {
        assert.equal(await verifyPassword(password, student.passwordHash), true, 'Configured password does not match the existing hash; existing credentials were preserved')
      }
      await mongoose.disconnect()
      databaseConnected = false
    }

    const request = (path, options = {}) => fetch(`${origin}${path}`, options)
    const anonymous = await request('/api/auth/session')
    assert.equal(anonymous.status, 200)
    assert.equal((await anonymous.json()).student, null)

    const wrongLogin = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'jordan.davis@example.test', password: `${password}incorrect` }),
    })
    assert.equal(wrongLogin.status, 401)

    const signIn = async () => {
      const response = await request('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'jordan.davis@example.test', password }),
      })
      assert.equal(response.status, 200)
      const payload = await response.json()
      assert.equal(payload.student.email, 'jordan.davis@example.test')
      assert.equal('passwordHash' in payload.student, false)
      const cookie = response.headers.getSetCookie()?.[0]?.split(';', 1)[0]
      assert.ok(cookie)
      return cookie
    }

    const firstCookie = await signIn()
    assert.equal((await request('/api/exams', { headers: { cookie: firstCookie } })).status, 200)
    assert.equal((await request('/api/exams')).status, 401)

    const logout = await request('/api/auth/logout', { method: 'POST', headers: { cookie: firstCookie } })
    assert.equal(logout.status, 204)
    assert.equal((await request('/api/exams', { headers: { cookie: firstCookie } })).status, 401)

    const secondCookie = await signIn()
    assert.equal((await request('/api/exams', { headers: { cookie: secondCookie } })).status, 200)
    assert.equal((await request('/api/auth/logout', { method: 'POST', headers: { cookie: secondCookie } })).status, 204)
  } finally {
    if (databaseConnected) await mongoose.disconnect()
    if (provisionedTestHash) {
      await connectDatabase()
      await Student.updateOne({ studentNumber }, { $unset: { passwordHash: '' } })
      await mongoose.disconnect()
    }
  }
})
