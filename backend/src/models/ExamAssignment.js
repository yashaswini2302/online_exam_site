import mongoose from 'mongoose'

const examAssignmentSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Assignment title is required'], trim: true, maxlength: 140 },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: [true, 'Exam is required'], index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: [true, 'Instructor is required'], index: true },
  targetType: {
    type: String,
    enum: ['department', 'class', 'individual', 'all'],
    required: true,
    default: 'all',
  },
  targetDepartments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Department' }],
  targetClasses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' }],
  targetStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  scheduledStartAt: { type: Date, required: [true, 'Scheduled start date is required'], default: Date.now },
  deadline: { type: Date, required: [true, 'Deadline date is required'] },
  maxAttempts: { type: Number, default: 1, min: [1, 'Maximum attempts must be at least 1'], max: [10, 'Maximum attempts cannot exceed 10'] },
  isGraded: { type: Boolean, default: true },
  presetQuestionCount: { type: Number, min: 1, max: 50 },
  presetDifficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  status: { type: String, enum: ['draft', 'published', 'closed'], default: 'published', index: true },
  instructions: { type: String, trim: true, maxlength: 2000, default: '' },
}, { timestamps: true })

examAssignmentSchema.index({ assignedBy: 1, status: 1 })
examAssignmentSchema.index({ exam: 1, status: 1 })

export default mongoose.model('ExamAssignment', examAssignmentSchema)
