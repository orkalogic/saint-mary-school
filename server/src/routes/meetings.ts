// server/src/routes/meetings.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/meetings — list meetings
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    let query = supabaseAdmin.from('meetings').select('*').order('date', { ascending: true })

    if (req.userRole === 'parent') {
      // Only meetings this parent is invited to (or all if invited_parent_ids is null)
      const { data } = await query
      if (data) {
        const filtered = data.filter((m: any) =>
          !m.invited_parent_ids || m.invited_parent_ids.includes(req.userId)
        )
        return res.json(filtered)
      }
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch meetings' })
  }
})

// POST /api/meetings — create meeting (admin)
router.post('/', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('meetings')
      .insert({
        ...req.body,
        organized_by: req.userId,
        reminders_sent: 0,
        created_at: Date.now(),
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create meeting' })
  }
})

// DELETE /api/meetings/:id (admin)
router.delete('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('meetings').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete meeting' })
  }
})

export default router
