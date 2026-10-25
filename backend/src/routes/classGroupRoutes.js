import { Router } from 'express'
import mongoose from 'mongoose'
import ClassGroup from '../models/ClassGroup.js'
import Department from '../models/Department.js'
import Student from '../models/Student.js'
import HttpError from '../utils/httpError.js'
import { validateObjectId } from '../services/attemptService.js'
import { requireRole } from '../middleware/requireAuth.js'

const router = Router()

function serializeClassGroup(cls) {
  return {
    id: String(cls._id),
    name: cls.name,
    code: cls.code || '',
    department: cls.department && typeof cls.department === 'object' && cls.department.name ? {
      id: String(cls.department._id),
      name: cls.department.name,
      code: cls.department.code,
    } : (cls.department ? String(cls.department) : null),
    academicYear: cls.academicYear || '',
    advisor: cls.advisor ? String(cls.advisor) : null,
    isActive: cls.isActive,
    createdAt: cls.createdAt,
  }
}

router.get('/', async (request, response) => {
  const filter = {}
  if (request.query.department) {
    validateObjectId(request.query.department, 'department ID')
    filter.department = request.query.department
  }
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  if (!isStaff || request.query.activeOnly === 'true') {
    filter.isActive = true
  }

  const classes = await ClassGroup.find(filter).populate('department', 'name code').sort({ name: 1 })
  response.json({ classes: classes.map(serializeClassGroup) })
})

router.get('/:classId', async (request, response) => {
  validateObjectId(request.params.classId, 'class ID')
  const classGroup = await ClassGroup.findById(request.params.classId).populate('department', 'name code')
  if (!classGroup) throw new HttpError(404, 'Class not found')
  response.json({ classGroup: serializeClassGroup(classGroup) })
})

router.get('/:classId/students', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.classId, 'class ID')
  const classGroup = await ClassGroup.exists({ _id: request.params.classId })
  if (!classGroup) throw new HttpError(404, 'Class not found')

  const students = await Student.find({ classes: request.params.classId }).sort({ name: 1 })
  response.json({ students: students.map((student) => ({
    id: String(student._id),
    name: student.name,
    email: student.email,
    studentNumber: student.studentNumber,
    role: student.role || 'student',
    department: student.department ? String(student.department) : null,
    classes: Array.isArray(student.classes) ? student.classes.map((item) => String(item)) : [],
  })) })
})

router.post('/', requireRole('teacher', 'admin'), async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const departmentId = request.body?.department
  const code = typeof request.body?.code === 'string' ? request.body.code.trim().toUpperCase() : ''
  const academicYear = typeof request.body?.academicYear === 'string' ? request.body.academicYear.trim() : ''

  if (name.length < 2 || name.length > 100) {
    throw new HttpError(400, 'Class name must be between 2 and 100 characters')
  }

  if (!departmentId || !mongoose.isValidObjectId(departmentId)) {
    throw new HttpError(400, 'A valid department ID is required')
  }

  const departmentExists = await Department.exists({ _id: departmentId })
  if (!departmentExists) {
    throw new HttpError(400, 'Referenced department does not exist')
  }

  const existingClass = await ClassGroup.findOne({ department: departmentId, name })
  if (existingClass) {
    throw new HttpError(409, `A class named "${name}" already exists in this department`)
  }

  const classGroup = new ClassGroup({
    name,
    code,
    department: departmentId,
    academicYear,
    isActive: request.body?.isActive !== false,
  })

  await classGroup.save()
  const populated = await ClassGroup.findById(classGroup._id).populate('department', 'name code')
  response.status(201).json({ classGroup: serializeClassGroup(populated) })
})

router.put('/:classId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.classId, 'class ID')
  const classGroup = await ClassGroup.findById(request.params.classId)
  if (!classGroup) throw new HttpError(404, 'Class not found')

  if ('department' in request.body) {
    const deptId = request.body.department
    if (!deptId || !mongoose.isValidObjectId(deptId)) {
      throw new HttpError(400, 'A valid department ID is required')
    }
    const deptExists = await Department.exists({ _id: deptId })
    if (!deptExists) throw new HttpError(400, 'Referenced department does not exist')
    classGroup.department = deptId
  }

  if ('name' in request.body) {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
    if (name.length < 2 || name.length > 100) {
      throw new HttpError(400, 'Class name must be between 2 and 100 characters')
    }
    const duplicate = await ClassGroup.findOne({
      department: classGroup.department,
      name,
      _id: { $ne: classGroup._id },
    })
    if (duplicate) throw new HttpError(409, `A class named "${name}" already exists in this department`)
    classGroup.name = name
  }

  if ('code' in request.body) {
    classGroup.code = typeof request.body.code === 'string' ? request.body.code.trim().toUpperCase() : ''
  }

  if ('academicYear' in request.body) {
    classGroup.academicYear = typeof request.body.academicYear === 'string' ? request.body.academicYear.trim() : ''
  }

  if ('isActive' in request.body) {
    classGroup.isActive = Boolean(request.body.isActive)
  }

  await classGroup.save()
  const populated = await ClassGroup.findById(classGroup._id).populate('department', 'name code')
  response.json({ classGroup: serializeClassGroup(populated) })
})

router.delete('/:classId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.classId, 'class ID')
  const classGroup = await ClassGroup.findById(request.params.classId)
  if (!classGroup) throw new HttpError(404, 'Class not found')

  const hasStudents = await Student.exists({ classes: classGroup._id })
  if (hasStudents) {
    throw new HttpError(400, 'Cannot delete class with enrolled students')
  }

  await ClassGroup.deleteOne({ _id: classGroup._id })
  response.json({ message: 'Class deleted successfully' })
})

export default router
