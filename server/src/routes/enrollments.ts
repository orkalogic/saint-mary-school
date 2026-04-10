// server/src/routes/enrollments.ts
// Enrollment request routes

import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase.js'
import { requireAuth, requireRole, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// POST /api/enrollments/student — submit student enrollment
router.post('/student', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, grade, parentEmail, parentPhone } = req.body

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' })
    }

    const now = Date.now()
    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollment_requests')
      .insert({
        clerk_id: req.userId,
        first_name: firstName,
        last_name: lastName,
        email: email ?? null,
        phone: phone ?? null,
        role: 'student',
        status: 'pending',
        date_of_birth: dateOfBirth ?? null,
        grade: grade ?? null,
        parent_email: parentEmail ?? null,
        parent_phone: parentPhone ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error

    // Notify all admins
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins) {
      const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'enrollment_pending',
        title: 'New Student Enrollment',
        message: `${firstName} ${lastName} has requested to enroll as a student.`,
        link_to: '/dashboard/admin/enrollments',
        is_read: false,
        related_id: enrollment.id,
        created_at: now,
      }))
      await supabaseAdmin.from('notifications').insert(notifications)
    }

    res.json(enrollment.id)
  } catch (err: any) {
    console.error('Error submitting student enrollment:', err)
    res.status(500).json({ message: err.message ?? 'Failed to submit enrollment' })
  }
})

// POST /api/enrollments/teacher — submit teacher enrollment
router.post('/teacher', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, email, phone, qualifications, preferredSubjects } = req.body

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'First name and last name are required' })
    }

    const now = Date.now()
    const { data: enrollment, error } = await supabaseAdmin
      .from('enrollment_requests')
      .insert({
        clerk_id: req.userId,
        first_name: firstName,
        last_name: lastName,
        email: email ?? null,
        phone: phone ?? null,
        role: 'teacher',
        status: 'pending',
        qualifications: qualifications ?? null,
        preferred_subjects: preferredSubjects ?? null,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) throw error

    // Notify all admins
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')

    if (admins) {
      const notifications = admins.map((admin: any) => ({
        user_id: admin.id,
        type: 'enrollment_pending',
        title: 'New Teacher Enrollment',
        message: `${firstName} ${lastName} has requested to join as a teacher.`,
        link_to: '/dashboard/admin/enrollments',
        is_read: false,
        related_id: enrollment.id,
        created_at: now,
      }))
      await supabaseAdmin.from('notifications').insert(notifications)
    }

    res.json(enrollment.id)
  } catch (err: any) {
    console.error('Error submitting teacher enrollment:', err)
    res.status(500).json({ message: err.message ?? 'Failed to submit enrollment' })
  }
})

// GET /api/enrollments — all enrollments (admin only)
router.get('/', requireAuth, requireRole('admin', 'assistant'), async (_req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollment_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    console.error('Error fetching enrollments:', err)
    res.status(500).json({ message: err.message ?? 'Failed to fetch enrollments' })
  }
})

// GET /api/enrollments/pending — pending enrollments (admin only)
router.get('/pending', requireAuth, requireRole('admin', 'assistant'), async (_req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollment_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) throw error
    res.json(data ?? [])
  } catch (err: any) {
    console.error('Error fetching pending enrollments:', err)
    res.status(500).json({ message: err.message ?? 'Failed to fetch enrollments' })
  }
})

// GET /api/enrollments/my — current user's pending enrollment
router.get('/my', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('enrollment_requests')
      .select('*')
      .eq('clerk_id', req.userId)
      .eq('status', 'pending')
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
    res.json(data ?? null)
  } catch (err: any) {
    console.error('Error fetching my enrollment:', err)
    res.status(500).json({ message: err.message ?? 'Failed to fetch enrollment' })
  }
})

// POST /api/enrollments/approve — approve an enrollment (admin only)
router.post('/approve', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { enrollmentId, role } = req.body
    if (!enrollmentId || !role) {
      return res.status(400).json({ message: 'enrollmentId and role are required' })
    }

    const now = Date.now()

    // Get admin's actual users.id (req.userId is the auth/clerk_id, not users.id)
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single()

    // Get enrollment details
    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollment_requests')
      .select('*')
      .eq('id', enrollmentId)
      .single()

    if (fetchError || !enrollment) throw fetchError ?? new Error('Enrollment not found')

    // Update enrollment status
    await supabaseAdmin
      .from('enrollment_requests')
      .update({
        status: 'approved',
        reviewed_by: adminUser?.id ?? null,
        updated_at: now,
      })
      .eq('id', enrollmentId)

    // Create or update user with approved role
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', enrollment.clerk_id)
      .single()

    if (existingUser) {
      await supabaseAdmin
        .from('users')
        .update({ role, is_active: true })
        .eq('id', existingUser.id)
    } else {
      await supabaseAdmin
        .from('users')
        .insert({
          clerk_id: enrollment.clerk_id,
          email: enrollment.email,
          phone: enrollment.phone,
          first_name: enrollment.first_name,
          last_name: enrollment.last_name,
          role,
          is_active: true,
          created_at: now,
        })
    }

    // Fetch user to notify them
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', enrollment.clerk_id)
      .single()

    if (user) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'enrollment_approved',
          title: 'Enrollment Approved',
          message: `Your enrollment as a ${role} has been approved! Welcome to Saint Mary Church School.`,
          is_read: false,
          related_id: enrollmentId,
          created_at: now,
        })
    }

    res.json(true)
  } catch (err: any) {
    console.error('Error approving enrollment:', err)
    res.status(500).json({ message: err.message ?? 'Failed to approve enrollment' })
  }
})

// POST /api/enrollments/reject — reject an enrollment (admin only)
router.post('/reject', requireAuth, requireRole('admin', 'assistant'), async (req: AuthRequest, res) => {
  try {
    const { enrollmentId, rejectionReason } = req.body
    if (!enrollmentId) {
      return res.status(400).json({ message: 'enrollmentId is required' })
    }

    const now = Date.now()

    // Get admin's actual users.id
    const { data: adminUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', req.userId)
      .single()

    const { data: enrollment, error: fetchError } = await supabaseAdmin
      .from('enrollment_requests')
      .select('*')
      .eq('id', enrollmentId)
      .single()

    if (fetchError || !enrollment) throw fetchError ?? new Error('Enrollment not found')

    await supabaseAdmin
      .from('enrollment_requests')
      .update({
        status: 'rejected',
        reviewed_by: adminUser?.id ?? null,
        rejection_reason: rejectionReason ?? 'Not specified',
        updated_at: now,
      })
      .eq('id', enrollmentId)

    // Notify user
    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('clerk_id', enrollment.clerk_id)
      .single()

    if (user) {
      await supabaseAdmin
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'enrollment_rejected',
          title: 'Enrollment Update',
          message: rejectionReason ?? 'Your enrollment request was not approved at this time.',
          is_read: false,
          related_id: enrollmentId,
          created_at: now,
        })
    }

    res.json(true)
  } catch (err: any) {
    console.error('Error rejecting enrollment:', err)
    res.status(500).json({ message: err.message ?? 'Failed to reject enrollment' })
  }
})

export default router
