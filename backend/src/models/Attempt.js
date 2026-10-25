import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOption: { type: Number, min: 0, max: 3 },
  markedForReview: { type: Boolean, default: false },
}, { _id: false })

const resultSchema = new mongoose.Schema({
  totalQuestions: { type: Number, required: true },
  correctAnswers: { type: Number, required: true },
  incorrectAnswers: { type: Number, required: true },
  unansweredQuestions: { type: Number, required: true },
  score: { type: Number, required: true },
  percentage: { type: Number, required: true },
}, { _id: false })

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamAssignment', default: null, index: true },
  selectedQuestionIds: { type: [mongoose.Schema.Types.ObjectId], default: undefined },
  questionCount: { type: Number, min: 1 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  durationMinutes: { type: Number, min: 1, max: 360 },
  status: { type: String, enum: ['in_progress', 'submitted'], default: 'in_progress', index: true },
  startedAt: { type: Date, required: true, default: Date.now },
  expiresAt: { type: Date, required: true },
  submittedAt: { type: Date },
  answers: { type: [answerSchema], default: [] },
  result: { type: resultSchema },
}, { timestamps: true })

attemptSchema.index({ student: 1, exam: 1, status: 1 })

export default mongoose.model('Attempt', attemptSchema)