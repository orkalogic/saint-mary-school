// src/pages/enroll/Teacher.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { api } from '../../lib/api'
import type { Session } from '@supabase/supabase-js'

const SUBJECTS = [
  'Bible Studies', 'Geez Language', 'Amharic', 'Church History',
  'Hymnology (Zema)', 'Liturgy', 'Ethics & Morality', 'English',
  'Mathematics', 'Science', 'Art', 'Music',
]

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4,
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 12px', borderRadius: 6,
  border: '1px solid #D1D5DB', fontSize: 14, outline: 'none', boxSizing: 'border-box',
}

export default function TeacherEnrollment() {
  const [session, setSession] = useState<Session | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualifications: '',
    preferredSubjects: [] as string[],
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        setForm(prev => ({
          ...prev,
          firstName: session.user.user_metadata?.first_name ?? '',
          lastName: session.user.user_metadata?.last_name ?? '',
          email: session.user.email ?? '',
          phone: session.user.phone ?? '',
        }))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const toggleSubject = (subject: string) => {
    setForm(prev => ({
      ...prev,
      preferredSubjects: prev.preferredSubjects.includes(subject)
        ? prev.preferredSubjects.filter(s => s !== subject)
        : [...prev.preferredSubjects, subject],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return
    setSubmitting(true)
    try {
      await api.enrollments.enrollments.submitTeacher({
        clerkId: session.user.id,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email || undefined,
        phone: form.phone || undefined,
        qualifications: form.qualifications || undefined,
        preferredSubjects: form.preferredSubjects.length > 0 ? form.preferredSubjects : undefined,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Teacher application failed:', err)
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Application Submitted!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12 }}>
          Your teacher application has been sent for review. You will be notified once it is reviewed.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Teacher Application
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Interested in teaching at Saint Mary Church School? Fill out the form below.
      </p>

      {!session && (
        <div style={{ padding: 16, background: '#FEF3C7', borderRadius: 8, marginBottom: 24, color: '#92400E' }}>
          Please <a href="/auth/sign-in" style={{ fontWeight: 600, color: '#92400E' }}>sign in</a> first to submit an application.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input required value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input required value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} style={inputStyle} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Phone</label>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
        </div>

        <div>
          <label style={labelStyle}>Qualifications & Experience</label>
          <textarea
            rows={3}
            value={form.qualifications}
            onChange={(e) => setForm({ ...form, qualifications: e.target.value })}
            placeholder="Describe your teaching experience, certifications, or relevant background..."
            style={{ ...inputStyle, resize: 'vertical' as const }}
          />
        </div>

        <div>
          <label style={labelStyle}>Preferred Subjects</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {SUBJECTS.map(subject => (
              <button
                key={subject}
                type="button"
                onClick={() => toggleSubject(subject)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 13, border: '1px solid',
                  borderColor: form.preferredSubjects.includes(subject) ? '#C9A84C' : '#D1D5DB',
                  background: form.preferredSubjects.includes(subject) ? '#C9A84C' : 'white',
                  color: form.preferredSubjects.includes(subject) ? '#1E3A5F' : '#6B7280',
                  cursor: 'pointer',
                }}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={!session || submitting}
          style={{
            padding: '12px 24px', borderRadius: 8, fontSize: 15, fontWeight: 600, border: 'none',
            background: session && !submitting ? '#C9A84C' : '#D1D5DB',
            color: session && !submitting ? '#1E3A5F' : '#9CA3AF',
            cursor: session && !submitting ? 'pointer' : 'not-allowed', marginTop: 8,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  )
}
