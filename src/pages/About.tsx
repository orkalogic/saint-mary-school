// src/pages/About.tsx
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

export default function About() {
  const [pages, setPages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.cms.pages.getAll().then(data => {
      setPages(data?.filter(p => p.title?.startsWith('about:')) || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ paddingTop: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>

  const contentMap: Record<string, any> = {}
  pages.forEach(p => {
    const section = p.title.replace('about:', '')
    contentMap[section] = p
  })

  const mission = contentMap.mission
  const history = contentMap.history
  const curriculum = contentMap.curriculum
  const community = contentMap.community

  if (!mission) {
    return <div style={{ paddingTop: 120, textAlign: 'center', color: '#6B7280' }}>About content not configured yet. Please add it in the CMS.</div>
  }

  return (
    <div style={{ paddingTop: 80 }}>
      <div style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #2C5282 100%)', padding: '80px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 42, marginBottom: 8 }}>About Our School</h1>
        <p style={{ fontSize: 20, color: '#C9A84C', fontFamily: 'Cormorant Garamond, serif' }}>ቅድስት ማርያም ቤተክርስቲያን ቤት ትምህርቲ</p>
        <p style={{ fontSize: 16, maxWidth: 600, margin: '16px auto 0', opacity: 0.9, lineHeight: 1.6 }}>
          Nurturing faith, knowledge, and character in the Eritrean Orthodox Tewahdo tradition.
        </p>
      </div>

      {mission && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 16 }}>{mission.title_display}</h2>
          <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>{mission.content}</p>
        </section>
      )}

      {history && (
        <section style={{ background: '#F9FAFB', padding: '60px 24px' }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 16 }}>{history.title_display}</h2>
            <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16, whiteSpace: 'pre-wrap' }}>{history.content}</p>
          </div>
        </section>
      )}

      {curriculum && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 32 }}>{curriculum.title_display}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {curriculum.content.split('\n').filter((l: string) => l.trim()).map((line: string) => {
              const parts = line.split(':')
              const title = parts[0]?.trim()
              const desc = parts.slice(1).join(':').trim()
              return (
                <div key={title} style={{ padding: 24, borderRadius: 10, border: '1px solid #E5E7EB', background: 'white' }}>
                  <h3 style={{ color: '#1E3A5F', fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{title}</h3>
                  <p style={{ color: '#6B7280', fontSize: 14, lineHeight: 1.6 }}>{desc}</p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {community && (
        <section style={{ maxWidth: 800, margin: '0 auto', padding: '60px 24px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, color: '#1E3A5F', marginBottom: 16 }}>{community.title_display}</h2>
          <p style={{ color: '#6B7280', lineHeight: 1.8, fontSize: 16, maxWidth: 600, margin: '0 auto', whiteSpace: 'pre-wrap' }}>{community.content}</p>
        </section>
      )}
    </div>
  )
}
