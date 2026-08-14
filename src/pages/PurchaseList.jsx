import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePurchases, useDeletePurchase } from '../hooks/usePurchases'
import { useDismissAlert, useDismissedAlerts } from '../hooks/useAlerts'
import { supabase } from '../supabaseClient'

const CATEGORIES = ['All', 'Food', 'Tech', 'Clothing', 'Transport', 'Health', 'Entertainment', 'Other']

export default function PurchaseList() {
  const navigate = useNavigate()
  const { data: transactions, isLoading, error } = usePurchases()
  const { mutate: deleteTransaction } = useDeletePurchase()
  const { data: dismissedAlerts } = useDismissedAlerts()
  const { mutate: dismissAlert, isPending: isDismissing } = useDismissAlert()
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [dismissError, setDismissError] = useState('')

  const alerts = useMemo(() => {
    const items = (transactions || [])
      .filter((transaction) => transaction?.is_recurring)
      .map((transaction) => ({
        alert_key: `recurring:${transaction.recurring_group || transaction.id}`,
        title: `${transaction.merchant_name || 'Recurring merchant'} looks recurring`,
        body: transaction.recurring_cadence_days
          ? `Matched a ${transaction.recurring_cadence_days}-day cadence on ${transaction.merchant_name || 'this merchant'}.`
          : `Matched a recurring pattern on ${transaction.merchant_name || 'this merchant'}.`,
        transaction_id: transaction.id,
      }))

    const dismissed = new Set((dismissedAlerts || []).map((item) => item.alert_key))
    return items.filter((item) => !dismissed.has(item.alert_key))
  }, [dismissedAlerts, transactions])

  const handleDismissAlert = async (alert) => {
    setDismissError('')
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user?.id
    if (!userId) {
      setDismissError('Missing signed-in user.')
      return
    }
    dismissAlert(
      { user_id: userId, alert_key: alert.alert_key },
      {
        onError: (err) => setDismissError(err.message),
      },
    )
  }

  const filtered = (transactions || []).filter(t => {
    const matchCat = filter === 'All' || t.category === filter
    const matchSearch =
      !search ||
      (t.merchant_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const total = filtered.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>loading transactions...</div>
    </div>
  )

  if (error) return (
    <div style={{ color: '#ff6584', fontFamily: 'DM Mono, monospace', fontSize: 13, padding: 24 }}>
      error: {error.message}
    </div>
  )

  return (
    <div className="fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 40 }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>OVERVIEW</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, color: 'var(--text)' }}>All Transactions</h1>
        </div>
        <button
          onClick={() => navigate('/transactions/new')}
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
          + Add Transaction
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Transactions', value: (transactions || []).length, mono: true },
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

      {alerts.length > 0 ? (
        <div style={{ marginBottom: 28, background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(255,255,255,0.02))', border: '1px solid rgba(108,99,255,0.25)', borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 12 }}>DASHBOARD ALERTS</div>
          <div style={{ display: 'grid', gap: 12 }}>
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.alert_key} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <div>
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>{alert.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)' }}>{alert.body}</div>
                </div>
                <button
                  disabled={isDismissing}
                  onClick={() => handleDismissAlert(alert)}
                  style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 999, padding: '8px 12px', fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap' }}
                >
                  Dismiss ×
                </button>
              </div>
            ))}
          </div>
          {dismissError ? <div style={{ marginTop: 10, color: '#ff6584', fontSize: 13 }}>{dismissError}</div> : null}
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Search transactions..."
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
          no transactions found
        </div>
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Merchant', 'Amount', 'Date', 'Category', 'Description', ''].map(h => (
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
              {filtered.map((t, i) => (
                <tr
                  key={t.id}
                  onClick={() => navigate(`/transactions/${t.id}`)}
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    cursor: 'pointer',
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '16px 20px', fontWeight: 600, fontSize: 14 }}>{t.merchant_name || '—'}</td>
                  <td style={{ padding: '16px 20px', fontFamily: 'DM Mono, monospace', fontSize: 14, color: '#6c63ff' }}>
                    ${parseFloat(t.amount || 0).toFixed(2)}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)', fontFamily: 'DM Mono, monospace' }}>
                    {t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {t.category && (
                      <span style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border)',
                        borderRadius: 4,
                        padding: '3px 10px',
                        fontSize: 12,
                        color: 'var(--muted)',
                      }}>{t.category}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.description || '—'}
                  </td>
                  <td style={{ padding: '16px 20px' }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => navigate(`/transactions/${t.id}/edit`)}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
                      >Edit</button>
                      <button
                        onClick={() => { if (confirm('Delete this transaction?')) deleteTransaction(t.id) }}
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
