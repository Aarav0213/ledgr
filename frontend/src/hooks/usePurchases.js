import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_URL || ''

const req = async (path, options = {}) => {
  const res = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  if (res.status === 204) return null
  return res.json()
}

export const usePurchases = () =>
  useQuery({
    queryKey: ['purchases'],
    queryFn: () => req('/api/purchases'),
  })

export const useCreatePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => req('/api/purchases', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

export const useUpdatePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, updates }) =>
      req(`/api/purchases/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  })
}

export const useDeletePurchase = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => req(`/api/purchases/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  })
}
