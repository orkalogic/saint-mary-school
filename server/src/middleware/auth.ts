// server/src/middleware/auth.ts
// Verify Supabase JWT and attach user to request

import type { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  userEmail?: string
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid or expired token' })
    }

    req.userId = user.id
    req.userEmail = user.email

    // Fetch user profile from our users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('clerk_id', user.id)
      .single()

    if (!profile) {
      // User exists in auth but not in our DB — they haven't been set up yet
      req.userRole = undefined
    } else if (!profile.is_active) {
      return res.status(403).json({ message: 'Your account has been deactivated. Contact an administrator.' })
    } else {
      req.userRole = profile.role
    }

    next()
  } catch {
    return res.status(401).json({ message: 'Authentication failed' })
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Insufficient permissions' })
    }
    next()
  }
}
