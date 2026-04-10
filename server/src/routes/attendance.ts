// server/src/routes/attendance.ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/attendance — list attendance records
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { schedule_id, student_id } = req.query
    let query = supabaseAdmin.from('attendance').select('*')
    if (schedule_id) query = query.eq('schedule_id', schedule_id as string)
    if (student_id) query = query.eq('student_id', student_id as string)
    query = query.order('marked_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to fetch attendance' })
  }
})

// POST /api/attendance — mark attendance (teacher)
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { schedule_id, records } = req.body // records: [{student_id, status}]
    if (!records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'records array is required' })
    }
    const now = Date.now()
    const items = records.map((r: any) => ({
      schedule_id,
      student_id: r.student_id,
      status: r.status,
      marked_by: req.userId,
      marked_at: now,
    }))
    const { error } = await supabaseAdmin.from('attendance').insert(items)
    if (error) throw error
    res.json(true)
  } catch (err: any) {
    res.status(500).json({ message: err.message ?? 'Failed to mark attendance' })
  }
})

export default router
