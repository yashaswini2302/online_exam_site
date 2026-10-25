import { test, expect } from '@playwright/test'
import { randomBytes } from 'node:crypto'
import mongoose from 'mongoose'
import Attempt from '../src/models/Attempt.js'
import Student from '../src/models/Student.js'
import Exam from '../src/models/Exam.js'
import Department from '../src/models/Department.js'
import ClassGroup from '../src/models/ClassGroup.js'
import ExamAssignment from '../src/models/ExamAssignment.js'
import { connectDatabase } from '../src/config/database.js'

let teacherId
let studentId
let createdExamTitle
let createdDeptCode

test.use({ baseURL: 'http://localhost:5174' })

test.afterEach(async ({ context, request }) => {
  try {
    await context.request.post('/api/auth/logout')
  } catch {}
  try {
    await request.post('/api/auth/logout')
  } catch {}

  await connectDatabase()
  try {
    if (studentId) {
      await Attempt.deleteMany({ student: studentId })
      await Student.deleteOne({ _id: studentId })
    }
    if (teacherId) {
      await Student.deleteOne({ _id: teacherId })
    }
    if (createdExamTitle) {
      const exam = await Exam.findOne({ title: createdExamTitle })
      if (exam) {
        await ExamAssignment.deleteMany({ exam: exam._id })
        await Exam.deleteOne({ _id: exam._id })
      }
    }
    if (createdDeptCode) {
      const dept = await Department.findOne({ code: createdDeptCode })
      if (dept) {
        await ClassGroup.deleteMany({ department: dept._id })
        await Department.deleteOne({ _id: dept._id })
      }
    }
  } finally {
    await mongoose.disconnect()
    studentId = undefined
    teacherId = undefined
    createdExamTitle = undefined
    createdDeptCode = undefined
  }
})

test('Teacher can register, manage departments/classes, author custom exams, and publish cohort assignments', async ({ page, request }) => {
  const teacherEmail = `teacher-${randomBytes(8).toString('hex')}@school.edu`
  const teacherPassword = `Tch-${randomBytes(16).toString('base64url')}-99!`
  
  // 1. Register teacher via API with official invite code
  const regRes = await request.post('/api/auth/teacher/register', {
    data: {
      name: 'Professor Turing',
      email: teacherEmail,
      password: teacherPassword,
      inviteCode: 'Q65-TEACHER-INVITE-2026',
      acceptedTerms: true,
    },
  })
  expect(regRes.status()).toBe(201)
  const regData = await regRes.json()
  teacherId = regData.student.id
  expect(regData.student.role).toBe('teacher')

  // 2. Open frontend, login as teacher
  await page.goto('/')
  await page.getByLabel('Email address').fill(teacherEmail)
  await page.locator('input[type="password"]').fill(teacherPassword)
  await page.getByRole('button', { name: /sign in/i }).click()

  // 3. Verify Teacher view / Instructor portal is displayed
  await expect(page.getByRole('heading', { name: /Instructor Control Center/i })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Professor Turing').first()).toBeVisible()

  // 4. Verify Teacher navigation tabs
  const navTabs = page.locator('.teacher-nav-tabs')
  await expect(navTabs.getByRole('button', { name: /Departments & Classes/i })).toBeVisible()
  await expect(navTabs.getByRole('button', { name: /Create Custom Exam/i })).toBeVisible()
  await expect(navTabs.getByRole('button', { name: /Assign Exam/i })).toBeVisible()
  await expect(navTabs.getByRole('button', { name: /Assignments/i })).toBeVisible()

  // 5. Navigate to Departments & Classes tab
  await navTabs.getByRole('button', { name: /Departments & Classes/i }).click()
  await expect(page.getByRole('heading', { name: /Departments & Class Cohorts/i })).toBeVisible()

  // 6. Create a Department
  createdDeptCode = `DEPT_${randomBytes(3).toString('hex').toUpperCase()}`
  await page.getByPlaceholder(/Computer Science & Engineering/i).fill('Quantum Informatics')
  await page.getByPlaceholder('e.g. CS', { exact: true }).fill(createdDeptCode)
  await page.getByRole('button', { name: /Add Department/i }).click()
  await expect(page.getByText('Quantum Informatics')).toBeVisible({ timeout: 6000 })

  // 7. Create a Class Group under this department
  const classCode = `CLASS_${randomBytes(3).toString('hex').toUpperCase()}`
  await page.getByPlaceholder(/CS-Year-2026-A/i).fill(classCode)
  await page.locator('select').filter({ hasText: /Select Department/i }).selectOption({ label: `Quantum Informatics (${createdDeptCode})` })
  await page.getByRole('button', { name: /Add Class Cohort/i }).click()
  await expect(page.getByText(classCode)).toBeVisible({ timeout: 6000 })

  // 8. Navigate to Create Custom Exam
  await navTabs.getByRole('button', { name: /Create Custom Exam/i }).click()
  await expect(page.getByRole('heading', { name: /Create Custom Exam/i })).toBeVisible()

  createdExamTitle = `Quantum Computing 101 ${randomBytes(3).toString('hex')}`
  await page.getByPlaceholder(/Advanced Operating Systems/i).fill(createdExamTitle)
  await page.getByPlaceholder(/e\.g\. Computer Science/i).fill('Quantum Physics')
  await page.getByPlaceholder(/Brief summary of exam scope/i).fill('End-to-end automated test exam.')
  
  // Fill Question 1
  await page.getByPlaceholder(/Type the question prompt/i).fill('What is the superposition principle in quantum computing?')
  await page.getByPlaceholder('Option A text...').fill('A state can be in a linear combination of |0> and |1>')
  await page.getByPlaceholder('Option B text...').fill('A classical bit toggle')
  await page.getByPlaceholder('Option C text...').fill('A magnetic memory error')
  await page.getByPlaceholder('Option D text...').fill('A network protocol latency')

  // Publish the exam
  await page.getByRole('button', { name: /Publish Custom Exam/i }).click()
  await expect(page.getByText(new RegExp(`Exam "${createdExamTitle}" created successfully`, 'i'))).toBeVisible({ timeout: 8000 })

  // 9. Navigate to Assign Exam tab
  await navTabs.getByRole('button', { name: /Assign Exam/i }).click()
  await expect(page.getByRole('heading', { name: /Assign Exam to Students/i })).toBeVisible()

  // Select the newly created custom exam
  const examSelect = page.locator('select').first()
  await examSelect.locator('option', { hasText: createdExamTitle }).waitFor({ state: 'attached', timeout: 6000 })
  const examOptionVal = await examSelect.locator('option', { hasText: createdExamTitle }).getAttribute('value')
  await examSelect.selectOption(examOptionVal)

  // Assign to All Students (open cohort)
  await page.getByRole('button', { name: /All Students \(Open\)/i }).click()

  // Click Create & Publish Assignment
  await page.getByRole('button', { name: /Create & Publish Assignment/i }).click()
  await expect(page.getByText(/created successfully/i)).toBeVisible({ timeout: 8000 })

  // 10. Verify Assignment appears in Assignments list
  await navTabs.getByRole('button', { name: /Assignments/i }).click()
  await expect(page.locator('.assignments-table-card').getByText(`${createdExamTitle} Assignment`, { exact: true })).toBeVisible({ timeout: 6000 })

  // 11. Switch to Student View and verify assigned exam is visible
  await page.getByRole('button', { name: /Switch to Student View/i }).click()
  await expect(page.getByRole('heading', { name: /Assigned to You/i })).toBeVisible({ timeout: 8000 })
  await expect(page.locator('.assigned-section').getByText(`${createdExamTitle} Assignment`)).toBeVisible()
})
