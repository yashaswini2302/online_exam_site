import HttpError from '../utils/httpError.js'
import Student from '../models/Student.js'

export default async function requireAuth(request, response, next) {
  const studentId = request.session?.studentId
  if (!studentId) return next(new HttpError(401, 'Authentication required'))

  const student = await Student.findById(studentId)
  if (!student) {
    request.session.destroy(() => {})
    return next(new HttpError(401, 'Authentication required'))
  }

  request.student = student
  request.user = student
  return next()
}

export function requireRole(...roles) {
  return (request, response, next) => {
    const user = request.user || request.student
    if (!user) return next(new HttpError(401, 'Authentication required'))
    const userRole = user.role || 'student'
    if (!roles.includes(userRole)) {
      return next(new HttpError(403, 'Access denied: insufficient permissions'))
    }
    return next()
  }
}