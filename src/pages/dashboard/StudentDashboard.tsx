// src/pages/dashboard/StudentDashboard.tsx
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function StudentDashboard() {
  const { convexUser, isLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'assignments' | 'notes' | 'schedule' | 'grades'>('assignments')
  const [assignments, setAssignments] = useState<any[]>([])
  const [notes, setNotes] = useState<any[]>([])
  const [schedules, setSchedules] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null)
  const [submissionText, setSubmissionText] = useState('')
  const [newNote, setNewNote] = useState({ title: '', content: '' })
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [loading, setLoading] = useState(false)

  const tabs = [
    { key: 'assignments' as const, label: 'Assignments' },
    { key: 'notes' as const, label: 'My Notes' },
    { key: 'schedule' as const, label: 'Schedule' },
    { key: 'grades' as const, label: 'Grades' },
  ]

  useEffect(() => {
    if (convexUser?.role === 'student') {
      api.assignments.getAll().then(setAssignments).catch(console.error)
      api.notes.getAll().then(setNotes).catch(console.error)
      api.schedules.getAll().then(setSchedules).catch(console.error)
      api.submissions.getAll().then(setSubmissions).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || convexUser.role !== 'student') {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}><h2 style={{ color: '#DC2626', fontSize: 24 }}>Access Denied</h2></div>
  }

  const handleSubmitAssignment = async () => {
    if (!selectedAssignment || !submissionText.trim()) return
    setLoading(true)
    try {
      await api.submissions.submit({ assignmentId: selectedAssignment.id, content: submissionText })
      setSubmissionText('')
      setSelectedAssignment(null)
      api.submissions.getAll().then(setSubmissions)
    } catch (err) { alert('Failed to submit') } finally { setLoading(false) }
  }

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return
    setLoading(true)
    try {
      await api.notes.create(newNote as any)
      setNewNote({ title: '', content: '' })
      setShowNoteForm(false)
      api.notes.getAll().then(setNotes)
    } catch (err) { alert('Failed to create note') } finally { setLoading(false) }
  }

  const handleDeleteNote = async (id: string) => {
    await api.notes.delete(id)
    api.notes.getAll().then(setNotes)
  }

  const renderAssignments = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Assignments</h3>
      {assignments.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No assignments yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {assignments.map(a => (
            <div key={a.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{a.title}</h4>
                  <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 8 }}>{a.description}</p>
                  <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#9CA3AF' }}>
                    <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>
                    <span>Status: {a.status}</span>
                  </div>
                </div>
                <button onClick={() => setSelectedAssignment(a)} style={{ padding: '6px 16px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>
                  View & Submit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAssignment && (
        <div style={{ marginTop: 24, padding: 24, borderRadius: 10, border: '2px solid #C9A84C', background: '#FFFBEB' }}>
          <h4 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 8 }}>{selectedAssignment.title}</h4>
          {selectedAssignment.instructions && (
            <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 12, whiteSpace: 'pre-wrap' }}>{selectedAssignment.instructions}</p>
          )}
          <textarea
            value={submissionText}
            onChange={e => setSubmissionText(e.target.value)}
            placeholder="Write your answer here..."
            rows={6}
            style={{ width: '100%', padding: 12, borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 12 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleSubmitAssignment} disabled={loading} style={{ padding: '8px 20px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button onClick={() => { setSelectedAssignment(null); setSubmissionText('') }} style={{ padding: '8px 20px', borderRadius: 6, background: '#E5E7EB', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )

  const renderNotes = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ color: '#1E3A5F', fontSize: 18, fontWeight: 600, margin: 0 }}>My Notes</h3>
        <button onClick={() => setShowNoteForm(!showNoteForm)} style={{ padding: '6px 16px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 13 }}>
          + New Note
        </button>
      </div>

      {showNoteForm && (
        <div style={{ padding: 20, borderRadius: 10, border: '2px solid #C9A84C', background: '#FFFBEB', marginBottom: 16 }}>
          <input value={newNote.title} onChange={e => setNewNote(p => ({ ...p, title: e.target.value }))} placeholder="Note title..." style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' }} />
          <textarea value={newNote.content} onChange={e => setNewNote(p => ({ ...p, content: e.target.value }))} placeholder="Write your note..." rows={4} style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }} />
          <button onClick={handleCreateNote} disabled={loading} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Save Note'}
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No notes yet. Create your first note!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notes.map(n => (
            <div key={n.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: n.is_pinned ? '#FFFBEB' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ color: '#1E3A5F', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    {n.is_pinned && '📌 '}{n.title}
                  </h4>
                  <p style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'pre-wrap' }}>{n.content}</p>
                </div>
                <button onClick={() => handleDeleteNote(n.id)} style={{ padding: '4px 10px', borderRadius: 4, background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderSchedule = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>My Schedule</h3>
      {schedules.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No schedule information available.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {schedules.map(s => (
            <div key={s.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 600, color: '#1E3A5F' }}>{new Date(s.date).toLocaleDateString()}</span>
                  <span style={{ marginLeft: 12, color: '#6B7280' }}>{s.start_time} – {s.end_time}</span>
                </div>
                <span style={{ padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.status === 'accepted' ? '#D1FAE5' : s.status === 'rejected' ? '#FEE2E2' : '#FEF3C7', color: s.status === 'accepted' ? '#065F46' : s.status === 'rejected' ? '#991B1B' : '#92400E' }}>
                  {s.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderGrades = () => {
    const gradedSubmissions = submissions.filter(s => s.status === 'graded' || s.score)
    return (
      <div>
        <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Grades & Progress</h3>
        {gradedSubmissions.length === 0 ? (
          <p style={{ color: '#6B7280' }}>No grades yet. Keep working on your assignments!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gradedSubmissions.map(s => (
              <div key={s.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: '#1E3A5F' }}>Assignment #{s.assignment_id}</span>
                    <span style={{ marginLeft: 12, color: '#6B7280', fontSize: 13 }}>
                      Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 24, fontWeight: 700, color: s.score >= 80 ? '#10B981' : s.score >= 60 ? '#F59E0B' : '#DC2626' }}>
                      {s.score ?? '—'}
                    </span>
                    {s.feedback && <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{s.feedback}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>Student Dashboard</h2>
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

      {activeTab === 'assignments' && renderAssignments()}
      {activeTab === 'notes' && renderNotes()}
      {activeTab === 'schedule' && renderSchedule()}
      {activeTab === 'grades' && renderGrades()}
    </div>
  )
}
