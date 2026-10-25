import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import { randomBytes } from 'node:crypto'
import authRoutes from './routes/authRoutes.js'
import examRoutes from './routes/examRoutes.js'
import subjectRoutes from './routes/subjectRoutes.js'
import attemptRoutes from './routes/attemptRoutes.js'
import studentRoutes from './routes/studentRoutes.js'
import departmentRoutes from './routes/departmentRoutes.js'
import classGroupRoutes from './routes/classGroupRoutes.js'
import assignmentRoutes from './routes/assignmentRoutes.js'
import requireAuth from './middleware/requireAuth.js'
import HttpError from './utils/httpError.js'

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim())
const sessionSecret = process.env.SESSION_SECRET || randomBytes(48).toString('hex')
if (!process.env.SESSION_SECRET) console.warn('SESSION_SECRET is unset; sessions will be invalidated when the API restarts')

export const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGODB_URI, collectionName: 'sessions', ttl: 8 * 60 * 60 })

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '32kb' }))
app.use(session({
  name: 'q65.sid',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.SESSION_COOKIE_SECURE === 'true',
    maxAge: 8 * 60 * 60 * 1000,
  },
}))

app.get('/api/health', (request, response) => response.json({ status: 'ok' }))
app.use('/api/auth', authRoutes)
app.use('/api', requireAuth)
app.use('/api/exams', examRoutes)
app.use('/api/subjects', subjectRoutes)
app.use('/api/attempts', attemptRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/classes', classGroupRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use((request, response, next) => next(new HttpError(404, 'API route not found')))

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'Invalid identifier' })
  }
  if (error.code === 11000) {
    return response.status(409).json({ error: 'A record with that value already exists' })
  }
  const status = error.status || 500
  if (status >= 500) console.error(error)
  return response.status(status).json({ error: status >= 500 ? 'An unexpected server error occurred' : error.message, ...error.details })
})

export default app