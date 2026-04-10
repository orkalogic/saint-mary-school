// src/pages/Contact.tsx
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function Contact() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.cms.pages.getAll().then(data => {
      setPages(data?.filter(p => p.title?.startsWith('contact:')) || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  const contentMap: Record<string, any> = {}
  pages.forEach(p => {
    const section = p.title.replace('contact:', '')
    contentMap[section] = p
  })

  const location = contentMap.location
  const serviceTimes = contentMap.service_times
  const contactInfo = contentMap.info

  if (!location && !serviceTimes && !contactInfo) {
    return <div style={{ paddingTop: 120, textAlign: 'center', color: '#6B7280' }}>Contact content not configured yet. Please add it in the CMS.</div>
  }

  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, marginBottom: 8 }}>Contact Us</h1>
        <p style={{ fontSize: 18, color: '#C9A84C' }}>We'd love to hear from you</p>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {location && (
            <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
              <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>{location.title_display}</h3>
              <p style={{ color: '#6B7280', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{location.content}</p>
            </div>
          )}
          {serviceTimes && (
            <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
              <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>{serviceTimes.title_display}</h3>
              <div style={{ color: '#6B7280', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {serviceTimes.content.split('\n').map((line: string, i: number) => {
                  const parts = line.split(':')
                  if (parts.length > 1) {
                    return <p key={i}><strong style={{ color: '#1E3A5F' }}>{parts[0].trim()}:</strong>{parts.slice(1).join(':').trim()}</p>
                  }
                  return <p key={i}>{line}</p>
                })}
              </div>
            </div>
          )}
          {contactInfo && (
            <div style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB' }}>
              <h3 style={{ color: '#1E3A5F', fontSize: 20, fontFamily: 'Cormorant Garamond, serif', marginBottom: 12 }}>{contactInfo.title_display}</h3>
              <p style={{ color: '#6B7280', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                {contactInfo.content.split('\n').map((line: string, i: number) => {
                  const parts = line.split(':')
                  if (parts.length > 1) {
                    return <span key={i}><strong style={{ color: '#1E3A5F' }}>{parts[0].trim()}:</strong>{parts.slice(1).join(':').trim()}<br /></span>
                  }
                  return <span key={i}>{line}<br /></span>
                })}
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: 48, padding: 40, borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: 16 }}>🗺️ Map will be embedded here</p>
        </div>
      </div>
    </div>
  )
}
