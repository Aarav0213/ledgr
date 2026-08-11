const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or ANON KEY is missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createSupabaseForRequest = (accessToken) =>
  createClient(supabaseUrl, supabaseKey, {
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

module.exports = { supabase, createSupabaseForRequest };
