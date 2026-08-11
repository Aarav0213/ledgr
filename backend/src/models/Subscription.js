const { createSupabaseForRequest } = require('../config/supabase.js');

class Subscription {
  // Create a Supabase client scoped to the authenticated user.
  static client(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    return createSupabaseForRequest(token);
  }

  // Get all subscriptions
  static async getAll(req) {
    const supabase = Subscription.client(req);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('next_renewal_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Get subscription by ID
  static async getById(req, id) {
    const supabase = Subscription.client(req);

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Create a new subscription
  static async create(req, subscriptionData) {
    const supabase = Subscription.client(req);

    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Update subscription by ID
  static async update(req, id, updateData) {
    const supabase = Subscription.client(req);

    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Delete subscription by ID
  static async delete(req, id) {
    const supabase = Subscription.client(req);

    const { error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

module.exports = Subscription;
