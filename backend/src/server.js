import './config/loadEnv.js'
import app from './app.js'
import { connectDatabase } from './config/database.js'

const port = Number(process.env.PORT) || 4000

try {
  await connectDatabase()
  app.listen(port, '0.0.0.0', () => console.info(`Q65 API listening on port ${port}`))
} catch (error) {
  console.error(`Unable to start API: ${error.message}`)
  process.exitCode = 1
}