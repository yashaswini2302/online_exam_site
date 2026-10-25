import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { createServer } from 'node:http'
import '../src/config/loadEnv.js'
import { connectDatabase } from '../src/config/database.js'
import app, { sessionStore } from '../src/app.js'
import Student from '../src/models/Student.js'
import Department from '../src/models/Department.js'
import ClassGroup from '../src/models/ClassGroup.js'
import { hashPassword } from '../src/services/passwordService.js'

test('Department and ClassGroup schema validation', () => {
  // Department validation
  const emptyDept = new Department({})
  const deptErrors = emptyDept.validateSync()
  assert.ok(deptErrors.errors.name, 'Department name is required')
  assert.ok(deptErrors.errors.code, 'Department code is required')

  const validDept = new Department({ name: 'Computer Science', code: 'cs' })
  assert.equal(validDept.code, 'CS', 'Department code should be uppercase')

  // ClassGroup validation
  const emptyClass = new ClassGroup({})
  const classErrors = emptyClass.validateSync()
  assert.ok(classErrors.errors.name, 'Class name is required')
  assert.ok(classErrors.errors.department, 'Class department is required')

  const validClass = new ClassGroup({
    name: 'CS-2026-A',
    department: new mongoose.Types.ObjectId(),
    academicYear: '2025-2026',
  })
  assert.equal(validClass.validateSync(), undefined, 'Valid class group has no validation errors')

  // Student organization defaults
  const student = new Student({
    name: 'Test Student',
    email: 'test-student@example.test',
    studentNumber: 'Q65-TST-001',
  })
  assert.equal(student.role, 'student')
  assert.equal(student.department, null)
  assert.deepEqual(student.classes, [])
})

test('Organization endpoints, teacher registration, and role authorization integration test', async (t) => {
  await connectDatabase()
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  const createdStudentIds = []
  const createdDeptIds = []
  const createdClassIds = []

  t.after(async () => {
    try {
      if (createdStudentIds.length) {
        await Student.deleteMany({ _id: { $in: createdStudentIds } })
      }
      if (createdClassIds.length) {
        await ClassGroup.deleteMany({ _id: { $in: createdClassIds } })
      }
      if (createdDeptIds.length) {
        await Department.deleteMany({ _id: { $in: createdDeptIds } })
      }
    } finally {
      if (typeof server.closeAllConnections === 'function') {
        server.closeAllConnections()
      }
      await new Promise((resolve) => server.close(resolve))
      await sessionStore.close()
      await mongoose.disconnect()
    }
  })

  // Helper for requests
  const api = async (path, options = {}) => {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'content-type': 'application/json',
        connection: 'close',
        ...(options.headers || {}),
      },
    })
    const cookie = res.headers.getSetCookie?.()?.[0]?.split(';', 1)[0]
    let body = null
    try {
      body = await res.json()
    } catch {}
    return { status: res.status, body, cookie, headers: res.headers }
  }

  // 1. Unauthenticated request to /api/departments should return 401
  const unauthDept = await api('/api/departments')
  assert.equal(unauthDept.status, 401, 'Unauthenticated access to departments returns 401')

  // 2. Register a normal student
  const studentEmail = `student-${randomBytes(8).toString('hex')}@example.test`
  const studentRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Normal Student',
      email: studentEmail,
      password: 'StrongPassword123!',
      acceptedTerms: true,
      role: 'teacher', // Malicious attempt to elevate role
    }),
  })
  assert.equal(studentRes.status, 201)
  assert.equal(studentRes.body.student.role, 'student', 'Registration must ignore role and default to student')
  assert.equal(studentRes.body.student.department, null)
  assert.deepEqual(studentRes.body.student.classes, [])
  const studentCookie = studentRes.cookie
  createdStudentIds.push(studentRes.body.student.id)

  // 3. Normal student cannot create a department (403 Forbidden)
  const studentCreateDept = await api('/api/departments', {
    method: 'POST',
    headers: { cookie: studentCookie },
    body: JSON.stringify({ name: 'Hacked Dept', code: 'HACK' }),
  })
  assert.equal(studentCreateDept.status, 403, 'Student cannot create department')

  // 4. Normal student cannot access /api/students list (403 Forbidden)
  const studentListStudents = await api('/api/students', {
    method: 'GET',
    headers: { cookie: studentCookie },
  })
  assert.equal(studentListStudents.status, 403, 'Student cannot list students')

  // 5. Normal student cannot modify organization (403 Forbidden)
  const studentPatchOrg = await api(`/api/students/${studentRes.body.student.id}/organization`, {
    method: 'PATCH',
    headers: { cookie: studentCookie },
    body: JSON.stringify({ department: new mongoose.Types.ObjectId() }),
  })
  assert.equal(studentPatchOrg.status, 403, 'Student cannot patch organization')

  // 6. Normal student CAN access their own profile (200 OK)
  const studentOwnProfile = await api(`/api/students/${studentRes.body.student.id}`, {
    headers: { cookie: studentCookie },
  })
  assert.equal(studentOwnProfile.status, 200, 'Student can access their own profile')
  assert.equal(studentOwnProfile.body.student.email, studentEmail)

  // 7. Teacher registration with invalid invite code returns 403
  const invalidTeacherRes = await api('/api/auth/teacher/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Failed Teacher',
      email: `fail-teacher-${randomBytes(8).toString('hex')}@example.test`,
      password: 'StrongPassword123!',
      acceptedTerms: true,
      inviteCode: 'WRONG-CODE',
    }),
  })
  assert.equal(invalidTeacherRes.status, 403, 'Teacher registration with invalid code returns 403')

  // 8. Teacher registration with valid invite code succeeds and sets role: 'teacher'
  const teacherEmail = `teacher-${randomBytes(8).toString('hex')}@example.test`
  const validInviteCode = process.env.TEACHER_INVITE_CODE || 'Q65-TEACHER-INVITE-2026'
  const teacherRes = await api('/api/auth/teacher/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Professor Smith',
      email: teacherEmail,
      password: 'StrongPassword123!',
      acceptedTerms: true,
      inviteCode: validInviteCode,
    }),
  })
  assert.equal(teacherRes.status, 201, 'Teacher registration succeeds')
  assert.equal(teacherRes.body.student.role, 'teacher', 'Teacher role is set correctly')
  assert.ok(teacherRes.body.student.studentNumber.startsWith('T65-'), 'Teacher student number starts with T65-')
  const teacherCookie = teacherRes.cookie
  createdStudentIds.push(teacherRes.body.student.id)

  // 9. Teacher creates a Department (201 Created)
  const deptCode = `CS-${randomBytes(4).toString('hex').toUpperCase()}`
  const createDeptRes = await api('/api/departments', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      name: 'Computer Science & Engineering',
      code: deptCode,
      description: 'Department of Computer Science',
    }),
  })
  assert.equal(createDeptRes.status, 201, 'Teacher can create department')
  assert.equal(createDeptRes.body.department.code, deptCode)
  const departmentId = createDeptRes.body.department.id
  createdDeptIds.push(departmentId)

  // 10. Duplicate department code returns 409 Conflict
  const duplicateDeptRes = await api('/api/departments', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      name: 'Another CS Department',
      code: deptCode,
    }),
  })
  assert.equal(duplicateDeptRes.status, 409, 'Duplicate department code returns 409 Conflict')

  // 11. Creating class with non-existent department returns 400 Bad Request
  const invalidClassRes = await api('/api/classes', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      name: 'CS-101',
      department: new mongoose.Types.ObjectId().toString(),
    }),
  })
  assert.equal(invalidClassRes.status, 400, 'Invalid department reference returns 400')

  // 12. Teacher creates a ClassGroup (201 Created)
  const createClassRes = await api('/api/classes', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      name: 'CS-Year-1',
      code: 'CS101',
      department: departmentId,
      academicYear: '2025-2026',
    }),
  })
  assert.equal(createClassRes.status, 201, 'Teacher can create class group')
  assert.equal(createClassRes.body.classGroup.department.code, deptCode)
  const classId = createClassRes.body.classGroup.id
  createdClassIds.push(classId)

  // 13. Teacher lists departments and classes
  const listDepts = await api('/api/departments', { headers: { cookie: teacherCookie } })
  assert.equal(listDepts.status, 200)
  assert.ok(listDepts.body.departments.some((d) => d.id === departmentId))

  const listClasses = await api(`/api/classes?department=${departmentId}`, { headers: { cookie: teacherCookie } })
  assert.equal(listClasses.status, 200)
  assert.ok(listClasses.body.classes.some((c) => c.id === classId))

  // 14. Teacher updates student organization (assign department and class)
  const assignRes = await api(`/api/students/${studentRes.body.student.id}/organization`, {
    method: 'PATCH',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      department: departmentId,
      classes: [classId],
    }),
  })
  assert.equal(assignRes.status, 200, 'Teacher can assign student to department and class')
  assert.equal(assignRes.body.student.department, departmentId)
  assert.deepEqual(assignRes.body.student.classes, [classId])

  // 15. Teacher lists students filtered by department
  const studentsByDept = await api(`/api/students?department=${departmentId}`, {
    headers: { cookie: teacherCookie },
  })
  assert.equal(studentsByDept.status, 200)
  assert.ok(studentsByDept.body.students.some((s) => s.id === studentRes.body.student.id))

  // 16. Teacher can view student profile and attempt results
  const teacherViewStudent = await api(`/api/students/${studentRes.body.student.id}`, {
    headers: { cookie: teacherCookie },
  })
  assert.equal(teacherViewStudent.status, 200, 'Teacher can view student profile')
  assert.equal(teacherViewStudent.body.student.department, departmentId)

  // 17. Safe deletion protections
  // Attempting to delete department that has associated classes returns 400
  const deleteDeptWithClasses = await api(`/api/departments/${departmentId}`, {
    method: 'DELETE',
    headers: { cookie: teacherCookie },
  })
  assert.equal(deleteDeptWithClasses.status, 400, 'Cannot delete department that has associated classes')

  // Attempting to delete class with enrolled student returns 400
  const deleteClassWithStudents = await api(`/api/classes/${classId}`, {
    method: 'DELETE',
    headers: { cookie: teacherCookie },
  })
  assert.equal(deleteClassWithStudents.status, 400, 'Cannot delete class with enrolled students')

  // 18. Student still functional with assigned department and classes
  const reloadedStudent = await api('/api/auth/session', {
    headers: { cookie: studentCookie },
  })
  assert.equal(reloadedStudent.status, 200)
  assert.equal(reloadedStudent.body.student.department, departmentId)
  assert.deepEqual(reloadedStudent.body.student.classes, [classId])
})
