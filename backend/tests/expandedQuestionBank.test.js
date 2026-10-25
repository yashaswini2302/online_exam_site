import test from 'node:test'
import assert from 'node:assert/strict'
import {
  expandedExamQuestions,
  getExpandedBankStats,
  validateExpandedBank,
} from '../scripts/expandedQuestionBank.js'
import {
  additionalExams,
  existingExamAdditions,
} from '../scripts/extendedSampleCatalogue.js'

test('expanded question bank passes structural validation and contains no duplicates', () => {
  const existingPrompts = new Set()
  for (const list of Object.values(existingExamAdditions)) {
    for (const q of list) existingPrompts.add(q.prompt.trim().toLowerCase())
  }
  for (const exam of additionalExams) {
    for (const q of exam.questions) existingPrompts.add(q.prompt.trim().toLowerCase())
  }

  const result = validateExpandedBank(existingPrompts)
  assert.equal(result.valid, true, `Validation failed with errors: ${result.errors.join('; ')}`)
  assert.deepEqual(result.errors, [])
})

test('artificial-intelligence-machine-learning has verified 50 eligible questions per difficulty tier', () => {
  const catalogueExam = additionalExams.find(
    (exam) => exam.slug === 'artificial-intelligence-machine-learning',
  )
  assert.ok(catalogueExam, 'AI/ML exam must exist in catalogue')

  const expandedQuestions =
    expandedExamQuestions['artificial-intelligence-machine-learning'] || []
  const combined = [...catalogueExam.questions, ...expandedQuestions]

  assert.equal(combined.length, 150)

  const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 }
  const uniquePrompts = new Set()

  for (const q of combined) {
    assert.ok(q.prompt && typeof q.prompt === 'string')
    const key = q.prompt.trim().toLowerCase()
    assert.equal(uniquePrompts.has(key), false, `Duplicate prompt: ${q.prompt}`)
    uniquePrompts.add(key)

    assert.equal(q.options.length, 4)
    assert.equal(new Set(q.options.map((opt) => opt.trim().toLowerCase())).size, 4)
    assert.ok(Number.isInteger(q.correctOption) && q.correctOption >= 0 && q.correctOption <= 3)
    assert.ok(q.explanation && typeof q.explanation === 'string')
    assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(q.difficulty))

    counts[q.difficulty] += 1
  }

  assert.deepEqual(counts, {
    Beginner: 50,
    Intermediate: 50,
    Advanced: 50,
  })
})

test('python-programming has verified 50 eligible questions per difficulty tier', () => {
  const catalogueExam = additionalExams.find(
    (exam) => exam.slug === 'python-programming',
  )
  assert.ok(catalogueExam, 'Python exam must exist in catalogue')

  const expandedQuestions =
    expandedExamQuestions['python-programming'] || []
  const combined = [...catalogueExam.questions, ...expandedQuestions]

  assert.equal(combined.length, 150)

  const counts = { Beginner: 0, Intermediate: 0, Advanced: 0 }
  const uniquePrompts = new Set()

  for (const q of combined) {
    assert.ok(q.prompt && typeof q.prompt === 'string')
    const key = q.prompt.trim().toLowerCase()
    assert.equal(uniquePrompts.has(key), false, `Duplicate prompt: ${q.prompt}`)
    uniquePrompts.add(key)

    assert.equal(q.options.length, 4)
    assert.equal(new Set(q.options.map((opt) => opt.trim().toLowerCase())).size, 4)
    assert.ok(Number.isInteger(q.correctOption) && q.correctOption >= 0 && q.correctOption <= 3)
    assert.ok(q.explanation && typeof q.explanation === 'string')
    assert.ok(['Beginner', 'Intermediate', 'Advanced'].includes(q.difficulty))

    counts[q.difficulty] += 1
  }

  assert.deepEqual(counts, {
    Beginner: 50,
    Intermediate: 50,
    Advanced: 50,
  })
})

test('getExpandedBankStats reports accurate tallies', () => {
  const stats = getExpandedBankStats()
  assert.ok(stats['artificial-intelligence-machine-learning'])
  assert.equal(stats['artificial-intelligence-machine-learning'].Beginner, 44)
  assert.equal(stats['artificial-intelligence-machine-learning'].Intermediate, 43)
  assert.equal(stats['artificial-intelligence-machine-learning'].Advanced, 48)
  assert.equal(stats['artificial-intelligence-machine-learning'].Total, 135)

  assert.ok(stats['python-programming'])
  assert.equal(stats['python-programming'].Beginner, 40)
  assert.equal(stats['python-programming'].Intermediate, 42)
  assert.equal(stats['python-programming'].Advanced, 48)
  assert.equal(stats['python-programming'].Total, 130)
})

