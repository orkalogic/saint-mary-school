// src/pages/EventDetail.tsx
import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'

const C = { parchment: "#F5F0E8", navy: "#1B2D4F", gold: "#B8860B", text: "#2C2418", textMuted: "#7A7062" }

export default function EventDetail() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<any>(null)
  const [media, setMedia] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(0)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.cms.events.getAll().catch(() => []),
      api.cms.eventMedia.getAll(id).catch(() => []),
    ]).then(([events, m]) => {
      const found = (events || []).find((e: any) => e.id === id)
      setEvent(found)
      setMedia(m || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.parchment, color: C.textMuted }}>Loading...</div>
  if (!event) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.parchment }}><div><h2 style={{ color: C.navy }}>Event not found</h2><Link to="/events" style={{ color: C.gold }}>← Back to Events</Link></div></div>

  const date = new Date(event.date)
  const images = media.filter(m => m.type === 'image')
  const videos = media.filter(m => m.type === 'video')

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", background: C.parchment, minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ position: 'relative', height: 400, overflow: 'hidden' }}>
        {event.cover_image
          ? <img src={event.cover_image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.navy}, #2C5282)` }} />
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }} />
        <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, padding: '0 24px', maxWidth: 900, margin: '0 auto', color: 'white' }}>
          <Link to="/events" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>← All Events</Link>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, marginTop: 12, marginBottom: 8 }}>{event.title}</h1>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 15 }}>
            <span>📅 {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
            {event.start_time && <span>🕐 {event.start_time}{event.end_time ? ' – ' + event.end_time : ''}</span>}
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {event.description && (
          <div style={{ marginBottom: 40 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 12 }}>About This Event</h2>
            <p style={{ fontSize: 16, color: C.text, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{event.description}</p>
          </div>
        )}

        {media.length > 0 && (
          <>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 20 }}>
              📸 Gallery ({images.length} photos{videos.length > 0 ? `, ${videos.length} videos` : ''})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, marginBottom: 40 }}>
              {media.map((m, i) => (
                m.type === 'image' ? (
                  <div key={m.id} onClick={() => { setLightboxIdx(i); setLightboxOpen(true) }} style={{ cursor: 'pointer', borderRadius: 8, overflow: 'hidden', position: 'relative', aspectRatio: m.display_order === 0 ? '16/9' : '1/1' }}>
                    <img src={m.url} alt={m.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')} onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')} />
                    {i === 0 && <span style={{ position: 'absolute', top: 8, left: 8, padding: '4px 10px', borderRadius: 12, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 11, fontWeight: 600 }}>Cover</span>}
                  </div>
                ) : (
                  <div key={m.id} style={{ borderRadius: 8, overflow: 'hidden', position: 'relative', aspectRatio: '16/9', background: '#000' }}>
                    <video src={m.url} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {m.title && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '8px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', color: 'white', fontSize: 13 }}>{m.title}</div>}
                  </div>
                )
              ))}
            </div>
          </>
        )}

        {media.length === 0 && (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMuted, border: '1px solid #E5E7EB', borderRadius: 12 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No photos or videos yet</p>
            <p style={{ fontSize: 14 }}>Media will appear here once uploaded in the CMS.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxOpen && images.length > 0 && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'white', fontSize: 32, cursor: 'pointer', zIndex: 501 }}>✕</button>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(p => Math.max(0, p - 1)) }} style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', padding: '12px 16px', borderRadius: 8 }}>‹</button>
          <button onClick={e => { e.stopPropagation(); setLightboxIdx(p => Math.min(images.length - 1, p + 1)) }} style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: 28, cursor: 'pointer', padding: '12px 16px', borderRadius: 8 }}>›</button>
          <img src={images[lightboxIdx]?.url} alt={images[lightboxIdx]?.title || ''} style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 4 }} onClick={e => e.stopPropagation()} />
          <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', color: 'white', fontSize: 14 }}>
            {images[lightboxIdx]?.title} — {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  )
}
