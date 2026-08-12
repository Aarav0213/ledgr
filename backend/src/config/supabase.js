const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or ANON KEY is missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const createSupabaseForRequest = (accessToken) =>
  createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

const getAuthenticatedUser = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  const authClient = createSupabaseForRequest(token);
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  if (error || !user) {
    const authError = new Error(error?.message || 'Invalid authentication token');
    authError.status = 401;
    throw authError;
  }

  return user;
};

module.exports = {
  supabase,
  createSupabaseForRequest,
  getAuthenticatedUser,
};
