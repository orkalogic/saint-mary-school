// src/components/ImageUpload.tsx
import { useState, useRef, useCallback } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  value?: string
  onChange: (url: string) => void
  label?: string
  aspectRatio?: string // e.g. '16/9', '1/1', '4/3'
}

export default function ImageUpload({ value, onChange, label = 'Image', aspectRatio = '16/9' }: Props) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState(value || '')
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `cms/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('cms-media')
        .upload(path, file, { contentType: file.type })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('cms-media')
        .getPublicUrl(path).data

      onChange(publicUrl)
      setPreviewUrl(publicUrl)
    } catch (err: any) {
      console.error('Upload failed:', err)
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }, [onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }, [uploadFile])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div style={{ marginBottom: 12 }}>
      {label && <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>}
      {previewUrl ? (
        <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
          <img src={previewUrl} alt={label} style={{ width: '100%', aspectRatio, objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 8, padding: 8, background: 'rgba(0,0,0,0.6)' }}>
            <button onClick={() => inputRef.current?.click()} style={{ padding: '6px 12px', borderRadius: 6, background: 'white', color: '#1E3A5F', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: 12 }}>
              {uploading ? 'Uploading...' : 'Replace'}
            </button>
            <button onClick={() => { onChange(''); setPreviewUrl('') }} style={{ padding: '6px 12px', borderRadius: 6, background: '#DC2626', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#C9A84C' : '#D1D5DB'}`,
            borderRadius: 8,
            padding: 32,
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: dragOver ? '#FFFBEB' : '#F9FAFB',
            transition: 'all 0.15s',
            aspectRatio,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>📷</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            {uploading ? 'Uploading...' : `Click or drag to upload ${label.toLowerCase()}`}
          </div>
          <div style={{ fontSize: 12, color: '#9CA3AF' }}>JPG, PNG, WebP, GIF — max 10MB</div>
        </div>
      )}
      {error && <p style={{ fontSize: 12, color: '#DC2626', marginTop: 4 }}>{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileSelect} style={{ display: 'none' }} />
    </div>
  )
}
