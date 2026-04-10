// src/pages/dashboard/admin/Users.tsx
import { useState, useEffect } from 'react'
import { api, type User } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

export default function Users() {
  const { convexUser, isLoading } = useCurrentUser()
  const [users, setUsers] = useState<any[] | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (convexUser?.role === 'admin') {
      api.users.users.getAll().then(setUsers).catch(console.error)
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
      await api.users.users.updateRole(userId, role)
      setUsers(prev => (prev ?? []).map(u => u.id === userId ? { ...u, role } : u))
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
      await api.users.users.toggleActive(userId)
      setUsers(prev => (prev ?? []).map(u => u.id === userId ? { ...u, is_active: !u.is_active } : u))
    } catch (err) {
      console.error('Failed to toggle user:', err)
      alert('Failed to toggle user status.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async (userId: string) => {
    if (!confirm('Delete this user permanently?')) return
    setProcessing(true)
    try {
      await api.users.users.delete(userId)
      setUsers(prev => (prev ?? []).filter(u => u.id !== userId))
    } catch (err) {
      console.error('Failed to delete user:', err)
      alert('Failed to delete user.')
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
            <div key={u.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 20px', borderRadius: 8, border: '1px solid #E5E7EB',
              background: u.is_active ? 'white' : '#F9FAFB', opacity: u.is_active ? 1 : 0.6,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: '#1E3A5F' }}>{u.first_name} {u.last_name}</span>
                  {!u.is_active && (
                    <span style={{ fontSize: 11, color: '#DC2626', background: '#FEE2E2', padding: '1px 8px', borderRadius: 10 }}>INACTIVE</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  {u.email || 'No email'} | Joined {new Date(u.created_at).toLocaleDateString()}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  disabled={processing}
                  style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13, textTransform: 'capitalize' as const, cursor: processing ? 'not-allowed' : 'pointer' }}
                >
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => handleToggleActive(u.id)}
                  disabled={processing}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid #D1D5DB',
                    background: 'white', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer',
                    color: u.is_active ? '#DC2626' : '#10B981',
                  }}
                >
                  {processing ? '...' : u.is_active ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => handleDelete(u.id)}
                  disabled={processing}
                  style={{
                    padding: '4px 12px', borderRadius: 6, border: '1px solid #DC2626',
                    background: '#FEE2E2', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer',
                    color: '#DC2626',
                  }}
                >
                  {processing ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
