import { Router } from 'express'
import Subject from '../models/Subject.js'
import Exam from '../models/Exam.js'

const router = Router()

router.get('/', async (request, response) => {
  const now = new Date()
  const [subjects, counts] = await Promise.all([
    Subject.find().sort({ displayOrder: 1, title: 1 }).lean(),
    Exam.aggregate([
      { $match: { published: true, availabilityEndsAt: { $gt: now } } },
      { $group: { _id: '$subjectSlug', examCount: { $sum: 1 }, questionCount: { $sum: { $size: '$questions' } } } },
    ]),
  ])
  const countBySlug = new Map(counts.filter((item) => item._id).map((item) => [item._id, item]))
  response.json({ subjects: subjects.map((subject) => {
    const count = countBySlug.get(subject.slug)
    return {
      id: String(subject._id),
      slug: subject.slug,
      title: subject.title,
      description: subject.description,
      examCount: count?.examCount || 0,
      questionCount: count?.questionCount || 0,
    }
  }) })
})

export default router