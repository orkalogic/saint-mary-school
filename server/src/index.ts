// server/src/index.ts
// Express.js API server for Saint Mary School app

import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import enrollmentRoutes from './routes/enrollments.js'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/enrollments', enrollmentRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not found' })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Saint Mary School API server running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
})

export default app
