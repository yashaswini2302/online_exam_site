import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import mongoose from 'mongoose'
import '../src/config/loadEnv.js'
import { connectDatabase } from '../src/config/database.js'
import app, { sessionStore } from '../src/app.js'
import Student from '../src/models/Student.js'
import Exam from '../src/models/Exam.js'
import Attempt from '../src/models/Attempt.js'
import { hashPassword } from '../src/services/passwordService.js'

test('Regression: Student can start, answer, and submit a 5-question Intermediate Python Programming exam', async (t) => {
  await connectDatabase()
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  const createdAttemptIds = []
  const createdStudentIds = []

  t.after(async () => {
    try {
      if (createdAttemptIds.length) {
        await Attempt.deleteMany({ _id: { $in: createdAttemptIds } })
      }
      if (createdStudentIds.length) {
        await Student.deleteMany({ _id: { $in: createdStudentIds } })
      }
    } finally {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections()
      }
      await new Promise((resolve) => server.close(resolve))
      await sessionStore.close()
      await mongoose.disconnect()
    }
  })

  const api = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        connection: 'close',
        ...options.headers,
      },
    })
    const body = await res.json().catch(() => ({}))
    return { status: res.status, headers: res.headers, body }
  }

  // 1. Create a dedicated student for clean test isolation
  const studentEmail = `regress.student.${Date.now()}@test.edu`
  const studentPassword = 'StudentSecurePassword2026!'
  const student = await Student.create({
    name: 'Regression Student',
    email: studentEmail,
    studentNumber: `Q65-REGRESS-${Date.now()}`,
    passwordHash: await hashPassword(studentPassword),
    role: 'student',
  })
  createdStudentIds.push(student._id)

  // 2. Sign in as the student
  const loginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: studentEmail, password: studentPassword }),
  })
  assert.equal(loginRes.status, 200, 'Student login should succeed')
  const studentCookie = loginRes.headers.get('set-cookie')?.split(';')[0]
  assert.ok(studentCookie, 'Session cookie must be returned')

  // 3. Retrieve exams catalog and find Python Programming
  const examsRes = await api('/api/exams', {
    headers: { cookie: studentCookie },
  })
  assert.equal(examsRes.status, 200, 'GET /api/exams should return 200')
  const pythonExam = examsRes.body.exams.find((e) => e.slug === 'python-programming')
  assert.ok(pythonExam, 'Python Programming exam must exist in available exams')
  assert.equal(pythonExam.isPlatformExam, true, 'Python Programming should be a platform exam')
  assert.ok(pythonExam.questionCount >= 50, `Python exam should have at least 50 questions (has ${pythonExam.questionCount})`)
  assert.ok(pythonExam.difficultyQuestionCounts.Intermediate >= 5, 'Intermediate tier must have at least 5 eligible questions')
  assert.ok(pythonExam.supportedQuestionCountsByDifficulty.Intermediate.includes(5), 'Intermediate tier must support 5-question length')

  // 4. Start 5-question Intermediate exam
  const attemptRes = await api('/api/attempts', {
    method: 'POST',
    headers: { cookie: studentCookie },
    body: JSON.stringify({
      examId: pythonExam.id,
      studentId: String(student._id),
      questionCount: 5,
      difficulty: 'Intermediate',
    }),
  })

  assert.equal(attemptRes.status, 201, `Starting 5-question Intermediate exam should return 201, got: ${JSON.stringify(attemptRes.body)}`)
  assert.ok(attemptRes.body.attempt, 'Attempt object must be returned')
  const attempt = attemptRes.body.attempt
  createdAttemptIds.push(attempt.id)

  assert.equal(attempt.difficulty, 'Intermediate', 'Attempt difficulty should be Intermediate')
  assert.equal(attempt.questionCount, 5, 'Attempt questionCount should be 5')
  assert.equal(attempt.status, 'in_progress', 'Attempt status should be in_progress')
  assert.equal(attempt.exam.questions.length, 5, 'Exam in attempt must contain exactly 5 questions')

  // Verify all 5 selected questions are of Intermediate difficulty
  for (const q of attempt.exam.questions) {
    assert.equal(q.difficulty, 'Intermediate', `Selected question should be Intermediate, got: ${q.difficulty}`)
  }

  // 5. Answer questions and submit the attempt
  for (const q of attempt.exam.questions) {
    const answerRes = await api(`/api/attempts/${attempt.id}/answers`, {
      method: 'PUT',
      headers: { cookie: studentCookie },
      body: JSON.stringify({ questionId: q.id, selectedOption: 1 }),
    })
    assert.equal(answerRes.status, 200, 'Submitting answer should succeed')
  }

  const submitRes = await api(`/api/attempts/${attempt.id}/submit`, {
    method: 'POST',
    headers: { cookie: studentCookie },
  })
  assert.equal(submitRes.status, 200, 'Submitting attempt should succeed')
  assert.equal(submitRes.body.attempt.status, 'submitted')
  assert.equal(submitRes.body.attempt.result.totalQuestions, 5)

  // 6. Regression check: A platform exam with expired availabilityEndsAt still launches
  // Create an expired platform exam to ensure it is never rejected with "Exam not found or no longer available"
  const expiredPlatformExam = await Exam.create({
    title: 'Expired Platform Practice Exam',
    slug: `expired-platform-${Date.now()}`,
    category: 'PRACTICE',
    description: 'A platform exam whose availability date expired',
    durationMinutes: 30,
    difficulty: 'Intermediate',
    published: true,
    isPlatformExam: true,
    contentSource: 'seeded_demo',
    availabilityEndsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // yesterday
    questions: pythonExam.questions || [
      { prompt: 'Q1', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Intermediate' },
      { prompt: 'Q2', options: ['A', 'B', 'C', 'D'], correctOption: 1, difficulty: 'Intermediate' },
      { prompt: 'Q3', options: ['A', 'B', 'C', 'D'], correctOption: 2, difficulty: 'Intermediate' },
      { prompt: 'Q4', options: ['A', 'B', 'C', 'D'], correctOption: 3, difficulty: 'Intermediate' },
      { prompt: 'Q5', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Intermediate' },
    ],
  })

  try {
    const expiredAttemptRes = await api('/api/attempts', {
      method: 'POST',
      headers: { cookie: studentCookie },
      body: JSON.stringify({
        examId: String(expiredPlatformExam._id),
        studentId: String(student._id),
        questionCount: 5,
        difficulty: 'Intermediate',
      }),
    })
    assert.equal(
      expiredAttemptRes.status,
      201,
      `Platform exam must launch even if availabilityEndsAt is past; got: ${JSON.stringify(expiredAttemptRes.body)}`
    )
    if (expiredAttemptRes.body.attempt?.id) {
      createdAttemptIds.push(expiredAttemptRes.body.attempt.id)
    }
  } finally {
    await Exam.deleteOne({ _id: expiredPlatformExam._id })
  }
})
