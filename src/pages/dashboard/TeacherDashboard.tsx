// src/pages/dashboard/TeacherDashboard.tsx
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function TeacherDashboard() {
  const { convexUser, isLoading } = useCurrentUser()

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  if (!convexUser) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Welcome!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12, marginBottom: 24 }}>
          Please submit a teacher application to get started.
        </p>
        <a href="/enroll/teacher" style={{
          display: 'inline-block', padding: '10px 24px', borderRadius: 8,
          background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, textDecoration: 'none',
        }}>
          Apply as Teacher
        </a>
      </div>
    )
  }

  if (convexUser.role !== 'teacher') {
    return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Redirecting...</div>
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Teacher Dashboard
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Welcome, {convexUser.firstName}. Manage your classes and assignments here.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>My Schedule</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>View and manage your teaching schedule</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Assignments</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Create and manage homework assignments</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Submissions</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Review and grade student work</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Attendance</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Mark attendance for your classes</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
      </div>
    </div>
  )
}
