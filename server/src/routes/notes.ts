// server/src/routes/notes.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/notes — student's own notes
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notes')
      .select('*')
      .eq('student_id', req.userId)
      .order('is_pinned', { ascending: false })
      .order('updated_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch notes' })
  }
})

// POST /api/notes — create note
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { title, content, class_id } = req.body
    const now = Date.now()
    const { data, error } = await supabaseAdmin
      .from('notes')
      .insert({
        student_id: req.userId, title, content,
        class_id: class_id ?? null,
        is_pinned: false,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create note' })
  }
})

// PATCH /api/notes/:id — update note
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notes')
      .update({ ...req.body, updated_at: Date.now() })
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to update note' })
  }
})

// DELETE /api/notes/:id
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notes')
      .delete()
      .eq('id', req.params.id)
      .eq('student_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete note' })
  }
})

export default router
