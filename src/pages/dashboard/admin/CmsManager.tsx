// src/pages/dashboard/admin/CmsManager.tsx
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

export default function CmsManager() {
  const { convexUser, isLoading } = useCurrentUser()
  const [activeTab, setActiveTab] = useState<'events' | 'blog' | 'news' | 'fasting' | 'verses'>('events')
  const [events, setEvents] = useState<any[]>([])
  const [blog, setBlog] = useState<any[]>([])
  const [news, setNews] = useState<any[]>([])
  const [fasting, setFasting] = useState<any[]>([])
  const [verses, setVerses] = useState<any[]>([])
  const [form, setForm] = useState<Record<string, any>>({})
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (convexUser?.role === 'admin') {
      api.cms.events.getAll().then(setEvents).catch(console.error)
      api.cms.blog.getAll().then(setBlog).catch(console.error)
      api.cms.news.getAll().then(setNews).catch(console.error)
      api.cms.fasting.getAll().then(setFasting).catch(console.error)
      api.cms.verses.getAll().then(setVerses).catch(console.error)
    }
  }, [convexUser])

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!convexUser || !['admin', 'assistant'].includes(convexUser.role)) {
    return <div style={{ padding: 120, textAlign: 'center', color: '#DC2626' }}>Access Denied</div>
  }

  const tabs = [
    { key: 'events' as const, label: 'Events' },
    { key: 'blog' as const, label: 'Blog' },
    { key: 'news' as const, label: 'News' },
    { key: 'fasting' as const, label: 'Fasting' },
    { key: 'verses' as const, label: 'Verses' },
  ]

  const handleCreate = async () => {
    setLoading(true)
    try {
      const data = { ...form }
      if (activeTab === 'events') await api.cms.events.create(data as any)
      else if (activeTab === 'blog') await api.cms.blog.create(data as any)
      else if (activeTab === 'news') await api.cms.news.create(data as any)
      else if (activeTab === 'fasting') await api.cms.fasting.create(data as any)
      else if (activeTab === 'verses') await api.cms.verses.create(data as any)
      setForm({})
      setShowForm(false)
      refresh()
    } catch (err) { alert('Failed to create') } finally { setLoading(false) }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return
    try {
      if (activeTab === 'events') await api.cms.events.delete(id)
      else if (activeTab === 'blog') await api.cms.blog.delete(id)
      else if (activeTab === 'news') await api.cms.news.delete(id)
      else if (activeTab === 'fasting') await api.cms.fasting.delete(id)
      else if (activeTab === 'verses') await api.cms.verses.delete(id)
      refresh()
    } catch (err) { alert('Failed to delete') }
  }

  const refresh = () => {
    api.cms.events.getAll().then(setEvents).catch(console.error)
    api.cms.blog.getAll().then(setBlog).catch(console.error)
    api.cms.news.getAll().then(setNews).catch(console.error)
    api.cms.fasting.getAll().then(setFasting).catch(console.error)
    api.cms.verses.getAll().then(setVerses).catch(console.error)
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 8, boxSizing: 'border-box' as const }

  const renderForm = () => {
    if (!showForm) return null
    return (
      <div style={{ padding: 20, borderRadius: 10, border: '2px solid #C9A84C', background: '#FFFBEB', marginBottom: 16 }}>
        {activeTab === 'events' && (
          <>
            <input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
            <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description" rows={3} style={inputStyle} />
            <input type="date" value={form.date || ''} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={inputStyle} />
            <input value={form.start_time || ''} onChange={e => setForm(p => ({ ...p, start_time: e.target.value }))} placeholder="Start time (HH:MM)" style={inputStyle} />
            <input value={form.location || ''} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} placeholder="Location" style={inputStyle} />
          </>
        )}
        {activeTab === 'blog' && (
          <>
            <input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
            <textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Content" rows={5} style={inputStyle} />
            <input value={form.excerpt || ''} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} placeholder="Excerpt" style={inputStyle} />
            <input value={form.category || ''} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="Category" style={inputStyle} />
          </>
        )}
        {activeTab === 'news' && (
          <>
            <input value={form.title || ''} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Title" style={inputStyle} />
            <textarea value={form.content || ''} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} placeholder="Content" rows={4} style={inputStyle} />
          </>
        )}
        {activeTab === 'fasting' && (
          <>
            <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Name (e.g., Hudade)" style={inputStyle} />
            <input value={form.name_geez || ''} onChange={e => setForm(p => ({ ...p, name_geez: e.target.value }))} placeholder="Name in Ge'ez" style={inputStyle} />
            <input type="date" value={form.start_date || ''} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} style={inputStyle} />
            <input type="date" value={form.end_date || ''} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} style={inputStyle} />
            <input type="number" value={form.total_days || ''} onChange={e => setForm(p => ({ ...p, total_days: parseInt(e.target.value) }))} placeholder="Total days" style={inputStyle} />
            <input type="number" value={form.year || ''} onChange={e => setForm(p => ({ ...p, year: parseInt(e.target.value) }))} placeholder="Year" style={inputStyle} />
          </>
        )}
        {activeTab === 'verses' && (
          <>
            <textarea value={form.text || ''} onChange={e => setForm(p => ({ ...p, text: e.target.value }))} placeholder="Verse text" rows={3} style={inputStyle} />
            <input value={form.reference || ''} onChange={e => setForm(p => ({ ...p, reference: e.target.value }))} placeholder="Reference (e.g., Joshua 1:9)" style={inputStyle} />
          </>
        )}
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button onClick={handleCreate} disabled={loading} style={{ padding: '6px 16px', borderRadius: 6, background: '#10B981', color: 'white', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 600 }}>
            {loading ? 'Creating...' : 'Create'}
          </button>
          <button onClick={() => { setShowForm(false); setForm({}) }} style={{ padding: '6px 16px', borderRadius: 6, background: '#E5E7EB', border: 'none', cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    )
  }

  const renderList = () => {
    const items = activeTab === 'events' ? events : activeTab === 'blog' ? blog : activeTab === 'news' ? news : activeTab === 'fasting' ? fasting : verses
    if (items.length === 0) return <p style={{ color: '#6B7280' }}>Nothing here yet.</p>
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map((item: any) => (
          <div key={item.id} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h4 style={{ color: '#1E3A5F', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{item.title || item.name || item.text}</h4>
                {item.description && <p style={{ color: '#6B7280', fontSize: 14 }}>{item.description}</p>}
                {item.date && <span style={{ fontSize: 13, color: '#9CA3AF' }}>{new Date(item.date).toLocaleDateString()}</span>}
                {item.reference && <span style={{ fontSize: 13, color: '#9CA3AF' }}>{item.reference}</span>}
              </div>
              <button onClick={() => handleDelete(item.id)} style={{ padding: '4px 10px', borderRadius: 4, background: '#FEE2E2', color: '#DC2626', border: 'none', cursor: 'pointer', fontSize: 12 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28, margin: 0 }}>Content Manager</h2>
        <button onClick={() => setShowForm(true)} style={{ padding: '8px 20px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ New</button>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #E5E7EB' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setActiveTab(t.key); setShowForm(false) }} style={{
            padding: '10px 20px', border: 'none', background: 'transparent', cursor: 'pointer',
            color: activeTab === t.key ? '#1E3A5F' : '#6B7280',
            borderBottom: activeTab === t.key ? '2px solid #C9A84C' : '2px solid transparent',
            fontWeight: activeTab === t.key ? 600 : 400, fontSize: 14,
          }}>{t.label}</button>
        ))}
      </div>

      {renderForm()}
      {renderList()}
    </div>
  )
}
