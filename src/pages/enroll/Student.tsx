// src/pages/enroll/Student.tsx
import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { api } from '../../lib/api'
import type { Session } from '@supabase/supabase-js'

export default function StudentEnrollment() {
  const [session, setSession] = useState<Session | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    grade: '',
    parentEmail: '',
    parentPhone: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user) return
    setSubmitting(true)
    try {
      await api.enrollments.submitStudentEnrollment({
        clerkId: session.user.id,
        ...form,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Enrollment submission failed:', err)
      alert('Failed to submit enrollment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Enrollment Submitted!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12 }}>
          Your student enrollment request has been sent to the administrators.
          You will be notified once it is reviewed.
        </p>
      </div>
    )
  }

  return (
    <div style={{ padding: '100px 24px', maxWidth: 600, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8 }}>
        Student Enrollment
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32 }}>
        Fill out the form below to enroll as a student at Saint Mary Church School.
      </p>

      {!session && (
        <div style={{ padding: 16, background: '#FEF3C7', borderRadius: 8, marginBottom: 24, color: '#92400E' }}>
          Please <a href="/auth/sign-in" style={{ fontWeight: 600, color: '#92400E' }}>sign in</a> first to submit an enrollment request.
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              First Name *
            </label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              Last Name *
            </label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Phone
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              Date of Birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              Grade Level
            </label>
            <select
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              style={inputStyle}
            >
              <option value="">Select grade</option>
              <option value="Pre-K">Pre-K</option>
              <option value="K">Kindergarten</option>
              <option value="1">Grade 1</option>
              <option value="2">Grade 2</option>
              <option value="3">Grade 3</option>
              <option value="4">Grade 4</option>
              <option value="5">Grade 5</option>
              <option value="6">Grade 6</option>
              <option value="7">Grade 7</option>
              <option value="8">Grade 8</option>
              <option value="9">Grade 9</option>
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
              <option value="12">Grade 12</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '8px 0' }} />
        <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 600 }}>Parent / Guardian Information</p>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Parent Email
          </label>
          <input
            type="email"
            value={form.parentEmail}
            onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Parent Phone
          </label>
          <input
            type="tel"
            value={form.parentPhone}
            onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={!session || submitting}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            background: session && !submitting ? '#C9A84C' : '#D1D5DB',
            color: session && !submitting ? '#1E3A5F' : '#9CA3AF',
            cursor: session && !submitting ? 'pointer' : 'not-allowed',
            marginTop: 8,
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Enrollment Request'}
        </button>
      </form>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid #D1D5DB',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
}
