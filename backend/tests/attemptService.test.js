import test from 'node:test'
import assert from 'node:assert/strict'
import {
  availableQuestionCounts,
  calculateResult,
  defaultMinutesPerQuestion,
  difficultyLevels,
  eligibleQuestions,
  estimateDurationMinutes,
  getAttemptQuestions,
  maximumQuestionCount,
  questionCountsByDifficulty,
  selectRandomQuestions,
  serializeAttempt,
  supportedQuestionCounts,
  toPublicExam,
  validateObjectId,
} from '../src/services/attemptService.js'
import { additionalExams, existingExamAdditions } from '../scripts/extendedSampleCatalogue.js'

const exam = {
  _id: '64b000000000000000000001',
  title: 'Sample assessment',
  slug: 'sample-assessment',
  category: 'GENERAL',
  description: 'A sample exam',
  durationMinutes: 10,
  difficulty: 'Beginner',
  availabilityEndsAt: new Date('2030-01-01T00:00:00.000Z'),
  questions: [
    { _id: '64b000000000000000000011', prompt: 'Question 1', options: ['A', 'B', 'C', 'D'], correctOption: 1 },
    { _id: '64b000000000000000000012', prompt: 'Question 2', options: ['A', 'B', 'C', 'D'], correctOption: 0 },
    { _id: '64b000000000000000000013', prompt: 'Question 3', options: ['A', 'B', 'C', 'D'], correctOption: 3 },
  ],
}

test('scores answers on the server and counts incorrect and unanswered separately', () => {
  const result = calculateResult(exam, [
    { questionId: exam.questions[0]._id, selectedOption: 1 },
    { questionId: exam.questions[1]._id, selectedOption: 2 },
  ])

  assert.deepEqual(result, {
    totalQuestions: 3,
    correctAnswers: 1,
    incorrectAnswers: 1,
    unansweredQuestions: 1,
    score: 1,
    percentage: 33,
  })
})

test('does not serialize correct answers into the public exam payload', () => {
  const publicExam = toPublicExam(exam)

  assert.equal(publicExam.questions.length, 3)
  assert.deepEqual(publicExam.questions[0], {
    id: exam.questions[0]._id,
    prompt: 'Question 1',
    options: ['A', 'B', 'C', 'D'],
  })
  assert.equal('correctOption' in publicExam.questions[0], false)
})

test('rejects invalid database identifiers with a client error', () => {
  assert.throws(() => validateObjectId('not-an-id', 'exam ID'), (error) => error.status === 400)
})

test('offers only supported exam lengths within the real question bank', () => {
  assert.equal(maximumQuestionCount, 50)
  assert.deepEqual(availableQuestionCounts(4), [])
  assert.deepEqual(availableQuestionCounts(5), [5])
  assert.deepEqual(availableQuestionCounts(12), [5, 10])
  assert.deepEqual(availableQuestionCounts(15), [5, 10, 15])
  assert.deepEqual(availableQuestionCounts(20), [5, 10, 15, 20])
  assert.deepEqual(availableQuestionCounts(27), [5, 10, 15, 20, 25])
  assert.deepEqual(availableQuestionCounts(30), [5, 10, 15, 20, 25, 30])
  assert.deepEqual(availableQuestionCounts(37), [5, 10, 15, 20, 25, 30, 35])
  assert.deepEqual(availableQuestionCounts(40), [5, 10, 15, 20, 25, 30, 35, 40])
  assert.deepEqual(availableQuestionCounts(45), [5, 10, 15, 20, 25, 30, 35, 40, 45])
  assert.deepEqual(availableQuestionCounts(50), [5, 10, 15, 20, 25, 30, 35, 40, 45, 50])
})

test('selects a random set without duplicates and rejects unavailable lengths', () => {
  const questions = Array.from({ length: 10 }, (_, index) => ({ _id: String(index) }))
  const selected = selectRandomQuestions(questions, 5, () => 0.4)
  assert.equal(selected.length, 5)
  assert.equal(new Set(selected.map((question) => question._id)).size, 5)
  for (const count of supportedQuestionCounts) {
    const selectedQuestions = selectRandomQuestions(
      Array.from({ length: count }, (_, index) => ({ _id: String(index) })),
      count,
      () => 0.5,
    )
    assert.equal(selectedQuestions.length, count)
    assert.equal(new Set(selectedQuestions.map((question) => question._id)).size, count)
  }
  assert.throws(() => selectRandomQuestions(questions, 15), (error) => error.status === 400)
  assert.throws(() => selectRandomQuestions(questions, 7), (error) => error.status === 400)
  assert.throws(() => selectRandomQuestions(questions.slice(0, 4), 5), (error) => error.status === 400)
})

test('scores the actual assigned question count for every supported preset', () => {
  for (const count of supportedQuestionCounts) {
    const questions = Array.from({ length: count }, (_, index) => ({
      _id: String(index),
      correctOption: index % 4,
    }))
    const answeredCount = Math.ceil(count / 2)
    const answers = questions.slice(0, answeredCount).map((question, index) => ({
      questionId: question._id,
      selectedOption: index % 2 === 0 ? question.correctOption : (question.correctOption + 1) % 4,
    }))
    const correctAnswers = Math.ceil(answeredCount / 2)
    const result = calculateResult({ questions }, answers)

    assert.deepEqual(result, {
      totalQuestions: count,
      correctAnswers,
      incorrectAnswers: answeredCount - correctAnswers,
      unansweredQuestions: count - answeredCount,
      score: correctAnswers,
      percentage: Math.round((correctAnswers / count) * 100),
    })
  }
})

test('seeded question banks have distinct valid questions and expected lengths', () => {
  const seededBanks = [
    ...Object.entries(existingExamAdditions).map(([slug, questions]) => ({
      slug,
      questions,
      totalQuestionCount: questions.length + 5,
    })),
    ...additionalExams.map((exam) => ({
      slug: exam.slug,
      questions: exam.questions,
      totalQuestionCount: exam.questions.length,
    })),
  ]
  const expectedQuestionCounts = {
    'math-foundations': 34,
    'verbal-reasoning': 27,
    'science-principles': 23,
    'python-programming': 20,
    'java-programming': 15,
    'c-programming': 15,
    'sql-database-management': 15,
    'data-structures-algorithms': 15,
    'web-development': 15,
    'operating-systems': 15,
    'computer-networks': 15,
    'artificial-intelligence-machine-learning': 15,
  }
  const validDifficulties = new Set(['Beginner', 'Intermediate', 'Advanced'])

  assert.equal(seededBanks.length, Object.keys(expectedQuestionCounts).length)
  for (const bank of seededBanks) {
    assert.equal(bank.totalQuestionCount, expectedQuestionCounts[bank.slug])
    assert.ok(bank.totalQuestionCount >= 15)
    const prompts = new Set()
    for (const question of bank.questions) {
      const normalizedPrompt = question.prompt.trim().toLocaleLowerCase()
      assert.ok(normalizedPrompt)
      assert.equal(prompts.has(normalizedPrompt), false, `${bank.slug} has a duplicate prompt`)
      prompts.add(normalizedPrompt)
      assert.equal(question.options.length, 4)
      assert.equal(new Set(question.options.map((option) => option.trim().toLocaleLowerCase())).size, 4)
      assert.ok(Number.isInteger(question.correctOption) && question.correctOption >= 0 && question.correctOption < 4)
      assert.ok(validDifficulties.has(question.difficulty))
    }
  }
})

test('scales configured time from the requested question count and difficulty level', () => {
  // Beginner: 1.0 min/question
  assert.equal(estimateDurationMinutes(5, 'Beginner'), 5)
  assert.equal(estimateDurationMinutes(10, 'Beginner'), 10)
  assert.equal(estimateDurationMinutes(15, 'Beginner'), 15)
  assert.equal(estimateDurationMinutes(20, 'Beginner'), 20)
  assert.equal(estimateDurationMinutes(30, 'Beginner'), 30)
  assert.equal(estimateDurationMinutes(50, 'Beginner'), 50)

  // Intermediate: 1.5 min/question
  assert.equal(estimateDurationMinutes(5, 'Intermediate'), 8)
  assert.equal(estimateDurationMinutes(10, 'Intermediate'), 15)
  assert.equal(estimateDurationMinutes(15, 'Intermediate'), 23)
  assert.equal(estimateDurationMinutes(20, 'Intermediate'), 30)
  assert.equal(estimateDurationMinutes(30, 'Intermediate'), 45)
  assert.equal(estimateDurationMinutes(50, 'Intermediate'), 75)

  // Advanced: 2.0 min/question
  assert.equal(estimateDurationMinutes(5, 'Advanced'), 10)
  assert.equal(estimateDurationMinutes(10, 'Advanced'), 20)
  assert.equal(estimateDurationMinutes(15, 'Advanced'), 30)
  assert.equal(estimateDurationMinutes(20, 'Advanced'), 40)
  assert.equal(estimateDurationMinutes(30, 'Advanced'), 60)
  assert.equal(estimateDurationMinutes(50, 'Advanced'), 100)

  // Boundary checks and invalid inputs
  assert.throws(() => estimateDurationMinutes(0, 'Intermediate'), (error) => error.status === 400)
  assert.throws(() => estimateDurationMinutes(51, 'Intermediate'), (error) => error.status === 400)
  assert.throws(() => estimateDurationMinutes(7.5, 'Intermediate'), (error) => error.status === 400)
  assert.throws(() => estimateDurationMinutes(10, 'Expert'), (error) => error.status === 400)
})

test('filters eligible questions and counts questions by difficulty level', () => {
  const multiDifficultyExam = {
    ...exam,
    difficulty: 'Intermediate',
    questions: [
      { _id: '1', prompt: 'Q1', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Beginner' },
      { _id: '2', prompt: 'Q2', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Beginner' },
      { _id: '3', prompt: 'Q3', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Intermediate' },
      { _id: '4', prompt: 'Q4', options: ['A', 'B', 'C', 'D'], correctOption: 0 }, // inherits exam.difficulty: Intermediate
      { _id: '5', prompt: 'Q5', options: ['A', 'B', 'C', 'D'], correctOption: 0, difficulty: 'Advanced' },
    ],
  }

  assert.equal(eligibleQuestions(multiDifficultyExam, 'Beginner').length, 2)
  assert.equal(eligibleQuestions(multiDifficultyExam, 'Intermediate').length, 2)
  assert.equal(eligibleQuestions(multiDifficultyExam, 'Advanced').length, 1)
  assert.throws(() => eligibleQuestions(multiDifficultyExam, 'InvalidTier'), (error) => error.status === 400)

  const counts = questionCountsByDifficulty(multiDifficultyExam)
  assert.deepEqual(counts, {
    Beginner: 2,
    Intermediate: 2,
    Advanced: 1,
  })

  assert.deepEqual(availableQuestionCounts(counts.Beginner), [])
  assert.deepEqual(availableQuestionCounts(5), [5])
  assert.deepEqual(availableQuestionCounts(12), [5, 10])
})

test('restores the saved question IDs and keeps legacy attempts at five questions', () => {
  const selectedQuestionIds = [exam.questions[2]._id, exam.questions[0]._id]
  const savedAttempt = { exam, selectedQuestionIds }
  assert.deepEqual(getAttemptQuestions(savedAttempt), [exam.questions[2], exam.questions[0]])
  assert.equal(getAttemptQuestions({ exam }).length, 3)
})

test('serializes attempt with difficulty, questionCount, and duration with legacy fallbacks', () => {
  const mockExam = {
    ...exam,
    toObject() { return { ...this } },
  }

  const fullAttempt = {
    _id: '64b000000000000000000099',
    status: 'in_progress',
    startedAt: new Date('2026-10-13T10:00:00.000Z'),
    expiresAt: new Date('2026-10-13T10:30:00.000Z'),
    difficulty: 'Advanced',
    durationMinutes: 30,
    answers: [],
    exam: mockExam,
    selectedQuestionIds: [exam.questions[0]._id, exam.questions[1]._id],
  }

  const serialized = serializeAttempt(fullAttempt)
  assert.equal(serialized.difficulty, 'Advanced')
  assert.equal(serialized.questionCount, 2)
  assert.equal(serialized.durationMinutes, 30)

  // Legacy attempt without attempt.difficulty or attempt.durationMinutes
  const legacyAttempt = {
    _id: '64b000000000000000000098',
    status: 'in_progress',
    startedAt: new Date('2026-10-13T10:00:00.000Z'),
    expiresAt: new Date('2026-10-13T10:10:00.000Z'),
    answers: [],
    exam: mockExam,
  }

  const legacySerialized = serializeAttempt(legacyAttempt)
  assert.equal(legacySerialized.difficulty, exam.difficulty)
  assert.equal(legacySerialized.durationMinutes, exam.durationMinutes)
})