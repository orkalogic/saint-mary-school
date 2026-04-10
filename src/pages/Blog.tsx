// src/pages/Blog.tsx
import { useState, useEffect } from 'react'
import { api } from '../lib/api'

const C = { parchment: "#F5F0E8", navy: "#1B2D4F", gold: "#B8860B", text: "#2C2418", textMuted: "#7A7062" }

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.cms.blog.getAll().then(p => {
      setPosts((p || []).filter(post => post.category !== 'page').sort((a: any, b: any) => (b.published_at || b.created_at) - (a.published_at || a.created_at)))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.parchment, color: C.textMuted }}>Loading...</div>

  const categories = ['all', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))]
  const filtered = filter === 'all' ? posts : posts.filter(p => p.category === filter)

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', serif", background: C.parchment, minHeight: "100vh", paddingTop: 80 }}>
      <div style={{ background: `linear-gradient(135deg, ${C.navy}, #2C5282)`, padding: '60px 24px', textAlign: 'center', color: 'white' }}>
        <h1 style={{ fontSize: 42, marginBottom: 8 }}>Blog & Reflections</h1>
        <p style={{ fontSize: 18, opacity: 0.8 }}>Teachings, community news, and spiritual reflections</p>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
        {/* Category filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              padding: '6px 16px', borderRadius: 20, border: '1px solid',
              borderColor: filter === cat ? C.gold : '#D1D5DB',
              background: filter === cat ? C.gold : 'white',
              color: filter === cat ? 'white' : C.textMuted,
              cursor: 'pointer', fontSize: 13, fontWeight: 600, textTransform: 'capitalize',
            }}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: C.textMuted }}>No posts yet.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {filtered.map((post: any) => (
              <div key={post.id} style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} style={{ width: 200, minWidth: 200, aspectRatio: '4/3', objectFit: 'cover', borderRadius: 8 }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ padding: '3px 10px', borderRadius: 12, background: `${C.gold}15`, color: C.gold, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{post.category}</span>
                    {post.published_at && <span style={{ fontSize: 12, color: C.textMuted }}>{new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>}
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 600, color: C.navy, marginBottom: 8, lineHeight: 1.3 }}>{post.title}</h2>
                  {post.excerpt && <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.6, marginBottom: 12 }}>{post.excerpt}</p>}
                  {post.content && <p style={{ fontSize: 14, color: '#7A7062', lineHeight: 1.6 }}>{post.content.substring(0, 200)}{post.content.length > 200 ? '...' : ''}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
