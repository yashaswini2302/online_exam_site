import mongoose from 'mongoose'

const classGroupSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Class name is required'], trim: true, maxlength: 100 },
  code: { type: String, trim: true, uppercase: true, maxlength: 30 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: [true, 'Department is required'], index: true },
  academicYear: { type: String, trim: true, maxlength: 20, default: '' },
  advisor: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

classGroupSchema.index({ department: 1, name: 1 })

export default mongoose.model('ClassGroup', classGroupSchema)
