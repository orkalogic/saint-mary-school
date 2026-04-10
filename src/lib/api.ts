// src/lib/api.ts
// API layer — communicates with our Express backend (which talks to Supabase)
// This replaces the Convex `api` object pattern

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'include',
    ...options,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(error.message ?? `API error: ${res.status}`)
  }

  return res.json() as T
}

export const api = {
  // Auth
  auth: {
    getCurrentUser: () => request<CurrentUser | null>('/auth/me'),
    getUserRole: () => request<string | null>('/auth/role'),
  },

  // Users (admin only)
  users: {
    getAllUsers: () => request<User[]>('/users'),
    getUsersByRole: (role: string) => request<User[]>(`/users?role=${role}`),
    updateUserRole: (userId: string, role: string) =>
      request<boolean>('/users/role', { method: 'PATCH', body: JSON.stringify({ userId, role }) }),
    toggleUserActive: (userId: string) =>
      request<boolean>('/users/toggle', { method: 'PATCH', body: JSON.stringify({ userId }) }),
    getDashboardStats: () => request<DashboardStats>('/users/stats'),
  },

  // Enrollments
  enrollments: {
    submitStudentEnrollment: (data: StudentEnrollmentData) =>
      request<string>('/enrollments/student', { method: 'POST', body: JSON.stringify(data) }),
    submitTeacherEnrollment: (data: TeacherEnrollmentData) =>
      request<string>('/enrollments/teacher', { method: 'POST', body: JSON.stringify(data) }),
    getPendingEnrollments: () => request<Enrollment[]>('/enrollments/pending'),
    getAllEnrollments: () => request<Enrollment[]>('/enrollments'),
    getMyEnrollment: () => request<Enrollment | null>('/enrollments/my'),
    approveEnrollment: (enrollmentId: string, role: string) =>
      request<boolean>('/enrollments/approve', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, role }),
      }),
    rejectEnrollment: (enrollmentId: string, rejectionReason: string) =>
      request<boolean>('/enrollments/reject', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, rejectionReason }),
      }),
  },
}

// ── Types ──

export interface User {
  _id: string
  clerkId: string
  email?: string
  phone?: string
  firstName: string
  lastName: string
  avatarUrl?: string
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'assistant'
  isActive: boolean
  createdAt: number
}

export interface CurrentUser extends User {}

export interface Enrollment {
  _id: string
  clerkId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  role: 'student' | 'teacher'
  status: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
  reviewedBy?: string
  dateOfBirth?: string
  grade?: string
  parentEmail?: string
  parentPhone?: string
  qualifications?: string
  preferredSubjects?: string[]
  createdAt: number
  updatedAt: number
}

export interface StudentEnrollmentData {
  clerkId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth?: string
  grade?: string
  parentEmail?: string
  parentPhone?: string
}

export interface TeacherEnrollmentData {
  clerkId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  qualifications?: string
  preferredSubjects?: string[]
}

export interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalParents: number
  pendingEnrollments: number
}
