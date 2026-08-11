import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const API = import.meta.env.VITE_API_URL || ''

const getAuthHeaders = async () => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const req = async (path, options = {}) => {
  const authHeaders = await getAuthHeaders()
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeaders, ...(options.headers || {}) },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const usePurchases = () =>
  useQuery({
    queryKey: ['transactions'],
    queryFn: () => req('/api/transactions'),
  })

export const useCreatePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => req('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useUpdatePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) =>
      req(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}

export const useDeletePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => req(`/api/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['transactions'] }),
  })
}
