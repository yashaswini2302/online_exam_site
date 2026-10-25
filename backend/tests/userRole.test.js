import test from 'node:test'
import assert from 'node:assert/strict'
import Student from '../src/models/Student.js'
import { requireRole } from '../src/middleware/requireAuth.js'

test('student schema defaults role to student and allows teacher and admin', () => {
  const defaultStudent = new Student({
    name: 'Default Role Student',
    email: 'default-role@example.test',
    studentNumber: 'Q65-DEF-001',
  })
  assert.equal(defaultStudent.role, 'student')

  const teacher = new Student({
    name: 'Teacher User',
    email: 'teacher@example.test',
    studentNumber: 'Q65-TCH-001',
    role: 'teacher',
  })
  assert.equal(teacher.role, 'teacher')

  const admin = new Student({
    name: 'Admin User',
    email: 'admin@example.test',
    studentNumber: 'Q65-ADM-001',
    role: 'admin',
  })
  assert.equal(admin.role, 'admin')

  const invalid = new Student({
    name: 'Invalid Role User',
    email: 'invalid-role@example.test',
    studentNumber: 'Q65-INV-001',
    role: 'unauthorized_role',
  })
  const validationError = invalid.validateSync()
  assert.ok(validationError)
  assert.ok(validationError.errors.role)
})

test('requireRole middleware authorizes matching roles and blocks unprivileged access with 403', () => {
  const teacherMiddleware = requireRole('teacher')

  // Case 1: Student attempting to access teacher route
  let errorCaught = null
  const studentReq = {
    user: { role: 'student' },
    student: { role: 'student' },
  }
  teacherMiddleware(studentReq, {}, (error) => {
    errorCaught = error
  })
  assert.ok(errorCaught)
  assert.equal(errorCaught.status, 403)
  assert.equal(errorCaught.message, 'Access denied: insufficient permissions')

  // Case 2: Teacher accessing teacher route
  let teacherAllowed = false
  const teacherReq = {
    user: { role: 'teacher' },
    student: { role: 'teacher' },
  }
  teacherMiddleware(teacherReq, {}, (error) => {
    if (!error) teacherAllowed = true
  })
  assert.equal(teacherAllowed, true)

  // Case 3: Route allowing either teacher or admin
  const multiRoleMiddleware = requireRole('teacher', 'admin')
  let adminAllowed = false
  multiRoleMiddleware({ user: { role: 'admin' } }, {}, (error) => {
    if (!error) adminAllowed = true
  })
  assert.equal(adminAllowed, true)

  // Case 4: Missing user falls back to 401
  let unauthError = null
  teacherMiddleware({}, {}, (error) => {
    unauthError = error
  })
  assert.ok(unauthError)
  assert.equal(unauthError.status, 401)
})
