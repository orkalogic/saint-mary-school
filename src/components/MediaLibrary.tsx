// src/components/MediaLibrary.tsx
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

interface MediaItem {
  name: string
  id: string
  created_at: string
  publicUrl: string
}

interface Props {
  onSelect: (url: string) => void
  onClose: () => void
}

export default function MediaLibrary({ onSelect, onClose }: Props) {
  const [images, setImages] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.storage.from('cms-media').list('cms', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      })
      if (error) throw error

      const items: MediaItem[] = (data || []).map(f => {
        const { data: { publicUrl } } = supabase.storage
          .from('cms-media')
          .getPublicUrl(`cms/${f.name}`).data
        return {
          name: f.name,
          id: f.name,
          created_at: f.created_at || '',
          publicUrl,
        }
      })
      setImages(items)
    } catch (err) {
      console.error('Failed to load media:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `cms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      await supabase.storage.from('cms-media').upload(path, file, { contentType: file.type })
    }

    setUploading(false)
    loadImages()
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Delete this image?')) return
    await supabase.storage.from('cms-media').remove([`cms/${name}`])
    loadImages()
  }

  const filtered = images.filter(img =>
    img.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div style={{ position: 'relative', width: 800, maxWidth: '95vw', maxHeight: '90vh', background: 'white', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>📁 Media Library</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #D1D5DB', fontSize: 13, width: 160 }}
            />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} style={{ padding: '6px 14px', borderRadius: 6, background: '#C9A84C', color: '#1E3A5F', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 13 }}>
              {uploading ? 'Uploading...' : '+ Upload'}
            </button>
            <button onClick={onClose} style={{ padding: '6px 10px', borderRadius: 6, background: '#E5E7EB', border: 'none', cursor: 'pointer', fontSize: 16 }}>✕</button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: 'none' }} />
        </div>

        {/* Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>Loading media library...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#6B7280' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📷</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No images yet</p>
              <p style={{ fontSize: 14 }}>Upload images to get started</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 }}>
              {filtered.map(img => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB', cursor: 'pointer', group: true }}>
                  <img
                    src={img.publicUrl}
                    alt={img.name}
                    onClick={() => onSelect(img.publicUrl)}
                    style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', transition: 'background 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}>
                    <div style={{ display: 'flex', gap: 4, opacity: 0, transition: 'opacity 0.15s' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0')}>
                      <button onClick={() => onSelect(img.publicUrl)} style={{ padding: '4px 10px', borderRadius: 4, background: '#C9A84C', color: '#1E3A5F', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11 }}>Use</button>
                      <button onClick={() => handleDelete(img.name)} style={{ padding: '4px 10px', borderRadius: 4, background: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', fontSize: 11 }}>Del</button>
                    </div>
                  </div>
                  <div style={{ padding: '4px 8', background: '#F9FAFB', fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {img.name}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
