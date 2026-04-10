// server/src/routes/assignments.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/assignments — list assignments (filtered by role)
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    let query = supabaseAdmin.from('assignments').select('*').order('due_date', { ascending: true })

    if (req.userRole === 'teacher') {
      query = query.eq('teacher_id', req.userId)
    } else if (req.userRole === 'student') {
      // Get assignments for classes this student is in
      const { data: classes } = await supabaseAdmin
        .from('classes')
        .select('id')
        .contains('student_ids', [req.userId])
      if (classes?.length) {
        query = query.in('class_id', classes.map(c => c.id)).eq('status', 'published')
      } else {
        return res.json([])
      }
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch assignments' })
  }
})

// GET /api/assignments/:id — single assignment
router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin.from('assignments').select('*').eq('id', req.params.id).single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch assignment' })
  }
})

// POST /api/assignments — create assignment (teacher/admin)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { class_id, title, description, instructions, attachments, due_date, max_score, status } = req.body
    const { data, error } = await supabaseAdmin
      .from('assignments')
      .insert({
        class_id, title, description,
        teacher_id: req.userId,
        instructions: instructions ?? null,
        attachments: attachments ?? null,
        due_date, max_score: max_score ?? null,
        status: status ?? 'draft',
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create assignment' })
  }
})

// PATCH /api/assignments/:id — update assignment
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('assignments')
      .update({ ...req.body, updated_at: Date.now() })
      .eq('id', req.params.id)
      .eq('teacher_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to update assignment' })
  }
})

// DELETE /api/assignments/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('assignments').delete().eq('id', req.params.id).eq('teacher_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete assignment' })
  }
})

export default router
