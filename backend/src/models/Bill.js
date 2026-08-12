const { createSupabaseForRequest, getAuthenticatedUser } = require('../config/supabase.js');

class Bill {
  // Create a Supabase client scoped to the authenticated user.
  static client(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    return createSupabaseForRequest(token);
  }

  // Get all bills
  static async getAll(req) {
    const supabase = Bill.client(req);

    const { data, error } = await supabase
      .from('bills')
      .select('*');

    if (error) throw error;
    return data;
  }

  // Get bill by ID
  static async getById(req, id) {
    const supabase = Bill.client(req);

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Create a new bill
  static async create(req, billData) {
    const supabase = Bill.client(req);
    const user = await getAuthenticatedUser(req);

    const payload = {
      ...billData,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from('bills')
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  // Update bill by ID
  static async update(req, id, updateData) {
    const supabase = Bill.client(req);

    const { data, error } = await supabase
      .from('bills')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  // Delete bill by ID
  static async delete(req, id) {
    const supabase = Bill.client(req);

    const { error } = await supabase
      .from('bills')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  // Get upcoming bills (due within 7 days)
  static async getUpcoming(req) {
    const supabase = Bill.client(req);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    const formattedDate = sevenDaysFromNow.toISOString().split('T')[0];

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .lte('due_date', formattedDate)
      .gte('due_date', today);

    if (error) throw error;
    return data;
  }
}

module.exports = Bill;
