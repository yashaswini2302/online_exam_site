import { test, expect } from '@playwright/test'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import Attempt from '../src/models/Attempt.js'
import Student from '../src/models/Student.js'
import { connectDatabase } from '../src/config/database.js'

let studentId

test.afterEach(async ({ context, request }) => {
  try {
    await context.request.post('/api/auth/logout')
  } catch {}
  try {
    await request.post('/api/auth/logout')
  } catch {}

  if (studentId) {
    await connectDatabase()
    try {
      await Attempt.deleteMany({ student: studentId })
      await Student.deleteOne({ _id: studentId })
    } finally {
      await mongoose.disconnect()
      studentId = undefined
    }
  }
})

for (const requestedQuestionCount of [10, 20]) {
test(`${requestedQuestionCount}-question exam keeps its state after refresh and resume`, async ({ page, request }) => {
  const email = `browser-flow-${randomBytes(12).toString('hex')}@example.test`
  const password = `Q65-${randomBytes(18).toString('base64url')}-aA7!`
  const registration = await request.post('/api/auth/register', {
    data: { name: 'Browser Flow Test', email, password, acceptedTerms: true },
  })
  expect(registration.status()).toBe(201)
  studentId = (await registration.json()).student.id
  await request.post('/api/auth/logout')

  await page.goto('/')
  await page.getByLabel('Email address').fill(email)
  await page.locator('input[type="password"]').fill(password)
  const examsResponsePromise = page.waitForResponse((response) =>
    new URL(response.url()).pathname === '/api/exams'
    && response.request().method() === 'GET'
    && response.status() === 200,
  )
  await page.getByRole('button', { name: /sign in/i }).click()
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()

  const examsResponse = await examsResponsePromise
  const { exams } = await examsResponse.json()
  const exam = exams.find((item) => item.supportedQuestionCounts?.includes(requestedQuestionCount))
  test.skip(!exam, `No published exam currently supports ${requestedQuestionCount} questions`)
  const questionCount = requestedQuestionCount

  await page.getByRole('button', { name: /Available exams/ }).first().click()
  const examCard = page.locator('.exam-card').filter({
    has: page.getByRole('heading', { name: exam.title, exact: true }),
  })
  await examCard.getByRole('button', { name: /Configure exam/ }).click()

  const lengthChoice = page.locator('.length-options button').filter({
    has: page.getByText(String(questionCount), { exact: true }),
  })
  await expect(lengthChoice).toBeEnabled()
  await lengthChoice.click()

  const startResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith('/api/attempts')
    && response.request().method() === 'POST'
    && response.status() === 201,
  )
  await page.getByRole('button', { name: `Start ${questionCount}-question exam` }).click()
  const startedResponse = await startResponsePromise
  const started = (await startedResponse.json()).attempt
  const selectedQuestionIds = started.exam.questions.map((question) => question.id)

  expect(started.questionCount).toBe(questionCount)
  expect(new Set(selectedQuestionIds).size).toBe(questionCount)
  await expect(page.locator('.question-number')).toHaveCount(questionCount)

  await page.locator('.answer-list .answer-option').first().click()
  await expect(page.locator('.question-actions')).toContainText('Saved')
  const timerBeforeRefresh = await page.locator('.timer span').innerText()

  await page.reload()
  await expect(page.getByRole('heading', { name: /Welcome back/ })).toBeVisible()
  await page.getByRole('button', { name: /Available exams/ }).first().click()
  const resumedCard = page.locator('.exam-card').filter({
    has: page.getByRole('heading', { name: exam.title, exact: true }),
  })
  const resumeResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/api/attempts/${started.id}`)
    && response.request().method() === 'GET',
  )
  await resumedCard.getByRole('button', { name: /Resume attempt/ }).click()
  const resumedResponse = await resumeResponsePromise
  expect(resumedResponse.status()).toBe(200)
  const resumed = (await resumedResponse.json()).attempt

  expect(resumed.exam.questions.map((question) => question.id)).toEqual(selectedQuestionIds)
  expect(resumed.expiresAt).toBe(started.expiresAt)
  await expect(page.locator('.question-number')).toHaveCount(questionCount)
  await expect(page.locator('.question-number').first()).toHaveClass(/answered/)
  await page.locator('.question-number').first().click()
  await expect(page.locator('.answer-list .answer-option.selected')).toHaveCount(1)

  const resumedRemaining = await page.locator('.timer span').innerText()
  const [minutes, seconds] = resumedRemaining.split(':').map(Number)
  const secondsLeft = minutes * 60 + seconds
  const expectedSecondsLeft = Math.ceil((new Date(resumed.expiresAt).getTime() - Date.now()) / 1000)
  expect(secondsLeft).toBeLessThanOrEqual(started.durationMinutes * 60)
  expect(Math.abs(secondsLeft - expectedSecondsLeft)).toBeLessThanOrEqual(5)
  expect(secondsLeft).toBeLessThanOrEqual(timerToSeconds(timerBeforeRefresh))

  for (let index = 0; index < questionCount; index += 1) {
    await page.locator('.question-number').nth(index).click()
    if (await page.locator('.answer-list .answer-option.selected').count() === 0) {
      await page.locator('.answer-list .answer-option').first().click()
    }
  }
  await expect(page.locator('.question-actions')).toContainText(`${questionCount} of ${questionCount} answered`)
  await expect(page.locator('.question-actions')).toContainText('Saved')

  const submitResponsePromise = page.waitForResponse((response) =>
    response.url().endsWith(`/api/attempts/${started.id}/submit`)
    && response.request().method() === 'POST'
    && response.status() === 200,
  )
  page.once('dialog', (dialog) => dialog.accept())
  await page.getByRole('button', { name: /Finish and submit/ }).click()
  const submitResponse = await submitResponsePromise
  const submitted = (await submitResponse.json()).attempt
  expect(submitted.result.totalQuestions).toBe(questionCount)
  expect(submitted.result.correctAnswers + submitted.result.incorrectAnswers + submitted.result.unansweredQuestions).toBe(questionCount)

  const resultCard = page.locator('.result-card')
  await expect(resultCard).toBeVisible()
  await expect(resultCard.getByRole('heading', { name: exam.title, exact: true })).toBeVisible()
  await expect(page.locator('.preview-label')).toHaveText('SERVER VERIFIED')
  const resultBreakdown = resultCard.locator('.result-breakdown > div')
  await expect(resultBreakdown.nth(0).locator('strong')).toHaveText(String(questionCount))
  await expect(resultBreakdown.nth(3).locator('strong')).toHaveText('0')
  await expect(resultBreakdown.nth(1).locator('strong')).toHaveText(String(submitted.result.correctAnswers))
  await expect(resultBreakdown.nth(2).locator('strong')).toHaveText(String(submitted.result.incorrectAnswers))
  await expect(resultCard.locator('.score-ring strong')).toHaveText(`${submitted.result.percentage}%`)

  await connectDatabase()
  try {
    const persistedAttempt = await Attempt.findById(started.id).lean()
    expect(persistedAttempt.status).toBe('submitted')
    expect(persistedAttempt.selectedQuestionIds.map(String)).toEqual(selectedQuestionIds)
    expect(persistedAttempt.answers).toHaveLength(questionCount)
    expect(persistedAttempt.result).toEqual(submitted.result)
  } finally {
    await mongoose.disconnect()
  }
})
}

function timerToSeconds(value) {
  const [minutes, seconds] = value.split(':').map(Number)
  return minutes * 60 + seconds
}