import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCreatePurchase, useUpdatePurchase } from '../hooks/usePurchases'
import { usePurchase } from '../hooks/usePurchase'

const CATEGORIES = ['Food', 'Tech', 'Clothing', 'Transport', 'Health', 'Entertainment', 'Other']

const Field = ({ label, children }) => (
  <div style={{ marginBottom: 24 }}>
    <label style={{ display: 'block', fontSize: 11, letterSpacing: 2, color: 'var(--muted)', fontWeight: 600, marginBottom: 8 }}>
      {label.toUpperCase()}
    </label>
    {children}
  </div>
)

const inputStyle = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '12px 16px',
  color: 'var(--text)',
  fontSize: 15,
  fontFamily: 'Syne, sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function PurchaseForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: purchase } = usePurchase(id)
  const { mutate: create, isPending: isCreating } = useCreatePurchase()
  const { mutate: update, isPending: isUpdating } = useUpdatePurchase()

  const [form, setForm] = useState({ merchant: '', amount: '', date: '', category: '', notes: '' })

  useEffect(() => {
    if (purchase) {
      setForm({
        merchant: purchase.merchant || '',
        amount: purchase.amount || '',
        date: purchase.date ? new Date(purchase.date).toISOString().split('T')[0] : '',
        category: purchase.category || '',
        notes: purchase.notes || '',
      })
    }
  }, [purchase])

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { ...form, amount: parseFloat(form.amount) }
    if (id) {
      update({ id, updates: data }, { onSuccess: () => navigate(`/purchases/${id}`) })
    } else {
      create(data, { onSuccess: () => navigate('/') })
    }
  }

  const isPending = isCreating || isUpdating

  return (
    <div className="fade-up" style={{ maxWidth: 560 }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: 'var(--muted)', fontWeight: 600, marginBottom: 6 }}>
          {id ? 'EDIT' : 'NEW'}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>
          {id ? 'Edit Purchase' : 'Add Purchase'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
        <Field label="Merchant">
          <input style={inputStyle} value={form.merchant} onChange={set('merchant')} placeholder="Amazon, Starbucks..." required />
        </Field>

        <Field label="Amount ($)">
          <input style={inputStyle} type="number" step="0.01" value={form.amount} onChange={set('amount')} placeholder="0.00" required />
        </Field>

        <Field label="Date">
          <input style={inputStyle} type="date" value={form.date} onChange={set('date')} required />
        </Field>

        <Field label="Category">
          <select
            style={{ ...inputStyle, appearance: 'none' }}
            value={form.category}
            onChange={set('category')}
          >
            <option value="">Select category...</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>

        <Field label="Notes">
          <textarea
            style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
            value={form.notes}
            onChange={set('notes')}
            placeholder="Optional notes..."
          />
        </Field>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            type="submit"
            disabled={isPending}
            style={{
              background: isPending ? 'var(--border)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '13px 28px',
              fontSize: 14,
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {isPending ? 'Saving...' : id ? 'Save Changes' : 'Add Purchase'}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
              borderRadius: 8,
              padding: '13px 24px',
              fontSize: 14,
              cursor: 'pointer',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
