import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import dotenv from 'dotenv'
import Student from '../src/models/Student.js'
import Attempt from '../src/models/Attempt.js'
import { connectDatabase } from '../src/config/database.js'
import { verifyPassword } from '../src/services/passwordService.js'

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
dotenv.config({ path: resolve(backendRoot, '../.env') })
const origin = process.env.Q65_AUTH_TEST_ORIGIN || `http://localhost:${process.env.FRONTEND_PORT || '8080'}`

test('student can sign in, complete an exam, and retrieve its persisted result', { skip: !origin }, async () => {
  const email = `registration-${randomBytes(12).toString('hex')}@example.test`
  const password = `Q65-${randomBytes(18).toString('base64url')}-aA7!`
  let createdStudent = false
  let createdStudentId
  let databaseConnected = false

  try {
    const request = (path, options = {}) => fetch(`${origin}${path}`, options)
    const payload = { name: 'Registration Test', email, password, acceptedTerms: true }
    const registration = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    assert.equal(registration.status, 201)
    createdStudent = true
    const registered = await registration.json()
    createdStudentId = registered.student.id
    assert.equal(registered.student.email, email)
    assert.equal(registered.emailVerified, false)
    assert.equal('passwordHash' in registered.student, false)

    const cookie = registration.headers.getSetCookie()?.[0]?.split(';', 1)[0]
    assert.ok(cookie)
    assert.equal((await request('/api/auth/session', { headers: { cookie } }).then((response) => response.json())).student.id, registered.student.id)
    assert.equal((await request('/api/exams', { headers: { cookie } })).status, 200)

    await connectDatabase()
    databaseConnected = true
    const student = await Student.findById(registered.student.id).select('+passwordHash')
    assert.ok(student.passwordHash.startsWith('$2'))
    assert.equal(await verifyPassword(password, student.passwordHash), true)
    assert.equal(student.passwordHash.includes(password), false)
    await mongoose.disconnect()
    databaseConnected = false

    const duplicate = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    assert.equal(duplicate.status, 409)

    const weakPassword = await request('/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ ...payload, email: `weak-${email}`, password: 'short' }),
    })
    assert.equal(weakPassword.status, 400)

    const logout = await request('/api/auth/logout', { method: 'POST', headers: { cookie } })
    assert.equal(logout.status, 204)
    assert.equal((await request('/api/exams', { headers: { cookie } })).status, 401)

    const login = await request('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    assert.equal(login.status, 200)
    const loginCookie = login.headers.getSetCookie()?.[0]?.split(';', 1)[0]
    assert.ok(loginCookie)
    assert.equal((await request('/api/auth/session', { headers: { cookie: loginCookie } }).then((response) => response.json())).student.id, registered.student.id)

    const examsResponse = await request('/api/exams', { headers: { cookie: loginCookie } })
    assert.equal(examsResponse.status, 200)
    const { exams } = await examsResponse.json()
    const exam = exams.find((item) => item.slug === 'math-foundations') || exams.find((item) => item.questionCount >= 5)
    assert.ok(exam, 'A published exam with at least five questions is required')

    const unavailableCount = [5, 10, 15, 20, 30, 50, 55].find((count) => count > exam.questionCount) || (exam.questionCount + 5)
    assert.ok(unavailableCount, 'The test exam must have an unavailable preset')
    for (const questionCount of [0, -1, 1.5, 7, unavailableCount, 51, '10', 'invalid']) {
      const invalidCountResponse = await request('/api/attempts', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: loginCookie },
        body: JSON.stringify({ examId: exam.id, studentId: registered.student.id, questionCount }),
      })
      assert.equal(invalidCountResponse.status, 400, `questionCount ${JSON.stringify(questionCount)} must be rejected`)
    }

    const startResponse = await request('/api/attempts', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: loginCookie },
      body: JSON.stringify({ examId: exam.id, studentId: registered.student.id }),
    })
    assert.equal(startResponse.status, 201)
    const started = (await startResponse.json()).attempt
    assert.equal(started.status, 'in_progress')
    assert.equal(started.exam.questions.length, 5)
    assert.equal(new Set(started.exam.questions.map((question) => question.id)).size, 5)

    for (const question of started.exam.questions) {
      const answerResponse = await request(`/api/attempts/${started.id}/answers`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json', cookie: loginCookie },
        body: JSON.stringify({ questionId: question.id, selectedOption: 0, markedForReview: false }),
      })
      assert.equal(answerResponse.status, 200)
    }

    const submitResponse = await request(`/api/attempts/${started.id}/submit`, {
      method: 'POST',
      headers: { cookie: loginCookie },
    })
    assert.equal(submitResponse.status, 200)
    const submitted = (await submitResponse.json()).attempt
    assert.equal(submitted.status, 'submitted')
    assert.equal(submitted.result.totalQuestions, 5)
    assert.equal(submitted.result.unansweredQuestions, 0)
    assert.equal(submitted.result.correctAnswers + submitted.result.incorrectAnswers, 5)

    const reopenedResponse = await request(`/api/attempts/${started.id}`, { headers: { cookie: loginCookie } })
    assert.equal(reopenedResponse.status, 200)
    assert.deepEqual((await reopenedResponse.json()).attempt.result, submitted.result)

    const historyResponse = await request(`/api/students/${registered.student.id}/attempts?status=submitted`, { headers: { cookie: loginCookie } })
    assert.equal(historyResponse.status, 200)
    const history = await historyResponse.json()
    assert.ok(history.attempts.some((item) => item.id === started.id && item.result?.totalQuestions === 5))

    await connectDatabase()
    databaseConnected = true
    const persistedAttempt = await Attempt.findById(started.id).lean()
    assert.ok(persistedAttempt)
    assert.equal(persistedAttempt.status, 'submitted')
    assert.equal(persistedAttempt.selectedQuestionIds.length, 5)
    assert.equal(persistedAttempt.answers.length, 5)
    assert.deepEqual(persistedAttempt.result, submitted.result)
    await mongoose.disconnect()
    databaseConnected = false

    for (const questionCount of exam.supportedQuestionCounts) {
      const presetStartResponse = await request('/api/attempts', {
        method: 'POST',
        headers: { 'content-type': 'application/json', cookie: loginCookie },
        body: JSON.stringify({ examId: exam.id, studentId: registered.student.id, questionCount }),
      })
      assert.equal(presetStartResponse.status, 201)
      const presetAttempt = (await presetStartResponse.json()).attempt
      assert.equal(presetAttempt.questionCount, questionCount)
      assert.equal(presetAttempt.exam.questions.length, questionCount)
      assert.equal(new Set(presetAttempt.exam.questions.map((question) => question.id)).size, questionCount)

      const presetSubmitResponse = await request(`/api/attempts/${presetAttempt.id}/submit`, {
        method: 'POST',
        headers: { cookie: loginCookie },
      })
      assert.equal(presetSubmitResponse.status, 200)
      const presetResult = (await presetSubmitResponse.json()).attempt.result
      assert.equal(presetResult.totalQuestions, questionCount)
      assert.equal(presetResult.unansweredQuestions, questionCount)
    }

    const expiredStartResponse = await request('/api/attempts', {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie: loginCookie },
      body: JSON.stringify({ examId: exam.id, studentId: registered.student.id, questionCount: 5 }),
    })
    assert.equal(expiredStartResponse.status, 201)
    const expiredAttempt = (await expiredStartResponse.json()).attempt

    await connectDatabase()
    databaseConnected = true
    await Attempt.updateOne({ _id: expiredAttempt.id }, { $set: { expiresAt: new Date(Date.now() - 1000) } })
    await mongoose.disconnect()
    databaseConnected = false

    const lateAnswerResponse = await request(`/api/attempts/${expiredAttempt.id}/answers`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie: loginCookie },
      body: JSON.stringify({ questionId: expiredAttempt.exam.questions[0].id, selectedOption: 0 }),
    })
    assert.equal(lateAnswerResponse.status, 409)
    const expired = await lateAnswerResponse.json()
    assert.equal(expired.attempt.status, 'submitted')
    assert.equal(expired.attempt.result.totalQuestions, 5)
    assert.equal(expired.attempt.result.unansweredQuestions, 5)

    await request('/api/auth/logout', { method: 'POST', headers: { cookie: loginCookie } })
  } finally {
    if (databaseConnected) await mongoose.disconnect()
    if (createdStudent) {
      await connectDatabase()
      if (createdStudentId) await Attempt.deleteMany({ student: createdStudentId })
      await Student.deleteOne({ email })
      await mongoose.disconnect()
    }
  }
})
