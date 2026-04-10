// src/pages/auth/SignIn.tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export default function SignIn() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/')
    } catch (err: any) {
      setError(err.message ?? 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '120px 24px', maxWidth: 400, margin: '0 auto' }}>
      <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 32, marginBottom: 8, textAlign: 'center' }}>
        Sign In
      </h2>
      <p style={{ color: '#6B7280', marginBottom: 32, textAlign: 'center' }}>
        Sign in to your Saint Mary Church School account.
      </p>

      {error && (
        <div style={{ padding: 12, background: '#FEE2E2', borderRadius: 8, marginBottom: 16, color: '#991B1B', fontSize: 14 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#6B7280' }}>
        Don't have an account?{' '}
        <Link to="/auth/sign-up" style={{ color: '#C9A84C', fontWeight: 600 }}>
          Sign Up
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
