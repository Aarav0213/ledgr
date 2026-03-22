import { useQuery } from '@tanstack/react-query'

const API = import.meta.env.VITE_API_URL || ''

export const usePurchase = (id) =>
  useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      const res = await fetch(`${API}/api/purchases/${id}`)
      if (!res.ok) throw new Error(`API error ${res.status}`)
      return res.json()
    },
    enabled: !!id,
  })
