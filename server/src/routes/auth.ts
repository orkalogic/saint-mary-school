// server/src/routes/auth.ts
// Auth routes: get current user info, get role

import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// GET /api/auth/me — returns current user profile
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', req.userId)
      .single()

    if (!user) {
      // User is authenticated but has no profile yet
      return res.json(null)
    }

    res.json(user)
  } catch (err) {
    console.error('Error fetching user profile:', err)
    res.status(500).json({ message: 'Failed to fetch user profile' })
  }
})

// GET /api/auth/role — returns current user's role
router.get('/role', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('clerk_id', req.userId)
      .single()

    res.json(user?.role ?? null)
  } catch (err) {
    console.error('Error fetching user role:', err)
    res.status(500).json({ message: 'Failed to fetch user role' })
  }
})

export default router
