// src/pages/dashboard/admin/AdminDashboard.tsx
import { useEffect, useState } from 'react'
import { api, type DashboardStats } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

export default function AdminDashboard() {
  const { convexUser, isLoading } = useCurrentUser()
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    if (convexUser?.role === 'admin') {
      api.users.getDashboardStats().then(setStats).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  if (!convexUser || convexUser.role !== 'admin') {
    return (
      <div style={{ padding: '120px 24px', textAlign: 'center' }}>
        <h2 style={{ color: '#DC2626', fontFamily: 'Cormorant Garamond, serif', fontSize: 24 }}>
          Access Denied
        </h2>
        <p style={{ color: '#6B7280', marginTop: 8 }}>You need admin privileges to view this page.</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Admin Dashboard
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Welcome back, {(convexUser as any).first_name}. Here is an overview of the school.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label="Students" value={stats?.totalStudents ?? 0} color="#3B82F6" />
        <StatCard label="Teachers" value={stats?.totalTeachers ?? 0} color="#10B981" />
        <StatCard label="Parents" value={stats?.totalParents ?? 0} color="#8B5CF6" />
        <StatCard label="Pending" value={stats?.pendingEnrollments ?? 0} color="#F59E0B" />
      </div>

      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 12, fontWeight: 600 }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <ActionLink href="/dashboard/admin/enrollments" label="Review Enrollments" desc="Approve or reject pending requests" />
        <ActionLink href="/dashboard/admin/users" label="Manage Users" desc="View and edit user roles" />
        <ActionLink href="/enroll/student" label="Enroll Student" desc="Add a new student" />
        <ActionLink href="/enroll/teacher" label="Add Teacher" desc="Register a new teacher" />
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
      <div style={{ fontSize: 36, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{label}</div>
    </div>
  )
}

function ActionLink({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <a href={href} style={{
      display: 'block', padding: 16, borderRadius: 8, border: '1px solid #E5E7EB',
      textDecoration: 'none',
    }}>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#1E3A5F' }}>{label}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{desc}</div>
    </a>
  )
}
