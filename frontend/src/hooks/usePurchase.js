import { useQuery } from '@tanstack/react-query'
import { supabase } from '../supabaseClient'

const API = import.meta.env.VITE_API_URL || ''

export const usePurchase = (id) =>
  useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch(`${API}/api/transactions/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      return res.json()
    },
    enabled: !!id,
  })
