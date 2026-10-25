import mongoose from 'mongoose'

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Department name is required'], trim: true, maxlength: 100 },
  code: { type: String, required: [true, 'Department code is required'], trim: true, uppercase: true, unique: true, maxlength: 20 },
  description: { type: String, trim: true, maxlength: 500, default: '' },
  headOfDepartment: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', default: null },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Department', departmentSchema)
