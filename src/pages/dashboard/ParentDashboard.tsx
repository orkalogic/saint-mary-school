// src/pages/dashboard/ParentDashboard.tsx
import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useCurrentUser } from '../../hooks/useCurrentUser'

export default function ParentDashboard() {
  const { convexUser, isLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'children' | 'meetings' | 'announcements'>('children')
  const [children, setChildren] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])

  const tabs = [
    { key: 'children' as const, label: 'My Children' },
    { key: 'meetings' as const, label: 'Meetings' },
    { key: 'announcements' as const, label: 'Announcements' },
  ]

  useEffect(() => {
    if (convexUser?.role === 'parent') {
      api.links.getMyChildren().then(setChildren).catch(console.error)
      api.meetings.getAll().then(setMeetings).catch(console.error)
      api.cms.news.getAll().then(setNews).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || convexUser.role !== 'parent') {
    return <div style={{ padding: '120px 24px', textAlign: 'center' }}><h2 style={{ color: '#DC2626', fontSize: 24 }}>Access Denied</h2></div>
  }

  const renderChildren = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>My Children</h3>
      {children.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No children linked to your account yet. Please contact the school administrator.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {children.map(c => (
            <div key={c.student?.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>👤</span>
                <div>
                  <h4 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, margin: 0 }}>
                    {c.student?.first_name} {c.student?.last_name}
                  </h4>
                  <span style={{ fontSize: 13, color: '#6B7280' }}>Relationship: {c.relationship}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderMeetings = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Parent Meetings</h3>
      {meetings.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No upcoming meetings scheduled.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {meetings.map(m => {
            const daysUntil = Math.ceil((new Date(m.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <div key={m.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h4 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{m.title}</h4>
                    {m.description && <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 4 }}>{m.description}</p>}
                    <div style={{ display: 'flex', gap: 12, fontSize: 13, color: '#9CA3AF' }}>
                      <span>{new Date(m.date).toLocaleDateString()}</span>
                      <span>{m.start_time} – {m.end_time}</span>
                      {m.location && <span>📍 {m.location}</span>}
                    </div>
                  </div>
                  <span style={{ padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: daysUntil <= 1 ? '#FEE2E2' : daysUntil <= 3 ? '#FEF3C7' : '#D1FAE5', color: daysUntil <= 1 ? '#991B1B' : daysUntil <= 3 ? '#92400E' : '#065F46' }}>
                    {daysUntil <= 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderAnnouncements = () => (
    <div>
      <h3 style={{ color: '#1E3A5F', fontSize: 18, marginBottom: 16, fontWeight: 600 }}>Announcements</h3>
      {news.length === 0 ? (
        <p style={{ color: '#6B7280' }}>No announcements yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {news.map(n => (
            <div key={n.id} style={{ padding: 20, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
              <h4 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{n.title}</h4>
              <p style={{ color: '#6B7280', fontSize: 14, whiteSpace: 'pre-wrap', marginBottom: 8 }}>{n.content}</p>
              <span style={{ fontSize: 13, color: '#9CA3AF' }}>
                {n.published_at ? new Date(n.published_at).toLocaleDateString() : new Date(n.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>Parent Dashboard</h2>
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

      {activeTab === 'children' && renderChildren()}
      {activeTab === 'meetings' && renderMeetings()}
      {activeTab === 'announcements' && renderAnnouncements()}
    </div>
  )
}
