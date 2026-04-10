// server/src/routes/schedules.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/schedules — list schedules
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    let query = supabaseAdmin.from('schedules').select('*').order('date', { ascending: true })

    if (req.userRole === 'teacher') {
      query = query.eq('teacher_id', req.userId)
    }

    const { data, error } = await query
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch schedules' })
  }
})

// POST /api/schedules — create schedule (admin)
router.post('/', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { class_id, teacher_id, date, start_time, end_time, recurrence, response_deadline } = req.body
    const { data, error } = await supabaseAdmin
      .from('schedules')
      .insert({
        class_id, teacher_id, date, start_time, end_time,
        recurrence: recurrence ?? 'once',
        status: 'assigned',
        response_deadline,
        reminders_sent: 0,
        created_by: req.userId,
        created_at: Date.now(),
        updated_at: Date.now(),
      })
      .select()
      .single()
    if (error) throw error
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to create schedule' })
  }
})

// PATCH /api/schedules/:id — accept/reject schedule (teacher)
router.patch('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { status, rejection_reason } = req.body
    const { error } = await supabaseAdmin
      .from('schedules')
      .update({
        status,
        rejection_reason: rejection_reason ?? null,
        updated_at: Date.now(),
      })
      .eq('id', req.params.id)
      .eq('teacher_id', req.userId)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to update schedule' })
  }
})

// DELETE /api/schedules/:id (admin)
router.delete('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { error } = await supabaseAdmin.from('schedules').delete().eq('id', req.params.id)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to delete schedule' })
  }
})

export default router
