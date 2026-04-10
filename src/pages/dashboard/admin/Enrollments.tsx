// src/pages/dashboard/admin/Enrollments.tsx
import { useState, useEffect } from 'react'
import { api, type Enrollment } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

export default function Enrollments() {
  const { convexUser, isLoading } = useCurrentUser()
  const [enrollments, setEnrollments] = useState<Enrollment[] | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [filter, setFilter] = useState<string>('all')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (convexUser?.role === 'admin') {
      api.enrollments.enrollments.getAll().then(setEnrollments).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || convexUser.role !== 'admin') {
    return <div style={{ padding: 120, textAlign: 'center', color: '#DC2626' }}>Access Denied</div>
  }

  const filtered = (enrollments ?? []).filter((e) => filter === 'all' || e.status === filter)

  const handleApprove = async (enrollmentId: string, role: string) => {
    setProcessing(true)
    try {
      await api.enrollments.enrollments.approve(enrollmentId, role)
      setEnrollments(prev => (prev ?? []).map(e => e.id === enrollmentId ? { ...e, status: 'approved' as const } : e))
    } catch (err) {
      console.error('Failed to approve:', err)
      alert('Failed to approve enrollment.')
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (enrollmentId: string) => {
    setProcessing(true)
    try {
      await api.enrollments.enrollments.reject(enrollmentId, rejectReason || 'Not specified')
      setEnrollments(prev => (prev ?? []).map(e => e.id === enrollmentId ? { ...e, status: 'rejected' as const, rejection_reason: rejectReason } : e))
      setRejectingId(null)
      setRejectReason('')
    } catch (err) {
      console.error('Failed to reject:', err)
      alert('Failed to reject enrollment.')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Enrollment Requests
        </h2>
        <div style={{ display: 'flex', gap: 8 }}>
          {['all', 'pending', 'approved', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px', borderRadius: 6, fontSize: 13,
                border: '1px solid', borderColor: filter === f ? '#C9A84C' : '#D1D5DB',
                background: filter === f ? '#C9A84C' : 'white',
                color: filter === f ? '#1E3A5F' : '#6B7280',
                cursor: 'pointer', textTransform: 'capitalize' as const,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {enrollments === null ? (
        <p style={{ color: '#6B7280' }}>Loading...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#6B7280', textAlign: 'center', padding: 40 }}>No enrollment requests found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((e) => (
            <div key={e.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F' }}>
                      {e.first_name} {e.last_name}
                    </span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      textTransform: 'uppercase' as const,
                      background: e.role === 'student' ? '#DBEAFE' : '#D1FAE5',
                      color: e.role === 'student' ? '#1E40AF' : '#065F46',
                    }}>
                      {e.role}
                    </span>
                    <StatusBadge status={e.status} />
                  </div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
                    {e.email && <span>{e.email} | </span>}
                    {e.phone && <span>{e.phone} | </span>}
                    {e.grade && <span>Grade: {e.grade} | </span>}
                    {e.qualifications && <span>Qual: {e.qualifications}</span>}
                    {e.preferred_subjects && e.preferred_subjects.length > 0 && (
                      <span> Subjects: {e.preferred_subjects.join(', ')}</span>
                    )}
                  </div>
                  {e.parent_email && (
                    <div style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                      Parent: {e.parent_email} {e.parent_phone && `| ${e.parent_phone}`}
                    </div>
                  )}
                  {e.rejection_reason && (
                    <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>Reason: {e.rejection_reason}</div>
                  )}
                </div>

                {e.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {rejectingId === e.id ? (
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input
                          value={rejectReason}
                          onChange={(ev) => setRejectReason(ev.target.value)}
                          placeholder="Rejection reason..."
                          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13, width: 200 }}
                        />
                        <button onClick={() => handleReject(e.id)} disabled={processing} style={{ padding: '6px 12px', borderRadius: 6, background: '#DC2626', color: 'white', border: 'none', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer' }}>
                          {processing ? '...' : 'Confirm'}
                        </button>
                        <button onClick={() => { setRejectingId(null); setRejectReason('') }} disabled={processing} style={{ padding: '6px 12px', borderRadius: 6, background: '#E5E7EB', color: '#374151', border: 'none', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer' }}>
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleApprove(e.id, e.role)} disabled={processing} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                          {processing ? '...' : 'Approve'}
                        </button>
                        <button onClick={() => setRejectingId(e.id)} disabled={processing} style={{ padding: '6px 16px', borderRadius: 6, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', fontSize: 13, cursor: processing ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    pending: { bg: '#FEF3C7', text: '#92400E' },
    approved: { bg: '#D1FAE5', text: '#065F46' },
    rejected: { bg: '#FEE2E2', text: '#991B1B' },
  }
  const c = colors[status] || colors.pending
  return (
    <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: c.bg, color: c.text }}>
      {status}
    </span>
  )
}
