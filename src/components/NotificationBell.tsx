// src/components/NotificationBell.tsx
import { useState, useEffect } from 'react'
import { api } from '../lib/api'
import { useCurrentUser } from '../hooks/useCurrentUser'

export default function NotificationBell() {
  const { isSignedIn } = useCurrentUser()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const loading = false

  useEffect(() => {
    if (!isSignedIn) return
    api.notifications.getAll().then(setNotifications).catch(console.error)
    api.notifications.getUnreadCount().then(d => setUnreadCount(d.count)).catch(console.error)
  }, [isSignedIn])

  const handleMarkRead = async (id: string) => {
    await api.notifications.markRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const handleMarkAllRead = async () => {
    await api.notifications.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  if (!isSignedIn) return null

  const typeIcons: Record<string, string> = {
    enrollment_approved: '✅',
    enrollment_rejected: '❌',
    enrollment_pending: '📋',
    schedule_assigned: '📅',
    assignment_published: '📝',
    submission_graded: '📊',
    meeting_scheduled: '🤝',
    news_posted: '📰',
    general: '🔔',
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: 'relative',
          padding: '6px 10px',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          fontSize: 18,
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 2,
            background: '#DC2626',
            color: 'white',
            fontSize: 10,
            fontWeight: 700,
            borderRadius: '50%',
            width: 16,
            height: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 299 }} onClick={() => setOpen(false)} />
          <div style={{
            position: 'absolute',
            top: 40,
            right: 0,
            width: 360,
            maxHeight: 480,
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            border: '1px solid #E5E7EB',
            zIndex: 300,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#1E3A5F' }}>Notifications</h3>
              {unreadCount > 0 && (
                <button onClick={handleMarkAllRead} style={{ fontSize: 12, color: '#C9A84C', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Mark all read
                </button>
              )}
            </div>
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: '#6B7280' }}>No notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #F3F4F6',
                      background: n.is_read ? 'white' : '#FFFBEB',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: 12,
                      alignItems: 'start',
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcons[n.type] || '🔔'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: n.is_read ? 400 : 600, color: '#1E3A5F', marginBottom: 2 }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>{n.message}</div>
                      <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    {!n.is_read && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, marginTop: 6 }} />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
