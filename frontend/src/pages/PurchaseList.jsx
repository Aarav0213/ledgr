import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePurchases, useDeletePurchase } from '../hooks/usePurchases'

const CATEGORIES = ['All', 'Food', 'Tech', 'Clothing', 'Transport', 'Health', 'Entertainment', 'Other']

export default function PurchaseList() {
  const navigate = useNavigate()
  const { data: purchases, isLoading, error } = usePurchases()
  const { mutate: deletePurchase } = useDeletePurchase()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = (purchases || []).filter(p => {
    const matchCat = filter === 'All' || p.category === filter
    const matchSearch = !search || (p.merchant || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const total = filtered.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>loading purchases...</div>
    </div>
  )

  if (error) return (
    <div style={{ color: '#ff6584', fontFamily: 'DM Mono, monospace', fontSize: 13, padding: 24 }}>
      error: {error.message}
    </div>
  )

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>OVERVIEW</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text)' }}>All Purchases</h1>
        </div>
        <button
          onClick={() => navigate('/purchases/new')}
          style={{
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 24px',
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
            letterSpacing: 0.5,
          }}
        >
          + Add Purchase
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Purchases', value: (purchases || []).length, mono: true },
          { label: 'Filtered Results', value: filtered.length, mono: true },
          { label: 'Total Spent', value: `$${total.toFixed(2)}`, mono: true },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: '20px 24px',
          }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8 }}>{label.toUpperCase()}</div>
            <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'DM Mono, monospace', color: 'var(--text)' }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Search purchases..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '10px 16px',
            color: 'var(--text)',
            fontSize: 14,
            fontFamily: 'Syne, sans-serif',
            outline: 'none',
            flex: 1,
            minWidth: 200,
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                background: filter === cat ? 'var(--accent)' : 'var(--surface)',
                border: `1px solid ${filter === cat ? 'var(--accent)' : 'var(--border)'}`,
                color: filter === cat ? '#fff' : 'var(--muted)',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'Syne, sans-serif',
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '60px 24px',
          textAlign: 'center',
          color: 'var(--muted)',
          fontFamily: 'DM Mono, monospace',
          fontSize: 13,
        }}>
          no purchases found
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Merchant', 'Amount', 'Date', 'Category', 'Notes', ''].map(h => (
                  <th key={h} style={{
                    padding: '14px 20px',
                    textAlign: 'left',
                    fontSize: 11,
                    letterSpacing: 2,
                    color: 'var(--muted)',
                    fontWeight: 600,
                  }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/purchases/${p.id}`)}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, fontSize: 14 }}>{p.merchant || '—'}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'DM Mono, monospace', fontSize: 14, color: '#6c63ff' }}>
                    ${parseFloat(p.amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                    {p.date ? new Date(p.date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {p.category && (
                      <span style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '3px 10px',
                        fontSize: 12,
                        color: 'var(--muted)',
                      }}>{p.category}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.notes || '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/purchases/${p.id}/edit`)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                      >Edit</button>
                      <button
                        onClick={() => { if (confirm('Delete this purchase?')) deletePurchase(p.id) }}
                        style={{ background: 'transparent', border: '1px solid #ff658440', color: '#ff6584', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
