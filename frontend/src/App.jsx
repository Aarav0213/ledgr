import React from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import PurchaseList from './pages/PurchaseList.jsx'
import PurchaseForm from './pages/PurchaseForm.jsx'
import PurchaseDetail from './pages/PurchaseDetail.jsx'

const NAV = [
  { to: '/', label: 'All Purchases', icon: '◈', exact: true },
  { to: '/purchases/new', label: 'Add Purchase', icon: '+', exact: false },
]

export default function App() {
  const location = useLocation()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Sidebar */}
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
          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', lineHeight: 1.1 }}>Purchase<br/>Intelligence</div>
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

        <div style={{ padding: '0 24px' }}>
          <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>v0.1.0</div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: 220, flex: 1, padding: '48px 48px', minHeight: '100vh' }}>
        <Routes>
          <Route path="/" element={<PurchaseList />} />
          <Route path="/purchases/new" element={<PurchaseForm />} />
          <Route path="/purchases/:id" element={<PurchaseDetail />} />
          <Route path="/purchases/:id/edit" element={<PurchaseForm />} />
        </Routes>
      </main>
    </div>
  )
}
