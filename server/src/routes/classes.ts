// server/src/routes/classes.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/classes — list all classes
router.get('/', requireAuth, async (_req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('*, curricula(name), users!classes_teacher_id_fkey(first_name, last_name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch classes' })
  }
})

// POST /api/classes — create class (admin only)
router.post('/', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { curriculum_id, name, term, teacher_id, student_ids } = req.body
    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        curriculum_id, name, term, teacher_id,
        student_ids: student_ids ?? [],
        is_active: true,
        created_at: Date.now(),
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create class' })
  }
})

// PATCH /api/classes/:id — update class
router.patch('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('classes').update(req.body).eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to update class' })
  }
})

// DELETE /api/classes/:id — delete class
router.delete('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('classes').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete class' })
  }
})

export default router
