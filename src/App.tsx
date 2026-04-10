import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { useCurrentUser } from './hooks/useCurrentUser'
import HomePage from './pages/HomePage'
import About from './pages/About'
import Contact from './pages/Contact'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import StudentEnrollment from './pages/enroll/Student'
import TeacherEnrollment from './pages/enroll/Teacher'
import ParentRegistration from './pages/enroll/Parent'
import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import Enrollments from './pages/dashboard/admin/Enrollments'
import Users from './pages/dashboard/admin/Users'
import StudentDashboard from './pages/dashboard/StudentDashboard'
import TeacherDashboard from './pages/dashboard/TeacherDashboard'
import ParentDashboard from './pages/dashboard/ParentDashboard'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoading } = useCurrentUser()
  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading...</div>
  if (!isSignedIn) return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/auth/sign-in" element={<SignIn />} />
        <Route path="/auth/sign-up" element={<SignUp />} />
        <Route path="/enroll/student" element={<StudentEnrollment />} />
        <Route path="/enroll/teacher" element={<TeacherEnrollment />} />
        <Route path="/enroll/parent" element={<ParentRegistration />} />

        {/* Dashboard routes - protected */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/admin/enrollments" element={<ProtectedRoute><Enrollments /></ProtectedRoute>} />
        <Route path="/dashboard/admin/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />
        <Route path="/dashboard/student" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/teacher" element={<ProtectedRoute><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/parent" element={<ProtectedRoute><ParentDashboard /></ProtectedRoute>} />
      </Routes>
    </>
  )
}

function DashboardRouter() {
  const { convexUser, isLoading } = useCurrentUser()

  if (isLoading) return <div style={{ padding: 120, textAlign: 'center', color: '#6B7280' }}>Loading your dashboard...</div>

  if (!convexUser) {
    return (
      <div style={{ padding: '120px 24px', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ color: '#1E3A5F', fontFamily: 'Cormorant Garamond, serif', fontSize: 28 }}>
          Welcome!
        </h2>
        <p style={{ color: '#6B7280', marginTop: 12, marginBottom: 24 }}>
          Your account needs to be set up. Choose an option below:
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/enroll/student" style={actionBtn}>Enroll as Student</a>
          <a href="/enroll/teacher" style={actionBtn}>Apply as Teacher</a>
        </div>
      </div>
    )
  }

  // Redirect based on role
  const redirects: Record<string, string> = {
    admin: '/dashboard/admin',
    teacher: '/dashboard/teacher',
    student: '/dashboard/student',
    parent: '/dashboard/parent',
    assistant: '/dashboard/admin',
  }

  const target = redirects[convexUser.role] || '/dashboard/student'
  return <Navigate to={target} replace />
}

function NavBar() {
  const location = useLocation()
  const { isSignedIn } = useCurrentUser()
  const { convexUser } = useCurrentUser()

  const links = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]

  // Show enrollment links to everyone
  const enrollLinks = [
    { path: '/enroll/student', label: 'Enroll Student' },
    { path: '/enroll/teacher', label: 'Apply Teacher' },
  ]

  // Show dashboard links based on role
  const dashLinks: { path: string; label: string }[] = []
  if (convexUser) {
    if (convexUser.role === 'admin') {
      dashLinks.push(
        { path: '/dashboard/admin', label: 'Dashboard' },
        { path: '/dashboard/admin/enrollments', label: 'Enrollments' },
        { path: '/dashboard/admin/users', label: 'Users' },
      )
    } else if (convexUser.role === 'teacher') {
      dashLinks.push({ path: '/dashboard/teacher', label: 'Dashboard' })
    } else if (convexUser.role === 'student') {
      dashLinks.push({ path: '/dashboard/student', label: 'Dashboard' })
    } else if (convexUser.role === 'parent') {
      dashLinks.push({ path: '/dashboard/parent', label: 'Dashboard' })
    }
  } else if (isSignedIn) {
    dashLinks.push({ path: '/dashboard', label: 'Dashboard' })
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 200,
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      height: 56,
      gap: 0,
    }}>
      <a href="/" style={{ fontWeight: 700, color: '#C9A84C', fontSize: 20, textDecoration: 'none', marginRight: 32, fontFamily: 'Cormorant Garamond, serif' }}>
        St. Mary School
      </a>

      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {links.map(l => (
          <NavLink key={l.path} to={l.path} label={l.label} active={location.pathname === l.path} />
        ))}

        {/* Enrollment dropdown-style links */}
        {enrollLinks.map(l => (
          <NavLink key={l.path} to={l.path} label={l.label} active={location.pathname === l.path} highlight />
        ))}

        {/* Dashboard links */}
        {dashLinks.map(l => (
          <NavLink key={l.path} to={l.path} label={l.label} active={location.pathname === l.path} />
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isSignedIn ? (
          <button onClick={() => supabase.auth.signOut()} style={signOutBtnStyle}>
            Sign Out
          </button>
        ) : (
          <>
            <Link to="/auth/sign-in" style={signInBtnStyle}>Sign In</Link>
            <Link to="/auth/sign-up" style={signUpBtnStyle}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, label, active, highlight }: { to: string; label: string; active: boolean; highlight?: boolean }) {
  return (
    <Link to={to} style={{
      padding: '6px 14px',
      borderRadius: 6,
      fontSize: 13,
      fontWeight: active ? 600 : 500,
      color: active ? '#1E3A5F' : '#6B7280',
      background: active ? '#F3F4F6' : 'transparent',
      textDecoration: 'none',
      transition: 'all 0.15s',
      ...(highlight && !active ? { color: '#C9A84C' } : {}),
    }}>
      {label}
    </Link>
  )
}

const signInBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  border: '1px solid #C9A84C',
  background: 'transparent',
  color: '#C9A84C',
  cursor: 'pointer',
  textDecoration: 'none',
}

const signUpBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  border: 'none',
  background: '#C9A84C',
  color: '#1E3A5F',
  cursor: 'pointer',
  textDecoration: 'none',
}

const signOutBtnStyle: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  fontSize: 13,
  fontWeight: 600,
  border: '1px solid #DC2626',
  background: 'transparent',
  color: '#DC2626',
  cursor: 'pointer',
}

const actionBtn: React.CSSProperties = {
  display: 'inline-block',
  padding: '10px 24px',
  borderRadius: 8,
  background: '#C9A84C',
  color: '#1E3A5F',
  fontWeight: 600,
  textDecoration: 'none',
}
