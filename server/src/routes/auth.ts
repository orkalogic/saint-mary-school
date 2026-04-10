// server/src/routes/auth.ts
// Auth routes: get current user info, get role

import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/auth/signup — create user with auto-confirm (no email needed)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'email, password, firstName, and lastName are required' })
    }

    // Create user via Admin API with email auto-confirmed
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName },
    })

    if (authError) {
      if (authError.message?.includes('already been registered')) {
        return res.status(409).json({ message: 'An account with this email already exists' })
      }
      throw authError
    }

    // Create profile in our users table
    const now = Date.now()
    await supabaseAdmin
      .from('users')
      .insert({
        clerk_id: authUser.user!.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'student', // default role
        is_active: true,
        created_at: now,
      })

    res.json({ message: 'Account created successfully' })
  } catch (err: any) {
    console.error('Error creating user:', err)
    res.status(500).json({ message: err.message ?? 'Failed to create account' })
  }
})

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
