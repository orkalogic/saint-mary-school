// src/lib/api.ts
// API layer — communicates with our Express backend (which talks to Supabase)
// This replaces the Convex `api` object pattern

import { supabase } from './supabase'

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token

  const headers: Record<string, string> = {}
  // Don't set Content-Type for FormData - browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (options.headers) {
    Object.assign(headers, options.headers as Record<string, string>)
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers,
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
    getAll: () => request<User[]>('/users'),
    getById: (id: string) => request<User>(`/users/${id}`),
    create: (data: CreateUserInput) => request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateUserInput) => request<User>(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/users/${id}`, { method: 'DELETE' }),
    getUsersByRole: (role: string) => request<User[]>(`/users?role=${role}`),
    updateUserRole: (userId: string, role: string) =>
      request<boolean>('/users/role', { method: 'PATCH', body: JSON.stringify({ userId, role }) }),
    toggleUserActive: (userId: string) =>
      request<boolean>('/users/toggle', { method: 'PATCH', body: JSON.stringify({ userId }) }),
    getDashboardStats: () => request<DashboardStats>('/users/stats'),
    // Backward-compat aliases
    getAllUsers: () => request<User[]>('/users'),
    deleteUser: (id: string) => request<boolean>(`/users/${id}`, { method: 'DELETE' }),
  },

  // Enrollments
  enrollments: {
    getAll: () => request<Enrollment[]>('/enrollments'),
    getPending: () => request<Enrollment[]>('/enrollments/pending'),
    getMyEnrollment: () => request<Enrollment | null>('/enrollments/my'),
    submitStudent: (data: StudentEnrollmentData) =>
      request<string>('/enrollments/student', { method: 'POST', body: JSON.stringify(data) }),
    submitTeacher: (data: TeacherEnrollmentData) =>
      request<string>('/enrollments/teacher', { method: 'POST', body: JSON.stringify(data) }),
    approve: (enrollmentId: string, role: string) =>
      request<boolean>('/enrollments/approve', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, role }),
      }),
    reject: (enrollmentId: string, rejectionReason: string) =>
      request<boolean>('/enrollments/reject', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, rejectionReason }),
      }),
    // Backward-compat aliases
    submitStudentEnrollment: (data: StudentEnrollmentData) =>
      request<string>('/enrollments/student', { method: 'POST', body: JSON.stringify(data) }),
    submitTeacherEnrollment: (data: TeacherEnrollmentData) =>
      request<string>('/enrollments/teacher', { method: 'POST', body: JSON.stringify(data) }),
    getAllEnrollments: () => request<Enrollment[]>('/enrollments'),
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

  // Classes
  classes: {
    getAll: () => request<Class[]>('/classes'),
    getById: (id: string) => request<Class>(`/classes/${id}`),
    create: (data: CreateClassInput) => request<Class>('/classes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateClassInput) => request<Class>(`/classes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/classes/${id}`, { method: 'DELETE' }),
  },

  // Assignments
  assignments: {
    getAll: (params?: { class_id?: string; teacher_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<Assignment[]>(`/assignments${qs ? '?' + qs : ''}`)
    },
    getById: (id: string) => request<Assignment>(`/assignments/${id}`),
    create: (data: CreateAssignmentInput) => request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateAssignmentInput) => request<Assignment>(`/assignments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/assignments/${id}`, { method: 'DELETE' }),
  },

  // Submissions
  submissions: {
    getAll: (params?: { assignment_id?: string; student_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<Submission[]>(`/submissions${qs ? '?' + qs : ''}`)
    },
    getByAssignment: (assignmentId: string) => request<Submission[]>(`/submissions/assignment/${assignmentId}`),
    getById: (id: string) => request<Submission>(`/submissions/${id}`),
    submit: (data: CreateSubmissionInput) => request<Submission>('/submissions', { method: 'POST', body: JSON.stringify(data) }),
    grade: (id: string, data: GradeSubmissionInput) => request<Submission>(`/submissions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  // Notes
  notes: {
    getAll: (params?: { class_id?: string; student_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<Note[]>(`/notes${qs ? '?' + qs : ''}`)
    },
    getById: (id: string) => request<Note>(`/notes/${id}`),
    create: (data: CreateNoteInput) => request<Note>('/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: UpdateNoteInput) => request<Note>(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/notes/${id}`, { method: 'DELETE' }),
  },

  // Schedules
  schedules: {
    getAll: (params?: { class_id?: string; teacher_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<Schedule[]>(`/schedules${qs ? '?' + qs : ''}`)
    },
    getById: (id: string) => request<Schedule>(`/schedules/${id}`),
    create: (data: CreateScheduleInput) => request<Schedule>('/schedules', { method: 'POST', body: JSON.stringify(data) }),
    respond: (id: string, data: RespondScheduleInput) => request<Schedule>(`/schedules/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/schedules/${id}`, { method: 'DELETE' }),
  },

  // Attendance
  attendance: {
    getAll: (params?: { schedule_id?: string; student_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<AttendanceRecord[]>(`/attendance${qs ? '?' + qs : ''}`)
    },
    mark: (data: MarkAttendanceInput) => request<AttendanceRecord>('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Notifications
  notifications: {
    getAll: () => request<Notification[]>('/notifications'),
    getUnreadCount: () => request<{ count: number }>('/notifications/unread-count'),
    markRead: (id: string) => request<boolean>(`/notifications/${id}/mark-read`, { method: 'PATCH' }),
    markAllRead: () => request<boolean>('/notifications/mark-all-read', { method: 'PATCH' }),
  },

  // CMS
  cms: {
    events: {
      getAll: () => request<CmsEvent[]>('/cms/events'),
      getById: (id: string) => request<CmsEvent>(`/cms/events/${id}`),
      create: (data: CreateCmsEventInput) => request<CmsEvent>('/cms/events', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: UpdateCmsEventInput) => request<CmsEvent>(`/cms/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/events/${id}`, { method: 'DELETE' }),
    },
    blog: {
      getAll: () => request<CmsBlog[]>('/cms/blog'),
      getById: (id: string) => request<CmsBlog>(`/cms/blog/${id}`),
      create: (data: CreateCmsBlogInput) => request<CmsBlog>('/cms/blog', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: UpdateCmsBlogInput) => request<CmsBlog>(`/cms/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/blog/${id}`, { method: 'DELETE' }),
    },
    news: {
      getAll: () => request<CmsNews[]>('/cms/news'),
      getById: (id: string) => request<CmsNews>(`/cms/news/${id}`),
      create: (data: CreateCmsNewsInput) => request<CmsNews>('/cms/news', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: UpdateCmsNewsInput) => request<CmsNews>(`/cms/news/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/news/${id}`, { method: 'DELETE' }),
    },
    fasting: {
      getAll: () => request<CmsFasting[]>('/cms/fasting'),
      create: (data: CreateCmsFastingInput) => request<CmsFasting>('/cms/fasting', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/fasting/${id}`, { method: 'DELETE' }),
    },
    verses: {
      getAll: () => request<CmsVerse[]>('/cms/verses'),
      create: (data: CreateCmsVerseInput) => request<CmsVerse>('/cms/verses', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/verses/${id}`, { method: 'DELETE' }),
    },
    pages: {
      getAll: () => request<any[]>('/cms/pages'),
      create: (data: any) => request<any>('/cms/pages', { method: 'POST', body: JSON.stringify(data) }),
      update: (id: string, data: any) => request<boolean>(`/cms/pages/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/pages/${id}`, { method: 'DELETE' }),
    },
    eventMedia: {
      getAll: (eventId: string) => request<any[]>(`/cms/event-media/${eventId}`),
      uploadFile: (formData: FormData) => request<any>('/upload', { method: 'POST', body: formData }),
      create: (data: any) => request<any>('/cms/event-media/upload', { method: 'POST', body: JSON.stringify(data) }),
      delete: (id: string) => request<boolean>(`/cms/event-media/${id}`, { method: 'DELETE' }),
      batchDelete: (ids: string[]) => request<boolean>('/cms/event-media/batch-delete', { method: 'POST', body: JSON.stringify({ ids }) }),
    },
  },

  // Meetings
  meetings: {
    getAll: (params?: { class_id?: string }) => {
      const qs = new URLSearchParams(params as any).toString()
      return request<Meeting[]>(`/meetings${qs ? '?' + qs : ''}`)
    },
    create: (data: CreateMeetingInput) => request<Meeting>('/meetings', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/meetings/${id}`, { method: 'DELETE' }),
  },

  // Parent-Student Links
  links: {
    getAll: () => request<ParentLink[]>('/links'),
    getMyChildren: () => request<ParentLink[]>('/links/my-children'),
    create: (data: CreateLinkInput) => request<ParentLink>('/links', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => request<boolean>(`/links/${id}`, { method: 'DELETE' }),
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

export interface CreateUserInput {
  clerkId: string
  email?: string
  phone?: string
  firstName: string
  lastName: string
  role: 'student' | 'teacher' | 'parent' | 'admin' | 'assistant'
  avatarUrl?: string
}

export interface UpdateUserInput {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  role?: string
  avatarUrl?: string
  isActive?: boolean
}

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

// Classes
export interface Class {
  _id: string
  name: string
  grade: string
  teacherId?: string
  teacherName?: string
  academicYear: string
  createdAt: number
}

export interface CreateClassInput {
  name: string
  grade: string
  teacherId?: string
  academicYear: string
}

export interface UpdateClassInput {
  name?: string
  grade?: string
  teacherId?: string
  academicYear?: string
}

// Assignments
export interface Assignment {
  _id: string
  title: string
  description?: string
  classId: string
  className?: string
  teacherId: string
  teacherName?: string
  dueDate: string
  attachmentUrl?: string
  maxScore?: number
  createdAt: number
}

export interface CreateAssignmentInput {
  title: string
  description?: string
  classId: string
  dueDate: string
  attachmentUrl?: string
  maxScore?: number
}

export interface UpdateAssignmentInput {
  title?: string
  description?: string
  dueDate?: string
  attachmentUrl?: string
  maxScore?: number
}

// Submissions
export interface Submission {
  _id: string
  assignmentId: string
  studentId: string
  studentName?: string
  content?: string
  attachmentUrl?: string
  score?: number
  feedback?: string
  status: 'pending' | 'submitted' | 'graded'
  submittedAt?: number
  gradedAt?: number
  createdAt: number
}

export interface CreateSubmissionInput {
  assignmentId: string
  content?: string
  attachmentUrl?: string
}

export interface GradeSubmissionInput {
  score: number
  feedback?: string
}

// Notes
export interface Note {
  _id: string
  title: string
  content: string
  classId: string
  className?: string
  teacherId: string
  teacherName?: string
  createdAt: number
}

export interface CreateNoteInput {
  title: string
  content: string
  classId: string
}

export interface UpdateNoteInput {
  title?: string
  content?: string
}

// Schedules
export interface Schedule {
  _id: string
  title: string
  description?: string
  classId: string
  className?: string
  teacherId: string
  teacherName?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  response?: 'accepted' | 'declined' | 'pending'
  createdAt: number
}

export interface CreateScheduleInput {
  title: string
  description?: string
  classId: string
  date: string
  startTime: string
  endTime: string
  location?: string
}

export interface RespondScheduleInput {
  response: 'accepted' | 'declined'
}

// Attendance
export interface AttendanceRecord {
  _id: string
  scheduleId: string
  studentId: string
  studentName?: string
  status: 'present' | 'absent' | 'late' | 'excused'
  date: string
  createdAt: number
}

export interface MarkAttendanceInput {
  scheduleId: string
  records: Array<{ studentId: string; status: 'present' | 'absent' | 'late' | 'excused' }>
}

// Notifications
export interface Notification {
  _id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: number
}

// CMS Events
export interface CmsEvent {
  _id: string
  title: string
  description: string
  date: string
  location?: string
  imageUrl?: string
  createdAt: number
}

export interface CreateCmsEventInput {
  title: string
  description: string
  date: string
  location?: string
  imageUrl?: string
}

export interface UpdateCmsEventInput {
  title?: string
  description?: string
  date?: string
  location?: string
  imageUrl?: string
}

// CMS Blog
export interface CmsBlog {
  _id: string
  title: string
  content: string
  authorId: string
  authorName?: string
  imageUrl?: string
  published: boolean
  createdAt: number
  updatedAt: number
}

export interface CreateCmsBlogInput {
  title: string
  content: string
  imageUrl?: string
  published?: boolean
}

export interface UpdateCmsBlogInput {
  title?: string
  content?: string
  imageUrl?: string
  published?: boolean
}

// CMS News
export interface CmsNews {
  _id: string
  title: string
  content: string
  authorId: string
  authorName?: string
  imageUrl?: string
  published: boolean
  createdAt: number
  updatedAt: number
}

export interface CreateCmsNewsInput {
  title: string
  content: string
  imageUrl?: string
  published?: boolean
}

export interface UpdateCmsNewsInput {
  title?: string
  content?: string
  imageUrl?: string
  published?: boolean
}

// CMS Fasting
export interface CmsFasting {
  _id: string
  title: string
  description: string
  startDate: string
  endDate: string
  createdAt: number
}

export interface CreateCmsFastingInput {
  title: string
  description: string
  startDate: string
  endDate: string
}

// CMS Verses
export interface CmsVerse {
  _id: string
  text: string
  reference: string
  createdAt: number
}

export interface CreateCmsVerseInput {
  text: string
  reference: string
}

// Meetings
export interface Meeting {
  _id: string
  title: string
  description?: string
  classId?: string
  date: string
  startTime: string
  endTime: string
  location?: string
  organizerId: string
  organizerName?: string
  createdAt: number
}

export interface CreateMeetingInput {
  title: string
  description?: string
  classId?: string
  date: string
  startTime: string
  endTime: string
  location?: string
}

// Parent-Student Links
export interface ParentLink {
  _id: string
  parentId: string
  parentName?: string
  studentId: string
  studentName?: string
  relationship: string
  createdAt: number
}

export interface CreateLinkInput {
  studentId: string
  relationship: string
}
