import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export const usePurchase = (id) => {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('purchases')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};
