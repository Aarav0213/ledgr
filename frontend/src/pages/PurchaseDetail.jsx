import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePurchase } from '../hooks/usePurchase'
import { useDeletePurchase } from '../hooks/usePurchases'

export default function PurchaseDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: p, isLoading, error } = usePurchase(id)
  const { mutate: deletePurchase } = useDeletePurchase()

  if (isLoading) return (
    <div style={{ color: 'var(--muted)', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>loading...</div>
  )
  if (error) return (
    <div style={{ color: '#ff6584', fontFamily: 'DM Mono, monospace', fontSize: 13 }}>error: {error.message}</div>
  )
  if (!p) return null

  const handleDelete = () => {
    if (confirm('Delete this purchase?')) {
      deletePurchase(id, { onSuccess: () => navigate('/') })
    }
  }

  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', fontWeight: 600 }}>{label.toUpperCase()}</span>
      <span style={{ fontFamily: label === 'Amount' || label === 'Date' ? 'DM Mono, monospace' : 'Syne, sans-serif', fontSize: 15, color: label === 'Amount' ? 'var(--accent)' : 'var(--text)', fontWeight: label === 'Amount' ? 700 : 400 }}>
        {value}
      </span>
    </div>
  )

  return (
    <div className="fade-up" style={{ maxWidth: 560 }}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Mono, monospace', marginBottom: 32, padding: 0 }}
      >
        ← back
      </button>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>PURCHASE DETAIL</div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>{p.merchant || 'Unnamed'}</h1>
      </div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '0 24px', marginBottom: 24 }}>
        <Row label="Amount" value={`$${parseFloat(p.amount || 0).toFixed(2)}`} />
        <Row label="Date" value={p.date ? new Date(p.date).toLocaleDateString() : '—'} />
        <Row label="Category" value={p.category || '—'} />
        {p.notes && <Row label="Notes" value={p.notes} />}
        <Row label="ID" value={<span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: 'var(--muted)' }}>{p.id}</span>} />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => navigate(`/purchases/${id}/edit`)}
          style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px 28px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{ background: 'transparent', border: '1px solid #ff658440', color: '#ff6584', borderRadius: 8, padding: '13px 24px', fontSize: 14, cursor: 'pointer', fontFamily: 'Syne, sans-serif' }}
        >
          Delete
        </button>
      </div>
    </div>
  )
}
