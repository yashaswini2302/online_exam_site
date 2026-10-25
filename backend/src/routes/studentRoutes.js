import { Router } from 'express'
import mongoose from 'mongoose'
import Attempt from '../models/Attempt.js'
import Student from '../models/Student.js'
import Department from '../models/Department.js'
import ClassGroup from '../models/ClassGroup.js'
import HttpError from '../utils/httpError.js'
import { validateObjectId } from '../services/attemptService.js'
import { requireRole } from '../middleware/requireAuth.js'

const router = Router()

function serializeStudent(student) {
  return {
    id: String(student._id),
    name: student.name,
    email: student.email,
    studentNumber: student.studentNumber,
    role: student.role || 'student',
    department: student.department ? String(student.department) : null,
    classes: Array.isArray(student.classes) ? student.classes.map((item) => String(item)) : [],
  }
}

router.get('/', requireRole('teacher', 'admin'), async (request, response) => {
  const filter = {}
  if (request.query.role) {
    if (!['student', 'teacher', 'admin'].includes(request.query.role)) {
      throw new HttpError(400, 'role filter must be student, teacher, or admin')
    }
    filter.role = request.query.role
  }
  if (request.query.department) {
    validateObjectId(request.query.department, 'department ID')
    filter.department = request.query.department
  }
  if (request.query.class) {
    validateObjectId(request.query.class, 'class ID')
    filter.classes = request.query.class
  }
  if (request.query.search) {
    const term = String(request.query.search).trim()
    if (term) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(escaped, 'i')
      filter.$or = [{ name: regex }, { email: regex }, { studentNumber: regex }]
    }
  }

  const students = await Student.find(filter).sort({ name: 1 })
  response.json({ students: students.map(serializeStudent) })
})

router.get('/demo', async (request, response) => {
  response.json({ student: serializeStudent(request.student) })
})

router.get('/:studentId', async (request, response) => {
  validateObjectId(request.params.studentId, 'student ID')
  const isOwner = String(request.student._id) === request.params.studentId
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  if (!isOwner && !isStaff) throw new HttpError(403, 'You can only access your own profile')

  const student = await Student.findById(request.params.studentId)
  if (!student) throw new HttpError(404, 'Student not found')
  response.json({ student: serializeStudent(student) })
})

router.patch('/:studentId/organization', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.studentId, 'student ID')
  const student = await Student.findById(request.params.studentId)
  if (!student) throw new HttpError(404, 'Student not found')

  if ('department' in request.body) {
    const deptId = request.body.department
    if (deptId === null || deptId === '') {
      student.department = null
    } else {
      if (!mongoose.isValidObjectId(deptId)) throw new HttpError(400, 'Invalid department identifier')
      const deptExists = await Department.exists({ _id: deptId })
      if (!deptExists) throw new HttpError(400, 'Referenced department does not exist')
      student.department = deptId
    }
  }

  if ('classes' in request.body) {
    const classIds = request.body.classes
    if (!Array.isArray(classIds)) throw new HttpError(400, 'classes must be an array of class IDs')
    for (const classId of classIds) {
      if (!mongoose.isValidObjectId(classId)) throw new HttpError(400, `Invalid class identifier: ${classId}`)
      const classExists = await ClassGroup.exists({ _id: classId })
      if (!classExists) throw new HttpError(400, `Referenced class does not exist: ${classId}`)
    }
    student.classes = classIds
  }

  await student.save()
  response.json({ student: serializeStudent(student) })
})

router.get('/:studentId/attempts', async (request, response) => {
  validateObjectId(request.params.studentId, 'student ID')
  const isOwner = String(request.student._id) === request.params.studentId
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  if (!isOwner && !isStaff) throw new HttpError(403, 'You can only access your own results')

  const student = await Student.exists({ _id: request.params.studentId })
  if (!student) throw new HttpError(404, 'Student not found')

  const requestedStatus = request.query.status || 'submitted'
  if (!['all', 'in_progress', 'submitted'].includes(requestedStatus)) {
    throw new HttpError(400, 'status must be all, in_progress, or submitted')
  }
  const filter = { student: request.params.studentId }
  if (requestedStatus !== 'all') filter.status = requestedStatus

  const attempts = await Attempt.find(filter)
    .populate('exam', 'title questions')
    .sort({ submittedAt: -1 })
  response.json({ attempts: attempts.map((attempt) => ({
    id: String(attempt._id),
    examId: String(attempt.exam._id),
    examTitle: attempt.exam.title,
    status: attempt.status,
    startedAt: attempt.startedAt,
    expiresAt: attempt.expiresAt,
    submittedAt: attempt.submittedAt,
    answeredCount: attempt.answers.filter((answer) => answer.selectedOption !== undefined && answer.selectedOption !== null).length,
    result: attempt.result,
  })) })
})

export default router