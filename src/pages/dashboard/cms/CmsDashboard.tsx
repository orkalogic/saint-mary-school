// src/pages/dashboard/cms/CmsDashboard.tsx
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useCurrentUser } from '../../../hooks/useCurrentUser'

const SECTIONS = [
  { key: 'hero', label: '🏠 Homepage Hero', group: 'Homepage' },
  { key: 'about', label: '📖 About Page', group: 'Pages' },
  { key: 'contact', label: '📞 Contact Page', group: 'Pages' },
  { key: 'events', label: '📅 Events', group: 'Content' },
  { key: 'blog', label: '✍️ Blog Posts', group: 'Content' },
  { key: 'news', label: '📰 Church News', group: 'Content' },
  { key: 'fasting', label: '⛪ Fasting Seasons', group: 'Content' },
  { key: 'verses', label: '📜 Verses of the Day', group: 'Content' },
  { key: 'settings', label: '⚙️ Site Settings', group: 'Settings' },
]

export default function CmsDashboard() {
  const { convexUser, isLoading } = useCurrentUser()
  const [activeSection, setActiveSection] = useState('hero')
  const loading = false
  const [saving, setSaving] = useState(false)

  // Data states
  const [heroData, setHeroData] = useState<any>({ title: '', subtitle: '', geetz_title: '', slides: [] })
  const [aboutPages, setAboutPages] = useState<any[]>([])
  const [contactPages, setContactPages] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [newsItems, setNewsItems] = useState<any[]>([])
  const [fastingSeasons, setFastingSeasons] = useState<any[]>([])
  const [verses, setVerses] = useState<any[]>([])
  const [settings, setSettings] = useState<any>({ church_name: '', email: '', phone: '', address: '', service_times: '' })

  // Form states for editing
  const [editItem, setEditItem] = useState<any | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  const isAdmin = convexUser?.role === 'admin' || convexUser?.role === 'assistant'

  // Load all data
  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [convexUser])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load About pages
      const pages = await api.cms.pages.getAll().catch(() => [])
      setAboutPages(pages?.filter(p => p.title?.startsWith('about:')) || [])
      setContactPages(pages?.filter(p => p.title?.startsWith('contact:')) || [])

      // Load Events
      const evts = await api.cms.events.getAll().catch(() => [])
      setEvents(evts || [])

      // Load Blog
      const blogs = await api.cms.blog.getAll().catch(() => [])
      setBlogPosts(blogs?.filter(p => p.category !== 'page') || [])

      // Load News
      const news = await api.cms.news.getAll().catch(() => [])
      setNewsItems(news || [])

      // Load Fasting
      const fasting = await api.cms.fasting.getAll().catch(() => [])
      setFastingSeasons(fasting || [])

      // Load Verses
      const vrs = await api.cms.verses.getAll().catch(() => [])
      setVerses(vrs || [])
    } catch (err) {
      console.error('Failed to load CMS data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (section: string) => {
    setSaving(true)
    try {
      if (section === 'events') {
        if (editItem?.id) {
          await api.cms.events.update(editItem.id, formData as any)
        } else {
          await api.cms.events.create(formData)
        }
      } else if (section === 'blog') {
        if (editItem?.id) {
          await api.cms.blog.update(editItem.id, formData as any)
        } else {
          await api.cms.blog.create(formData)
        }
      } else if (section === 'news') {
        if (editItem?.id) {
          await api.cms.news.update(editItem.id, formData as any)
        } else {
          await api.cms.news.create(formData)
        }
      } else if (section === 'fasting') {
        if (editItem?.id) {
          // Update: delete and re-insert (no PATCH endpoint)
          await api.cms.fasting.delete(editItem.id)
          await api.cms.fasting.create(formData)
        } else {
          await api.cms.fasting.create(formData)
        }
      } else if (section === 'verses') {
        if (editItem?.id) {
          await api.cms.verses.delete(editItem.id)
          await api.cms.verses.create(formData)
        } else {
          await api.cms.verses.create(formData)
        }
      } else if (section === 'about') {
        if (editItem?.id) {
          await api.cms.pages.update(editItem.id, formData as any)
        } else {
          formData.title = 'about:' + (formData.section || 'general')
          await api.cms.pages.create(formData)
        }
      } else if (section === 'contact') {
        if (editItem?.id) {
          await api.cms.pages.update(editItem.id, formData as any)
        } else {
          formData.title = 'contact:' + (formData.section || 'general')
          await api.cms.pages.create(formData)
        }
      }
      setEditItem(null)
      setFormData({})
      loadData()
    } catch (err) {
      console.error('Failed to save:', err)
      alert('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (section: string, id: string) => {
    if (!confirm('Delete this item permanently?')) return
    try {
      if (section === 'events') await api.cms.events.delete(id)
      else if (section === 'blog') await api.cms.blog.delete(id)
      else if (section === 'news') await api.cms.news.delete(id)
      else if (section === 'fasting') await api.cms.fasting.delete(id)
      else if (section === 'verses') await api.cms.verses.delete(id)
      else if (section === 'about' || section === 'contact') await api.cms.pages.delete(id)
      loadData()
    } catch (err) {
      alert('Failed to delete')
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }
  const btnPrimary: React.CSSProperties = { padding: '10px 24px', borderRadius: 8, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14 }
  const btnSecondary: React.CSSProperties = { padding: '10px 24px', borderRadius: 8, background: '#E5E7EB', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }
  const btnDanger: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, background: '#FEE2E2', color: '#DC2626', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 12 }

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!isAdmin) return <div style={{ padding: 120, textAlign: 'center', color: '#DC2626' }}><h2>Access Denied</h2></div>

  // ── Hero Section Editor ──
  const renderHero = () => (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>Homepage Hero</h2>
      <p style={{ color: '#6B7280', marginBottom: 24 }}>Manage the hero title, subtitle, and carousel on the homepage.</p>

      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 16 }}>Site Identity</h3>
        <label style={labelStyle}>Church Name</label>
        <input style={inputStyle} value={settings.church_name || 'Saint Mary Orthodox Church'} onChange={e => setSettings(p => ({ ...p, church_name: e.target.value }))} placeholder="Saint Mary Orthodox Church" />
        <label style={labelStyle}>Ge'ez Name</label>
        <input style={inputStyle} value="ቅድስት ማርያም ቤተክርስቲያን" onChange={e => setSettings(p => ({ ...p, geetz_name: e.target.value }))} placeholder="ቅድስት ማርያም ቤተክርስቲያን" />
        <label style={labelStyle}>Hero Tagline</label>
        <input style={inputStyle} value="Nurturing faith, knowledge, and character" onChange={e => setSettings(p => ({ ...p, hero_tagline: e.target.value }))} placeholder="Your tagline" />
        <button style={btnPrimary}>Save Site Identity</button>
      </div>

      <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 16 }}>Carousel Slides</h3>
        <p style={{ color: '#6B7280', fontSize: 14, marginBottom: 16 }}>Replace hero.png in /src/assets/ with your own images. Currently configured for 4 slides.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {['Kidan Yohannes', 'Timket', 'Palm Sunday', 'Feast of St. Mary'].map((name, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 8, border: '1px solid #E5E7EB', background: '#F9FAFB' }}>
              <div style={{ width: '100%', height: 100, borderRadius: 8, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, color: '#9CA3AF', fontSize: 13 }}>📷 Slide {i + 1}</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#1E3A5F' }}>{name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ── Generic CRUD List ──
  const renderList = (section: string, items: any[], fields: { key: string; label: string; type?: string }[]) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>
            {SECTIONS.find(s => s.key === section)?.label || section}
          </h2>
          <p style={{ color: '#6B7280' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={btnPrimary} onClick={() => { setEditItem({}); setFormData({}) }}>+ New</button>
      </div>

      {editItem && (
        <div style={{ padding: 24, borderRadius: 12, border: '2px solid #C9A84C', background: '#FFFBEB', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 16 }}>{editItem.id ? 'Edit Item' : 'New Item'}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
            {fields.map(f => (
              <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
                <label style={labelStyle}>{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                ) : f.type === 'date' ? (
                  <input type="date" style={inputStyle} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                ) : f.type === 'number' ? (
                  <input type="number" style={inputStyle} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))} />
                ) : (
                  <input style={inputStyle} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                )}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button style={btnPrimary} onClick={() => handleSave(section)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
            <button style={btnSecondary} onClick={() => { setEditItem(null); setFormData({}) }}>Cancel</button>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12 }}>
          No items yet. Click "+ New" to add one.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ padding: 20, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>{item.title_display || item.title || item.name || item.text}</h4>
                {item.description && <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>{item.description}</p>}
                {item.content && <p style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>{item.content}</p>}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                  {item.date && <span>📅 {new Date(item.date).toLocaleDateString()}</span>}
                  {item.start_date && <span>📅 {item.start_date} → {item.end_date}</span>}
                  {item.reference && <span>📖 {item.reference}</span>}
                  {item.is_active !== undefined && <span style={{ color: item.is_active ? '#10B981' : '#DC2626' }}>{item.is_active ? '● Active' : '○ Inactive'}</span>}
                  {item.is_published !== undefined && <span style={{ color: item.is_published ? '#10B981' : '#9CA3AF' }}>{item.is_published ? '● Published' : '○ Draft'}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button style={btnSecondary} onClick={() => { setEditItem(item); setFormData(item) }}>Edit</button>
                <button style={btnDanger} onClick={() => handleDelete(section, item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'hero': return renderHero()
      case 'about': return renderList('about', aboutPages, [
        { key: 'section', label: 'Section ID (e.g., mission)' },
        { key: 'title_display', label: 'Display Title' },
        { key: 'content', label: 'Content', type: 'textarea' },
      ])
      case 'contact': return renderList('contact', contactPages, [
        { key: 'section', label: 'Section ID (e.g., location)' },
        { key: 'title_display', label: 'Display Title' },
        { key: 'content', label: 'Content', type: 'textarea' },
      ])
      case 'events': return renderList('events', events, [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description', type: 'textarea' },
        { key: 'date', label: 'Date', type: 'date' },
        { key: 'start_time', label: 'Start Time' },
        { key: 'end_time', label: 'End Time' },
        { key: 'location', label: 'Location' },
        { key: 'category', label: 'Category' },
      ])
      case 'blog': return renderList('blog', blogPosts, [
        { key: 'title', label: 'Title' },
        { key: 'content', label: 'Content', type: 'textarea' },
        { key: 'excerpt', label: 'Excerpt', type: 'textarea' },
        { key: 'category', label: 'Category' },
      ])
      case 'news': return renderList('news', newsItems, [
        { key: 'title', label: 'Title' },
        { key: 'content', label: 'Content', type: 'textarea' },
        { key: 'excerpt', label: 'Excerpt' },
      ])
      case 'fasting': return renderList('fasting', fastingSeasons, [
        { key: 'name', label: 'Name' },
        { key: 'name_geez', label: 'Ge\'ez Name' },
        { key: 'start_date', label: 'Start Date', type: 'date' },
        { key: 'end_date', label: 'End Date', type: 'date' },
        { key: 'total_days', label: 'Total Days', type: 'number' },
        { key: 'year', label: 'Year', type: 'number' },
      ])
      case 'verses': return renderList('verses', verses, [
        { key: 'text', label: 'Verse Text', type: 'textarea' },
        { key: 'reference', label: 'Reference (e.g., John 3:16)' },
      ])
      case 'settings': return (
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>⚙️ Site Settings</h2>
          <p style={{ color: '#6B7280', marginBottom: 24 }}>Manage site-wide settings.</p>
          <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white' }}>
            <label style={labelStyle}>Church Name</label>
            <input style={inputStyle} value={settings.church_name || ''} onChange={e => setSettings(p => ({ ...p, church_name: e.target.value }))} />
            <label style={labelStyle}>Email</label>
            <input style={inputStyle} value={settings.email || 'school@saintmarychurch.org'} onChange={e => setSettings(p => ({ ...p, email: e.target.value }))} />
            <label style={labelStyle}>Phone</label>
            <input style={inputStyle} value={settings.phone || '(555) 123-4567'} onChange={e => setSettings(p => ({ ...p, phone: e.target.value }))} />
            <label style={labelStyle}>Address</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} value={settings.address || ''} onChange={e => setSettings(p => ({ ...p, address: e.target.value }))} />
            <label style={labelStyle}>Service Times</label>
            <textarea style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }} value={settings.service_times || 'Sunday Liturgy: 8:00 AM – 11:00 AM\nSunday School: 9:00 AM – 10:30 AM\nWednesday Bible Study: 6:00 PM – 7:30 PM'} onChange={e => setSettings(p => ({ ...p, service_times: e.target.value }))} />
            <button style={btnPrimary}>Save Settings</button>
          </div>
        </div>
      )
      default: return <div>Select a section from the sidebar</div>
    }
  }

  const currentGroup = SECTIONS.find(s => s.key === activeSection)?.group || ''
  const groupedSections = SECTIONS.reduce((acc, s) => {
    if (!acc[s.group]) acc[s.group] = []
    acc[s.group].push(s)
    return acc
  }, {} as Record<string, typeof SECTIONS>)

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 56 }}>
      {/* Sidebar */}
      <div style={{ width: 260, borderRight: '1px solid #E5E7EB', background: '#1E3A5F', color: 'white', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📋 CMS Dashboard</h2>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0' }}>Content Management System</p>
        </div>
        {Object.entries(groupedSections).map(([group, items]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ padding: '0 20px', fontSize: 11, fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{group}</div>
            {items.map(item => (
              <button
                key={item.key}
                onClick={() => { setActiveSection(item.key); setEditItem(null) }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '10px 20px',
                  border: 'none',
                  background: activeSection === item.key ? 'rgba(201,168,76,0.2)' : 'transparent',
                  color: activeSection === item.key ? '#C9A84C' : 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: 14,
                  fontWeight: activeSection === item.key ? 600 : 400,
                  borderLeft: activeSection === item.key ? '3px solid #C9A84C' : '3px solid transparent',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: 32, background: '#F3F4F6', minHeight: '100vh', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>Loading content...</div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}
