const { supabase } = require('../config/supabase.js');

class Bill {
  // Get all bills
  static async getAll() {
    const { data, error } = await supabase
      .from('bills')
      .select('*');

    if (error) throw error;
    return data;
  }

  // Get bill by ID
  static async getById(id) {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  // Create a new bill
  static async create(billData) {
    const { data, error } = await supabase
      .from('bills')
      .insert([billData])
      .select();

    if (error) throw error;
    return data[0];
  }

  // Update bill by ID
  static async update(id, updateData) {
    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }

  // Delete bill by ID
  static async delete(id) {
    const { data, error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return data;
  }

  // Get upcoming bills (due within 7 days)
  static async getUpcoming() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const formattedDate = sevenDaysFromNow.toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .lte('due_date', formattedDate)
      .gte('due_date', new Date().toISOString().split('T')[0]);

    if (error) throw error;
    return data;
  }
}

module.exports = Bill;
