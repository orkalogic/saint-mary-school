// src/pages/dashboard/ParentDashboard.tsx
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function ParentDashboard() {
  const { convexUser, isLoading } = useCurrentUser()

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  if (!convexUser) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Welcome!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12 }}>
          Your parent account is being set up. Please contact an administrator for access.
        </p>
      </div>
    )
  }

  if (convexUser.role !== 'parent') {
    return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Redirecting...</div>
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Parent Dashboard
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Welcome, {convexUser.firstName}. Track your children's progress and stay connected.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>My Children</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>View your children's progress</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Meetings</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>View upcoming parent meetings</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
        <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>Announcements</div>
          <div style={{ fontSize: 14, color: '#6B7280' }}>School news and updates</div>
          <div style={{ fontSize: 13, color: '#C9A84C', marginTop: 8 }}>Coming soon</div>
        </div>
      </div>
    </div>
  )
}
