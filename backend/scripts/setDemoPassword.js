import '../src/config/loadEnv.js'
import { connectDatabase } from '../src/config/database.js'
import { hashPassword } from '../src/services/passwordService.js'
import Student from '../src/models/Student.js'

try {
  const password = process.env.DEMO_STUDENT_PASSWORD
  if (!password) throw new Error('Set DEMO_STUDENT_PASSWORD in the project root .env before running this command')

  await connectDatabase()
  const studentNumber = process.env.DEMO_STUDENT_NUMBER || 'Q65-DEMO-001'
  const student = await Student.findOne({ studentNumber })
  if (!student) throw new Error(`Demo student ${studentNumber} does not exist; run npm run seed first`)

  student.passwordHash = await hashPassword(password)
  await student.save()
  console.info(`Updated password hash for demo student ${studentNumber}`)
} catch (error) {
  console.error(`Unable to update demo password: ${error.message}`)
  process.exitCode = 1
} finally {
  const mongoose = await import('mongoose')
  await mongoose.default.disconnect()
}