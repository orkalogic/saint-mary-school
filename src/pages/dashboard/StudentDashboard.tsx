// src/pages/dashboard/StudentDashboard.tsx
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function StudentDashboard() {
  const { convexUser, isLoading } = useCurrentUser()

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  if (!convexUser) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Welcome to Saint Mary Church School!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12, marginBottom: 24 }}>
          Your account is being set up. Please submit an enrollment request if you haven't already.
        </p>
        <a href="/enroll/student" style={{
          display: 'inline-block',
          padding: '10px 24px',
          borderRadius: 8,
          background: '#C9A84C',
          color: '#1E3A5F',
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          Enroll as Student
        </a>
      </div>
    )
  }

  if (convexUser.role !== 'student') {
    return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Redirecting to your dashboard...</div>
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Welcome, {convexUser.firstName}!
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Your student dashboard. Check your assignments, notes, and schedule below.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Assignments</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>View and submit your homework</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>My Notes</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Keep track of your study notes</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Schedule</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>View your class schedule</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Grades</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>Check your grades and feedback</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
      </div>
    </div>
  )
}
