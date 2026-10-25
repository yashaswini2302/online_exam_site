import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import Exam from '../models/Exam.js'
import HttpError from '../utils/httpError.js'
import { requireRole } from '../middleware/requireAuth.js'
import {
  availableQuestionCounts,
  defaultMinutesPerQuestion,
  difficultyLevels,
  questionCountsByDifficulty,
  toPublicExam,
  validateObjectId,
} from '../services/attemptService.js'

const router = Router()

router.get('/', async (request, response) => {
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  const now = new Date()
  const filter = {}

  if (isStaff && request.query.myExams === 'true') {
    filter.createdBy = request.user._id
  } else {
    filter.published = true
    filter.$or = [
      { availabilityEndsAt: { $gt: now } },
      { isPlatformExam: true },
      { contentSource: 'seeded_demo' },
    ]
  }

  const exams = await Exam.find(filter)
    .sort({ availabilityEndsAt: 1 })
    .select('title slug subjectSlug contentSource category description durationMinutes difficulty availabilityEndsAt questions.prompt questions.difficulty createdBy isPlatformExam')

  response.json({ exams: exams.map((exam) => {
    const difficultyQuestionCounts = questionCountsByDifficulty(exam)
    return {
      id: String(exam._id),
      title: exam.title,
      slug: exam.slug,
      subjectSlug: exam.subjectSlug || exam.slug,
      contentSource: exam.contentSource || 'seeded_demo',
      category: exam.category,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      questionCount: exam.questions.length,
      supportedQuestionCounts: availableQuestionCounts(exam.questions.length),
      difficultyQuestionCounts,
      supportedQuestionCountsByDifficulty: Object.fromEntries(difficultyLevels.map((difficulty) => [
        difficulty,
        availableQuestionCounts(difficultyQuestionCounts[difficulty]),
      ])),
      maximumQuestionCount: exam.questions.length,
      durationPerFiveQuestions: exam.durationMinutes,
      minutesPerQuestionByDifficulty: defaultMinutesPerQuestion,
      difficulty: exam.difficulty,
      availabilityEndsAt: exam.availabilityEndsAt,
      createdBy: exam.createdBy ? String(exam.createdBy) : null,
      isPlatformExam: Boolean(exam.isPlatformExam),
    }
  }) })
})

router.get('/:examId', async (request, response) => {
  validateObjectId(request.params.examId, 'exam ID')
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'

  let filter
  if (isStaff) {
    filter = { _id: request.params.examId }
  } else {
    filter = {
      _id: request.params.examId,
      published: true,
      $or: [
        { availabilityEndsAt: { $gt: new Date() } },
        { isPlatformExam: true },
        { contentSource: 'seeded_demo' },
      ],
    }
  }

  const exam = await Exam.findOne(filter).select('+questions.prompt +questions.options')
  if (!exam) throw new HttpError(404, 'Exam not found or no longer available')
  response.json({ exam: toPublicExam(exam) })
})

router.post('/', requireRole('teacher', 'admin'), async (request, response) => {
  const title = typeof request.body?.title === 'string' ? request.body.title.trim() : ''
  const description = typeof request.body?.description === 'string' ? request.body.description.trim() : ''
  const category = typeof request.body?.category === 'string' ? request.body.category.trim() : ''
  const difficulty = request.body?.difficulty

  if (title.length < 2 || title.length > 140) {
    throw new HttpError(400, 'Title must be between 2 and 140 characters')
  }
  if (description.length < 2 || description.length > 1000) {
    throw new HttpError(400, 'Description must be between 2 and 1000 characters')
  }
  if (!category || category.length > 100) {
    throw new HttpError(400, 'Category is required and must not exceed 100 characters')
  }
  if (!difficultyLevels.includes(difficulty)) {
    throw new HttpError(400, 'difficulty must be Beginner, Intermediate, or Advanced')
  }

  const rawQuestions = request.body?.questions
  if (!Array.isArray(rawQuestions) || rawQuestions.length === 0) {
    throw new HttpError(400, 'An exam must include at least one question')
  }

  const validatedQuestions = []
  for (let i = 0; i < rawQuestions.length; i++) {
    const q = rawQuestions[i]
    const prompt = typeof q?.prompt === 'string' ? q.prompt.trim() : ''
    if (prompt.length < 2 || prompt.length > 2000) {
      throw new HttpError(400, `Question ${i + 1} prompt must be between 2 and 2000 characters`)
    }
    if (!Array.isArray(q?.options) || q.options.length !== 4) {
      throw new HttpError(400, `Question ${i + 1} must have exactly four options`)
    }
    for (let optIdx = 0; optIdx < 4; optIdx++) {
      if (typeof q.options[optIdx] !== 'string' || !q.options[optIdx].trim()) {
        throw new HttpError(400, `Question ${i + 1} option ${optIdx + 1} cannot be empty`)
      }
    }
    const correctOption = q.correctOption
    if (!Number.isInteger(correctOption) || correctOption < 0 || correctOption > 3) {
      throw new HttpError(400, `Question ${i + 1} correctOption must be an integer from 0 to 3`)
    }
    const qDifficulty = q.difficulty || difficulty
    if (!difficultyLevels.includes(qDifficulty)) {
      throw new HttpError(400, `Question ${i + 1} difficulty must be Beginner, Intermediate, or Advanced`)
    }

    validatedQuestions.push({
      prompt,
      options: q.options.map((opt) => opt.trim()),
      correctOption,
      explanation: typeof q.explanation === 'string' ? q.explanation.trim() : '',
      difficulty: qDifficulty,
    })
  }

  let durationMinutes = Number(request.body?.durationMinutes)
  if (!durationMinutes || Number.isNaN(durationMinutes) || durationMinutes < 1 || durationMinutes > 360) {
    durationMinutes = Math.max(5, Math.ceil(validatedQuestions.length * (defaultMinutesPerQuestion[difficulty] || 1)))
  }

  let availabilityEndsAt
  if (request.body?.availabilityEndsAt) {
    availabilityEndsAt = new Date(request.body.availabilityEndsAt)
    if (Number.isNaN(availabilityEndsAt.getTime()) || availabilityEndsAt <= new Date()) {
      throw new HttpError(400, 'availabilityEndsAt must be a valid future date')
    }
  } else {
    availabilityEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }

  const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'exam'
  const slug = `${baseSlug}-${randomBytes(4).toString('hex')}`

  const exam = new Exam({
    title,
    slug,
    subjectSlug: typeof request.body?.subjectSlug === 'string' ? request.body.subjectSlug.trim().toLowerCase() : baseSlug,
    category,
    description,
    durationMinutes,
    difficulty,
    availabilityEndsAt,
    published: request.body?.published !== false,
    contentSource: 'user_created',
    createdBy: request.user._id,
    isPlatformExam: false,
    questions: validatedQuestions,
  })

  await exam.save()
  response.status(201).json({ exam: toPublicExam(exam) })
})

export default router