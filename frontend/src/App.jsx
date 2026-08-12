import React, { useEffect, useState } from 'react'
import { Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import PurchaseList from './pages/PurchaseList.jsx'
import PurchaseForm from './pages/PurchaseForm.jsx'
import PurchaseDetail from './pages/PurchaseDetail.jsx'
import { supabase } from './supabaseClient'

const NAV = [
  { to: '/', label: 'All Transactions', icon: 'â—ˆ', exact: true },
  { to: '/transactions/new', label: 'Add Transaction', icon: '+', exact: false },
]

function AuthGate({ onSignedIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      const result = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
      if (result.error) throw result.error
      const { data } = await supabase.auth.getSession()
      if (data.session) onSignedIn()
      else setMessage(isLogin ? 'Signed in.' : 'Check your email to confirm your account.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--bg)' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: 28 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>SIGN IN</div>
          <h1 style={{ fontSize: 30, margin: 0 }}>Ledgr access</h1>
          <p style={{ color: 'var(--muted)', marginBottom: 0 }}>Use your Cozy Supabase account to load private transactions.</p>
        </div>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--muted)' }}>Email</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }} />
        </label>
        <label style={{ display: 'block', marginBottom: 16 }}>
          <div style={{ fontSize: 12, marginBottom: 8, color: 'var(--muted)' }}>Password</div>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface2)', color: 'var(--text)' }} />
        </label>
        <button disabled={loading} type="submit" style={{ width: '100%', padding: '12px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Working...' : isLogin ? 'Sign in' : 'Create account'}
        </button>
        <button type="button" onClick={() => setIsLogin((v) => !v)} style={{ width: '100%', marginTop: 12, background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer' }}>
          {isLogin ? 'Need an account? Switch to sign up' : 'Already have an account? Switch to sign in'}
        </button>
        {message ? <div style={{ marginTop: 14, color: 'var(--muted)', fontSize: 13 }}>{message}</div> : null}
      </form>
    </div>
  )
}

export default function App() {
  const location = useLocation()
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  useEffect(() => {
    window.__ledgrSupabase = supabase
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null)
      setAuthLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (authLoading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--muted)' }}>loading session...</div>
  }

  if (!session) {
    return <AuthGate onSignedIn={() => supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))} />
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <aside style={{
        width: 220,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '32px 0',
        position: 'fixed',
        top: 0, bottom: 0, left: 0,
      }}>
        <div style={{ padding: '0 24px', marginBottom: 40 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 4 }}>LEDGR</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Transaction<br/>Intelligence</div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map(({ to, label, icon, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to) && to !== '/'
            return (
              <NavLink
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 24px',
                  color: active ? 'var(--text)' : 'var(--muted)',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: active ? 700 : 400,
                  background: active ? 'var(--surface2)' : 'transparent',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 16 }}>{icon}</span>
                {label}
              </NavLink>
            )
          })}
        </nav>
      </aside>

      <main style={{ marginLeft: 220, flex: 1, padding: '48px 48px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<PurchaseList />} />
          <Route path="/transactions/new" element={<PurchaseForm />} />
          <Route path="/transactions/:id" element={<PurchaseDetail />} />
          <Route path="/transactions/:id/edit" element={<PurchaseForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

