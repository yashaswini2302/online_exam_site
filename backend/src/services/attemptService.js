import mongoose from 'mongoose'
import HttpError from '../utils/httpError.js'

export const maximumQuestionCount = 50
export const supportedQuestionCounts = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
export const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced']
export const defaultMinutesPerQuestion = Object.freeze({
  Beginner: 1,
  Intermediate: 1.5,
  Advanced: 2,
})

export function uniqueQuestions(questions) {
  const seen = new Set()
  return questions.filter((question) => {
    const key = question._id
      ? `id:${String(question._id)}`
      : `prompt:${question.prompt.trim().toLocaleLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export function eligibleQuestions(exam, difficulty = exam.difficulty) {
  if (!difficultyLevels.includes(difficulty)) {
    throw new HttpError(400, 'difficulty must be Beginner, Intermediate, or Advanced')
  }
  return uniqueQuestions(exam.questions).filter((question) => (question.difficulty || exam.difficulty) === difficulty)
}

export function questionCountsByDifficulty(exam) {
  return Object.fromEntries(difficultyLevels.map((difficulty) => [
    difficulty,
    eligibleQuestions(exam, difficulty).length,
  ]))
}

export function availableQuestionCounts(availableCount) {
  return supportedQuestionCounts.filter((count) => count <= availableCount)
}

export function selectRandomQuestions(questions, count, random = Math.random) {
  if (!Number.isInteger(count) || !supportedQuestionCounts.includes(count)) {
    throw new HttpError(400, `Question count must be one of ${supportedQuestionCounts.join(', ')}`)
  }
  const uniquePool = uniqueQuestions(questions)
  if (count > uniquePool.length) throw new HttpError(400, `This exam has only ${uniquePool.length} eligible questions`)

  const pool = [...uniquePool]
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
      ;[pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]]
  }
  return pool.slice(0, count)
}

export function estimateDurationMinutes(count, difficulty) {
  if (!Number.isInteger(count) || count < 1 || count > maximumQuestionCount) {
    throw new HttpError(400, `questionCount must be an integer from 1 to ${maximumQuestionCount}`)
  }
  const minutesPerQuestion = defaultMinutesPerQuestion[difficulty]
  if (!minutesPerQuestion) throw new HttpError(400, 'A valid difficulty is required')
  return Math.ceil(count * minutesPerQuestion)
}

export function getAttemptQuestions(attempt) {
  const bank = attempt.exam.questions
  if (!attempt.selectedQuestionIds?.length) return bank.slice(0, Math.min(5, bank.length))
  const byId = new Map(bank.map((question) => [String(question._id), question]))
  const questions = attempt.selectedQuestionIds.map((questionId) => byId.get(String(questionId)))
  if (questions.some((question) => !question)) throw new HttpError(409, 'The saved question set is no longer available')
  return questions
}

export function toPublicExam(exam) {
  return {
    id: String(exam._id),
    title: exam.title,
    slug: exam.slug,
    category: exam.category,
    description: exam.description,
    durationMinutes: exam.durationMinutes,
    questionCount: exam.questions.length,
    difficulty: exam.difficulty,
    subjectSlug: exam.subjectSlug,
    contentSource: exam.contentSource || 'seeded_demo',
    availabilityEndsAt: exam.availabilityEndsAt,
    questions: exam.questions.map((question) => ({
      id: String(question._id),
      prompt: question.prompt,
      options: question.options,
      ...(question.difficulty ? { difficulty: question.difficulty } : {}),
    })),
  }
}

export function calculateResult(exam, answers) {
  const answerByQuestion = new Map(answers.map((answer) => [String(answer.questionId), answer]))
  let correctAnswers = 0
  let answeredCount = 0

  for (const question of exam.questions) {
    const answer = answerByQuestion.get(String(question._id))
    if (answer?.selectedOption === undefined || answer?.selectedOption === null) continue
    answeredCount += 1
    if (answer.selectedOption === question.correctOption) correctAnswers += 1
  }

  const totalQuestions = exam.questions.length
  const incorrectAnswers = answeredCount - correctAnswers
  const unansweredQuestions = totalQuestions - answeredCount
  const percentage = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100)

  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    unansweredQuestions,
    score: correctAnswers,
    percentage,
  }
}

export function validateObjectId(value, label) {
  if (!mongoose.isValidObjectId(value)) throw new HttpError(400, `A valid ${label} is required`)
}

export function serializeAttempt(attempt, selectedQuestions = getAttemptQuestions(attempt)) {
  const exam = attempt.exam
  const publicExam = exam && typeof exam === 'object' && exam.questions
    ? toPublicExam({ ...exam.toObject(), questions: selectedQuestions })
    : undefined
  return {
    id: String(attempt._id),
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    questionCount: selectedQuestions.length,
    difficulty: attempt.difficulty ?? exam?.difficulty,
    durationMinutes: attempt.durationMinutes ?? exam?.durationMinutes,
    submittedAt: attempt.submittedAt,
    assignment: attempt.assignment ? String(attempt.assignment) : null,
    answers: attempt.answers.map((answer) => ({
      questionId: String(answer.questionId),
      selectedOption: answer.selectedOption ?? null,
      markedForReview: answer.markedForReview,
    })),
    result: attempt.result,
    exam: publicExam,
  }
}