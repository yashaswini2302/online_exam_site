import '../src/config/loadEnv.js'
import { connectDatabase } from '../src/config/database.js'
import Exam from '../src/models/Exam.js'
import Subject from '../src/models/Subject.js'
import Student from '../src/models/Student.js'
import { hashPassword, verifyPassword } from '../src/services/passwordService.js'
import { additionalExams, existingExamAdditions, existingExamMetadata, seededSubjects } from './extendedSampleCatalogue.js'
import { expandedExamQuestions } from './expandedQuestionBank.js'

const daysFromNow = (days) => new Date(Date.now() + days * 24 * 60 * 60 * 1000)

const sampleExams = [
  {
    title: 'Mathematical Foundations', slug: 'math-foundations', category: 'QUANTITATIVE REASONING',
    description: 'Test your command of algebra, number systems, and practical problem solving.',
    durationMinutes: 45, difficulty: 'Intermediate', availabilityEndsAt: daysFromNow(365), published: true, isPlatformExam: true,
    questions: [
      { prompt: 'A train travels 180 kilometers in 2.5 hours. What is its average speed?', options: ['65 km/h', '70 km/h', '72 km/h', '75 km/h'], correctOption: 2 },
      { prompt: 'If 3x + 7 = 28, what is the value of x?', options: ['5', '6', '7', '8'], correctOption: 2 },
      { prompt: 'Which fraction is equivalent to 0.375?', options: ['3/8', '5/12', '7/16', '2/5'], correctOption: 0 },
      { prompt: 'A jacket costs $80 after a 20% discount. What was its original price?', options: ['$90', '$96', '$100', '$104'], correctOption: 2 },
      { prompt: 'What is the next number in the sequence: 4, 9, 19, 39, ...?', options: ['59', '69', '79', '89'], correctOption: 2 },
    ],
  },
  {
    title: 'Verbal Reasoning', slug: 'verbal-reasoning', category: 'LANGUAGE & COMPREHENSION',
    description: 'Read closely, recognize patterns, and make precise inferences from text.',
    durationMinutes: 35, difficulty: 'Beginner', availabilityEndsAt: daysFromNow(365), published: true, isPlatformExam: true,
    questions: [
      { prompt: 'Which word is closest in meaning to “concise”?', options: ['Brief', 'Unclear', 'Detailed', 'Formal'], correctOption: 0 },
      { prompt: 'Choose the word that best completes: “Despite the delay, the team remained ___.”', options: ['discouraged', 'resolute', 'careless', 'uncertain'], correctOption: 1 },
      { prompt: 'Which sentence uses “their” correctly?', options: ['Their going to arrive soon.', 'The students submitted their work.', 'The book is over their.', 'Their is no reason to wait.'], correctOption: 1 },
      { prompt: 'What is the opposite of “expand”?', options: ['Increase', 'Stretch', 'Contract', 'Extend'], correctOption: 2 },
      { prompt: 'A reliable conclusion should be based primarily on:', options: ['A strong first impression', 'Relevant evidence', 'Popular opinion', 'A single example'], correctOption: 1 },
    ],
  },
  {
    title: 'Science Principles', slug: 'science-principles', category: 'GENERAL SCIENCE',
    description: 'A broad check-in across core concepts in biology, chemistry, and physics.',
    durationMinutes: 60, difficulty: 'Advanced', availabilityEndsAt: daysFromNow(365), published: true, isPlatformExam: true,
    questions: [
      { prompt: 'Which cell structure contains most of a cell’s genetic material?', options: ['Ribosome', 'Nucleus', 'Cell membrane', 'Golgi apparatus'], correctOption: 1 },
      { prompt: 'What is the chemical symbol for potassium?', options: ['P', 'Po', 'K', 'Pt'], correctOption: 2 },
      { prompt: 'Which unit is used to measure electric current?', options: ['Volt', 'Watt', 'Ohm', 'Ampere'], correctOption: 3 },
      { prompt: 'At standard atmospheric pressure, water boils at:', options: ['0°C', '50°C', '100°C', '150°C'], correctOption: 2 },
      { prompt: 'Which gas do plants primarily absorb during photosynthesis?', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'], correctOption: 2 },
    ],
  },
]

try {
  await connectDatabase()
  const studentNumber = process.env.DEMO_STUDENT_NUMBER || 'Q65-DEMO-001'
  await Student.updateOne(
    { studentNumber },
    { $setOnInsert: { name: 'Jordan Davis', email: 'jordan.davis@example.test', studentNumber } },
    { upsert: true },
  )
  const demoPassword = process.env.DEMO_STUDENT_PASSWORD
  if (demoPassword) {
    const student = await Student.findOne({ studentNumber }).select('+passwordHash')
    if (!student.passwordHash) {
      student.passwordHash = await hashPassword(demoPassword)
      await student.save()
    } else if (!await verifyPassword(demoPassword, student.passwordHash)) {
      console.warn('Configured demo password does not match the stored hash; credentials were not changed. Use npm run set-demo-password to explicitly update it.')
    }
  } else {
    console.warn('DEMO_STUDENT_PASSWORD is unset; the demo student cannot sign in until a password is configured')
  }
  for (const subject of seededSubjects) {
    await Subject.updateOne({ slug: subject.slug }, { $setOnInsert: subject }, { upsert: true })
  }

  const allExams = [
    ...sampleExams,
    ...additionalExams.map((exam) => ({ ...exam, availabilityEndsAt: daysFromNow(365), isPlatformExam: true })),
  ]
  let insertedQuestions = 0
  for (const exam of allExams) {
    const metadata = existingExamMetadata[exam.slug] || { subjectSlug: exam.subjectSlug, contentSource: 'seeded_demo' }
    let storedExam = await Exam.findOne({ slug: exam.slug })
    if (!storedExam) {
      storedExam = await Exam.create({ ...exam, ...metadata, isPlatformExam: true, contentSource: 'seeded_demo' })
    } else if (storedExam.contentSource !== 'user_created') {
      storedExam.subjectSlug = metadata.subjectSlug
      storedExam.contentSource = 'seeded_demo'
      storedExam.isPlatformExam = true
      if (!storedExam.availabilityEndsAt || storedExam.availabilityEndsAt <= new Date()) {
        storedExam.availabilityEndsAt = daysFromNow(365)
      }
      await storedExam.save()
    }
    if (storedExam.contentSource === 'user_created') continue

    const catalogueQuestions = existingExamAdditions[exam.slug] || exam.questions || []
    const expandedQuestions = expandedExamQuestions[exam.slug] || []
    const additions = [...catalogueQuestions, ...expandedQuestions]
    const promptKeys = new Set(storedExam.questions.map((item) => item.prompt.trim().toLocaleLowerCase()))
    const missingQuestions = additions.filter((item) => {
      const key = item.prompt.trim().toLocaleLowerCase()
      if (promptKeys.has(key)) return false
      promptKeys.add(key)
      return true
    })
    if (missingQuestions.length) {
      await Exam.updateOne({ _id: storedExam._id }, { $push: { questions: { $each: missingQuestions } } })
      insertedQuestions += missingQuestions.length
    }
  }
  console.info(`Synced ${allExams.length} seeded exams, ${insertedQuestions} new questions, ${seededSubjects.length} subjects, and demo student ${studentNumber}`)
} catch (error) {
  console.error(`Seeding failed: ${error.message}`)
  process.exitCode = 1
} finally {
  const mongoose = await import('mongoose')
  await mongoose.default.disconnect()
}