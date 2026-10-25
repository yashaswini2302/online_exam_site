import test from 'node:test'
import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import { createServer } from 'node:http'
import '../src/config/loadEnv.js'
import { connectDatabase } from '../src/config/database.js'
import app, { sessionStore } from '../src/app.js'
import Student from '../src/models/Student.js'
import Exam from '../src/models/Exam.js'
import Department from '../src/models/Department.js'
import ClassGroup from '../src/models/ClassGroup.js'
import ExamAssignment from '../src/models/ExamAssignment.js'
import Attempt from '../src/models/Attempt.js'
import { hashPassword } from '../src/services/passwordService.js'

test('Teacher exam creation, assignments, targeting, deadlines, and attempt limits', async (t) => {
  await connectDatabase()
  const server = createServer(app)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  const baseUrl = `http://127.0.0.1:${address.port}`

  const createdStudentIds = []
  const createdExamIds = []
  const createdDeptIds = []
  const createdClassIds = []
  const createdAssignmentIds = []
  const createdAttemptIds = []

  t.after(async () => {
    try {
      if (createdAttemptIds.length) {
        await Attempt.deleteMany({ _id: { $in: createdAttemptIds } })
      }
      if (createdAssignmentIds.length) {
        await ExamAssignment.deleteMany({ _id: { $in: createdAssignmentIds } })
      }
      if (createdExamIds.length) {
        await Exam.deleteMany({ _id: { $in: createdExamIds } })
      }
      if (createdClassIds.length) {
        await ClassGroup.deleteMany({ _id: { $in: createdClassIds } })
      }
      if (createdDeptIds.length) {
        await Department.deleteMany({ _id: { $in: createdDeptIds } })
      }
      if (createdStudentIds.length) {
        await Student.deleteMany({ _id: { $in: createdStudentIds } })
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

  // 1. Setup accounts: 1 Teacher, 1 Enrolled Student (in CS Dept), 1 Outside Student (no Dept)
  const inviteCode = process.env.TEACHER_INVITE_CODE || 'Q65-TEACHER-INVITE-2026'

  // Teacher
  const teacherEmail = `teacher-exam-${randomBytes(6).toString('hex')}@example.test`
  const teacherRes = await api('/api/auth/teacher/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Turing',
      email: teacherEmail,
      password: 'StrongTeacherPassword123!',
      acceptedTerms: true,
      inviteCode,
    }),
  })
  assert.equal(teacherRes.status, 201)
  const teacherCookie = teacherRes.cookie
  const teacherId = teacherRes.body.student.id
  createdStudentIds.push(teacherId)

  // Create Department & Class
  const deptCode = `DEPT-${randomBytes(4).toString('hex').toUpperCase()}`
  const deptRes = await api('/api/departments', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({ name: 'Computer Science', code: deptCode }),
  })
  assert.equal(deptRes.status, 201)
  const deptId = deptRes.body.department.id
  createdDeptIds.push(deptId)

  const classRes = await api('/api/classes', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({ name: 'CS-Cohort-1', department: deptId }),
  })
  assert.equal(classRes.status, 201)
  const classId = classRes.body.classGroup.id
  createdClassIds.push(classId)

  // Enrolled Student
  const enrolledEmail = `student-enrolled-${randomBytes(6).toString('hex')}@example.test`
  const enrolledRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Alice Enrolled',
      email: enrolledEmail,
      password: 'StrongStudentPassword123!',
      acceptedTerms: true,
    }),
  })
  assert.equal(enrolledRes.status, 201)
  const enrolledCookie = enrolledRes.cookie
  const enrolledId = enrolledRes.body.student.id
  createdStudentIds.push(enrolledId)

  // Assign enrolled student to department and class
  await api(`/api/students/${enrolledId}/organization`, {
    method: 'PATCH',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({ department: deptId, classes: [classId] }),
  })

  // Outside Student
  const outsideEmail = `student-outside-${randomBytes(6).toString('hex')}@example.test`
  const outsideRes = await api('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Bob Outside',
      email: outsideEmail,
      password: 'StrongStudentPassword123!',
      acceptedTerms: true,
    }),
  })
  assert.equal(outsideRes.status, 201)
  const outsideCookie = outsideRes.cookie
  const outsideId = outsideRes.body.student.id
  createdStudentIds.push(outsideId)

  // 2. Student cannot create an exam (403 Forbidden)
  const studentExamAttempt = await api('/api/exams', {
    method: 'POST',
    headers: { cookie: enrolledCookie },
    body: JSON.stringify({ title: 'Student Exam', category: 'CS', difficulty: 'Beginner' }),
  })
  assert.equal(studentExamAttempt.status, 403, 'Student cannot create exam')

  // 3. Teacher exam creation validation
  // Invalid: missing options
  const invalidExam = await api('/api/exams', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      title: 'Bad Exam',
      category: 'CS',
      description: 'Bad question options',
      difficulty: 'Beginner',
      questions: [{ prompt: 'Question 1', options: ['A', 'B'], correctOption: 0 }],
    }),
  })
  assert.equal(invalidExam.status, 400, 'Rejects questions without 4 options')

  // Valid Teacher Exam Creation with 5 questions
  const sampleQuestions = [
    { prompt: 'What is 2 + 2?', options: ['3', '4', '5', '6'], correctOption: 1, explanation: 'Basic math', difficulty: 'Beginner' },
    { prompt: 'What is 3 * 3?', options: ['6', '8', '9', '12'], correctOption: 2, explanation: 'Multiplication', difficulty: 'Beginner' },
    { prompt: 'What is 10 / 2?', options: ['2', '4', '5', '10'], correctOption: 2, explanation: 'Division', difficulty: 'Beginner' },
    { prompt: 'What is 7 - 4?', options: ['1', '2', '3', '4'], correctOption: 2, explanation: 'Subtraction', difficulty: 'Beginner' },
    { prompt: 'What is 5 squared?', options: ['10', '20', '25', '30'], correctOption: 2, explanation: 'Exponents', difficulty: 'Beginner' },
  ]

  const createExamRes = await api('/api/exams', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      title: 'Software Engineering Fundamentals',
      category: 'Computer Science',
      description: 'Core concepts in SE and discrete math.',
      difficulty: 'Beginner',
      durationMinutes: 30,
      questions: sampleQuestions,
    }),
  })
  assert.equal(createExamRes.status, 201, 'Teacher can create valid exam')
  assert.ok(createExamRes.body.exam.id)
  assert.equal(createExamRes.body.exam.title, 'Software Engineering Fundamentals')
  // Verify correctOption is NOT leaked in public payload
  assert.equal('correctOption' in createExamRes.body.exam.questions[0], false, 'correctOption must not leak in public exam payload')
  const examId = createExamRes.body.exam.id
  createdExamIds.push(examId)

  // 4. Student cannot create an assignment (403 Forbidden)
  const studentAssignmentAttempt = await api('/api/assignments', {
    method: 'POST',
    headers: { cookie: enrolledCookie },
    body: JSON.stringify({ examId, deadline: new Date(Date.now() + 86400000) }),
  })
  assert.equal(studentAssignmentAttempt.status, 403, 'Student cannot create assignment')

  // 5. Teacher Assignment Validation
  // Invalid deadline (deadline before scheduled start)
  const invalidDeadline = await api('/api/assignments', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      examId,
      scheduledStartAt: new Date(Date.now() + 86400000),
      deadline: new Date(Date.now() + 3600000), // Earlier than start
    }),
  })
  assert.equal(invalidDeadline.status, 400, 'Rejects deadline before scheduled start')

  // Valid Assignment: Targeted to CS Department, maxAttempts: 1
  const validAssignmentRes = await api('/api/assignments', {
    method: 'POST',
    headers: { cookie: teacherCookie },
    body: JSON.stringify({
      examId,
      title: 'CS Cohort Midterm',
      targetType: 'department',
      targetDepartments: [deptId],
      scheduledStartAt: new Date(Date.now() - 3600000), // Started 1 hour ago
      deadline: new Date(Date.now() + 86400000), // Deadline in 24 hours
      maxAttempts: 1,
      presetQuestionCount: 5,
      presetDifficulty: 'Beginner',
      instructions: 'Complete all 5 questions within the time limit.',
    }),
  })
  assert.equal(validAssignmentRes.status, 201, 'Teacher can create valid assignment')
  const assignmentId = validAssignmentRes.body.assignment.id
  createdAssignmentIds.push(assignmentId)

  // 6. Student views assignments
  // Enrolled student sees the assignment
  const enrolledAssignments = await api('/api/assignments', {
    headers: { cookie: enrolledCookie },
  })
  assert.equal(enrolledAssignments.status, 200)
  const enrolledTargeted = enrolledAssignments.body.assignments.find((a) => a.id === assignmentId)
  assert.ok(enrolledTargeted, 'Enrolled student sees assignment targeting their department')
  assert.equal(enrolledTargeted.canAttempt, true)
  assert.equal(enrolledTargeted.attemptsUsed, 0)

  // Outside student does NOT see the assignment
  const outsideAssignments = await api('/api/assignments', {
    headers: { cookie: outsideCookie },
  })
  assert.equal(outsideAssignments.status, 200)
  const outsideTargeted = outsideAssignments.body.assignments.find((a) => a.id === assignmentId)
  assert.equal(outsideTargeted, undefined, 'Outside student should not see non-targeted assignment')

  // 7. Non-targeted student attempting to start this assignment gets 403 Forbidden
  const outsideStartAttempt = await api('/api/attempts', {
    method: 'POST',
    headers: { cookie: outsideCookie },
    body: JSON.stringify({
      assignmentId,
      studentId: outsideId,
    }),
  })
  assert.equal(outsideStartAttempt.status, 403, 'Non-targeted student cannot start assignment attempt')

  // 8. Enrolled student successfully starts assignment attempt
  const startAttemptRes = await api('/api/attempts', {
    method: 'POST',
    headers: { cookie: enrolledCookie },
    body: JSON.stringify({
      assignmentId,
      studentId: enrolledId,
    }),
  })
  assert.equal(startAttemptRes.status, 201, 'Enrolled student starts assignment attempt')
  assert.equal(startAttemptRes.body.attempt.assignment, assignmentId, 'Attempt links to assignment')
  assert.equal(startAttemptRes.body.attempt.questionCount, 5)
  const attemptId = startAttemptRes.body.attempt.id
  createdAttemptIds.push(attemptId)

  // 9. Answer all questions and submit
  const questions = startAttemptRes.body.attempt.exam.questions
  for (const q of questions) {
    await api(`/api/attempts/${attemptId}/answers`, {
      method: 'PUT',
      headers: { cookie: enrolledCookie },
      body: JSON.stringify({ questionId: q.id, selectedOption: 1 }),
    })
  }
  const submitRes = await api(`/api/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: { cookie: enrolledCookie },
  })
  assert.equal(submitRes.status, 200)
  assert.equal(submitRes.body.attempt.status, 'submitted')
  assert.ok(submitRes.body.attempt.result)

  // 10. Attempt Limits Enforcement:
  // Student tries to start a 2nd attempt when maxAttempts === 1 -> 409 Conflict
  const secondAttemptRes = await api('/api/attempts', {
    method: 'POST',
    headers: { cookie: enrolledCookie },
    body: JSON.stringify({
      assignmentId,
      studentId: enrolledId,
    }),
  })
  assert.equal(secondAttemptRes.status, 409, 'Rejects attempt exceeding maxAttempts limit')

  // 11. Teacher views assignment submissions
  const submissionsRes = await api(`/api/assignments/${assignmentId}/submissions`, {
    headers: { cookie: teacherCookie },
  })
  assert.equal(submissionsRes.status, 200, 'Teacher can view submissions')
  assert.equal(submissionsRes.body.totalSubmissions, 1)
  assert.equal(submissionsRes.body.submissions[0].student.id, enrolledId)
  assert.equal(submissionsRes.body.submissions[0].status, 'submitted')
  assert.ok(submissionsRes.body.submissions[0].result.score !== undefined)

  // Student cannot view submissions endpoint (403 Forbidden)
  const studentSubmissionsAttempt = await api(`/api/assignments/${assignmentId}/submissions`, {
    headers: { cookie: enrolledCookie },
  })
  assert.equal(studentSubmissionsAttempt.status, 403, 'Student cannot view assignment submissions')

  // 12. Cannot delete assignment with existing student attempts (400 Bad Request)
  const deleteWithAttempts = await api(`/api/assignments/${assignmentId}`, {
    method: 'DELETE',
    headers: { cookie: teacherCookie },
  })
  assert.equal(deleteWithAttempts.status, 400, 'Cannot delete assignment with existing student attempts')

  // 13. Backward compatibility: Standard open practice attempt works with assignment: null
  const openExamAttempt = await api('/api/attempts', {
    method: 'POST',
    headers: { cookie: outsideCookie },
    body: JSON.stringify({
      examId,
      studentId: outsideId,
      questionCount: 5,
    }),
  })
  assert.equal(openExamAttempt.status, 201, 'Open practice exam still works')
  assert.equal(openExamAttempt.body.attempt.assignment, null, 'Open exam attempt has assignment: null')
  createdAttemptIds.push(openExamAttempt.body.attempt.id)
})
