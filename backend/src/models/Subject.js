import mongoose from 'mongoose'

const subjectSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 500 },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('Subject', subjectSchema)