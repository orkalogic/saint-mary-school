// src/pages/dashboard/admin/Users.tsx
import { useState, useEffect } from 'react'
import { api, type User } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

export default function Users() {
  const { convexUser, isLoading } = useCurrentUser()
  const [users, setUsers] = useState<User[] | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (convexUser?.role === 'admin') {
      api.users.getAllUsers().then(setUsers).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || convexUser.role !== 'admin') {
    return <div style={{ padding: 120, textAlign: 'center', color: '#DC2626' }}>Access Denied</div>
  }

  const roles = ['student', 'teacher', 'parent', 'admin', 'assistant'] as const

  const handleRoleChange = async (userId: string, role: string) => {
    setProcessing(true)
    try {
      await api.users.updateUserRole(userId, role)
      setUsers(prev => prev?.map(u => u._id === userId ? { ...u, role: role as User['role'] } : u))
    } catch (err) {
      console.error('Failed to update role:', err)
      alert('Failed to update user role.')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleActive = async (userId: string) => {
    setProcessing(true)
    try {
      await api.users.toggleUserActive(userId)
      setUsers(prev => prev?.map(u => u._id === userId ? { ...u, isActive: !u.isActive } : u))
    } catch (err) {
      console.error('Failed to toggle user:', err)
      alert('Failed to toggle user status.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, marginBottom: 24 }}>
        Manage Users
      </h2>

      {users === null ? (
        <p style={{ color: '#6B7280' }}>Loading...</p>
      ) : users.length === 0 ? (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>No users found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((u) => (
            <div key={u._id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderRadius: 8, border: '1px solid #E5E7EB',
              background: u.isActive ? 'white' : '#F9FAFB', opacity: u.isActive ? 1 : 0.6,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#1E3A5F' }}>{u.firstName} {u.lastName}</span>
                  {!u.isActive && (
                    <span style={{ fontSize: 11, color: '#DC2626', background: '#FEE2E2', padding: '1px 8px', borderRadius: 10 }}>INACTIVE</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  {u.email || 'No email'} | Joined {new Date(u.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u._id, e.target.value)}
                  disabled={processing}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13, textTransform: 'capitalize' as const, cursor: processing ? 'not-allowed' : 'pointer' }}
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => handleToggleActive(u._id)}
                  disabled={processing}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid #D1D5DB',
                    background: 'white', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer',
                    color: u.isActive ? '#DC2626' : '#10B981',
                  }}
                >
                  {processing ? '...' : u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
