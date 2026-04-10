// src/pages/dashboard/cms/CmsDashboard.tsx
import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { supabase } from '../../../lib/supabase'
import { useCurrentUser } from '../../../hooks/useCurrentUser'
import ImageUpload from '../../../components/ImageUpload'
import MediaLibrary from '../../../components/MediaLibrary'

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
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aboutPages, setAboutPages] = useState<any[]>([])
  const [contactPages, setContactPages] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [blogPosts, setBlogPosts] = useState<any[]>([])
  const [newsItems, setNewsItems] = useState<any[]>([])
  const [fastingSeasons, setFastingSeasons] = useState<any[]>([])
  const [verses, setVerses] = useState<any[]>([])
  const [settings] = useState<any>({})
  const [editItem, setEditItem] = useState<any | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [showMediaLib, setShowMediaLib] = useState(false)
  const [eventMediaMode, setEventMediaMode] = useState<string | null>(null)
  const [eventMediaItems, setEventMediaItems] = useState<any[]>([])

  const isAdmin = convexUser?.role === 'admin' || convexUser?.role === 'assistant'

  useEffect(() => {
    if (!isAdmin) return
    loadData()
  }, [convexUser])

  const loadData = async () => {
    setLoading(true)
    try {
      const pages = await api.cms.pages.getAll().catch(() => [])
      setAboutPages(pages?.filter((p: any) => p.title?.startsWith('about:')) || [])
      setContactPages(pages?.filter((p: any) => p.title?.startsWith('contact:')) || [])
      const evts = await api.cms.events.getAll().catch(() => [])
      setEvents(evts || [])
      const blogs = await api.cms.blog.getAll().catch(() => [])
      setBlogPosts(blogs?.filter((p: any) => p.category !== 'page') || [])
      const news = await api.cms.news.getAll().catch(() => [])
      setNewsItems(news || [])
      const fasting = await api.cms.fasting.getAll().catch(() => [])
      setFastingSeasons(fasting || [])
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
      const fd = formData as any
      if (section === 'events') {
        if (editItem?.id) await api.cms.events.update(editItem.id, fd)
        else await api.cms.events.create(fd)
      } else if (section === 'blog') {
        if (editItem?.id) await api.cms.blog.update(editItem.id, fd)
        else await api.cms.blog.create(fd)
      } else if (section === 'news') {
        if (editItem?.id) await api.cms.news.update(editItem.id, fd)
        else await api.cms.news.create(fd)
      } else if (section === 'fasting') {
        if (editItem?.id) { await api.cms.fasting.delete(editItem.id); await api.cms.fasting.create(fd) }
        else await api.cms.fasting.create(fd)
      } else if (section === 'verses') {
        if (editItem?.id) { await api.cms.verses.delete(editItem.id); await api.cms.verses.create(fd) }
        else await api.cms.verses.create(fd)
      } else if (section === 'about' || section === 'contact') {
        if (editItem?.id) await api.cms.pages.update(editItem.id, fd)
        else {
          fd.title = section + ':' + (fd.section || 'general')
          await api.cms.pages.create(fd)
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
    if (!confirm('Delete this item?')) return
    try {
      if (section === 'events') await api.cms.events.delete(id)
      else if (section === 'blog') await api.cms.blog.delete(id)
      else if (section === 'news') await api.cms.news.delete(id)
      else if (section === 'fasting') await api.cms.fasting.delete(id)
      else if (section === 'verses') await api.cms.verses.delete(id)
      else await api.cms.pages.delete(id)
      loadData()
    } catch {
      alert('Failed to delete')
    }
  }

  const loadEventMedia = async (eventId: string) => {
    const items = await api.cms.eventMedia.getAll(eventId).catch(() => [])
    setEventMediaItems(items || [])
    setEventMediaMode(eventId)
  }

  const handleMediaUpload = async (eventId: string, files: FileList) => {
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith('video')
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `events/${eventId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await supabase.storage.from('cms-media').upload(path, file, { contentType: file.type })
      if (uploadError) { console.error('Upload failed:', uploadError); continue }
      const { data: { publicUrl } } = supabase.storage.from('cms-media').getPublicUrl(path).data
      await api.cms.eventMedia.create({ event_id: eventId, type: isVideo ? 'video' : 'image', url: publicUrl, title: file.name.split('.')[0] }).catch(console.error)
    }
    loadEventMedia(eventId)
  }

  const handleDeleteMedia = async (id: string, eventId: string) => {
    await api.cms.eventMedia.delete(id).catch(console.error)
    loadEventMedia(eventId)
  }

  const IS: React.CSSProperties = { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #D1D5DB', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', outline: 'none' }
  const LS: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }
  const BP: React.CSSProperties = { padding: '10px 24px', borderRadius: 8, background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, border: 'none', cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14 }
  const BS: React.CSSProperties = { padding: '10px 24px', borderRadius: 8, background: '#E5E7EB', color: '#374151', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 14 }
  const BD: React.CSSProperties = { padding: '6px 14px', borderRadius: 6, background: '#FEE2E2', color: '#DC2626', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: 12 }

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!isAdmin) return <div style={{ padding: 120, textAlign: 'center', color: '#DC2626' }}><h2>Access Denied</h2></div>

  const grouped = SECTIONS.reduce((a, s) => { if (!a[s.group]) a[s.group] = []; a[s.group].push(s); return a }, {} as Record<string, typeof SECTIONS>)

  const renderForm = (section: string, fields: { key: string; label: string; type?: string }[]) => {
    const hasImg = fields.some(f => f.key === 'cover_image')
    return (
      <>
        {hasImg && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={LS}>Cover Image</label>
              <button onClick={() => setShowMediaLib(true)} style={{ padding: '4px 12px', borderRadius: 6, background: '#1E3A5F', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12 }}>📁 Browse</button>
            </div>
            <ImageUpload value={formData.cover_image || ''} onChange={url => setFormData(p => ({ ...p, cover_image: url }))} label="" aspectRatio="16/9" />
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {fields.map(f => (
            <div key={f.key} style={{ gridColumn: f.type === 'textarea' ? '1 / -1' : undefined }}>
              <label style={LS}>{f.label}</label>
              {f.type === 'textarea'
                ? <textarea style={{ ...IS, resize: 'vertical', minHeight: 120 }} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                : f.type === 'date'
                  ? <input type="date" style={IS} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
                  : f.type === 'number'
                    ? <input type="number" style={IS} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: parseInt(e.target.value) || 0 }))} />
                    : <input style={IS} value={formData[f.key] || ''} onChange={e => setFormData(p => ({ ...p, [f.key]: e.target.value }))} />
              }
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button style={BP} onClick={() => handleSave(section)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          <button style={BS} onClick={() => { setEditItem(null); setFormData({}) }}>Cancel</button>
        </div>
      </>
    )
  }

  const renderList = (section: string, items: any[], fields: { key: string; label: string; type?: string }[]) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 4 }}>{SECTIONS.find(s => s.key === section)?.label}</h2>
          <p style={{ color: '#6B7280' }}>{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button style={BP} onClick={() => { setEditItem({}); setFormData({}) }}>+ New</button>
      </div>
      {editItem && (
        <div style={{ padding: 24, borderRadius: 12, border: '2px solid #C9A84C', background: '#FFFBEB', marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 16 }}>{editItem.id ? 'Edit' : 'New'}</h3>
          {renderForm(section, fields)}
        </div>
      )}
      {items.length === 0
        ? <div style={{ padding: 40, textAlign: 'center', color: '#6B7280', border: '1px solid #E5E7EB', borderRadius: 12 }}>Nothing yet. Click "+ New".</div>
        : <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {items.map((item: any) => (
            <div key={item.id} style={{ padding: 20, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 4 }}>{item.title_display || item.title || item.name || item.text}</h4>
                {item.description && <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>{item.description}</p>}
                {item.content && <p style={{ fontSize: 13, color: '#6B7280', whiteSpace: 'pre-wrap', maxHeight: 60, overflow: 'hidden' }}>{item.content}</p>}
                {item.cover_image && <img src={item.cover_image} alt="" style={{ width: '100%', maxWidth: 200, aspectRatio: '16/9', objectFit: 'cover', borderRadius: 6, marginTop: 8 }} />}
                <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                  {item.date && <span>📅 {new Date(item.date).toLocaleDateString()}</span>}
                  {item.start_date && <span>📅 {item.start_date} → {item.end_date}</span>}
                  {item.reference && <span>📖 {item.reference}</span>}
                  {item.is_active !== undefined && <span style={{ color: item.is_active ? '#10B981' : '#DC2626' }}>{item.is_active ? '● Active' : '○ Inactive'}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {section === 'events' && (
                  <button style={{ ...BS, background: '#DBEAFE', color: '#1E40AF' }} onClick={() => loadEventMedia(item.id)}>📸 Media</button>
                )}
                <button style={BS} onClick={() => { setEditItem(item); setFormData(item) }}>Edit</button>
                <button style={BD} onClick={() => handleDelete(section, item.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'hero':
        return (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>Homepage Hero</h2>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>Manage site identity and carousel images.</p>
            <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white', marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', marginBottom: 16 }}>Site Identity</h3>
              <label style={LS}>Church Name</label>
              <input style={IS} defaultValue="Saint Mary Orthodox Church" />
              <label style={LS}>Ge'ez Name</label>
              <input style={IS} defaultValue="ቅድስት ማርያም ቤተክርስቲያን" />
              <label style={LS}>Hero Tagline</label>
              <input style={IS} defaultValue="Nurturing faith, knowledge, and character" />
              <button style={BP}>Save Site Identity</button>
            </div>
            <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', margin: 0 }}>Carousel Slides</h3>
                <button onClick={() => setShowMediaLib(true)} style={BS}>📁 Media Library</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {['Kidan Yohannes', 'Timket', 'Palm Sunday', 'Feast of St. Mary'].map((n, i) => (
                  <ImageUpload key={i} value="" onChange={() => {}} label={n} aspectRatio="16/9" />
                ))}
              </div>
            </div>
          </div>
        )
      case 'about': return renderList('about', aboutPages, [{ key: 'section', label: 'Section ID' }, { key: 'title_display', label: 'Display Title' }, { key: 'content', label: 'Content', type: 'textarea' }])
      case 'contact': return renderList('contact', contactPages, [{ key: 'section', label: 'Section ID' }, { key: 'title_display', label: 'Display Title' }, { key: 'content', label: 'Content', type: 'textarea' }])
      case 'events':
        return (
          <div>
            {renderList('events', events, [{ key: 'title', label: 'Title' }, { key: 'description', label: 'Description', type: 'textarea' }, { key: 'date', label: 'Date', type: 'date' }, { key: 'start_time', label: 'Start Time' }, { key: 'end_time', label: 'End Time' }, { key: 'location', label: 'Location' }, { key: 'category', label: 'Category' }, { key: 'cover_image', label: 'Cover Image' }])}
            {eventMediaMode && (
              <div style={{ marginTop: 24, padding: 24, borderRadius: 12, border: '2px solid #C9A84C', background: '#FFFBEB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1E3A5F', margin: 0 }}>📸 Media for: {events.find(e => e.id === eventMediaMode)?.title}</h3>
                  <button onClick={() => setEventMediaMode(null)} style={{ padding: '4px 12px', borderRadius: 6, background: '#E5E7EB', border: 'none', cursor: 'pointer', fontSize: 13 }}>Close</button>
                </div>
                <input type="file" accept="image/*,video/*" multiple onChange={e => e.target.files && handleMediaUpload(eventMediaMode, e.target.files)} style={{ marginBottom: 16 }} />
                {eventMediaItems.length === 0 ? (
                  <p style={{ color: '#6B7280', fontSize: 14 }}>No media yet. Upload images or videos above.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                    {eventMediaItems.map(m => (
                      <div key={m.id} style={{ position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
                        {m.type === 'image'
                          ? <img src={m.url} alt={m.title} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                          : <video src={m.url} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />}
                        <button onClick={() => handleDeleteMedia(m.id, eventMediaMode)} style={{ position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: 'rgba(220,38,38,0.9)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                        <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2px 6px', background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.type === 'video' ? '🎬' : '📷'} {m.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      case 'blog': return renderList('blog', blogPosts, [{ key: 'title', label: 'Title' }, { key: 'content', label: 'Content', type: 'textarea' }, { key: 'excerpt', label: 'Excerpt', type: 'textarea' }, { key: 'category', label: 'Category' }, { key: 'cover_image', label: 'Cover Image' }])
      case 'news': return renderList('news', newsItems, [{ key: 'title', label: 'Title' }, { key: 'content', label: 'Content', type: 'textarea' }, { key: 'excerpt', label: 'Excerpt' }, { key: 'cover_image', label: 'Cover Image' }])
      case 'fasting': return renderList('fasting', fastingSeasons, [{ key: 'name', label: 'Name' }, { key: 'name_geez', label: 'Ge\'ez Name' }, { key: 'start_date', label: 'Start', type: 'date' }, { key: 'end_date', label: 'End', type: 'date' }, { key: 'total_days', label: 'Days', type: 'number' }, { key: 'year', label: 'Year', type: 'number' }])
      case 'verses': return renderList('verses', verses, [{ key: 'text', label: 'Verse Text', type: 'textarea' }, { key: 'reference', label: 'Reference' }])
      case 'settings':
        return (
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1E3A5F', marginBottom: 8 }}>⚙️ Site Settings</h2>
            <p style={{ color: '#6B7280', marginBottom: 24 }}>Manage site-wide settings.</p>
            <div style={{ padding: 24, borderRadius: 12, border: '1px solid #E5E7EB', background: 'white' }}>
              <label style={LS}>Church Name</label><input style={IS} />
              <label style={LS}>Email</label><input style={IS} defaultValue="school@saintmarychurch.org" />
              <label style={LS}>Phone</label><input style={IS} />
              <label style={LS}>Address</label><textarea style={{ ...IS, resize: 'vertical', minHeight: 80 }} />
              <label style={LS}>Service Times</label><textarea style={{ ...IS, resize: 'vertical', minHeight: 100 }} defaultValue="Sunday Liturgy: 8:00 AM – 11:00 AM&#10;Sunday School: 9:00 AM – 10:30 AM" />
              <button style={BP}>Save Settings</button>
            </div>
          </div>
        )
      default: return <div>Select a section</div>
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', paddingTop: 56 }}>
      <div style={{ width: 260, borderRight: '1px solid #E5E7EB', background: '#1E3A5F', color: 'white', padding: '24px 0', flexShrink: 0 }}>
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>📋 CMS Dashboard</h2>
          <p style={{ fontSize: 12, opacity: 0.7, margin: '4px 0 0' }}>Content Management</p>
        </div>
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} style={{ marginBottom: 16 }}>
            <div style={{ padding: '0 20px', fontSize: 11, fontWeight: 600, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{group}</div>
            {items.map(item => (
              <button key={item.key} onClick={() => { setActiveSection(item.key); setEditItem(null) }}
                style={{ display: 'block', width: '100%', padding: '10px 20px', border: 'none', background: activeSection === item.key ? 'rgba(201,168,76,0.2)' : 'transparent', color: activeSection === item.key ? '#C9A84C' : 'rgba(255,255,255,0.8)', cursor: 'pointer', textAlign: 'left', fontSize: 14, fontWeight: activeSection === item.key ? 600 : 400, borderLeft: activeSection === item.key ? '3px solid #C9A84C' : '3px solid transparent' }}>
                {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: 32, background: '#F3F4F6', minHeight: '100vh', overflowY: 'auto' }}>
        {loading ? <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>Loading...</div> : renderContent()}
      </div>
      {showMediaLib && <MediaLibrary onSelect={() => setShowMediaLib(false)} onClose={() => setShowMediaLib(false)} />}
    </div>
  )
}
