// server/src/index.ts
// Express.js API server for Saint Mary School app

import 'dotenv/config'
import { supabaseAdmin } from './lib/supabase.js'
import express from 'express'
import cors from 'cors'
import multer from 'multer'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import enrollmentRoutes from './routes/enrollments.js'
import classRoutes from './routes/classes.js'
import assignmentRoutes from './routes/assignments.js'
import submissionRoutes from './routes/submissions.js'
import noteRoutes from './routes/notes.js'
import scheduleRoutes from './routes/schedules.js'
import attendanceRoutes from './routes/attendance.js'
import notificationRoutes from './routes/notifications.js'
import cmsRoutes from './routes/cms.js'
import meetingRoutes from './routes/meetings.js'
import linkRoutes from './routes/links.js'

const app = express()
const PORT = parseInt(process.env.PORT ?? '3001', 10)

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// File upload middleware
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } })

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Upload endpoint - bypasses storage RLS by using service role key
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ message: 'No file provided' })

    const bucket = req.body.bucket || 'cms-media'
    const fullpath = req.body.path || `cms/${Date.now()}-${file.originalname}`

    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(fullpath, file.buffer, { contentType: file.mimetype, upsert: true })

    if (error) throw error

    const localUrl = supabaseAdmin.storage.from(bucket).getPublicUrl(fullpath).data.publicUrl
    const publicUrl = process.env.SUPABASE_PUBLIC_URL
      ? localUrl.replace('http://localhost:8000', process.env.SUPABASE_PUBLIC_URL)
      : localUrl
    res.json({ path: fullpath, publicUrl })
  } catch (err: any) {
    console.error('Upload failed:', err)
    res.status(500).json({ message: err.message || 'Upload failed' })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/enrollments', enrollmentRoutes)
app.use('/api/classes', classRoutes)
app.use('/api/assignments', assignmentRoutes)
app.use('/api/submissions', submissionRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/schedules', scheduleRoutes)
app.use('/api/attendance', attendanceRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/cms', cmsRoutes)
app.use('/api/meetings', meetingRoutes)
app.use('/api/links', linkRoutes)

// 404 handler
app.use((_req, res) => { res.status(404).json({ message: 'Not found' }) })

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ message: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Saint Mary School API server running on port ${PORT}`)
  console.log(`   Health check: http://localhost:${PORT}/health`)
})

export default app
