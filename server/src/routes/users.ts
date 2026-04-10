// server/src/routes/users.ts
// User management routes (admin only for most operations)

import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/users — list all users (admin only)
router.get('/', requireAuth, requireRole('admin', 'assistant'), async (_req: AuthRequest, res) => {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(users ?? [])
  } catch (err: any) {
    console.error('Error fetching users:', err)
    res.status(500).json({ message: err.message ?? 'Failed to fetch users' })
  }
})

// GET /api/users/stats — dashboard stats (admin only)
router.get('/stats', requireAuth, requireRole('admin', 'assistant'), async (_req: AuthRequest, res) => {
  try {
    const students = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student')
    const teachers = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'teacher')
    const parents = await supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'parent')
    const pending = await supabaseAdmin.from('enrollment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending')

    res.json({
      totalStudents: students.count ?? 0,
      totalTeachers: teachers.count ?? 0,
      totalParents: parents.count ?? 0,
      pendingEnrollments: pending.count ?? 0,
    })
  } catch (err: any) {
    console.error('Error fetching stats:', err)
    res.status(500).json({ message: err.message ?? 'Failed to fetch stats' })
  }
})

// PATCH /api/users/role — change user role (admin only)
router.patch('/role', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { userId, role } = req.body
    if (!userId || !role) {
      return res.status(400).json({ message: 'userId and role are required' })
    }

    const { error } = await supabaseAdmin
      .from('users')
      .update({ role })
      .eq('id', userId)

    if (error) throw error
    res.json(true)
  } catch (err: any) {
    console.error('Error updating user role:', err)
    res.status(500).json({ message: err.message ?? 'Failed to update role' })
  }
})

// PATCH /api/users/toggle — toggle user active status (admin only)
router.patch('/toggle', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { userId } = req.body
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' })
    }

    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('is_active')
      .eq('id', userId)
      .single()

    if (fetchError || !user) throw fetchError ?? new Error('User not found')

    const { error } = await supabaseAdmin
      .from('users')
      .update({ is_active: !user.is_active })
      .eq('id', userId)

    if (error) throw error
    res.json(true)
  } catch (err: any) {
    console.error('Error toggling user:', err)
    res.status(500).json({ message: err.message ?? 'Failed to toggle user' })
  }
})

// DELETE /api/users/:id — delete a user (admin only)
router.delete('/:id', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    // Don't allow self-deletion
    if (id === req.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' })
    }

    // Also delete the auth user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('clerk_id')
      .eq('id', id)
      .single()

    if (user?.clerk_id) {
      await supabaseAdmin.auth.admin.deleteUser(user.clerk_id).catch(() => {})
    }

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) throw error
    res.json(true)
  } catch (err: any) {
    console.error('Error deleting user:', err)
    res.status(500).json({ message: err.message ?? 'Failed to delete user' })
  }
})

export default router
