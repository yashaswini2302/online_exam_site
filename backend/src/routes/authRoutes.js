import { Router } from 'express'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import Student from '../models/Student.js'
import Department from '../models/Department.js'
import HttpError from '../utils/httpError.js'
import { hashPassword, validatePassword, verifyPassword } from '../services/passwordService.js'

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

async function createSession(request, student) {
  await new Promise((resolve, reject) => request.session.regenerate((error) => error ? reject(error) : resolve()))
  request.session.studentId = String(student._id)
  await new Promise((resolve, reject) => request.session.save((error) => error ? reject(error) : resolve()))
}

router.get('/session', async (request, response) => {
  if (!request.session.studentId) return response.json({ student: null })
  const student = await Student.findById(request.session.studentId)
  if (!student) {
    await new Promise((resolve, reject) => request.session.destroy((error) => error ? reject(error) : resolve()))
    return response.json({ student: null })
  }
  response.json({ student: serializeStudent(student) })
})

router.post('/register', async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = request.body?.password
  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Full name must be between 2 and 100 characters')
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address')
  validatePassword(password)
  if (request.body?.acceptedTerms !== true) throw new HttpError(400, 'Accept the terms and privacy notice to create an account')

  const student = new Student({
    name,
    email,
    studentNumber: `Q65-${randomBytes(8).toString('hex').toUpperCase()}`,
    passwordHash: await hashPassword(password),
    termsAcceptedAt: new Date(),
  })
  try {
    await student.save()
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) throw new HttpError(409, 'An account with this email already exists. Sign in instead.')
    throw error
  }

  await createSession(request, student)
  response.status(201).json({ student: serializeStudent(student), emailVerified: false })
})

router.post('/teacher/register', async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = request.body?.password
  const inviteCode = typeof request.body?.inviteCode === 'string' ? request.body.inviteCode.trim() : ''
  const expectedInviteCode = process.env.TEACHER_INVITE_CODE || 'Q65-TEACHER-INVITE-2026'

  if (!inviteCode || inviteCode !== expectedInviteCode) {
    throw new HttpError(403, 'Invalid or missing teacher invitation code')
  }

  if (name.length < 2 || name.length > 100) throw new HttpError(400, 'Full name must be between 2 and 100 characters')
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Enter a valid email address')
  validatePassword(password)
  if (request.body?.acceptedTerms !== true) throw new HttpError(400, 'Accept the terms and privacy notice to create an account')

  let department = null
  if (request.body?.department) {
    if (!mongoose.isValidObjectId(request.body.department)) {
      throw new HttpError(400, 'Invalid department identifier')
    }
    const deptExists = await Department.exists({ _id: request.body.department })
    if (!deptExists) throw new HttpError(400, 'Referenced department does not exist')
    department = request.body.department
  }

  const teacher = new Student({
    name,
    email,
    studentNumber: `T65-${randomBytes(8).toString('hex').toUpperCase()}`,
    passwordHash: await hashPassword(password),
    termsAcceptedAt: new Date(),
    role: 'teacher',
    department,
  })

  try {
    await teacher.save()
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) throw new HttpError(409, 'An account with this email already exists. Sign in instead.')
    throw error
  }

  await createSession(request, teacher)
  response.status(201).json({ student: serializeStudent(teacher), emailVerified: false })
})

router.post('/login', async (request, response) => {
  const email = typeof request.body?.email === 'string' ? request.body.email.trim().toLowerCase() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''
  if (!email || !password) throw new HttpError(400, 'Email and password are required')

  const student = await Student.findOne({ email }).select('+passwordHash')
  if (!student?.passwordHash || !await verifyPassword(password, student.passwordHash)) {
    throw new HttpError(401, 'Email or password is incorrect')
  }

  await createSession(request, student)
  response.json({ student: serializeStudent(student) })
})

router.post('/logout', async (request, response, next) => {
  if (request.session) {
    await new Promise((resolve, reject) => request.session.destroy((error) => error ? reject(error) : resolve()))
  }
  response.clearCookie('q65.sid', { httpOnly: true, sameSite: 'lax', secure: process.env.SESSION_COOKIE_SECURE === 'true', path: '/' })
  response.status(204).end()
})

export default router