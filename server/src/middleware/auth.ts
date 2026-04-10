// server/src/middleware/auth.ts
// Verify Supabase JWT and attach user to request

import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabaseAdmin } from '../lib/supabase.js'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: string
  userEmail?: string
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'super-secret-jwt-token-for-development'

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid authorization header' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verify the JWT using the shared secret
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any

    if (!decoded?.sub) {
      return res.status(401).json({ message: 'Invalid token: missing subject' })
    }

    req.userId = decoded.sub
    req.userEmail = decoded.email

    // Fetch user profile from our users table
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, is_active')
      .eq('clerk_id', decoded.sub)
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
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' })
    }
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
