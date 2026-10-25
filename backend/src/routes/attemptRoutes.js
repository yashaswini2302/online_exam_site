import { Router } from 'express'
import Attempt from '../models/Attempt.js'
import Exam from '../models/Exam.js'
import Student from '../models/Student.js'
import ExamAssignment from '../models/ExamAssignment.js'
import { isStudentTargeted } from './assignmentRoutes.js'
import HttpError from '../utils/httpError.js'
import {
  availableQuestionCounts,
  calculateResult,
  difficultyLevels,
  eligibleQuestions,
  estimateDurationMinutes,
  getAttemptQuestions,
  maximumQuestionCount,
  selectRandomQuestions,
  serializeAttempt,
  validateObjectId,
} from '../services/attemptService.js'

const router = Router()

async function loadAttempt(attemptId, user) {
  validateObjectId(attemptId, 'attempt ID')
  const attempt = await Attempt.findById(attemptId).populate({ path: 'exam', select: '+questions.correctOption' })
  if (!attempt) throw new HttpError(404, 'Attempt not found')
  const isOwner = String(attempt.student) === String(user._id)
  const isStaff = user.role === 'teacher' || user.role === 'admin'
  if (!isOwner && !isStaff) throw new HttpError(403, 'You can only access your own attempts')
  return attempt
}

async function submitAttempt(attempt) {
  if (attempt.status === 'submitted') return attempt

  const selectedQuestions = getAttemptQuestions(attempt)
  attempt.result = calculateResult({ questions: selectedQuestions }, attempt.answers)
  attempt.status = 'submitted'
  attempt.submittedAt = new Date()
  await attempt.save()
  return attempt
}

router.post('/', async (request, response) => {
  const {
    examId: rawExamId,
    studentId,
    assignmentId,
    questionCount: rawQuestionCount,
    difficulty: rawRequestedDifficulty,
  } = request.body ?? {}

  validateObjectId(studentId, 'student ID')
  if (String(request.student._id) !== studentId) throw new HttpError(403, 'You can only start attempts for your own account')

  const student = await Student.findById(studentId)
  if (!student) throw new HttpError(404, 'Student not found')

  let assignment = null
  let examId = rawExamId

  if (assignmentId) {
    validateObjectId(assignmentId, 'assignment ID')
    assignment = await ExamAssignment.findById(assignmentId)
    if (!assignment || assignment.status !== 'published') {
      throw new HttpError(404, 'Assignment not found or closed')
    }

    if (examId && String(assignment.exam) !== String(examId)) {
      throw new HttpError(400, 'examId does not match assignment exam')
    }
    examId = String(assignment.exam)

    const now = new Date()
    if (now < assignment.scheduledStartAt) {
      throw new HttpError(400, 'This assignment has not started yet')
    }
    if (now > assignment.deadline) {
      throw new HttpError(400, 'The deadline for this assignment has passed')
    }

    if (!isStudentTargeted(assignment, student)) {
      throw new HttpError(403, 'You are not assigned to this exam')
    }

    const previousAttemptsCount = await Attempt.countDocuments({
      student: studentId,
      assignment: assignment._id,
    })
    if (previousAttemptsCount >= assignment.maxAttempts) {
      throw new HttpError(409, `You have reached the maximum number of attempts (${assignment.maxAttempts}) for this assignment`)
    }
  } else {
    validateObjectId(examId, 'exam ID')
  }

  const examFilter = assignment
    ? { _id: examId }
    : {
        _id: examId,
        published: true,
        $or: [
          { availabilityEndsAt: { $gt: new Date() } },
          { isPlatformExam: true },
          { contentSource: 'seeded_demo' },
        ],
      }

  const exam = await Exam.findOne(examFilter)
  if (!exam) throw new HttpError(404, 'Exam not found or no longer available')

  const questionCount = rawQuestionCount !== undefined
    ? rawQuestionCount
    : (assignment?.presetQuestionCount ?? 5)
  if (typeof questionCount !== 'number' || !Number.isInteger(questionCount) || questionCount < 1 || questionCount > maximumQuestionCount) {
    throw new HttpError(400, `questionCount must be an integer from 1 to ${maximumQuestionCount}`)
  }
  const numericQuestionCount = questionCount

  const requestedDifficulty = assignment?.presetDifficulty ?? rawRequestedDifficulty
  const hasExplicitDifficulty = requestedDifficulty !== undefined && requestedDifficulty !== null
  const difficulty = hasExplicitDifficulty ? requestedDifficulty : exam.difficulty
  if (!difficultyLevels.includes(difficulty)) {
    throw new HttpError(400, 'difficulty must be Beginner, Intermediate, or Advanced')
  }

  const pool = hasExplicitDifficulty ? eligibleQuestions(exam, difficulty) : exam.questions
  const supportedCounts = availableQuestionCounts(pool.length)
  if (!supportedCounts.includes(numericQuestionCount)) {
    throw new HttpError(
      400,
      hasExplicitDifficulty
        ? `Question count ${numericQuestionCount} is unavailable at ${difficulty} difficulty; this bank supports ${supportedCounts.join(', ') || 'no valid exam lengths'}`
        : `Question count ${numericQuestionCount} is unavailable; this exam supports ${supportedCounts.join(', ') || 'no valid exam lengths'}`
    )
  }

  const previousAttemptFilter = assignment
    ? { student: studentId, assignment: assignment._id, status: 'in_progress' }
    : { student: studentId, exam: examId, assignment: null, status: 'in_progress' }

  const previousAttempt = await Attempt.findOne(previousAttemptFilter)
  if (previousAttempt && previousAttempt.expiresAt > new Date()) {
    throw new HttpError(409, 'You already have an active attempt for this exam', { attemptId: String(previousAttempt._id) })
  }
  if (previousAttempt) await submitAttempt(await loadAttempt(previousAttempt._id, request.user))

  const selectedQuestions = selectRandomQuestions(pool, numericQuestionCount)
  const durationMinutes = estimateDurationMinutes(numericQuestionCount, difficulty)
  const startedAt = new Date()
  const attempt = await Attempt.create({
    student: studentId,
    exam: examId,
    assignment: assignment ? assignment._id : null,
    selectedQuestionIds: selectedQuestions.map((question) => question._id),
    questionCount: selectedQuestions.length,
    difficulty,
    durationMinutes,
    startedAt,
    expiresAt: new Date(startedAt.getTime() + durationMinutes * 60_000),
  })

  const populatedAttempt = await loadAttempt(attempt._id, request.user)
  response.status(201).json({ attempt: serializeAttempt(populatedAttempt, selectedQuestions) })
})

router.get('/:attemptId', async (request, response) => {
  let attempt = await loadAttempt(request.params.attemptId, request.user)
  if (attempt.status === 'in_progress' && attempt.expiresAt <= new Date()) {
    attempt = await submitAttempt(attempt)
  }
  response.json({ attempt: serializeAttempt(attempt) })
})

router.put('/:attemptId/answers', async (request, response) => {
  const attempt = await loadAttempt(request.params.attemptId, request.user)
  if (attempt.status === 'submitted') throw new HttpError(409, 'This attempt has already been submitted')

  if (attempt.expiresAt <= new Date()) {
    await submitAttempt(attempt)
    return response.status(409).json({ error: 'Time expired; your attempt was submitted', attempt: serializeAttempt(attempt) })
  }

  const { questionId, selectedOption, markedForReview = false } = request.body ?? {}
  validateObjectId(questionId, 'question ID')
  if (typeof markedForReview !== 'boolean') throw new HttpError(400, 'markedForReview must be a boolean')

  const selectedQuestions = getAttemptQuestions(attempt)
  const questionExists = selectedQuestions.some((question) => String(question._id) === questionId)
  if (!questionExists) throw new HttpError(400, 'Question does not belong to this exam')

  if (selectedOption !== null && selectedOption !== undefined && (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 3)) {
    throw new HttpError(400, 'selectedOption must be an option index from 0 to 3, or null')
  }

  const answerIndex = attempt.answers.findIndex((answer) => String(answer.questionId) === questionId)
  if (selectedOption === null && !markedForReview) {
    if (answerIndex !== -1) attempt.answers.splice(answerIndex, 1)
  } else if (answerIndex === -1) {
    attempt.answers.push({ questionId, selectedOption: selectedOption ?? undefined, markedForReview })
  } else {
    attempt.answers[answerIndex].selectedOption = selectedOption ?? undefined
    attempt.answers[answerIndex].markedForReview = markedForReview
  }

  await attempt.save()
  response.json({ attempt: serializeAttempt(attempt) })
})

router.post('/:attemptId/submit', async (request, response) => {
  const attempt = await loadAttempt(request.params.attemptId, request.user)
  await submitAttempt(attempt)
  response.json({ attempt: serializeAttempt(attempt) })
})

export default router