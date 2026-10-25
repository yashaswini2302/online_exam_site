import { Router } from 'express'
import Department from '../models/Department.js'
import ClassGroup from '../models/ClassGroup.js'
import Student from '../models/Student.js'
import HttpError from '../utils/httpError.js'
import { validateObjectId } from '../services/attemptService.js'
import { requireRole } from '../middleware/requireAuth.js'

const router = Router()

function serializeDepartment(dept) {
  return {
    id: String(dept._id),
    name: dept.name,
    code: dept.code,
    description: dept.description || '',
    isActive: dept.isActive,
    headOfDepartment: dept.headOfDepartment ? String(dept.headOfDepartment) : null,
    createdAt: dept.createdAt,
  }
}

router.get('/', async (request, response) => {
  const isStaff = request.user?.role === 'teacher' || request.user?.role === 'admin'
  const filter = {}
  if (!isStaff || request.query.activeOnly === 'true') {
    filter.isActive = true
  }
  const departments = await Department.find(filter).sort({ name: 1 })
  response.json({ departments: departments.map(serializeDepartment) })
})

router.get('/:departmentId', async (request, response) => {
  validateObjectId(request.params.departmentId, 'department ID')
  const department = await Department.findById(request.params.departmentId)
  if (!department) throw new HttpError(404, 'Department not found')
  response.json({ department: serializeDepartment(department) })
})

router.post('/', requireRole('teacher', 'admin'), async (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const rawCode = typeof request.body?.code === 'string' ? request.body.code.trim().toUpperCase() : ''
  const description = typeof request.body?.description === 'string' ? request.body.description.trim() : ''

  if (name.length < 2 || name.length > 100) {
    throw new HttpError(400, 'Department name must be between 2 and 100 characters')
  }
  if (!rawCode || rawCode.length < 2 || rawCode.length > 20 || !/^[A-Z0-9_-]+$/.test(rawCode)) {
    throw new HttpError(400, 'Department code must be 2-20 uppercase alphanumeric characters, dashes, or underscores')
  }

  const existingDept = await Department.findOne({ code: rawCode })
  if (existingDept) {
    throw new HttpError(409, `Department with code "${rawCode}" already exists`)
  }

  const department = new Department({
    name,
    code: rawCode,
    description,
    isActive: request.body?.isActive !== false,
  })

  await department.save()
  response.status(201).json({ department: serializeDepartment(department) })
})

router.put('/:departmentId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.departmentId, 'department ID')
  const department = await Department.findById(request.params.departmentId)
  if (!department) throw new HttpError(404, 'Department not found')

  if ('name' in request.body) {
    const name = typeof request.body.name === 'string' ? request.body.name.trim() : ''
    if (name.length < 2 || name.length > 100) {
      throw new HttpError(400, 'Department name must be between 2 and 100 characters')
    }
    department.name = name
  }

  if ('code' in request.body) {
    const rawCode = typeof request.body.code === 'string' ? request.body.code.trim().toUpperCase() : ''
    if (!rawCode || rawCode.length < 2 || rawCode.length > 20 || !/^[A-Z0-9_-]+$/.test(rawCode)) {
      throw new HttpError(400, 'Department code must be 2-20 uppercase alphanumeric characters, dashes, or underscores')
    }
    if (rawCode !== department.code) {
      const duplicate = await Department.findOne({ code: rawCode, _id: { $ne: department._id } })
      if (duplicate) throw new HttpError(409, `Department with code "${rawCode}" already exists`)
      department.code = rawCode
    }
  }

  if ('description' in request.body) {
    department.description = typeof request.body.description === 'string' ? request.body.description.trim() : ''
  }

  if ('isActive' in request.body) {
    department.isActive = Boolean(request.body.isActive)
  }

  await department.save()
  response.json({ department: serializeDepartment(department) })
})

router.delete('/:departmentId', requireRole('teacher', 'admin'), async (request, response) => {
  validateObjectId(request.params.departmentId, 'department ID')
  const department = await Department.findById(request.params.departmentId)
  if (!department) throw new HttpError(404, 'Department not found')

  const hasClasses = await ClassGroup.exists({ department: department._id })
  if (hasClasses) {
    throw new HttpError(400, 'Cannot delete department that has associated classes')
  }

  const hasStudents = await Student.exists({ department: department._id })
  if (hasStudents) {
    throw new HttpError(400, 'Cannot delete department with assigned students')
  }

  await Department.deleteOne({ _id: department._id })
  response.json({ message: 'Department deleted successfully' })
})

export default router
