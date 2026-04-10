// src/pages/auth/SignUp.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

export default function SignUp() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message ?? 'Failed to create account')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>&#10003;</div>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Account Created!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12, marginBottom: 24 }}>
          Your account is ready. You can now sign in and enroll as a student or apply as a teacher.
        </p>
        <Link to="/auth/sign-in" style={{
          display: 'inline-block', padding: '10px 24px', borderRadius: 8,
          background: '#C9A84C', color: '#1E3A5F', fontWeight: 600, textDecoration: 'none',
        }}>
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div style={{ padding: '120px 24px', maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8, textAlign: 'center' }}>
        Create Account
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32, textAlign: 'center' }}>
        Create an account to get started with Saint Mary Church School.
      </p>

      {error && (
        <div style={{ padding: 12, background: '#FEE2E2', borderRadius: 8, marginBottom: 16, color: '#991B1B', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignUp} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              First Name
            </label>
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
              Last Name
            </label>
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 4 }}>
            Password
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '12px 24px',
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            border: 'none',
            background: loading ? '#D1D5DB' : '#C9A84C',
            color: loading ? '#9CA3AF' : '#1E3A5F',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
        Already have an account?{' '}
        <Link to="/auth/sign-in" style={{ color: '#C9A84C', fontWeight: 600 }}>
          Sign In
        </Link>
      </p>
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
