// src/pages/Events.tsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../lib/api'

const C = {
  parchment: "#F5F0E8", navy: "#1B2D4F", gold: "#B8860B", text: "#2C2418", textMuted: "#7A7062",
  terracotta: "#C4613A", cream: "#EDE7D9",
}

export default function Events() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [mediaCache, setMediaCache] = useState<Record<string, number>>({})

  useEffect(() => {
    api.cms.events.getAll().then(e => {
      const sorted = (e || []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      setEvents(sorted)
      sorted.forEach(ev => {
        api.cms.eventMedia.getAll(ev.id).then(items => {
          setMediaCache(prev => ({ ...prev, [ev.id]: (items || []).length }))
        }).catch(() => {})
      })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.parchment, color: C.textMuted }}>Loading...</div>

  const today = new Date()
  const upcoming = events.filter((e: any) => new Date(e.date) >= today)
  const past = events.filter((e: any) => new Date(e.date) < today)

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", background: C.parchment, minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2C5282)`, padding: '60px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, marginBottom: 8 }}>All Events</h1>
        <p style={{ fontSize: 18, opacity: 0.8 }}>Church services, celebrations, and community gatherings</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {upcoming.length === 0 && past.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMuted }}>No events scheduled. Check back soon!</div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div style={{ marginBottom: 48 }}>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 20, paddingBottom: 8, borderBottom: `2px solid ${C.gold}` }}>Upcoming Events</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {upcoming.map((ev: any) => <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none' }}><EventCard ev={ev} mediaCount={mediaCache[ev.id] || 0} /></Link>)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 style={{ fontSize: 24, fontWeight: 700, color: C.textMuted, marginBottom: 20, paddingBottom: 8, borderBottom: '2px solid #D1D5DB' }}>Past Events</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20, opacity: 0.6 }}>
                  {past.map((ev: any) => <Link key={ev.id} to={`/events/${ev.id}`} style={{ textDecoration: 'none' }}><EventCard ev={ev} past mediaCount={mediaCache[ev.id] || 0} /></Link>)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function EventCard({ ev, past, mediaCount }: { ev: any; past?: boolean; mediaCount?: number }) {
  const date = new Date(ev.date)
  return (
    <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: past ? '#F9FAFB' : 'white', position: 'relative' }}>
      {ev.cover_image && (
        <img src={ev.cover_image} alt={ev.title} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, marginBottom: 16 }} />
      )}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ width: 56, minWidth: 56, textAlign: 'center', padding: '10px 0', background: past ? '#9CA3AF' : 'linear-gradient(135deg, #1B2D4F, #0E1A30)', borderRadius: 10, color: 'white' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7 }}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.1 }}>{date.getDate()}</div>
          <div style={{ fontSize: 10, opacity: 0.6 }}>{date.toLocaleDateString('en-US', { month: 'short' })}</div>
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: '#1B2D4F', marginBottom: 8, lineHeight: 1.3 }}>{ev.title}</h3>
          {ev.description && (() => {
            const words = ev.description.split(' ')
            let truncated = ''
            for (const word of words) {
              if ((truncated + ' ' + word).length <= 140) {
                truncated += (truncated ? ' ' : '') + word
              } else break
            }
            const showDots = truncated.length < ev.description.length
            return <p style={{ fontSize: 14, color: '#7A7062', marginBottom: 8, lineHeight: 1.5 }}>{truncated}{showDots ? '…' : ''}</p>
          })()}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13, color: '#7A7062' }}>
            {ev.start_time && <span>🕐 {ev.start_time}{ev.end_time ? ' – ' + ev.end_time : ''}</span>}
            {ev.location && <span>📍 {ev.location}</span>}
            {ev.category && <span>🏷️ {ev.category}</span>}
          </div>
        </div>
      </div>

      {/* Album icon - absolute positioned in bottom-right corner */}
      {mediaCount ? (
        <Link to={`/events/${ev.id}`} style={{
          position: 'absolute',
          bottom: 30,
          right: 24,
          textDecoration: 'none',
        }}>
          <div style={{ position: 'relative', width: 58, height: 50 }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: 50, height: 40, background: '#C9A84C', borderRadius: 6, transform: 'rotate(8deg)', boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }} />
            <div style={{ position: 'absolute', top: 3, right: 5, width: 50, height: 40, background: 'white', borderRadius: 6, transform: 'rotate(-4deg)', boxShadow: '0 3px 10px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 18 }}>📷</span>
            </div>
            <div style={{ position: 'absolute', bottom: -3, left: -2, width: 24, height: 24, borderRadius: '50%', background: '#DC2626', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
              {mediaCount}
            </div>
          </div>
        </Link>
      ) : null}
    </div>
  )
}
