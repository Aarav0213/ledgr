const { supabase } = require('../config/supabase.js');

class Purchase {
  // Get all purchases
  static async getAll() {
    const { data, error } = await supabase
      .from('purchases')
      .select('*');

    if (error) throw error;
    return data;
  }

  // Get purchase by ID
  static async getById(id) {
    const { data, error } = await supabase
      .from('purchases')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create a new purchase
  static async create(purchaseData) {
    const { data, error } = await supabase
      .from('purchases')
      .insert([purchaseData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update purchase by ID
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('purchases')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete purchase by ID
  static async delete(id) {
    const { data, error } = await supabase
      .from('purchases')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  }
}

module.exports = Purchase;
