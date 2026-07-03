/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import dubRoutes from './routes/dub.js'
import translateRoutes from './routes/translate.js'
import groupRoutes from './routes/groups.js'
import achievementRoutes from './routes/achievements.js'
import handwritingRoutes from './routes/handwriting.js'
import userRoutes from './routes/users.js'
import { initializeDatabase } from './db.js'
import { seedDatabase } from './seed.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

// Initialize database and seed
initializeDatabase()
seedDatabase()

const app: express.Application = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/dub', dubRoutes)
app.use('/api/translate', translateRoutes)
app.use('/api/groups', groupRoutes)
app.use('/api/achievements', achievementRoutes)
app.use('/api/handwriting', handwritingRoutes)
app.use('/api/users', userRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  res.status(500).json({
    success: false,
    error: 'Server internal error',
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app