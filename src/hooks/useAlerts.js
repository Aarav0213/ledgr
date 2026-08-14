import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

export const useDismissedAlerts = () =>
  useQuery({
    queryKey: ['alert-dismissals'],
    queryFn: () => req('/api/alerts/dismissals'),
  })

export const useDismissAlert = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => req('/api/alerts/dismissals', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alert-dismissals'] }),
  })
}
