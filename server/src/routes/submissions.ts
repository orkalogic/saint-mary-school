// server/src/routes/submissions.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/submissions — list submissions
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    let query = supabaseAdmin.from('submissions').select('*')

    if (req.userRole === 'student') {
      query = query.eq('student_id', req.userId)
    } else if (req.userRole === 'teacher') {
      // Get submissions for this teacher's assignments
      const { data: assignments } = await supabaseAdmin
        .from('assignments')
        .select('id')
        .eq('teacher_id', req.userId)
      if (assignments?.length) {
        query = query.in('assignment_id', assignments.map(a => a.id))
      } else {
        return res.json([])
      }
    }

    const { data, error } = await query.order('submitted_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch submissions' })
  }
})

// GET /api/submissions/assignment/:id — submissions for a specific assignment
router.get('/assignment/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .select('*')
      .eq('assignment_id', req.params.id)
      .order('submitted_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch submissions' })
  }
})

// POST /api/submissions — submit assignment (student)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { assignment_id, content, attachments } = req.body
    const now = Date.now()
    const { data, error } = await supabaseAdmin
      .from('submissions')
      .insert({
        assignment_id,
        student_id: req.userId,
        content,
        attachments: attachments ?? null,
        submitted_at: now,
        status: 'submitted',
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to submit assignment' })
  }
})

// PATCH /api/submissions/:id — grade submission (teacher)
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { score, feedback, status } = req.body
    const { error } = await supabaseAdmin
      .from('submissions')
      .update({
        score: score ?? null,
        feedback: feedback ?? null,
        status: status ?? 'graded',
        graded_by: req.userId,
        graded_at: Date.now(),
      })
      .eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to grade submission' })
  }
})

export default router
