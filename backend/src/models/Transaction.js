const { createSupabaseForRequest } = require('../config/supabase.js');
const { stripInjectedRecurringLabel } = require('../lib/classification');

const table = 'transactions';

class Transaction {
  static client(req) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    return createSupabaseForRequest(token);
  }

  static async getAll(req) {
    const supabase = Transaction.client(req);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('transaction_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getById(req, id) {
    const supabase = Transaction.client(req);
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async create(req, transactionData) {
    const supabase = Transaction.client(req);
    const payload = {
      ...transactionData,
      merchant_name: stripInjectedRecurringLabel(transactionData.merchant_name),
    };
    const { data, error } = await supabase
      .from(table)
      .insert([payload])
      .select('*')
      .single();

    if (error) throw error;
    return data;
  }

  static async update(req, id, updateData) {
    const supabase = Transaction.client(req);
    const payload = {
      ...updateData,
      merchant_name: stripInjectedRecurringLabel(updateData.merchant_name),
    };
    const { data, error } = await supabase
      .from(table)
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    return data;
  }

  static async delete(req, id) {
    const supabase = Transaction.client(req);
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
}

module.exports = Transaction;
