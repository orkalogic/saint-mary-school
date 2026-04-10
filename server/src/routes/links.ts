// server/src/routes/links.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/links — list parent-student links
router.get('/', requireAuth, requireRole('admin', 'assistant'), async (_req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('parent_student_links')
      .select('*, parent:users!parent_student_links_parent_id_fkey(first_name, last_name, email), student:users!parent_student_links_student_id_fkey(first_name, last_name, grade)')
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch links' })
  }
})

// GET /api/links/my-children — current parent's children
router.get('/my-children', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('parent_student_links')
      .select('relationship, student:users!parent_student_links_student_id_fkey(*)')
      .eq('parent_id', req.userId)
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch children' })
  }
})

// POST /api/links — create parent-student link (admin)
router.post('/', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { parent_id, student_id, relationship } = req.body
    const { data, error } = await supabaseAdmin
      .from('parent_student_links')
      .insert({ parent_id, student_id, relationship })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create link' })
  }
})

// DELETE /api/links/:id
router.delete('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('parent_student_links').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete link' })
  }
})

export default router
