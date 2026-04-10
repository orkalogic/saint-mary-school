// src/pages/dashboard/TeacherDashboard.tsx
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function TeacherDashboard() {
  const { convexUser, isLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'schedule' | 'assignments' | 'submissions' | 'attendance'>('schedule')
  const [schedules, setSchedules] = useState<any[]>([])
  const [assignments, setAssignments] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [showAssignmentForm, setShowAssignmentForm] = useState(false)
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', class_id: '' })
  const [gradingSubmission, setGradingSubmission] = useState<any | null>(null)
  const [gradeScore, setGradeScore] = useState('')
  const [gradeFeedback, setGradeFeedback] = useState('')
  const [loading, setLoading] = useState(false)

  const tabs = [
    { key: 'schedule' as const, label: 'My Schedule' },
    { key: 'assignments' as const, label: 'Assignments' },
    { key: 'submissions' as const, label: 'Submissions' },
    { key: 'attendance' as const, label: 'Attendance' },
  ]

  useEffect(() => {
    if (convexUser?.role === 'teacher') {
      api.schedules.getAll().then(setSchedules).catch(console.error)
      api.assignments.getAll().then(setAssignments).catch(console.error)
      api.submissions.getAll().then(setSubmissions).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || convexUser.role !== 'teacher') {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}><h2 style={{ color: '#DC2626', fontSize: 24 }}>Access Denied</h2></div>
  }

  const handleScheduleResponse = async (id: string, status: string) => {
    await api.schedules.respond(id, { status } as any)
    api.schedules.getAll().then(setSchedules)
  }

  const handleCreateAssignment = async () => {
    if (!newAssignment.title || !newAssignment.due_date) return
    setLoading(true)
    try {
      await api.assignments.create({ ...newAssignment, status: 'published' } as any)
      setNewAssignment({ title: '', description: '', due_date: '', class_id: '' })
      setShowAssignmentForm(false)
      api.assignments.getAll().then(setAssignments)
    } catch (err) { alert('Failed to create assignment') } finally { setLoading(false) }
  }

  const handleGrade = async () => {
    if (!gradingSubmission) return
    setLoading(true)
    try {
      await api.submissions.grade(gradingSubmission.id, {
        score: gradeScore ? Number(gradeScore) : (undefined as any),
        feedback: gradeFeedback,
        status: 'graded',
      } as any)
      setGradingSubmission(null)
      setGradeScore('')
      setGradeFeedback('')
      api.submissions.getAll().then(setSubmissions)
    } catch (err) { alert('Failed to grade') } finally { setLoading(false) }
  }

  const renderSchedule = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>My Schedule</h3>
      {schedules.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No schedules assigned yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {schedules.map(s => (
            <div key={s.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1E3A5F', fontSize: 16 }}>{new Date(s.date).toLocaleDateString()}</span>
                  <span style={{ marginLeft: 12, color: '#6B7280' }}>{s.start_time} – {s.end_time}</span>
                  <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>Status: {s.status}</div>
                  {s.rejection_reason && <div style={{ fontSize: 13, color: '#DC2626', marginTop: 4 }}>Reason: {s.rejection_reason}</div>}
                </div>
                {s.status === 'assigned' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleScheduleResponse(s.id, 'accepted')} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Accept</button>
                    <button onClick={() => handleScheduleResponse(s.id, 'rejected')} style={{ padding: '6px 16px', borderRadius: 6, background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Reject</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAssignments = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: '#1E3A5F', fontSize: 18, fontWeight: 600, margin: 0 }}>Assignments</h3>
        <button onClick={() => setShowAssignmentForm(!showAssignmentForm)} style={{ padding: '6px 16px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>
          + Create Assignment
        </button>
      </div>

      {showAssignmentForm && (
        <div style={{ padding: 20, borderRadius: 10, border: '2px solid #C9A84C', background: '#FFFBEB', marginBottom: 16 }}>
          <input value={newAssignment.title} onChange={e => setNewAssignment(p => ({ ...p, title: e.target.value }))} placeholder="Title" style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
          <textarea value={newAssignment.description} onChange={e => setNewAssignment(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, resize: 'vertical', marginBottom: 8, boxSizing: 'border-box' }} />
          <input value={newAssignment.due_date} onChange={e => setNewAssignment(p => ({ ...p, due_date: e.target.value }))} type="date" style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 8 }} />
          <button onClick={handleCreateAssignment} disabled={loading} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Publish Assignment'}
          </button>
        </div>
      )}

      {assignments.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No assignments created yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {assignments.map(a => (
            <div key={a.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ color: '#1E3A5F', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{a.title}</h4>
                  <p style={{ color: '#6B7280', fontSize: 14 }}>{a.description}</p>
                  <span style={{ fontSize: 13, color: '#9CA3AF' }}>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                </div>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: a.status === 'published' ? '#D1FAE5' : '#FEF3C7', color: a.status === 'published' ? '#065F46' : '#92400E' }}>{a.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSubmissions = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Submissions Inbox</h3>
      {submissions.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No submissions yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {submissions.map(s => (
            <div key={s.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1E3A5F' }}>Assignment #{s.assignment_id}</span>
                  <span style={{ marginLeft: 12, color: '#6B7280', fontSize: 13 }}>
                    Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.status === 'graded' ? '#D1FAE5' : '#FEF3C7', color: s.status === 'graded' ? '#065F46' : '#92400E' }}>{s.status}</span>
              </div>
              {s.content && <p style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 8, padding: 12, background: '#F9FAFB', borderRadius: 6 }}>{s.content}</p>}
              {gradingSubmission?.id === s.id ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 8 }}>
                  <input type="number" value={gradeScore} onChange={e => setGradeScore(e.target.value)} placeholder="Score" style={{ width: 80, padding: '6px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14 }} />
                  <input value={gradeFeedback} onChange={e => setGradeFeedback(e.target.value)} placeholder="Feedback..." style={{ flex: 1, padding: '6px 10px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14 }} />
                  <button onClick={handleGrade} disabled={loading} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>Grade</button>
                  <button onClick={() => setGradingSubmission(null)} style={{ padding: '6px 12px', borderRadius: 6, background: '#E5E7EB', border: 'none', cursor: 'pointer' }}>Cancel</button>
                </div>
              ) : s.status !== 'graded' ? (
                <button onClick={() => { setGradingSubmission(s); setGradeScore(''); setGradeFeedback('') }} style={{ padding: '6px 16px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Grade</button>
              ) : (
                <div style={{ fontSize: 13, color: '#6B7280' }}>Score: {s.score} | {s.feedback}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderAttendance = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Attendance</h3>
      <p style={{ color: '#6B7280' }}>Attendance tracking will be available soon.</p>
    </div>
  )

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>Teacher Dashboard</h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>Welcome, {(convexUser as any).first_name}!</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: activeTab === t.key ? '#1E3A5F' : '#6B7280',
            borderBottom: activeTab === t.key ? '2px solid #C9A84C' : '2px solid transparent',
            fontWeight: activeTab === t.key ? 600 : 400, fontSize: 14,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'submissions' && renderSubmissions()}
      {activeTab === 'attendance' && renderAttendance()}
    </div>
  )
}
