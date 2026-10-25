import { Router } from 'express'
import mongoose from 'mongoose'
import ExamAssignment from '../models/ExamAssignment.js'
import Exam from '../models/Exam.js'
import Student from '../models/Student.js'
import Department from '../models/Department.js'
import ClassGroup from '../models/ClassGroup.js'
import Attempt from '../models/Attempt.js'
import HttpError from '../utils/httpError.js'
import { requireRole } from '../middleware/requireAuth.js'
import { validateObjectId } from '../services/attemptService.js'

const router = Router()

function serializeAssignment(assignment, extra = {}) {
  return {
    id: String(assignment._id),
    title: assignment.title,
    exam: assignment.exam && typeof assignment.exam === 'object' && assignment.exam.title ? {
      id: String(assignment.exam._id),
      title: assignment.exam.title,
      slug: assignment.exam.slug,
      durationMinutes: assignment.exam.durationMinutes,
      difficulty: assignment.exam.difficulty,
    } : String(assignment.exam),
    assignedBy: assignment.assignedBy && typeof assignment.assignedBy === 'object' && assignment.assignedBy.name ? {
      id: String(assignment.assignedBy._id),
      name: assignment.assignedBy.name,
      email: assignment.assignedBy.email,
    } : String(assignment.assignedBy),
    targetType: assignment.targetType,
    targetDepartments: Array.isArray(assignment.targetDepartments) ? assignment.targetDepartments.map((d) => String(d._id || d)) : [],
    targetClasses: Array.isArray(assignment.targetClasses) ? assignment.targetClasses.map((c) => String(c._id || c)) : [],
    targetStudents: Array.isArray(assignment.targetStudents) ? assignment.targetStudents.map((s) => String(s._id || s)) : [],
    scheduledStartAt: assignment.scheduledStartAt,
    deadline: assignment.deadline,
    maxAttempts: assignment.maxAttempts,
    isGraded: assignment.isGraded,
    presetQuestionCount: assignment.presetQuestionCount,
    presetDifficulty: assignment.presetDifficulty,
    status: assignment.status,
    instructions: assignment.instructions || '',
    createdAt: assignment.createdAt,
    ...extra,
  }
}

export function isStudentTargeted(assignment, student) {
  if (assignment.targetType === 'all') return true
  if (assignment.targetType === 'individual') {
    return assignment.targetStudents.some((id) => String(id) === String(student._id))
  }
  if (assignment.targetType === 'department') {
    return student.department && assignment.targetDepartments.some((id) => String(id) === String(student.department))
  }
  if (assignment.targetType === 'class') {
    return Array.isArray(student.classes) && student.classes.some((classId) =>
      assignment.targetClasses.some((id) => String(id) === String(classId))
    )
  }
  return false
}

router.get('/', async (request, response) => {
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'

  if (isStaff) {
    const filter = {}
    if (request.query.myOnly === 'true' && request.user.role === 'teacher') {
      filter.assignedBy = request.user._id
    }
    if (request.query.examId) {
      validateObjectId(request.query.examId, 'exam ID')
      filter.exam = request.query.examId
    }
    const assignments = await ExamAssignment.find(filter)
      .populate('exam', 'title slug durationMinutes difficulty')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
    return response.json({ assignments: assignments.map((a) => serializeAssignment(a)) })
  }

  // Student view: assignments targeting this student
  const student = request.student
  const orClauses = [{ targetType: 'all' }, { targetType: 'individual', targetStudents: student._id }]
  if (student.department) {
    orClauses.push({ targetType: 'department', targetDepartments: student.department })
  }
  if (Array.isArray(student.classes) && student.classes.length > 0) {
    orClauses.push({ targetType: 'class', targetClasses: { $in: student.classes } })
  }

  const assignments = await ExamAssignment.find({
    status: 'published',
    $or: orClauses,
  })
    .populate('exam', 'title slug durationMinutes difficulty')
    .populate('assignedBy', 'name email')
    .sort({ deadline: 1 })

  const now = new Date()
  const serialized = await Promise.all(assignments.map(async (assignment) => {
    const attemptsUsed = await Attempt.countDocuments({
      student: student._id,
      assignment: assignment._id,
    })
    const isStarted = now >= assignment.scheduledStartAt
    const isExpired = now > assignment.deadline
    const hasRemainingAttempts = attemptsUsed < assignment.maxAttempts
    const canAttempt = isStarted && !isExpired && hasRemainingAttempts

    return serializeAssignment(assignment, {
      attemptsUsed,
      attemptsRemaining: Math.max(0, assignment.maxAttempts - attemptsUsed),
      isStarted,
      isExpired,
      canAttempt,
    })
  }))

  response.json({ assignments: serialized })
})

router.get('/:assignmentId', async (request, response) => {
  validateObjectId(request.params.assignmentId, 'assignment ID')
  const assignment = await ExamAssignment.findById(request.params.assignmentId)
    .populate('exam', 'title slug durationMinutes difficulty questions')
    .populate('assignedBy', 'name email')

  if (!assignment) throw new HttpError(404, 'Assignment not found')

  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  if (!isStaff) {
    const student = request.student
    if (!isStudentTargeted(assignment, student)) {
      throw new HttpError(403, 'You are not assigned to this exam')
    }
    const attemptsUsed = await Attempt.countDocuments({
      student: student._id,
      assignment: assignment._id,
    })
    const now = new Date()
    const isStarted = now >= assignment.scheduledStartAt
    const isExpired = now > assignment.deadline
    const hasRemainingAttempts = attemptsUsed < assignment.maxAttempts
    const canAttempt = isStarted && !isExpired && hasRemainingAttempts

    return response.json({
      assignment: serializeAssignment(assignment, {
        attemptsUsed,
        attemptsRemaining: Math.max(0, assignment.maxAttempts - attemptsUsed),
        isStarted,
        isExpired,
        canAttempt,
      }),
    })
  }

  response.json({ assignment: serializeAssignment(assignment) })
})

router.post('/', requireRole('teacher', 'admin'), async (request, response) => {
  const {
    examId,
    title: rawTitle,
    targetType = 'all',
    targetDepartments = [],
    targetClasses = [],
    targetStudents = [],
    scheduledStartAt: rawStart,
    deadline: rawDeadline,
    maxAttempts = 1,
    isGraded = true,
    presetQuestionCount,
    presetDifficulty,
    instructions = '',
  } = request.body ?? {}

  validateObjectId(examId, 'exam ID')
  const exam = await Exam.findById(examId)
  if (!exam) throw new HttpError(404, 'Referenced exam not found')

  const title = typeof rawTitle === 'string' && rawTitle.trim() ? rawTitle.trim() : `${exam.title} Assignment`
  if (title.length < 2 || title.length > 140) {
    throw new HttpError(400, 'Assignment title must be between 2 and 140 characters')
  }

  if (!['department', 'class', 'individual', 'all'].includes(targetType)) {
    throw new HttpError(400, 'targetType must be department, class, individual, or all')
  }

  // Validate target references
  if (targetType === 'department') {
    if (!Array.isArray(targetDepartments) || targetDepartments.length === 0) {
      throw new HttpError(400, 'At least one target department is required for department targeting')
    }
    for (const deptId of targetDepartments) {
      if (!mongoose.isValidObjectId(deptId)) throw new HttpError(400, `Invalid department ID: ${deptId}`)
      const exists = await Department.exists({ _id: deptId })
      if (!exists) throw new HttpError(400, `Referenced department does not exist: ${deptId}`)
    }
  }

  if (targetType === 'class') {
    if (!Array.isArray(targetClasses) || targetClasses.length === 0) {
      throw new HttpError(400, 'At least one target class is required for class targeting')
    }
    for (const classId of targetClasses) {
      if (!mongoose.isValidObjectId(classId)) throw new HttpError(400, `Invalid class ID: ${classId}`)
      const exists = await ClassGroup.exists({ _id: classId })
      if (!exists) throw new HttpError(400, `Referenced class does not exist: ${classId}`)
    }
  }

  if (targetType === 'individual') {
    if (!Array.isArray(targetStudents) || targetStudents.length === 0) {
      throw new HttpError(400, 'At least one student is required for individual targeting')
    }
    for (const studentId of targetStudents) {
      if (!mongoose.isValidObjectId(studentId)) throw new HttpError(400, `Invalid student ID: ${studentId}`)
      const exists = await Student.exists({ _id: studentId })
      if (!exists) throw new HttpError(400, `Referenced student does not exist: ${studentId}`)
    }
  }

  const scheduledStartAt = rawStart ? new Date(rawStart) : new Date()
  if (Number.isNaN(scheduledStartAt.getTime())) {
    throw new HttpError(400, 'scheduledStartAt must be a valid date')
  }

  if (!rawDeadline) throw new HttpError(400, 'A deadline date is required')
  const deadline = new Date(rawDeadline)
  if (Number.isNaN(deadline.getTime())) {
    throw new HttpError(400, 'deadline must be a valid date')
  }
  if (deadline <= scheduledStartAt) {
    throw new HttpError(400, 'Deadline must be after the scheduled start time')
  }

  const numericMaxAttempts = Number(maxAttempts)
  if (!Number.isInteger(numericMaxAttempts) || numericMaxAttempts < 1 || numericMaxAttempts > 10) {
    throw new HttpError(400, 'maxAttempts must be an integer between 1 and 10')
  }

  const assignment = new ExamAssignment({
    title,
    exam: exam._id,
    assignedBy: request.user._id,
    targetType,
    targetDepartments: targetType === 'department' ? targetDepartments : [],
    targetClasses: targetType === 'class' ? targetClasses : [],
    targetStudents: targetType === 'individual' ? targetStudents : [],
    scheduledStartAt,
    deadline,
    maxAttempts: numericMaxAttempts,
    isGraded: Boolean(isGraded),
    presetQuestionCount: Number.isInteger(presetQuestionCount) ? presetQuestionCount : undefined,
    presetDifficulty: ['Beginner', 'Intermediate', 'Advanced'].includes(presetDifficulty) ? presetDifficulty : undefined,
    instructions: typeof instructions === 'string' ? instructions.trim() : '',
    status: 'published',
  })

  await assignment.save()
  const populated = await ExamAssignment.findById(assignment._id)
    .populate('exam', 'title slug durationMinutes difficulty')
    .populate('assignedBy', 'name email')

  response.status(201).json({ assignment: serializeAssignment(populated) })
})

router.put('/:assignmentId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.assignmentId, 'assignment ID')
  const assignment = await ExamAssignment.findById(request.params.assignmentId)
  if (!assignment) throw new HttpError(404, 'Assignment not found')

  const isOwner = String(assignment.assignedBy) === String(request.user._id)
  const isAdmin = request.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, 'You can only edit assignments you created')
  }

  if ('title' in request.body) {
    const title = typeof request.body.title === 'string' ? request.body.title.trim() : ''
    if (title.length < 2 || title.length > 140) {
      throw new HttpError(400, 'Assignment title must be between 2 and 140 characters')
    }
    assignment.title = title
  }

  if ('deadline' in request.body) {
    const deadline = new Date(request.body.deadline)
    if (Number.isNaN(deadline.getTime()) || deadline <= assignment.scheduledStartAt) {
      throw new HttpError(400, 'Deadline must be a valid date after scheduledStartAt')
    }
    assignment.deadline = deadline
  }

  if ('maxAttempts' in request.body) {
    const attempts = Number(request.body.maxAttempts)
    if (!Number.isInteger(attempts) || attempts < 1 || attempts > 10) {
      throw new HttpError(400, 'maxAttempts must be an integer between 1 and 10')
    }
    assignment.maxAttempts = attempts
  }

  if ('status' in request.body) {
    if (!['draft', 'published', 'closed'].includes(request.body.status)) {
      throw new HttpError(400, 'status must be draft, published, or closed')
    }
    assignment.status = request.body.status
  }

  if ('instructions' in request.body) {
    assignment.instructions = typeof request.body.instructions === 'string' ? request.body.instructions.trim() : ''
  }

  await assignment.save()
  const populated = await ExamAssignment.findById(assignment._id)
    .populate('exam', 'title slug durationMinutes difficulty')
    .populate('assignedBy', 'name email')
  response.json({ assignment: serializeAssignment(populated) })
})

router.delete('/:assignmentId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.assignmentId, 'assignment ID')
  const assignment = await ExamAssignment.findById(request.params.assignmentId)
  if (!assignment) throw new HttpError(404, 'Assignment not found')

  const isOwner = String(assignment.assignedBy) === String(request.user._id)
  const isAdmin = request.user.role === 'admin'
  if (!isOwner && !isAdmin) {
    throw new HttpError(403, 'You can only delete assignments you created')
  }

  const existingAttempts = await Attempt.exists({ assignment: assignment._id })
  if (existingAttempts) {
    throw new HttpError(400, 'Cannot delete assignment with existing student attempts. Set status to closed instead.')
  }

  await ExamAssignment.deleteOne({ _id: assignment._id })
  response.json({ message: 'Assignment deleted successfully' })
})

router.get('/:assignmentId/submissions', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.assignmentId, 'assignment ID')
  const assignment = await ExamAssignment.findById(request.params.assignmentId)
  if (!assignment) throw new HttpError(404, 'Assignment not found')

  const attempts = await Attempt.find({ assignment: assignment._id })
    .populate('student', 'name email studentNumber department classes')
    .sort({ submittedAt: -1, startedAt: -1 })

  response.json({
    assignmentId: String(assignment._id),
    title: assignment.title,
    totalSubmissions: attempts.length,
    submissions: attempts.map((attempt) => ({
      attemptId: String(attempt._id),
      student: attempt.student ? {
        id: String(attempt.student._id),
        name: attempt.student.name,
        email: attempt.student.email,
        studentNumber: attempt.student.studentNumber,
      } : null,
      status: attempt.status,
      startedAt: attempt.startedAt,
      expiresAt: attempt.expiresAt,
      submittedAt: attempt.submittedAt,
      questionCount: attempt.questionCount,
      difficulty: attempt.difficulty,
      result: attempt.result,
    })),
  })
})

export default router
