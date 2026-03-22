const { supabase } = require('../config/supabase.js');

class Subscription {
  // Get all subscriptions
  static async getAll() {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*');

    if (error) throw error;
    return data;
  }

  // Get subscription by ID
  static async getById(id) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create a new subscription
  static async create(subscriptionData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .insert([subscriptionData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update subscription by ID
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('subscriptions')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete subscription by ID
  static async delete(id) {
    const { data, error } = await supabase
      .from('subscriptions')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  }
}

module.exports = Subscription;
