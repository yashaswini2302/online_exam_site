import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  studentNumber: { type: String, required: true, trim: true, unique: true },
  passwordHash: { type: String, select: false },
  termsAcceptedAt: { type: Date },
  role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student', index: true },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', default: null },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ClassGroup' }],
}, { timestamps: true })

export default mongoose.model('Student', studentSchema)