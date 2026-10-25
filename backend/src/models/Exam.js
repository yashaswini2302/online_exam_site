import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema({
  prompt: { type: String, required: true, trim: true, maxlength: 2000 },
  options: { type: [String], required: true, validate: [(options) => options.length === 4, 'Questions must have exactly four options'] },
  correctOption: { type: Number, required: true, min: 0, max: 3, select: false },
  explanation: { type: String, trim: true, maxlength: 2000 },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
}, { timestamps: false })

const examSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 140 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  subjectSlug: { type: String, trim: true, lowercase: true, index: true },
  contentSource: { type: String, enum: ['seeded_demo', 'user_created'], default: 'seeded_demo' },
  category: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true, maxlength: 1000 },
  durationMinutes: { type: Number, required: true, min: 1, max: 360 },
  difficulty: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  availabilityEndsAt: { type: Date, required: true },
  published: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null, index: true },
  isPlatformExam: { type: Boolean, default: false },
  questions: { type: [questionSchema], validate: [(items) => items.length > 0, 'An exam must include at least one question'] },
}, { timestamps: true })

export default mongoose.model('Exam', examSchema)