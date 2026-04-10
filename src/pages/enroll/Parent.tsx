// src/pages/enroll/Parent.tsx
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function ParentRegistration() {
  const { convexUser, isLoading, isSignedIn } = useCurrentUser()

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  return (
    <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 12 }}>
        Parent Registration
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>
        Parent accounts are created by administrators when linking children to their parents.
        If your child is already enrolled, please contact the school administrator to get your parent account set up.
      </p>

      {!isSignedIn ? (
        <p style={{ color: '#92400E', background: '#FEF3C7', padding: 16, borderRadius: 8 }}>
          Please <a href="/auth/sign-in" style={{ fontWeight: 600, color: '#92400E' }}>sign in</a> first, then contact an administrator to link your parent account.
        </p>
      ) : convexUser ? (
        <div style={{ padding: 20, borderRadius: 8, border: '1px solid #D1FAE5', background: '#F0FDF4' }}>
          <p style={{ color: '#065F46', fontWeight: 600 }}>
            You are signed in as {convexUser.firstName} {convexUser.lastName} ({convexUser.role})
          </p>
          <p style={{ color: '#065F46', fontSize: 14, marginTop: 8 }}>
            Contact an administrator to set up your parent access.
          </p>
        </div>
      ) : (
        <p style={{ color: '#6B7280' }}>
          Your account is being synced. Please refresh the page in a moment.
        </p>
      )}
    </div>
  )
}
