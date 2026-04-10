// server/src/routes/notifications.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/notifications — current user's notifications
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch notifications' })
  }
})

// GET /api/notifications/unread-count
router.get('/unread-count', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('is_read', false)
    if (error) throw error
    res.json({ count: count ?? 0 })
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to count notifications' })
  }
})

// PATCH /api/notifications/:id/mark-read
router.patch('/:id/mark-read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to mark notification' })
  }
})

// PATCH /api/notifications/mark-all-read
router.patch('/mark-all-read', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', req.userId)
      .eq('is_read', false)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to mark all read' })
  }
})

export default router
