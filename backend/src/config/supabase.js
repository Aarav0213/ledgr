const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase URL or ANON KEY is missing. Check your .env file.');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

const createSupabaseForRequest = (accessToken) => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    accessToken: accessToken
      ? async () => accessToken
      : undefined,
  });
};

const getAuthenticatedUser = async (req) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ')
    ? header.slice(7).trim()
    : null;

  if (!token) {
    const error = new Error('Authentication required');
    error.status = 401;
    throw error;
  }

  const authClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const { data, error } = await authClient.auth.getClaims(token);

  if (error || !data?.claims) {
    const authError = new Error(
      error?.message || 'Invalid authentication token'
    );
    authError.status = 401;
    throw authError;
  }

  return {
    id: data.claims.sub,
    email: data.claims.email,
    role: data.claims.role,
  };
};

module.exports = {
  supabase,
  createSupabaseForRequest,
  getAuthenticatedUser,
};
